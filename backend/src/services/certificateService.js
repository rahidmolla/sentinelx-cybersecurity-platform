import tls from 'tls';
import axios from 'axios';
import { logger } from '../utils/logger.js';

function matchesDomain(pattern, hostname) {
  if (!pattern || !hostname) return false;
  pattern = pattern.toLowerCase();
  hostname = hostname.toLowerCase();

  if (pattern === hostname) return true;
  if (pattern.startsWith('*.')) {
    const rootPattern = pattern.slice(2);
    if (hostname.endsWith('.' + rootPattern) || hostname === rootPattern) {
      return true;
    }
  }
  return false;
}

export async function analyzeCertificate(hostname, port = 443) {
  return new Promise(async (resolve) => {
    const findings = [];
    let certDetails = null;
    let ctLogs = [];

    const options = {
      host: hostname,
      port: port,
      servername: hostname,
      rejectUnauthorized: false, // We check authorization status manually to provide detailed error diagnostics
      timeout: 5000
    };

    let socket;
    try {
      socket = tls.connect(options, async () => {
        try {
          const peerCert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          const authorizationError = socket.authorizationError;
          const protocol = socket.getProtocol();
          const cipher = socket.getCipher();

          if (!peerCert || Object.keys(peerCert).length === 0) {
            findings.push({
              id: 'TLS_NO_CERT_RETURNED',
              name: 'No Peer Certificate Returned',
              severity: 'High',
              category: 'TLS Certificate',
              evidence: `Server connected on port ${port} but returned an empty certificate.`,
              explanation: 'The remote server did not present a TLS certificate during the handshake.',
              recommendation: 'Configure a valid TLS certificate on the web server.'
            });
            socket.destroy();
            return resolve({
              hasTls: false,
              findings,
              certificate: null,
              ctLogs: []
            });
          }

          const validFrom = new Date(peerCert.valid_from);
          const validTo = new Date(peerCert.valid_to);
          const now = new Date();
          const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isExpired = daysRemaining < 0;

          // Parse SANs
          const rawSan = peerCert.subjectaltname || '';
          const sans = rawSan.split(',')
            .map(s => s.trim().replace(/^DNS:/i, ''))
            .filter(Boolean);

          // Check domain name match
          let domainMatches = matchesDomain(peerCert.subject?.CN, hostname);
          if (!domainMatches && sans.length > 0) {
            domainMatches = sans.some(san => matchesDomain(san, hostname));
          }

          const isSelfSigned = peerCert.issuer?.CN === peerCert.subject?.CN &&
            peerCert.issuer?.O === peerCert.subject?.O;

          if (!authorized) {
            findings.push({
              id: 'TLS_UNAUTHORIZED_CERTIFICATE',
              name: 'Certificate Verification Error',
              severity: 'High',
              category: 'TLS Certificate',
              evidence: `TLS handshake authorization failed: ${authorizationError || 'Untrusted Certificate Authority'}`,
              explanation: `The browser or operating system trust store cannot verify this certificate. Cause: ${authorizationError}`,
              recommendation: 'Install an SSL certificate issued by a globally recognized Certificate Authority.'
            });
          }

          if (isExpired) {
            findings.push({
              id: 'TLS_CERT_EXPIRED',
              name: 'Expired TLS Certificate',
              severity: 'High',
              category: 'TLS Certificate',
              evidence: `Certificate expired on ${validTo.toISOString().split('T')[0]} (${Math.abs(daysRemaining)} days ago).`,
              explanation: 'Expired certificates trigger severe browser warnings and break encrypted integrity verification.',
              recommendation: 'Renew the SSL/TLS certificate immediately.'
            });
          } else if (daysRemaining < 15) {
            findings.push({
              id: 'TLS_CERT_EXPIRING_SOON',
              name: 'Certificate Expiring Soon',
              severity: 'Low',
              category: 'TLS Certificate',
              evidence: `Certificate expires in ${daysRemaining} days.`,
              explanation: 'Certificate will expire soon and requires renewal to prevent service interruption.',
              recommendation: 'Renew or re-issue certificate before expiration.'
            });
          }

          if (!domainMatches) {
            findings.push({
              id: 'TLS_HOSTNAME_MISMATCH',
              name: 'Certificate Hostname Mismatch',
              severity: 'High',
              category: 'TLS Certificate',
              evidence: `Hostname '${hostname}' does not match Common Name '${peerCert.subject?.CN}' or SANs: ${sans.slice(0, 3).join(', ')}`,
              explanation: 'When the domain name does not match the certificate, modern browsers display a critical warning (ERR_CERT_COMMON_NAME_INVALID).',
              recommendation: 'Issue a certificate covering the exact fully-qualified domain name (FQDN) or wildcard.'
            });
          }

          if (isSelfSigned) {
            findings.push({
              id: 'TLS_SELF_SIGNED_CERT',
              name: 'Self-Signed Certificate Detected',
              severity: 'High',
              category: 'TLS Certificate',
              evidence: `Issuer and Subject are identical (${peerCert.subject?.CN || 'Unknown'}).`,
              explanation: 'Self-signed certificates are not signed by a trusted root CA. Phishers and test environments commonly use self-signed certificates.',
              recommendation: 'Obtain a free automated certificate from Let\'s Encrypt or a trusted commercial CA.'
            });
          }

          // Check key length
          if (peerCert.bits && peerCert.bits < 2048) {
            findings.push({
              id: 'TLS_WEAK_KEY_SIZE',
              name: 'Weak Public Key Size (< 2048 bits)',
              severity: 'Medium',
              category: 'Cryptographic Strength',
              evidence: `Public key size is ${peerCert.bits} bits.`,
              explanation: 'Key sizes below 2048 bits for RSA are considered cryptographically weak and vulnerable to factoring attacks.',
              recommendation: 'Re-generate private key with at least 2048-bit RSA or 256-bit ECDSA.'
            });
          }

          certDetails = {
            hasTls: true,
            status: authorized && !isExpired && domainMatches ? 'Valid' : 'Warning/Invalid',
            authorized,
            authorizationError: authorizationError || null,
            subject: {
              commonName: peerCert.subject?.CN || '',
              organization: peerCert.subject?.O || '',
              country: peerCert.subject?.C || ''
            },
            issuer: {
              commonName: peerCert.issuer?.CN || '',
              organization: peerCert.issuer?.O || '',
              country: peerCert.issuer?.C || ''
            },
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysRemaining,
            isExpired,
            domainMatches,
            isSelfSigned,
            subjectAltNames: sans,
            serialNumber: peerCert.serialNumber,
            fingerprint256: peerCert.fingerprint256,
            bits: peerCert.bits,
            pubkeyAlgorithm: peerCert.pubkey ? 'RSA/ECC' : 'Standard',
            protocolVersion: protocol || 'TLSv1.3',
            cipher: cipher?.name || 'Unknown'
          };

          // Certificate Transparency query (crt.sh)
          try {
            const ctResp = await axios.get(`https://crt.sh/?q=${encodeURIComponent(hostname)}&output=json`, {
              timeout: 3500
            });
            if (Array.isArray(ctResp.data)) {
              ctLogs = ctResp.data.slice(0, 10).map(entry => ({
                id: entry.id,
                loggedAt: entry.entry_timestamp,
                notBefore: entry.not_before,
                notAfter: entry.not_after,
                commonName: entry.common_name,
                issuerName: entry.issuer_name
              }));
            }
          } catch (ctErr) {
            logger.debug(`crt.sh CT lookup skipped for ${hostname}: ${ctErr.message}`);
          }

          socket.destroy();
          return resolve({
            hasTls: true,
            certificate: certDetails,
            findings,
            ctLogs
          });
        } catch (innerErr) {
          logger.error('Error parsing TLS certificate', innerErr);
          if (socket) socket.destroy();
          return resolve({
            hasTls: false,
            error: innerErr.message,
            findings,
            certificate: null,
            ctLogs: []
          });
        }
      });

      socket.on('error', (err) => {
        logger.debug(`TLS handshake error for ${hostname}: ${err.message}`);
        findings.push({
          id: 'TLS_CONNECTION_FAILED',
          name: 'TLS Handshake Failed or Port Closed',
          severity: 'Medium',
          category: 'TLS Certificate',
          evidence: `Unable to establish TLS connection: ${err.message}`,
          explanation: 'The server may not listen on port 443 or does not support SSL/TLS.',
          recommendation: 'Enable HTTPS and configure TLS listeners.'
        });
        return resolve({
          hasTls: false,
          error: err.message,
          findings,
          certificate: null,
          ctLogs: []
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        findings.push({
          id: 'TLS_TIMEOUT',
          name: 'TLS Handshake Timeout (5s)',
          severity: 'Low',
          category: 'TLS Certificate',
          evidence: 'Handshake did not complete within 5000ms.',
          explanation: 'The remote host dropped or filtered TLS handshake packets.',
          recommendation: 'Verify firewall and TLS listener settings.'
        });
        return resolve({
          hasTls: false,
          error: 'Connection timeout',
          findings,
          certificate: null,
          ctLogs: []
        });
      });

    } catch (outerErr) {
      return resolve({
        hasTls: false,
        error: outerErr.message,
        findings,
        certificate: null,
        ctLogs: []
      });
    }
  });
}

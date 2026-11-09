import axios from 'axios';
import { validateAndResolveHost } from '../utils/safeDnsResolver.js';
import { logger } from '../utils/logger.js';

export async function analyzeWebsiteSecurity(targetUrl) {
  const findings = [];
  const headers = {};
  const redirectChain = [];
  let finalDestination = targetUrl;
  let httpStatusCode = null;
  let serverBanner = null;
  let xPoweredBy = null;
  let securityTxtFound = false;
  let cookiesAnalyzed = [];

  // Safe request client with manual redirect inspection and SSRF protection
  let currentUrl = targetUrl;
  let redirectCount = 0;
  const maxRedirects = 5;

  try {
    while (redirectCount < maxRedirects) {
      const parsed = new URL(currentUrl);

      // Validate DNS and IP against SSRF before connecting
      await validateAndResolveHost(parsed.hostname);

      const resp = await axios.get(currentUrl, {
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: () => true, // Don't throw on 3xx or 4xx/5xx
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SentinelX-Security-Scanner/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      httpStatusCode = resp.status;
      Object.assign(headers, resp.headers);
      redirectChain.push({
        url: currentUrl,
        status: resp.status,
        destination: resp.headers.location || null
      });

      // Handle redirect
      if ([301, 302, 303, 307, 308].includes(resp.status) && resp.headers.location) {
        const nextUrl = new URL(resp.headers.location, currentUrl).toString();
        currentUrl = nextUrl;
        redirectCount++;
      } else {
        finalDestination = currentUrl;
        break;
      }
    }
  } catch (err) {
    logger.debug(`HTTP inspection for ${targetUrl}: ${err.message}`);
    // If request failed, report finding
    findings.push({
      id: 'HTTP_CONNECTION_FAILED',
      name: 'HTTP/HTTPS Probe Incomplete',
      severity: 'Low',
      category: 'Network Reachability',
      evidence: `Could not retrieve complete HTTP response: ${err.message}`,
      explanation: 'The remote host dropped the connection, returned a timeout, or actively filters automated scanner requests.',
      recommendation: 'Verify firewall and web server ingress configurations.'
    });
  }

  // Detect excessive redirects
  if (redirectCount >= 4) {
    findings.push({
      id: 'SEC_EXCESSIVE_REDIRECTS',
      name: 'Excessive Redirect Chain Detected',
      severity: 'Medium',
      category: 'Redirect Analysis',
      evidence: `Followed ${redirectCount} redirect hops from ${targetUrl} to ${finalDestination}.`,
      explanation: 'Long redirect chains are frequently used in evasive phishing to bypass perimeter email gateway scanners and delay sandbox execution.',
      recommendation: 'Minimize redirects to reduce attack surface and latency.'
    });
  }

  // Cross-domain redirect detection
  try {
    const originHost = new URL(targetUrl).hostname;
    const destHost = new URL(finalDestination).hostname;
    if (originHost !== destHost) {
      findings.push({
        id: 'SEC_CROSS_DOMAIN_REDIRECT',
        name: 'Unexpected Cross-Domain Redirection',
        severity: 'Medium',
        category: 'Redirect Analysis',
        evidence: `Initial target '${originHost}' redirected to different host '${destHost}'.`,
        explanation: 'Open redirects or unexpected off-site hops can lead users to third-party phishing or deceptive landing pages.',
        recommendation: 'Ensure open redirect vulnerabilities are mitigated on destination servers.'
      });
    }
  } catch {}

  // 1. Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  if (!hsts) {
    findings.push({
      id: 'SEC_MISSING_HSTS',
      name: 'Missing HTTP Strict Transport Security (HSTS)',
      severity: 'Medium',
      category: 'Security Headers',
      evidence: 'Header Strict-Transport-Security is not present in HTTP response.',
      explanation: 'HSTS instructs browsers to strictly communicate over HTTPS only, preventing SSL stripping and downgrade attacks.',
      recommendation: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" to web server headers.'
    });
  }

  // 2. Content-Security-Policy (CSP)
  const csp = headers['content-security-policy'];
  if (!csp) {
    findings.push({
      id: 'SEC_MISSING_CSP',
      name: 'Missing Content Security Policy (CSP)',
      severity: 'Medium',
      category: 'Security Headers',
      evidence: 'Header Content-Security-Policy is not present.',
      explanation: 'Without a Content Security Policy, the application has no native browser-level defense against Cross-Site Scripting (XSS) and malicious script injection.',
      recommendation: 'Define a robust Content-Security-Policy restricting script-src, object-src, and frame-ancestors.'
    });
  }

  // 3. X-Content-Type-Options
  const xcto = headers['x-content-type-options'];
  if (!xcto || xcto.toLowerCase() !== 'nosniff') {
    findings.push({
      id: 'SEC_MISSING_XCTO',
      name: 'Missing X-Content-Type-Options: nosniff',
      severity: 'Low',
      category: 'Security Headers',
      evidence: `X-Content-Type-Options is ${xcto || 'missing'}.`,
      explanation: 'Prevents MIME-sniffing where browsers interpret non-executable MIME types as executable JavaScript or CSS.',
      recommendation: 'Set "X-Content-Type-Options: nosniff" on all responses.'
    });
  }

  // 4. X-Frame-Options / Clickjacking Protection
  const xfo = headers['x-frame-options'];
  const hasFrameAncestors = csp && csp.includes('frame-ancestors');
  if (!xfo && !hasFrameAncestors) {
    findings.push({
      id: 'SEC_MISSING_CLICKJACKING_PROTECTION',
      name: 'Missing Anti-Clickjacking Header (X-Frame-Options)',
      severity: 'Medium',
      category: 'Security Headers',
      evidence: 'Neither X-Frame-Options nor CSP frame-ancestors directive was detected.',
      explanation: 'Allows the website to be framed inside an attacker controlled iframe, enabling Clickjacking / UI Redressing attacks.',
      recommendation: 'Set "X-Frame-Options: SAMEORIGIN" or "Content-Security-Policy: frame-ancestors \'self\'".'
    });
  }

  // 5. Referrer-Policy
  const refPolicy = headers['referrer-policy'];
  if (!refPolicy) {
    findings.push({
      id: 'SEC_MISSING_REFERRER_POLICY',
      name: 'Missing Referrer-Policy Header',
      severity: 'Low',
      category: 'Information Disclosure',
      evidence: 'Referrer-Policy header is absent.',
      explanation: 'Sensitive URL parameters and tokens may leak to third-party endpoints in the Referer header upon outbound navigation.',
      recommendation: 'Set "Referrer-Policy: strict-origin-when-cross-origin".'
    });
  }

  // 6. Server and Technology Information Disclosure
  serverBanner = headers['server'] || null;
  xPoweredBy = headers['x-powered-by'] || null;
  if (serverBanner || xPoweredBy) {
    const disclosed = [serverBanner ? `Server: ${serverBanner}` : null, xPoweredBy ? `X-Powered-By: ${xPoweredBy}` : null].filter(Boolean).join(', ');
    findings.push({
      id: 'SEC_SERVER_INFO_DISCLOSURE',
      name: 'Web Server / Framework Information Disclosure',
      severity: 'Low',
      category: 'Information Disclosure',
      evidence: `Disclosed technology headers: ${disclosed}`,
      explanation: 'Exposing detailed web server versions or backend runtimes assists attackers in fingerprinting known CVE exploits.',
      recommendation: 'Disable Server and X-Powered-By headers in web server configuration.'
    });
  }

  // 7. Cookie Security Flags
  const rawSetCookie = headers['set-cookie'];
  if (rawSetCookie) {
    const cookieList = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
    for (const cookieStr of cookieList) {
      const name = cookieStr.split('=')[0]?.trim();
      const lower = cookieStr.toLowerCase();
      const hasSecure = lower.includes('secure');
      const hasHttpOnly = lower.includes('httponly');
      const hasSameSite = lower.includes('samesite');

      cookiesAnalyzed.push({
        name,
        hasSecure,
        hasHttpOnly,
        hasSameSite
      });

      if (!hasSecure || !hasHttpOnly) {
        findings.push({
          id: `SEC_INSECURE_COOKIE_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
          name: `Cookie '${name}' Missing Security Flags`,
          severity: 'Low',
          category: 'Cookie Security',
          evidence: `Flags: Secure=${hasSecure}, HttpOnly=${hasHttpOnly}, SameSite=${hasSameSite}`,
          explanation: 'Cookies without Secure flag transmit over plaintext. Missing HttpOnly allows JavaScript access via XSS.',
          recommendation: 'Ensure all session and auth cookies use Secure, HttpOnly, and SameSite=Lax/Strict.'
        });
      }
    }
  }

  // 8. Publicly Accessible security.txt check (RFC 9116)
  try {
    const parsed = new URL(finalDestination);
    const secTxtUrl = `${parsed.protocol}//${parsed.hostname}/.well-known/security.txt`;
    const secResp = await axios.get(secTxtUrl, {
      timeout: 3000,
      validateStatus: (s) => s === 200,
      headers: { 'User-Agent': 'SentinelX-Security-Scanner/1.0' }
    });
    if (secResp.status === 200 && typeof secResp.data === 'string' && secResp.data.includes('Contact:')) {
      securityTxtFound = true;
    }
  } catch {
    securityTxtFound = false;
  }

  return {
    httpStatusCode,
    finalDestination,
    redirectChain,
    serverBanner,
    xPoweredBy,
    securityTxtFound,
    cookiesAnalyzed,
    headers: {
      strictTransportSecurity: hsts || null,
      contentSecurityPolicy: csp || null,
      xContentTypeOptions: xcto || null,
      xFrameOptions: xfo || null,
      referrerPolicy: refPolicy || null,
      permissionsPolicy: headers['permissions-policy'] || null,
      server: serverBanner,
      xPoweredBy: xPoweredBy
    },
    findings
  };
}

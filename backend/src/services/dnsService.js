import dns from 'dns/promises';
import axios from 'axios';
import { logger } from '../utils/logger.js';

export async function analyzeDns(hostname) {
  const findings = [];
  const records = {
    a: [],
    aaaa: [],
    mx: [],
    ns: [],
    txt: [],
    rdap: null
  };

  // 1. Resolve A records
  try {
    records.a = await dns.resolve4(hostname);
  } catch (err) {
    logger.debug(`No A records for ${hostname}: ${err.code}`);
  }

  // 2. Resolve AAAA records
  try {
    records.aaaa = await dns.resolve6(hostname);
  } catch (err) {
    logger.debug(`No AAAA records for ${hostname}: ${err.code}`);
  }

  // 3. Resolve MX records
  try {
    const mxList = await dns.resolveMx(hostname);
    records.mx = mxList.sort((a, b) => a.priority - b.priority).map(m => `${m.exchange} (pri: ${m.priority})`);
  } catch (err) {
    logger.debug(`No MX records for ${hostname}: ${err.code}`);
  }

  // 4. Resolve NS records
  try {
    records.ns = await dns.resolveNs(hostname);
  } catch (err) {
    logger.debug(`No NS records for ${hostname}: ${err.code}`);
  }

  // 5. Resolve TXT records (SPF, DMARC, Domain Verification)
  try {
    const txtList = await dns.resolveTxt(hostname);
    records.txt = txtList.map(t => t.join(' '));
  } catch (err) {
    logger.debug(`No TXT records for ${hostname}: ${err.code}`);
  }

  // Evaluate Findings based on DNS
  if (records.a.length === 0 && records.aaaa.length === 0) {
    findings.push({
      id: 'DNS_NO_ADDRESS_RECORDS',
      name: 'No Address Records (A or AAAA) Configured',
      severity: 'Medium',
      category: 'DNS Configuration',
      evidence: `Domain has no resolvable IPv4 or IPv6 records.`,
      explanation: 'The domain does not currently point to an active host. It may be parked, seized, or undergoing DNS propagation.',
      recommendation: 'Check again later or verify DNS configuration.'
    });
  }

  // 6. RDAP Domain Registration Age Check (ICANN RDAP)
  try {
    // Extract base domain for RDAP
    const parts = hostname.split('.');
    const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : hostname;

    const rdapResp = await axios.get(`https://rdap.org/domain/${baseDomain}`, {
      timeout: 3000,
      headers: { 'Accept': 'application/rdap+json' }
    });

    if (rdapResp.data && rdapResp.data.events) {
      const registrationEvent = rdapResp.data.events.find(e => e.eventAction === 'registration');
      const expirationEvent = rdapResp.data.events.find(e => e.eventAction === 'expiration');

      records.rdap = {
        registeredAt: registrationEvent?.eventDate || null,
        expiresAt: expirationEvent?.eventDate || null,
        registrar: rdapResp.data.entities?.[0]?.vcardArray?.[1]?.find(item => item[0] === 'fn')?.[3] || 'Available in RDAP',
        domain: baseDomain
      };

      if (registrationEvent?.eventDate) {
        const regDate = new Date(registrationEvent.eventDate);
        const ageInDays = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
        records.rdap.ageInDays = ageInDays;

        if (ageInDays < 14) {
          findings.push({
            id: 'DNS_NEWLY_REGISTERED_DOMAIN',
            name: 'Newly Registered Domain (< 14 Days Old)',
            severity: 'High',
            category: 'Domain Age',
            evidence: `Domain was registered ${ageInDays} days ago on ${regDate.toISOString().split('T')[0]}.`,
            explanation: 'The vast majority of disposable phishing and malware infrastructure is registered immediately prior to campaign launch.',
            recommendation: 'Treat websites registered in the last two weeks with high suspicion.'
          });
        } else if (ageInDays < 60) {
          findings.push({
            id: 'DNS_YOUNG_DOMAIN',
            name: 'Young Domain (< 60 Days Old)',
            severity: 'Low',
            category: 'Domain Age',
            evidence: `Domain is ${ageInDays} days old.`,
            explanation: 'Young domains lack established reputation history across threat intelligence sensors.',
            recommendation: 'Verify organization authenticity through independent channels.'
          });
        }
      }
    }
  } catch (err) {
    logger.debug(`RDAP lookup not available for ${hostname}: ${err.message}`);
    records.rdap = {
      status: 'Unavailable or Rate Limited',
      note: 'RDAP provider did not return verifiable registration timestamp.'
    };
  }

  return {
    records,
    findings
  };
}

import net from 'net';

// High-target brands commonly impersonated by phishing campaigns
const MONITORED_BRANDS = [
  { brand: 'PayPal', keywords: ['paypal', 'pay-pal', 'paypaI', 'paypai'] },
  { brand: 'Apple', keywords: ['apple', 'appleid', 'icloud', 'app-store', 'itunes'] },
  { brand: 'Microsoft', keywords: ['microsoft', 'office365', 'outlook', 'onedrive', 'azure', 'ms-online'] },
  { brand: 'Google', keywords: ['google', 'gmail', 'google-drive', 'googleplay', 'workspace'] },
  { brand: 'Amazon', keywords: ['amazon', 'amazon-pay', 'aws-verify', 'prime-video'] },
  { brand: 'Netflix', keywords: ['netflix', 'netflix-billing', 'netfIix'] },
  { brand: 'Bank of America', keywords: ['bankofamerica', 'bofa', 'bofa-auth'] },
  { brand: 'Chase', keywords: ['chase', 'chase-online', 'chase-bank'] },
  { brand: 'Wells Fargo', keywords: ['wellsfargo', 'wells-fargo'] },
  { brand: 'Steam', keywords: ['steampowered', 'steamcommunity', 'steam-trade'] },
  { brand: 'Binance', keywords: ['binance', 'binance-wallet', 'binance-login'] },
  { brand: 'Coinbase', keywords: ['coinbase', 'coinbase-pro', 'coinbase-verify'] },
  { brand: 'DHL', keywords: ['dhl', 'dhl-tracking', 'dhl-parcel'] },
  { brand: 'FedEx', keywords: ['fedex', 'fedex-delivery', 'fedex-parcel'] },
  { brand: 'Facebook/Meta', keywords: ['facebook', 'fb-security', 'meta-support', 'instagram'] }
];

// Higher risk TLDs frequently abused in ephemeral phishing
const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'work', 'click', 'loan', 'buzz', 'tk', 'ml', 'ga', 'cf', 'gq',
  'country', 'stream', 'gdn', 'racing', 'date', 'faith', 'review', 'download', 'win'
];

// Phishing lure keywords
const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'log-in', 'sign-in', 'secure', 'security', 'account', 'verify',
  'verification', 'confirm', 'update', 'banking', 'wallet', 'recover', 'token', 'support',
  'billing', 'invoice', 'authenticate', 'password', 'credential', 'suspension', 'reactivate'
];

function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

export function analyzeUrlStructure(parsedUrl) {
  const { originalUrl, normalizedUrl, protocol, hostname, pathname, search } = parsedUrl;
  const fullUrl = normalizedUrl;

  const findings = [];
  const indicators = {};

  // 1. URL Length Analysis
  const isExcessivelyLong = fullUrl.length > 100;
  indicators.urlLength = fullUrl.length;
  if (fullUrl.length > 150) {
    findings.push({
      id: 'URL_EXCESSIVE_LENGTH',
      name: 'Abnormally Long URL Structure',
      severity: 'Medium',
      category: 'URL Structure',
      evidence: `URL length is ${fullUrl.length} characters (typical legitimate URLs are < 75).`,
      explanation: 'Phishers frequently use elongated URLs with repeated padding to hide deceptive domain names or confuse mobile address bars.',
      recommendation: 'Inspect the primary registered domain carefully before interacting.'
    });
  }

  // 2. IP Address in Hostname
  const isIpHost = net.isIP(hostname) !== 0;
  indicators.isDirectIp = isIpHost;
  if (isIpHost) {
    findings.push({
      id: 'URL_RAW_IP_HOSTNAME',
      name: 'Direct IP Address Used in Hostname',
      severity: 'High',
      category: 'URL Structure',
      evidence: `Hostname is direct IP: ${hostname}`,
      explanation: 'Legitimate corporate, banking, and SaaS websites use registered domain names with TLS certificates. Using raw IP addresses is common in malware staging, command and control, or evasive phishing.',
      recommendation: 'Avoid entering any sensitive data or passwords on raw IP addresses.'
    });
  }

  // 3. Subdomain Depth & Entropy
  const domainParts = hostname.split('.');
  const subdomainCount = Math.max(0, domainParts.length - 2);
  indicators.subdomainCount = subdomainCount;

  if (subdomainCount >= 3) {
    findings.push({
      id: 'URL_EXCESSIVE_SUBDOMAINS',
      name: 'Deep Nested Subdomain Structure',
      severity: 'Medium',
      category: 'Domain Structure',
      evidence: `Detected ${subdomainCount} subdomains (${hostname}).`,
      explanation: 'Attackers create excessive subdomains to make URLs look authentic on mobile screens (e.g. login.chase.com.evilsite.xyz).',
      recommendation: 'Verify the rightmost two domain segments to identify the true root domain.'
    });
  }

  // 4. Excessive Hyphens
  const hyphenCountInHost = (hostname.match(/-/g) || []).length;
  indicators.hyphenCount = hyphenCountInHost;
  if (hyphenCountInHost >= 3) {
    findings.push({
      id: 'URL_EXCESSIVE_HYPHENS',
      name: 'Multiple Hyphens in Hostname',
      severity: 'Medium',
      category: 'Domain Structure',
      evidence: `Hostname contains ${hyphenCountInHost} hyphens: ${hostname}`,
      explanation: 'Multiple hyphens are commonly combined with well-known brand names to bypass domain availability checks (e.g. paypal-security-update-center).',
      recommendation: 'Verify domain ownership directly through the brand official website.'
    });
  }

  // 5. Punycode / Internationalized Domain Name (IDN) Homograph Attack
  const isPunycode = hostname.includes('xn--');
  indicators.isPunycode = isPunycode;
  if (isPunycode) {
    findings.push({
      id: 'URL_PUNYCODE_IDN',
      name: 'Punycode / Internationalized Domain Name Detected',
      severity: 'High',
      category: 'Homograph Phishing',
      evidence: `Punycode representation: ${hostname}`,
      explanation: 'IDN Punycode domains can substitute Cyrillic or Greek characters that look visually identical to Latin characters (e.g., Cyrillic "а" instead of Latin "a").',
      recommendation: 'Exercise extreme caution. Do not input credentials unless the domain has been independently confirmed.'
    });
  }

  // 6. Suspicious TLD Analysis
  const tld = domainParts[domainParts.length - 1];
  indicators.tld = tld;
  const isSuspiciousTld = SUSPICIOUS_TLDS.includes(tld);
  if (isSuspiciousTld) {
    findings.push({
      id: 'URL_HIGH_RISK_TLD',
      name: 'High-Abuse Top-Level Domain (TLD)',
      severity: 'Low',
      category: 'Domain Reputation',
      evidence: `Domain uses '.${tld}' TLD which has documented high statistical abuse rates in disposable phishing.`,
      explanation: 'While some legitimate sites use this TLD, it is frequently favored by cybercriminals due to low registration barriers and bulk free pricing.',
      recommendation: 'Evaluate in conjunction with brand impersonation and TLS certificate indicators.'
    });
  }

  // 7. Protocol Analysis (HTTP vs HTTPS)
  const isHttps = protocol === 'https';
  indicators.isHttps = isHttps;
  if (!isHttps) {
    findings.push({
      id: 'URL_CLEARTEXT_HTTP',
      name: 'Unencrypted Cleartext HTTP Protocol',
      severity: 'Medium',
      category: 'Transport Security',
      evidence: `URL specifies cleartext http:// protocol.`,
      explanation: 'Traffic sent over plain HTTP is unencrypted and vulnerable to eavesdropping, credential interception, and adversary-in-the-middle tampering.',
      recommendation: 'Never submit passwords, personal identifiable information (PII), or payment details over plain HTTP.'
    });
  }

  // 8. Unusual Characters (@, %, // in path)
  if (originalUrl.includes('@')) {
    findings.push({
      id: 'URL_CREDENTIAL_USERINFO_TRICK',
      name: 'Embedded Userinfo Symbol (@) in URL',
      severity: 'High',
      category: 'URL Obfuscation',
      evidence: `Found '@' symbol in URL: ${originalUrl}`,
      explanation: 'Standard URL specifications interpret everything before the @ symbol as HTTP basic credentials, causing browsers to actually connect to the host following the @ symbol.',
      recommendation: 'Do not follow this link. This is a classic phishing deception technique.'
    });
  }

  // 9. Brand Impersonation Inspection
  const detectedBrandImpersonations = [];
  const lowerUrl = fullUrl.toLowerCase();
  for (const { brand, keywords } of MONITORED_BRANDS) {
    for (const kw of keywords) {
      if (hostname.includes(kw)) {
        // Check if the domain is legitimately owned by the brand
        const isLegitDomain = hostname.endsWith(`.${kw}.com`) ||
                              hostname === `${kw}.com` ||
                              hostname.endsWith(`.${kw}.org`) ||
                              hostname === `${kw}.org` ||
                              hostname.endsWith(`.${kw}.net`);
        if (!isLegitDomain) {
          detectedBrandImpersonations.push({ brand, matchedKeyword: kw, target: 'hostname' });
          findings.push({
            id: `BRAND_IMPERSONATION_${brand.toUpperCase().replace(/[^A-Z]/g, '')}`,
            name: `Potential Brand Impersonation: ${brand}`,
            severity: 'High',
            category: 'Brand Protection',
            evidence: `Monitored brand keyword '${kw}' appears in non-official domain '${hostname}'.`,
            explanation: `The domain references '${brand}', but its root domain structure does not appear to belong to the official organization.`,
            recommendation: `Navigate directly to the official ${brand} website by typing the address manually.`
          });
          break;
        }
      } else if (pathname.toLowerCase().includes(kw)) {
        detectedBrandImpersonations.push({ brand, matchedKeyword: kw, target: 'path' });
      }
    }
  }
  indicators.detectedBrandImpersonations = detectedBrandImpersonations;

  // 10. Phishing Lure Keywords in Subdomain or Path
  const matchedKeywords = [];
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (hostname.includes(kw) || pathname.toLowerCase().includes(kw)) {
      matchedKeywords.push(kw);
    }
  }
  indicators.matchedKeywords = matchedKeywords;
  if (matchedKeywords.length >= 2 && detectedBrandImpersonations.length > 0) {
    findings.push({
      id: 'PHISHING_LURE_KEYWORD_COMBO',
      name: 'High-Probability Phishing Lure Keyword Combination',
      severity: 'High',
      category: 'Phishing Heuristics',
      evidence: `Found multiple authentication lure keywords (${matchedKeywords.slice(0, 4).join(', ')}) combined with brand impersonation.`,
      explanation: 'Attackers craft URL paths mimicking account verification, credential recovery, or billing suspension workflows.',
      recommendation: 'Treat this URL as a high-risk credential harvesting trap.'
    });
  }

  // 11. Hostname & Path Shannon Entropy
  const hostEntropy = calculateEntropy(hostname);
  indicators.hostEntropy = hostEntropy;
  if (hostEntropy > 3.8 && hostname.length > 18) {
    findings.push({
      id: 'URL_HIGH_ENTROPY_DOMAIN',
      name: 'High Character Randomness / Entropy in Domain',
      severity: 'Medium',
      category: 'Domain Heuristics',
      evidence: `Domain entropy is ${hostEntropy} bits (indicative of algorithmic or randomly generated domains).`,
      explanation: 'Domain Generation Algorithms (DGA) and disposable phishing kits frequently use randomized alphanumeric domain names.',
      recommendation: 'Evaluate whether this domain matches any known legitimate service.'
    });
  }

  return {
    indicators,
    findings,
    isSuspicious: findings.some(f => f.severity === 'Critical' || f.severity === 'High')
  };
}

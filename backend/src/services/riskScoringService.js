export function calculateRiskScore({
  urlAnalysis,
  dnsAnalysis,
  certificateAnalysis,
  websiteSecurity,
  threatIntelligence
}) {
  let score = 0;
  const positiveSignals = [];
  const recommendations = [];
  const findings = [];
  const deduplicationSet = new Set();

  function addFinding(f) {
    if (!f || !f.id) return;
    if (deduplicationSet.has(f.id)) return;
    deduplicationSet.add(f.id);
    findings.push(f);
  }

  // Aggregate findings from all services
  (urlAnalysis?.findings || []).forEach(addFinding);
  (dnsAnalysis?.findings || []).forEach(addFinding);
  (certificateAnalysis?.findings || []).forEach(addFinding);
  (websiteSecurity?.findings || []).forEach(addFinding);

  // 1. Threat Intelligence Evaluation (Highest Weight)
  let threatIntelWeight = 0;
  if (threatIntelligence?.isMalicious) {
    const highestConfidence = Math.max(...threatIntelligence.matches.map(m => m.confidence || 85));
    // Confirmed threat match drives score directly into High / Critical
    threatIntelWeight = Math.max(80, highestConfidence);
    score += threatIntelWeight;

    for (const match of threatIntelligence.matches) {
      addFinding({
        id: `TI_MATCH_${match.source.replace(/[^A-Za-z0-9]/g, '_')}`,
        name: `Blacklisted by ${match.source}`,
        severity: 'Critical',
        category: 'Threat Intelligence',
        evidence: match.details,
        explanation: `This destination was independently verified as malicious by threat intelligence feed '${match.source}' (${match.threatType}).`,
        recommendation: 'Block all incoming and outgoing connections to this domain immediately.'
      });
    }
  } else {
    positiveSignals.push('Clean across all integrated Threat Intelligence feeds (URLhaus, CYVEX, Abuse feeds)');
  }

  // 2. Phishing URL & Structural Evaluation
  let phishingWeight = 0;
  const indicators = urlAnalysis?.indicators || {};

  if (indicators.detectedBrandImpersonations?.length > 0) {
    const brands = indicators.detectedBrandImpersonations.map(b => b.brand).join(', ');
    phishingWeight += 35;
    recommendations.push(`Exercise high caution: Potential brand impersonation targeting ${brands}. Verify domain via official company channels.`);
  }

  if (indicators.isPunycode) {
    phishingWeight += 25;
    recommendations.push('Punycode domain detected: Watch for homograph / lookalike character substitutions.');
  }

  if (indicators.isDirectIp) {
    phishingWeight += 25;
    recommendations.push('Host uses raw IP address instead of domain. Avoid submitting sensitive credentials.');
  }

  if ((indicators.matchedKeywords?.length || 0) >= 2 && indicators.detectedBrandImpersonations?.length > 0) {
    phishingWeight += 20;
  } else if ((indicators.matchedKeywords?.length || 0) >= 3) {
    phishingWeight += 12;
  }

  if (indicators.hyphenCount >= 3) {
    phishingWeight += 8;
  }

  if (indicators.subdomainCount >= 3) {
    phishingWeight += 10;
  }

  score += Math.min(phishingWeight, 50); // Cap purely heuristic phishing contribution at 50 if no threat intel match

  // 3. Domain Registration Age
  const rdap = dnsAnalysis?.records?.rdap;
  if (rdap && rdap.ageInDays !== undefined) {
    if (rdap.ageInDays < 14) {
      score += 25;
      recommendations.push('Domain was registered less than 14 days ago. New domains represent significant disposable phishing risk.');
    } else if (rdap.ageInDays < 60) {
      score += 10;
    } else if (rdap.ageInDays > 365) {
      positiveSignals.push(`Established domain registration age (${Math.floor(rdap.ageInDays / 365)} years old)`);
    }
  }

  // 4. TLS Certificate Analysis
  let certWeight = 0;
  if (certificateAnalysis?.hasTls && certificateAnalysis?.certificate) {
    const cert = certificateAnalysis.certificate;
    if (cert.status === 'Valid') {
      positiveSignals.push(`Valid SSL/TLS certificate issued by ${cert.issuer?.organization || cert.issuer?.commonName || 'Trusted CA'}`);
    }

    if (cert.isExpired) {
      certWeight += 18;
      recommendations.push('TLS certificate is expired. Communications cannot be safely verified.');
    }
    if (cert.isSelfSigned) {
      certWeight += 22;
      recommendations.push('Self-signed certificate detected. Do not trust this certificate on public websites.');
    }
    if (!cert.domainMatches) {
      certWeight += 22;
      recommendations.push('Certificate Common Name does not match requested host. Potential adversary-in-the-middle or misconfiguration.');
    }
    if (!cert.authorized && !cert.isExpired && !cert.isSelfSigned) {
      certWeight += 15;
    }

    if (cert.daysRemaining > 60 && !cert.isSelfSigned && cert.domainMatches) {
      positiveSignals.push(`Certificate valid for ${cert.daysRemaining} days remaining`);
    }
  } else if (indicators.isHttps) {
    certWeight += 20;
  }

  score += Math.min(certWeight, 30);

  // 5. Website Security Configuration (Passive Headers)
  let headerWeight = 0;
  const headers = websiteSecurity?.headers || {};

  if (!headers.strictTransportSecurity) {
    headerWeight += 4;
    recommendations.push('Enable Strict-Transport-Security (HSTS) with a long max-age to prevent protocol downgrade attacks.');
  } else {
    positiveSignals.push('HTTP Strict Transport Security (HSTS) properly configured');
  }

  if (!headers.contentSecurityPolicy) {
    headerWeight += 4;
    recommendations.push('Implement Content-Security-Policy (CSP) to defend against Cross-Site Scripting (XSS).');
  } else {
    positiveSignals.push('Content Security Policy (CSP) detected');
  }

  if (!headers.xFrameOptions) {
    headerWeight += 3;
    recommendations.push('Configure X-Frame-Options or frame-ancestors to defend against Clickjacking.');
  } else {
    positiveSignals.push('Clickjacking protection enabled (X-Frame-Options)');
  }

  if (headers.xContentTypeOptions !== 'nosniff') {
    headerWeight += 2;
  }

  if (websiteSecurity?.serverBanner || websiteSecurity?.xPoweredBy) {
    headerWeight += 2;
    recommendations.push('Mask or remove Server and X-Powered-By response headers to avoid information disclosure.');
  }

  if (websiteSecurity?.securityTxtFound) {
    positiveSignals.push('Standard security.txt vulnerability disclosure policy found');
  }

  score += headerWeight;

  // Cap and classify final score
  score = Math.min(100, Math.max(0, Math.round(score)));
  const riskLevel = score >= 80 ? 'Critical Risk' : score >= 60 ? 'High Risk' : score >= 40 ? 'Moderate Risk' : score >= 20 ? 'Low Risk' : 'Minimal Risk';

  const confidence = Math.min(99, Math.round(60 + (findings.length * 5)));
  const evidenceCoverage = threatIntelWeight > 0 ? 'Comprehensive' : findings.length > 3 ? 'Expanded' : 'Standard';

  return {
    riskScore: score,
    riskLevel,
    confidence,
    evidenceCoverage,
    findings,
    positiveSignals,
    recommendations,
    sourcesChecked: threatIntelligence?.sourcesChecked || []
  };
}

import { normalizeUrl } from '../utils/urlNormalizer.js';
import { validateAndResolveHost } from '../utils/safeDnsResolver.js';
import { analyzeUrlStructure } from '../services/urlAnalysisService.js';
import { analyzeDns } from '../services/dnsService.js';
import { analyzeCertificate } from '../services/certificateService.js';
import { analyzeWebsiteSecurity } from '../services/websiteSecurityService.js';
import { checkThreatIntelligence } from '../services/threatIntelligenceService.js';
import { calculateRiskScore } from '../services/riskScoringService.js';
import { generatePdfSecurityReport } from '../services/pdfReportService.js';
import { Scan } from '../models/Scan.js';
import { logger } from '../utils/logger.js';

// Pre-configured simulated test fixtures for safe testing without visiting live malware
const SIMULATED_FIXTURES = {
  'paypal-security-verification.fake-bank-login.com': {
    riskScore: 92,
    riskLevel: 'Critical Risk',
    confidence: 96,
    evidenceCoverage: 'Comprehensive (Simulated Fixture)',
    isSimulated: true,
    findings: [
      {
        id: 'SIM_TI_URLHAUS',
        name: 'Blacklisted by abuse.ch URLhaus',
        severity: 'Critical',
        category: 'Threat Intelligence',
        evidence: 'Listed on active malware/phishing feed URLhaus with tag #paypal-phish.',
        explanation: 'Independently confirmed malicious host active in credential harvesting.',
        recommendation: 'Block this domain immediately across firewall and email gateways.'
      },
      {
        id: 'SIM_BRAND_PAYPAL',
        name: 'Brand Impersonation: PayPal',
        severity: 'High',
        category: 'Brand Protection',
        evidence: 'Keyword "paypal" embedded into non-PayPal domain "fake-bank-login.com".',
        explanation: 'Attacker leverages PayPal branding to deceptively request account credentials.',
        recommendation: 'Navigate only to official https://www.paypal.com.'
      },
      {
        id: 'SIM_TLS_UNTRUSTED',
        name: 'Self-Signed / Untrusted TLS Certificate',
        severity: 'High',
        category: 'TLS Certificate',
        evidence: 'Certificate CN=fake-bank-login.com not verified by public trust store.',
        explanation: 'Self-signed certificate triggers ERR_CERT_AUTHORITY_INVALID in browsers.',
        recommendation: 'Never accept security certificate exceptions.'
      },
      {
        id: 'SIM_MISSING_HSTS',
        name: 'Missing HTTP Strict Transport Security (HSTS)',
        severity: 'Medium',
        category: 'Security Headers',
        evidence: 'HSTS header absent.',
        explanation: 'Allows SSL stripping downgrade attacks.',
        recommendation: 'Enforce HSTS with long max-age.'
      }
    ],
    positiveSignals: [],
    sourcesChecked: ['CYVEX Internal Threat Intelligence', 'abuse.ch URLhaus', 'PhishTank Database'],
    recommendations: [
      'CRITICAL: Do not open or enter any passwords on this website.',
      'Report URL to brand protection at spoof@paypal.com.',
      'Deploy endpoint quarantine if users have submitted credentials.'
    ]
  },
  'appleid-support-icloud-secure.info': {
    riskScore: 88,
    riskLevel: 'Critical Risk',
    confidence: 94,
    evidenceCoverage: 'Comprehensive (Simulated Fixture)',
    isSimulated: true,
    findings: [
      {
        id: 'SIM_BRAND_APPLE',
        name: 'Brand Impersonation: Apple ID / iCloud',
        severity: 'High',
        category: 'Brand Protection',
        evidence: 'Deceptive subdomains "appleid-support-icloud" targeting Apple users.',
        explanation: 'Phishing portal designed to harvest Apple ID credentials and 2FA SMS tokens.',
        recommendation: 'Only access Apple ID via https://appleid.apple.com.'
      },
      {
        id: 'SIM_YOUNG_DOMAIN',
        name: 'Newly Registered Disposable Domain',
        severity: 'High',
        category: 'Domain Age',
        evidence: 'Registered 3 days ago through privacy-shielded registrar.',
        explanation: 'Disposable domain infrastructure spun up for targeted campaign.',
        recommendation: 'Treat newly created domains with heightened scrutiny.'
      }
    ],
    positiveSignals: [],
    sourcesChecked: ['CYVEX Internal Threat Intelligence', 'abuse.ch URLhaus'],
    recommendations: [
      'Do not disclose Apple ID credentials or two-factor authorization codes.'
    ]
  }
};

export async function runScan(req, res, next) {
  const startTime = Date.now();
  try {
    const { url, deepScan = true, simulate = false } = req.body;

    // 1. Normalize URL
    const parsed = normalizeUrl(url);

    // 2. Check if this is a requested simulation or known test fixture
    if (simulate || SIMULATED_FIXTURES[parsed.hostname]) {
      const fixture = SIMULATED_FIXTURES[parsed.hostname] || {
        riskScore: 78,
        riskLevel: 'High Risk',
        confidence: 90,
        evidenceCoverage: 'Simulated Test Fixture',
        isSimulated: true,
        findings: [
          {
            id: 'SIM_GENERIC_PHISH',
            name: 'Controlled Test Fixture - Simulated Malicious Behavior',
            severity: 'High',
            category: 'Simulation',
            evidence: `Simulated scan trigger for ${parsed.hostname}.`,
            explanation: 'This result was produced using controlled test fixtures to verify detection rules without live malicious exploitation.',
            recommendation: 'Use simulated fixtures for testing SIEM and SOAR integrations.'
          }
        ],
        positiveSignals: ['Controlled test sandbox environment'],
        sourcesChecked: ['CYVEX Simulated Threat Engine'],
        recommendations: ['Demonstration test completed.']
      };

      const simulatedScan = await Scan.create({
        userId: req.user ? req.user.id : null,
        originalUrl: parsed.originalUrl,
        normalizedUrl: parsed.normalizedUrl,
        hostname: parsed.hostname,
        ipAddress: '198.51.100.1 (Documentation / Test IP)',
        riskScore: fixture.riskScore,
        riskLevel: fixture.riskLevel,
        confidence: fixture.confidence,
        evidenceCoverage: fixture.evidenceCoverage,
        findings: fixture.findings,
        positiveSignals: fixture.positiveSignals,
        recommendations: fixture.recommendations,
        phishingAnalysis: { isSimulated: true, indicators: { isDirectIp: false } },
        certificateAnalysis: { hasTls: true, certificate: { status: 'Untrusted (Simulated)', isExpired: true } },
        websiteSecurityAnalysis: { headers: {}, securityTxtFound: false },
        dnsIntelligence: { records: { a: ['198.51.100.1'], mx: [] } },
        threatIntelligenceResults: { isMalicious: true, matches: [{ source: 'Simulated Feed', threatType: 'Phishing', confidence: 95 }] },
        sourcesChecked: fixture.sourcesChecked,
        scanDurationMs: 45,
        scannedAt: new Date().toISOString()
      });

      return res.status(201).json({
        success: true,
        isSimulated: true,
        scan: simulatedScan
      });
    }

    // 3. Controlled DNS pre-resolution & SSRF Validation
    let resolvedHost;
    try {
      resolvedHost = await validateAndResolveHost(parsed.hostname);
    } catch (ssrfErr) {
      return res.status(400).json({
        success: false,
        error: ssrfErr.message,
        code: 'SSRF_PROTECTION_BLOCKED'
      });
    }

    logger.info(`Initiating scan for ${parsed.normalizedUrl} (IP: ${resolvedHost.resolvedIp || 'NXDOMAIN'})`);

    // 4. Multi-Vector Security Pipeline
    const urlAnalysis = analyzeUrlStructure(parsed);

    if (resolvedHost.isNxDomain) {
      urlAnalysis.findings.push({
        id: 'DNS_NXDOMAIN_UNRESOLVED',
        name: 'Domain Does Not Resolve (NXDOMAIN / Inactive)',
        severity: 'Medium',
        category: 'DNS Resolution',
        evidence: `DNS lookup failed for host ${parsed.hostname} (${resolvedHost.dnsError || 'NXDOMAIN'}).`,
        explanation: 'Domain has no active A or AAAA records. This frequently indicates an ephemeral phishing domain that was taken down or abandoned.',
        recommendation: 'Domain is currently unreachable.'
      });
    }

    const dnsPromise = analyzeDns(parsed.hostname);

    // Only attempt TLS and HTTP if the domain resolves to an IP
    let certPromise = Promise.resolve({ hasTls: false, certificate: null, findings: [], ctLogs: [] });
    let secPromise = Promise.resolve({ httpStatusCode: null, headers: {}, findings: [], redirectChain: [] });

    if (!resolvedHost.isNxDomain) {
      certPromise = analyzeCertificate(parsed.hostname, parsed.port);
      secPromise = analyzeWebsiteSecurity(parsed.normalizedUrl);
    }

    const intelPromise = checkThreatIntelligence(parsed.normalizedUrl, parsed.hostname);

    const [dnsAnalysis, certificateAnalysis, websiteSecurity, threatIntelligence] = await Promise.all([
      dnsPromise,
      certPromise,
      secPromise,
      intelPromise
    ]);

    // 5. Weighted Risk Scoring Engine
    const scoreResult = calculateRiskScore({
      urlAnalysis,
      dnsAnalysis,
      certificateAnalysis,
      websiteSecurity,
      threatIntelligence
    });

    const scanDurationMs = Date.now() - startTime;

    // 6. Build and Save Scan Record
    const scanData = {
      userId: req.user ? req.user.id : null,
      originalUrl: parsed.originalUrl,
      normalizedUrl: parsed.normalizedUrl,
      hostname: parsed.hostname,
      ipAddress: resolvedHost.resolvedIp || 'Unresolved (NXDOMAIN)',
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      confidence: scoreResult.confidence,
      evidenceCoverage: scoreResult.evidenceCoverage,
      findings: scoreResult.findings,
      positiveSignals: scoreResult.positiveSignals,
      recommendations: scoreResult.recommendations,
      phishingAnalysis: urlAnalysis,
      certificateAnalysis,
      websiteSecurityAnalysis: websiteSecurity,
      dnsIntelligence: dnsAnalysis,
      threatIntelligenceResults: threatIntelligence,
      sourcesChecked: scoreResult.sourcesChecked,
      scanDurationMs,
      scannedAt: new Date().toISOString()
    };

    const savedScan = await Scan.create(scanData);

    res.status(201).json({
      success: true,
      isSimulated: false,
      scan: savedScan
    });
  } catch (err) {
    logger.error('Scan execution failure', err);
    res.status(500).json({
      success: false,
      error: `Security scan could not complete: ${err.message}`
    });
  }
}

export async function getScans(req, res, next) {
  try {
    const query = {};
    if (req.user && req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (!req.user) {
      query.userId = null;
    }

    const scans = await Scan.find(query);
    res.json({
      success: true,
      count: scans.length,
      scans
    });
  } catch (err) {
    next(err);
  }
}

export async function getScanById(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await Scan.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan record not found'
      });
    }

    if (scan.userId && (!req.user || (req.user.id !== scan.userId && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Private scan record'
      });
    }

    res.json({
      success: true,
      scan
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteScan(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await Scan.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan record not found'
      });
    }

    if (!req.user || (req.user.id !== scan.userId && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only delete your own scans'
      });
    }

    await Scan.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Scan record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadPdfReport(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await Scan.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan report not found'
      });
    }

    const pdfBuffer = await generatePdfSecurityReport(scan);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CYVEX_Report_${scan.hostname}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

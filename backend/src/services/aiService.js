import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

function generateDeterministicExplanation(scanData, question) {
  const { hostname, riskScore, riskLevel, findings, positiveSignals, certificateAnalysis, websiteSecurityAnalysis, threatIntelligenceResults } = scanData;

  const topFindings = (findings || []).slice(0, 4);
  const criticalFindings = (findings || []).filter(f => f.severity === 'Critical' || f.severity === 'High');

  let explanation = `### 🛡️ SentinelX Security Analysis Summary for **${hostname}**\n\n`;
  explanation += `**Assigned Risk Assessment:** **${riskLevel} (${riskScore}/100)**\n\n`;

  if (threatIntelligenceResults?.isMalicious) {
    explanation += `> ⚠️ **Threat Intelligence Alert**: This domain has been identified as malicious by verified intelligence feeds (${threatIntelligenceResults.matches.map(m => m.source).join(', ')}).\n\n`;
  }

  if (criticalFindings.length > 0) {
    explanation += `#### 🚨 Primary Security Concerns:\n`;
    criticalFindings.forEach((f, idx) => {
      explanation += `${idx + 1}. **${f.name}** (${f.severity} Severity)\n   - *Evidence:* ${f.evidence}\n   - *Risk:* ${f.explanation}\n   - *Action:* ${f.recommendation}\n\n`;
    });
  } else if (topFindings.length > 0) {
    explanation += `#### 🔍 Observable Security Indicators:\n`;
    topFindings.forEach((f, idx) => {
      explanation += `${idx + 1}. **${f.name}** (${f.severity})\n   - ${f.explanation}\n`;
    });
    explanation += '\n';
  }

  if (positiveSignals && positiveSignals.length > 0) {
    explanation += `#### ✅ Positive Security Signals:\n`;
    positiveSignals.slice(0, 3).forEach(sig => {
      explanation += `- ${sig}\n`;
    });
    explanation += '\n';
  }

  explanation += `#### 💡 Analyst Recommendation:\n`;
  if (riskScore >= 60) {
    explanation += `Users are advised **NOT** to enter credentials, personal data, or credit card information on this site. If received via unsolicited email or SMS, flag as phishing and block domain.`;
  } else if (riskScore >= 40) {
    explanation += `Proceed with caution. Verify the destination URL against official organizational directories before interacting with forms or downloading files.`;
  } else {
    explanation += `The domain demonstrates standard security practices with no active threat blacklist records. Standard browsing hygiene is recommended.`;
  }

  return explanation;
}

export async function explainScanWithAI(scanData, userQuery = '') {
  const apiKey = ENV.GEMINI_API_KEY;

  if (!apiKey) {
    logger.info('Gemini API key not configured; generating deterministic evidence-based explanation');
    return {
      aiProvider: 'SentinelX Grounded Security Intelligence (Rule-Grounded Engine)',
      isAiGrounded: true,
      explanation: generateDeterministicExplanation(scanData, userQuery),
      note: 'Evidence-grounded explanation based on real scanner findings. Configure GEMINI_API_KEY in backend/.env for generative multi-turn dialogue.'
    };
  }

  try {
    const prompt = `
You are SentinelX AI Security Analyst, an expert cybersecurity engineer.
Your task is to explain the website security scan results to a user.

RULES:
1. STRICTLY BASE YOUR EXPLANATION ON THE PROVIDED EVIDENCE.
2. DO NOT invent findings, CVEs, or threats that are not in the scan data.
3. DO NOT change or override the scanner's risk score (${scanData.riskScore}) or risk classification (${scanData.riskLevel}).
4. Provide actionable, defensive cybersecurity guidance.
5. Format your output with clear markdown headings, bullet points, and callouts.

SCAN DATA:
Hostname: ${scanData.hostname}
Original URL: ${scanData.originalUrl}
Risk Score: ${scanData.riskScore} / 100
Risk Level: ${scanData.riskLevel}
Confidence: ${scanData.confidence}%
Threat Intelligence Matches: ${JSON.stringify(scanData.threatIntelligenceResults?.matches || [])}
Security Findings: ${JSON.stringify(scanData.findings || [])}
Positive Security Signals: ${JSON.stringify(scanData.positiveSignals || [])}
SSL/TLS Details: ${JSON.stringify(scanData.certificateAnalysis?.certificate || {})}
Security Headers: ${JSON.stringify(scanData.websiteSecurityAnalysis?.headers || {})}

USER QUESTION: "${userQuery || 'Please provide a comprehensive security breakdown and explain why this URL received this risk score.'}"
`;

    // Try Gemini 1.5 Flash endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2, // Low temperature for factual fidelity
        maxOutputTokens: 1200
      }
    };

    const resp = await axios.post(url, payload, { timeout: 8000 });
    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      return {
        aiProvider: 'Google Gemini 1.5 Flash (Grounded on Scanner Data)',
        isAiGrounded: true,
        explanation: text,
        note: 'Grounded by SentinelX scan telemetry.'
      };
    }

    throw new Error('Empty response from Gemini API');
  } catch (err) {
    logger.warn('Gemini API call failed or timed out, using fallback explainer', { error: err.message });
    return {
      aiProvider: 'SentinelX Grounded Security Intelligence (Fallback Engine)',
      isAiGrounded: true,
      explanation: generateDeterministicExplanation(scanData, userQuery),
      note: `Gemini API query encountered: ${err.message}. Showing grounded factual explanation.`
    };
  }
}

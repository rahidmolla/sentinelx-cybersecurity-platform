import axios from 'axios';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function buildDeterministicExplanation(scan) {
  const findings = scan.findings || [];
  if (!findings.length) {
    return `CYVEX completed an assessment of ${scan.hostname}. No significant risk indicators were found in the evidence collected. This is not a guarantee that the site is safe.`;
  }
  const top = findings.slice(0, 4).map(f => `• ${f.severity}: ${f.name} — ${f.evidence}`).join('\n');
  return `CYVEX assessed ${scan.hostname} with a risk score of ${scan.riskScore}/100 (${scan.riskLevel}). The strongest observed indicators are:\n${top}\n\nTreat this as evidence-based guidance, not a definitive safety verdict.`;
}

export async function explainScan(scan) {
  const fallback = buildDeterministicExplanation(scan);
  if (!ENV.GEMINI_API_KEY) {
    return { explanation: fallback, source: 'deterministic-evidence-summary' };
  }

  try {
    const prompt = `Explain this cybersecurity scan for a defensive analyst. Use only these scan facts; do not invent findings. State uncertainty.\n${JSON.stringify({ hostname: scan.hostname, riskScore: scan.riskScore, riskLevel: scan.riskLevel, findings: scan.findings })}`;
    const { data } = await axios.post(`${GEMINI_URL}?key=${ENV.GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 }
    }, { timeout: 15000 });
    const explanation = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n').trim();
    if (!explanation) throw new Error('Empty Gemini response');
    return { explanation, source: 'gemini' };
  } catch (err) {
    logger.warn('Gemini explanation failed; using deterministic evidence summary', { error: err.message });
    return { explanation: fallback, source: 'deterministic-evidence-summary' };
  }
}

import { normalizeUrl } from '../utils/urlNormalizer.js';
import { validateAndResolveHost } from '../utils/safeDnsResolver.js';
import { analyzeCertificate } from '../services/certificateService.js';

export async function analyzeCertificateEndpoint(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL or hostname is required' });
    }

    const parsed = normalizeUrl(url);
    await validateAndResolveHost(parsed.hostname);

    const result = await analyzeCertificate(parsed.hostname, parsed.port);

    res.json({
      success: true,
      hostname: parsed.hostname,
      port: parsed.port,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Certificate inspection failed: ${err.message}`
    });
  }
}

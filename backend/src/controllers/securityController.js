import { normalizeUrl } from '../utils/urlNormalizer.js';
import { validateAndResolveHost } from '../utils/safeDnsResolver.js';
import { analyzeWebsiteSecurity } from '../services/websiteSecurityService.js';

export async function analyzeSecurityEndpoint(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const parsed = normalizeUrl(url);
    await validateAndResolveHost(parsed.hostname);

    const result = await analyzeWebsiteSecurity(parsed.normalizedUrl);

    res.json({
      success: true,
      url: parsed.normalizedUrl,
      hostname: parsed.hostname,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Security configuration analysis failed: ${err.message}`
    });
  }
}

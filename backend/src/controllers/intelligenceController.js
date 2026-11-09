import { ThreatIntelligence } from '../models/ThreatIntelligence.js';

export async function getIntelligence(req, res, next) {
  try {
    const { category, source, status, search } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.threatType = category;
    }
    if (source && source !== 'all') {
      query.source = source;
    }
    if (status && status !== 'all') {
      query.verificationStatus = status;
    }

    let threats = await ThreatIntelligence.find(query);

    if (search) {
      const q = search.toLowerCase();
      threats = threats.filter(t =>
        t.hostname?.toLowerCase().includes(q) ||
        t.threatType?.toLowerCase().includes(q) ||
        t.source?.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Compute threat trends and brand impersonation counts
    const brandCounts = {};
    const categoryCounts = {};
    for (const t of threats) {
      categoryCounts[t.threatType] = (categoryCounts[t.threatType] || 0) + 1;
      if (t.tags) {
        for (const tag of t.tags) {
          brandCounts[tag] = (brandCounts[tag] || 0) + 1;
        }
      }
    }

    res.json({
      success: true,
      count: threats.length,
      threats,
      stats: {
        categoryCounts,
        topTags: Object.entries(brandCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([tag, count]) => ({ tag, count }))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function searchIntelligence(req, res, next) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }

    const threats = await ThreatIntelligence.find({});
    const matches = threats.filter(t =>
      t.hostname.toLowerCase().includes(q.toLowerCase()) ||
      t.threatType.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
}

import { ThreatReport } from '../models/ThreatReport.js';
import { ThreatIntelligence } from '../models/ThreatIntelligence.js';
import { normalizeUrl } from '../utils/urlNormalizer.js';
import { logger } from '../utils/logger.js';

export async function submitReport(req, res, next) {
  try {
    const { url, category, description, evidence } = req.body;

    const parsed = normalizeUrl(url);

    // Duplicate check: check if already pending or reviewed for this exact URL
    const existing = await ThreatReport.find({ url: parsed.normalizedUrl });
    if (existing && existing.length > 0) {
      const activeReport = existing.find(r => r.status === 'Pending' || r.status === 'Under Review' || r.status === 'Confirmed Threat');
      if (activeReport) {
        return res.status(409).json({
          success: false,
          error: `A community threat report for this target already exists (Status: ${activeReport.status}).`,
          existingReportId: activeReport._id || activeReport.id
        });
      }
    }

    const report = await ThreatReport.create({
      reportedBy: req.user ? {
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email
      } : {
        userId: 'anonymous',
        name: 'Community Contributor',
        email: 'anonymous@community.local'
      },
      url: parsed.normalizedUrl,
      hostname: parsed.hostname,
      category,
      description,
      evidence: evidence || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Threat report submitted for security analyst review.',
      report
    });
  } catch (err) {
    next(err);
  }
}

export async function getReports(req, res, next) {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    let reports = await ThreatReport.find(query);

    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(r =>
        r.hostname?.toLowerCase().includes(q) ||
        r.url?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req, res, next) {
  try {
    const { id } = req.params;
    const report = await ThreatReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Threat report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, verificationDetails } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Confirmed Threat', 'False Positive', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await ThreatReport.findByIdAndUpdate(id, {
      status,
      verificationDetails: verificationDetails || '',
      verifiedBy: req.user ? req.user.email : 'Admin',
      verifiedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    // If marked as Confirmed Threat, propagate into ThreatIntelligence database
    if (status === 'Confirmed Threat') {
      await ThreatIntelligence.create({
        hostname: updated.hostname,
        threatType: updated.category,
        source: 'SentinelX Community Verified',
        confidence: 90,
        verificationStatus: 'Confirmed Threat',
        tags: ['community-reported', updated.category.toLowerCase().replace(/\s+/g, '-')]
      });
      logger.info(`Promoted confirmed threat report ${id} for ${updated.hostname} into global ThreatIntelligence feed.`);
    }

    res.json({
      success: true,
      message: `Report status updated to '${status}'`,
      report: updated
    });
  } catch (err) {
    next(err);
  }
}

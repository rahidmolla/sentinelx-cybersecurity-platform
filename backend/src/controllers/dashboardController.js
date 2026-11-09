import { Scan } from '../models/Scan.js';
import { ThreatReport } from '../models/ThreatReport.js';
import { ThreatIntelligence } from '../models/ThreatIntelligence.js';

export async function getDashboardStats(req, res, next) {
  try {
    const allScans = await Scan.find({});
    const totalReports = await ThreatReport.countDocuments();
    const confirmedThreats = await ThreatIntelligence.countDocuments();

    let safeCount = 0;
    let moderateCount = 0;
    let suspiciousCount = 0;
    let highRiskCount = 0;
    let criticalCount = 0;

    for (const s of allScans) {
      if (s.riskScore < 20) safeCount++;
      else if (s.riskScore < 40) moderateCount++;
      else if (s.riskScore < 60) suspiciousCount++;
      else if (s.riskScore < 80) highRiskCount++;
      else criticalCount++;
    }

    const maliciousCount = highRiskCount + criticalCount;

    // Threat distribution breakdown for Pie Chart
    const threatDistribution = [
      { name: 'Phishing', count: 0 },
      { name: 'Brand Impersonation', count: 0 },
      { name: 'Malware / C2', count: 0 },
      { name: 'Financial Fraud', count: 0 },
      { name: 'Credential Theft', count: 0 }
    ];

    const threats = await ThreatIntelligence.find({});
    for (const t of threats) {
      const type = t.threatType || '';
      if (/phish/i.test(type)) threatDistribution[0].count++;
      else if (/brand/i.test(type)) threatDistribution[1].count++;
      else if (/malware/i.test(type)) threatDistribution[2].count++;
      else if (/fraud|payment/i.test(type)) threatDistribution[3].count++;
      else threatDistribution[4].count++;
    }

    // Risk level distribution for Bar Chart
    const riskDistribution = [
      { level: 'Low (Safe)', count: safeCount, color: '#10b981' },
      { level: 'Moderate', count: moderateCount, color: '#3b82f6' },
      { level: 'Suspicious', count: suspiciousCount, color: '#eab308' },
      { level: 'High Risk', count: highRiskCount, color: '#f97316' },
      { level: 'Critical', count: criticalCount, color: '#ef4444' }
    ];

    res.json({
      success: true,
      stats: {
        totalScans: allScans.length,
        safeWebsites: safeCount,
        suspiciousWebsites: suspiciousCount + moderateCount,
        maliciousWebsites: maliciousCount,
        communityReports: totalReports,
        confirmedThreats
      },
      visualizations: {
        threatDistribution,
        riskDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardActivity(req, res, next) {
  try {
    const recentScans = (await Scan.find({})).slice(0, 8);
    const latestReports = (await ThreatReport.find({})).slice(0, 6);
    const latestThreats = (await ThreatIntelligence.find({})).slice(0, 6);

    // Group scans by date for timeline chart (past 7 days)
    const daysMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { date: key.slice(5), total: 0, threats: 0 };
    }

    const allScans = await Scan.find({});
    for (const s of allScans) {
      const dateKey = (s.scannedAt ? new Date(s.scannedAt) : new Date()).toISOString().split('T')[0];
      if (daysMap[dateKey]) {
        daysMap[dateKey].total++;
        if (s.riskScore >= 60) daysMap[dateKey].threats++;
      }
    }

    const scanActivityTimeline = Object.values(daysMap);

    res.json({
      success: true,
      recentScans,
      latestReports,
      latestThreats,
      scanActivityTimeline
    });
  } catch (err) {
    next(err);
  }
}

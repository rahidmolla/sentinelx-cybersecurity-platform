import PDFDocument from 'pdfkit';

export function generatePdfSecurityReport(scanData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
        info: {
          Title: `CYVEX Threat Intelligence Report - ${scanData.hostname}`,
          Author: 'CYVEX AI Cybersecurity Platform',
          Subject: 'Website Security Assessment & Threat Analysis'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Banner
      doc.rect(45, 45, 505, 55).fill('#07100c');
      doc.fillColor('#00c978').fontSize(20).text('CYVEX', 60, 55, { characterSpacing: 1 });
      doc.fillColor('#94a3b8').fontSize(10).text('DETECT. DEFEND. TRUST. • THREAT INTELLIGENCE & SECURITY ASSESSMENT', 60, 80);

      doc.moveDown(3);

      // Metadata Box
      const topY = 115;
      doc.rect(45, topY, 505, 75).strokeColor('#334155').lineWidth(1).stroke();

      doc.fillColor('#0f172a').fontSize(10);
      doc.text(`Target Hostname: ${scanData.hostname}`, 55, topY + 12);
      doc.text(`Original URL: ${scanData.originalUrl.slice(0, 70)}`, 55, topY + 28);
      doc.text(`Scan Date: ${new Date(scanData.scannedAt).toUTCString()}`, 55, topY + 44);
      doc.text(`Confidence Level: ${scanData.confidence}% (${scanData.evidenceCoverage || 'Standard'} Coverage)`, 55, topY + 60);

      // Risk Score Badge
      let scoreColor = '#10b981'; // Green
      if (scanData.riskScore >= 80) scoreColor = '#ef4444'; // Red
      else if (scanData.riskScore >= 60) scoreColor = '#f97316'; // Orange
      else if (scanData.riskScore >= 40) scoreColor = '#eab308'; // Amber
      else if (scanData.riskScore >= 20) scoreColor = '#3b82f6'; // Blue

      doc.rect(390, topY + 15, 145, 45).fill(scoreColor);
      doc.fillColor('#ffffff').fontSize(11).text('RISK SCORE', 402, topY + 23);
      doc.fontSize(18).text(`${scanData.riskScore}/100`, 402, topY + 38);

      doc.moveDown(6);
      doc.fillColor('#0f172a').fontSize(16).text('Executive Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Risk Level: ${scanData.riskLevel} | Confidence: ${scanData.confidence}%`);
      doc.moveDown(0.5);
      doc.text(`This report summarizes the observable security evidence collected for ${scanData.hostname}. Findings are indicators and do not guarantee that a site is safe or malicious.`);

      doc.moveDown(1.5);
      doc.fontSize(14).text('Detailed Findings', { underline: true });
      doc.moveDown(0.5);

      const findings = scanData.findings || [];
      if (!findings.length) {
        doc.fontSize(10).text('No significant security indicators were observed during this assessment.');
      }
      findings.forEach((finding, index) => {
        if (doc.y > 690) doc.addPage();
        doc.fontSize(11).fillColor('#0f172a').text(`${index + 1}. ${finding.name} (${finding.severity})`);
        doc.fontSize(9).fillColor('#334155').text(`Category: ${finding.category || 'General'}`);
        doc.text(`Evidence: ${finding.evidence || 'Not provided'}`);
        if (finding.recommendation) doc.text(`Recommendation: ${finding.recommendation}`);
        doc.moveDown(0.8);
      });

      doc.moveDown(1);
      doc.fontSize(14).fillColor('#0f172a').text('Remediation Guidance', { underline: true });
      doc.moveDown(0.5);
      (scanData.recommendations || []).forEach((recommendation, index) => {
        if (doc.y > 720) doc.addPage();
        doc.fontSize(10).fillColor('#334155').text(`${index + 1}. ${recommendation}`);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

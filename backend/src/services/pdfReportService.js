import PDFDocument from 'pdfkit';

export function generatePdfSecurityReport(scanData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 45,
        size: 'A4',
        info: {
          Title: `SentinelX Threat Intelligence Report - ${scanData.hostname}`,
          Author: 'SentinelX AI Cybersecurity Platform',
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
      doc.rect(45, 45, 505, 55).fill('#0f172a');
      doc.fillColor('#38bdf8').fontSize(20).text('SENTINELX', 60, 55, { characterSpacing: 1 });
      doc.fillColor('#94a3b8').fontSize(10).text('THREAT INTELLIGENCE & SECURITY ASSESSMENT REPORT', 60, 80);

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

      doc.rect(390, topY + 10, 150, 55).fill(scoreColor);
      doc.fillColor('#ffffff').fontSize(11).text('RISK ASSESSMENT', 400, topY + 18, { align: 'center', width: 130 });
      doc.fontSize(18).text(`${scanData.riskScore} / 100`, 400, topY + 32, { align: 'center', width: 130 });
      doc.fontSize(9).text(scanData.riskLevel.toUpperCase(), 400, topY + 52, { align: 'center', width: 130 });

      // Executive Summary
      let currentY = 205;
      doc.fillColor('#0f172a').fontSize(14).text('Executive Summary', 45, currentY);
      doc.strokeColor('#0284c7').lineWidth(2).moveTo(45, currentY + 18).lineTo(180, currentY + 18).stroke();

      currentY += 26;
      doc.fillColor('#334155').fontSize(10).text(
        `SentinelX conducted a passive multi-vector security assessment of ${scanData.hostname}. The evaluation examined DNS infrastructure, SSL/TLS cryptographic posture, HTTP security headers, brand impersonation indicators, and cross-referenced public threat intelligence databases.`,
        45,
        currentY,
        { width: 505, lineGap: 3 }
      );

      // Findings Section
      currentY += 45;
      doc.fillColor('#0f172a').fontSize(14).text(`Detected Security Findings (${(scanData.findings || []).length})`, 45, currentY);
      doc.strokeColor('#0284c7').lineWidth(2).moveTo(45, currentY + 18).lineTo(230, currentY + 18).stroke();

      currentY += 26;
      const findings = scanData.findings || [];
      if (findings.length === 0) {
        doc.fillColor('#10b981').fontSize(10).text('No critical security vulnerabilities or phishing indicators were identified.', 45, currentY);
        currentY += 20;
      } else {
        for (const f of findings.slice(0, 6)) {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          let badgeColor = '#64748b';
          if (f.severity === 'Critical') badgeColor = '#ef4444';
          else if (f.severity === 'High') badgeColor = '#f97316';
          else if (f.severity === 'Medium') badgeColor = '#eab308';
          else if (f.severity === 'Low') badgeColor = '#3b82f6';

          doc.rect(45, currentY, 55, 15).fill(badgeColor);
          doc.fillColor('#ffffff').fontSize(8).text(f.severity.toUpperCase(), 45, currentY + 3, { align: 'center', width: 55 });

          doc.fillColor('#0f172a').fontSize(10).text(`${f.name} [${f.category || 'General'}]`, 110, currentY + 2);
          currentY += 18;

          doc.fillColor('#475569').fontSize(9).text(`Evidence: ${f.evidence}`, 55, currentY, { width: 495 });
          currentY += 16;
          doc.fillColor('#334155').fontSize(9).text(`Remediation: ${f.recommendation || f.explanation}`, 55, currentY, { width: 495 });
          currentY += 22;
        }
      }

      // Cryptographic & Header Posture
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      currentY += 10;
      doc.fillColor('#0f172a').fontSize(14).text('Security Configuration & Cryptographic Posture', 45, currentY);
      doc.strokeColor('#0284c7').lineWidth(2).moveTo(45, currentY + 18).lineTo(340, currentY + 18).stroke();
      currentY += 26;

      const cert = scanData.certificateAnalysis?.certificate;
      const headers = scanData.websiteSecurityAnalysis?.headers || {};

      doc.fillColor('#334155').fontSize(9);
      doc.text(`• SSL/TLS Status: ${cert ? (cert.status === 'Valid' ? 'Valid Certificate' : cert.authorizationError || 'Warning') : 'No TLS Certificate'}`, 55, currentY);
      currentY += 14;
      if (cert) {
        doc.text(`• Certificate Issuer: ${cert.issuer?.organization || cert.issuer?.commonName || 'Unknown'} (Expires: ${cert.validTo?.split('T')[0] || 'N/A'})`, 55, currentY);
        currentY += 14;
      }
      doc.text(`• Strict-Transport-Security (HSTS): ${headers.strictTransportSecurity ? 'Configured' : 'Missing'}`, 55, currentY);
      currentY += 14;
      doc.text(`• Content-Security-Policy (CSP): ${headers.contentSecurityPolicy ? 'Configured' : 'Missing'}`, 55, currentY);
      currentY += 14;
      doc.text(`• Anti-Clickjacking (X-Frame-Options): ${headers.xFrameOptions ? headers.xFrameOptions : 'Missing'}`, 55, currentY);
      currentY += 14;
      doc.text(`• MIME Sniffing Protection (X-Content-Type-Options): ${headers.xContentTypeOptions || 'Missing'}`, 55, currentY);

      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text(
        'Generated by SentinelX Security Engine. Disclaimer: Passive threat assessments reflect public observables at scan time and do not guarantee the absolute security of any target web application.',
        45,
        780,
        { align: 'center', width: 505 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

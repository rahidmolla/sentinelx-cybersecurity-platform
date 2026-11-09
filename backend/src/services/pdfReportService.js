import PDFDocument from 'pdfkit';

const COLORS = {
  ink: '#17202A',
  muted: '#586574',
  green: '#00C978',
  darkGreen: '#006B44',
  border: '#D7E0E8',
  red: '#C0392B',
  amber: '#B9770E',
};

const severityColor = (level) => level === 'critical' || level === 'high' ? COLORS.red : level === 'moderate' ? COLORS.amber : COLORS.darkGreen;

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
}

export async function generatePdfReport(scan) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'CYVEX Security Scan Report', Author: 'CYVEX' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const riskColor = severityColor(scan.level);

    doc.rect(0, 0, doc.page.width, 112).fill('#07130E');
    doc.fillColor(COLORS.green).font('Helvetica-Bold').fontSize(10).text('CYVEX  /  DETECT. DEFEND. TRUST.', 48, 35, { characterSpacing: 1.4 });
    doc.fillColor('#FFFFFF').fontSize(24).text('Website Security Assessment', 48, 55);
    doc.fillColor('#D7E8DF').font('Helvetica').fontSize(9).text('Passive multi-signal analysis report', 48, 88);

    doc.y = 137;
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(10).text('TARGET', 48, doc.y);
    doc.moveDown(0.3);
    doc.fillColor('#007B50').font('Helvetica-Bold').fontSize(12).text(scan.url, { width: pageWidth, link: scan.url, underline: true });
    doc.moveDown(0.45);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(`Scanned ${formatDate(scan.scannedAt)}  |  Report ID: ${scan.id}`);

    doc.moveDown(1.4);
    const boxY = doc.y;
    const boxHeight = 91;
    doc.roundedRect(48, boxY, pageWidth, boxHeight, 7).fill('#F2F6F4');
    doc.fillColor(COLORS.muted).font('Helvetica-Bold').fontSize(8).text('OVERALL CYVEX RISK SCORE', 64, boxY + 16);
    doc.fillColor(riskColor).fontSize(22).text(`${scan.score} / 100`, 64, boxY + 32);
    doc.fillColor(riskColor).fontSize(10).text(String(scan.level).toUpperCase(), 188, boxY + 40);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(`Confidence: ${scan.confidence ?? 'unavailable'}`, 64, boxY + 66);
    doc.y = boxY + boxHeight + 17;

    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(12).text('Executive summary');
    doc.moveDown(0.4);
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9.5).text(scan.summary || 'No summary supplied.', { lineGap: 3 });
    doc.moveDown(1);

    const findings = scan.findings ?? {};
    const sections = [
      ['URL analysis', findings.urlAnalysis],
      ['TLS certificate', findings.tls],
      ['Website security', findings.websiteSecurity],
      ['Threat intelligence', findings.threatFeeds],
    ];
    doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(12).text('Evidence reviewed');
    doc.moveDown(0.5);

    for (const [title, data] of sections) {
      if (doc.y > 690) doc.addPage();
      doc.fillColor(COLORS.darkGreen).font('Helvetica-Bold').fontSize(10).text(title);
      const serialized = data ? JSON.stringify(data, null, 2) : 'No data available.';
      doc.moveDown(0.25);
      doc.fillColor(COLORS.muted).font('Courier').fontSize(7.2).text(serialized, { width: pageWidth, lineGap: 1, paragraphGap: 2 });
      doc.moveDown(0.7);
    }

    if (scan.aiSummary?.text) {
      if (doc.y > 660) doc.addPage();
      doc.fillColor(COLORS.ink).font('Helvetica-Bold').fontSize(12).text('Analyst explanation');
      doc.moveDown(0.4);
      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(9).text(scan.aiSummary.text, { width: pageWidth, lineGap: 3 });
    }

    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      const footerY = doc.page.height - 37;
      doc.moveTo(48, footerY - 8).lineTo(doc.page.width - 48, footerY - 8).strokeColor(COLORS.border).lineWidth(0.6).stroke();
      doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7.5).text('CYVEX  |  DETECT. DEFEND. TRUST.  |  Defensive use only', 48, footerY, { lineBreak: false });
      doc.text(`Page ${index + 1} of ${range.count}`, doc.page.width - 112, footerY, { width: 64, align: 'right', lineBreak: false });
    }

    doc.end();
  });
}

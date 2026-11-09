import { explainScanWithAI } from '../services/aiService.js';
import { Scan } from '../models/Scan.js';

export async function explainScan(req, res, next) {
  try {
    const { scanId, scanData, question } = req.body;

    let targetScan = scanData;
    if (!targetScan && scanId) {
      targetScan = await Scan.findById(scanId);
    }

    if (!targetScan) {
      return res.status(400).json({
        success: false,
        error: 'Scan data or valid scanId is required to provide grounded AI explanation'
      });
    }

    const aiResult = await explainScanWithAI(targetScan, question);

    res.json({
      success: true,
      ...aiResult
    });
  } catch (err) {
    next(err);
  }
}

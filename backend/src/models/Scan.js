import mongoose from 'mongoose';
import { isConnected, getMemoryStore, saveLocalBackup } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const scanSchema = new mongoose.Schema({
  userId: { type: String, default: null, index: true },
  originalUrl: { type: String, required: true },
  normalizedUrl: { type: String, required: true, index: true },
  hostname: { type: String, required: true, index: true },
  ipAddress: { type: String, default: '' },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: {
    type: String,
    enum: ['Low Risk', 'Moderate Risk', 'Suspicious', 'High Risk', 'Critical Risk'],
    required: true
  },
  confidence: { type: Number, default: 85 },
  evidenceCoverage: { type: String, default: 'Standard' },
  findings: [{
    id: String,
    name: String,
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low', 'Info'] },
    category: String,
    evidence: String,
    explanation: String,
    recommendation: String
  }],
  positiveSignals: [String],
  phishingAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  certificateAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  websiteSecurityAnalysis: { type: mongoose.Schema.Types.Mixed, default: {} },
  dnsIntelligence: { type: mongoose.Schema.Types.Mixed, default: {} },
  threatIntelligenceResults: { type: mongoose.Schema.Types.Mixed, default: {} },
  sourcesChecked: [String],
  scannedAt: { type: Date, default: Date.now, index: true },
  scanDurationMs: { type: Number, default: 0 }
});

const MongoScanModel = mongoose.models.Scan || mongoose.model('Scan', scanSchema);

export const Scan = {
  async create(data) {
    if (isConnected()) {
      return MongoScanModel.create(data);
    }
    const store = getMemoryStore();
    const newScan = {
      _id: `scn_${uuidv4().slice(0, 10)}`,
      ...data,
      scannedAt: data.scannedAt || new Date().toISOString()
    };
    store.scans.unshift(newScan);
    saveLocalBackup();
    return newScan;
  },

  async find(query = {}) {
    if (isConnected()) {
      return MongoScanModel.find(query).sort({ scannedAt: -1 });
    }
    const store = getMemoryStore();
    return store.scans
      .filter(s => {
        for (const key of Object.keys(query)) {
          if (query[key] !== undefined && s[key] !== query[key]) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
  },

  async findById(id) {
    if (isConnected()) {
      return MongoScanModel.findById(id);
    }
    const store = getMemoryStore();
    return store.scans.find(s => s._id === id || s.id === id) || null;
  },

  async deleteOne(query) {
    if (isConnected()) {
      return MongoScanModel.deleteOne(query);
    }
    const store = getMemoryStore();
    const index = store.scans.findIndex(s => {
      for (const k of Object.keys(query)) {
        if (s[k] !== query[k]) return false;
      }
      return true;
    });
    if (index !== -1) {
      store.scans.splice(index, 1);
      saveLocalBackup();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  },

  async deleteMany(query) {
    if (isConnected()) {
      return MongoScanModel.deleteMany(query);
    }
    const store = getMemoryStore();
    const beforeCount = store.scans.length;
    store.scans = store.scans.filter(s => {
      for (const k of Object.keys(query)) {
        if (s[k] === query[k]) return false;
      }
      return true;
    });
    saveLocalBackup();
    return { deletedCount: beforeCount - store.scans.length };
  },

  async countDocuments(query = {}) {
    if (isConnected()) {
      return MongoScanModel.countDocuments(query);
    }
    const store = getMemoryStore();
    if (!Object.keys(query).length) return store.scans.length;
    return store.scans.filter(s => {
      for (const k of Object.keys(query)) {
        if (s[k] !== query[k]) return false;
      }
      return true;
    }).length;
  }
};

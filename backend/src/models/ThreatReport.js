import mongoose from 'mongoose';
import { isConnected, getMemoryStore, saveLocalBackup } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const threatReportSchema = new mongoose.Schema({
  reportedBy: {
    userId: String,
    name: String,
    email: String
  },
  url: { type: String, required: true },
  hostname: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: [
      'Phishing',
      'Fake Recruitment',
      'Fake Payment',
      'Brand Impersonation',
      'Malicious Redirect',
      'Malware Distribution',
      'Credential Harvesting',
      'Other'
    ],
    required: true
  },
  description: { type: String, required: true },
  evidence: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Confirmed Threat', 'False Positive', 'Rejected'],
    default: 'Pending',
    index: true
  },
  verificationDetails: { type: String, default: '' },
  verifiedBy: { type: String, default: null },
  verifiedAt: { type: Date, default: null },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const MongoReportModel = mongoose.models.ThreatReport || mongoose.model('ThreatReport', threatReportSchema);

export const ThreatReport = {
  async create(data) {
    if (isConnected()) {
      return MongoReportModel.create(data);
    }
    const store = getMemoryStore();
    const newReport = {
      _id: `rep_${uuidv4().slice(0, 8)}`,
      ...data,
      status: data.status || 'Pending',
      verificationDetails: data.verificationDetails || '',
      upvotes: data.upvotes || 0,
      createdAt: new Date().toISOString()
    };
    store.reports.unshift(newReport);
    saveLocalBackup();
    return newReport;
  },

  async find(query = {}) {
    if (isConnected()) {
      return MongoReportModel.find(query).sort({ createdAt: -1 });
    }
    const store = getMemoryStore();
    return store.reports
      .filter(r => {
        for (const k of Object.keys(query)) {
          if (query[k] !== undefined && r[k] !== query[k]) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    if (isConnected()) {
      return MongoReportModel.findById(id);
    }
    const store = getMemoryStore();
    return store.reports.find(r => r._id === id || r.id === id) || null;
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    if (isConnected()) {
      return MongoReportModel.findByIdAndUpdate(id, updateData, { new: true, ...options });
    }
    const store = getMemoryStore();
    const rep = store.reports.find(r => r._id === id || r.id === id);
    if (!rep) return null;
    Object.assign(rep, updateData);
    saveLocalBackup();
    return rep;
  },

  async countDocuments(query = {}) {
    if (isConnected()) {
      return MongoReportModel.countDocuments(query);
    }
    const store = getMemoryStore();
    if (!Object.keys(query).length) return store.reports.length;
    return store.reports.filter(r => {
      for (const k of Object.keys(query)) {
        if (r[k] !== query[k]) return false;
      }
      return true;
    }).length;
  }
};

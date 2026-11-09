import mongoose from 'mongoose';
import { isConnected, getMemoryStore, saveLocalBackup } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const threatIntelSchema = new mongoose.Schema({
  hostname: { type: String, required: true, unique: true, index: true },
  threatType: { type: String, required: true },
  source: { type: String, required: true },
  confidence: { type: Number, default: 90 },
  verificationStatus: { type: String, default: 'Confirmed Threat' },
  tags: [String],
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

const MongoIntelModel = mongoose.models.ThreatIntelligence || mongoose.model('ThreatIntelligence', threatIntelSchema);

export const ThreatIntelligence = {
  async findOne(query) {
    if (isConnected()) {
      return MongoIntelModel.findOne(query);
    }
    const store = getMemoryStore();
    return store.threats.find(t => {
      for (const k of Object.keys(query)) {
        if (k === 'hostname' && t.hostname?.toLowerCase() !== query[k]?.toLowerCase()) return false;
        if (k !== 'hostname' && t[k] !== query[k]) return false;
      }
      return true;
    }) || null;
  },

  async find(query = {}) {
    if (isConnected()) {
      return MongoIntelModel.find(query).sort({ lastSeen: -1 });
    }
    const store = getMemoryStore();
    return store.threats
      .filter(t => {
        for (const k of Object.keys(query)) {
          if (query[k] !== undefined && t[k] !== query[k]) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  },

  async create(data) {
    if (isConnected()) {
      return MongoIntelModel.create(data);
    }
    const store = getMemoryStore();
    const existing = store.threats.find(t => t.hostname?.toLowerCase() === data.hostname?.toLowerCase());
    if (existing) {
      existing.lastSeen = new Date().toISOString();
      existing.confidence = Math.max(existing.confidence, data.confidence || 90);
      saveLocalBackup();
      return existing;
    }
    const newThreat = {
      _id: `ti_${uuidv4().slice(0, 8)}`,
      ...data,
      firstSeen: data.firstSeen || new Date().toISOString(),
      lastSeen: data.lastSeen || new Date().toISOString()
    };
    store.threats.unshift(newThreat);
    saveLocalBackup();
    return newThreat;
  },

  async countDocuments(query = {}) {
    if (isConnected()) {
      return MongoIntelModel.countDocuments(query);
    }
    const store = getMemoryStore();
    if (!Object.keys(query).length) return store.threats.length;
    return store.threats.filter(t => {
      for (const k of Object.keys(query)) {
        if (t[k] !== query[k]) return false;
      }
      return true;
    }).length;
  }
};

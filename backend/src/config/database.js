import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

let isMongooseConnected = false;
let memoryStore = {
  users: [],
  scans: [],
  reports: [],
  threats: []
};

const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'sentinelx_local_db.json');

function loadLocalBackup() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryStore = { ...memoryStore, ...parsed };
      logger.info('Loaded local fallback database from file', {
        users: memoryStore.users.length,
        scans: memoryStore.scans.length,
        reports: memoryStore.reports.length,
        threats: memoryStore.threats.length
      });
    }
  } catch (err) {
    logger.warn('Could not read fallback DB file, starting fresh in-memory', { error: err.message });
  }
}

export function saveLocalBackup() {
  if (isMongooseConnected) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Failed to save fallback DB file', err);
  }
}

async function seedFallbackData() {
  // Seed admin and analyst if missing
  const adminExists = memoryStore.users.find(u => u.email === 'admin@sentinelx.local');
  if (!adminExists) {
    const adminHash = await bcrypt.hash('Admin@123456', 10);
    memoryStore.users.push({
      _id: 'usr_admin_001',
      name: 'CYVEX Administrator',
      email: 'admin@sentinelx.local',
      passwordHash: adminHash,
      role: 'admin',
      organization: 'Cyber Defense Center',
      createdAt: new Date().toISOString()
    });
  }

  const analystExists = memoryStore.users.find(u => u.email === 'analyst@sentinelx.local');
  if (!analystExists) {
    const analystHash = await bcrypt.hash('Analyst@123456', 10);
    memoryStore.users.push({
      _id: 'usr_analyst_002',
      name: 'Sarah Connor',
      email: 'analyst@sentinelx.local',
      passwordHash: analystHash,
      role: 'analyst',
      organization: 'Threat Intel Labs',
      createdAt: new Date().toISOString()
    });
  }

  // Seed sample threat intelligence if empty
  if (memoryStore.threats.length === 0) {
    memoryStore.threats = [
      {
        _id: 'ti_001',
        hostname: 'paypal-security-verification.fake-bank-login.com',
        threatType: 'Phishing',
        source: 'URLhaus / ThreatIntel Feed',
        confidence: 95,
        verificationStatus: 'Confirmed Threat',
        tags: ['credential-harvesting', 'brand-impersonation', 'paypal'],
        firstSeen: new Date(Date.now() - 3600000 * 48).toISOString(),
        lastSeen: new Date().toISOString()
      },
      {
        _id: 'ti_002',
        hostname: 'appleid-support-icloud-secure.info',
        threatType: 'Phishing',
        source: 'Community Threat Intel',
        confidence: 92,
        verificationStatus: 'Confirmed Threat',
        tags: ['apple-impersonation', 'fake-login', 'credential-theft'],
        firstSeen: new Date(Date.now() - 3600000 * 72).toISOString(),
        lastSeen: new Date().toISOString()
      },
      {
        _id: 'ti_003',
        hostname: 'update-chrome-browser-patch.xyz',
        threatType: 'Malware Distribution',
        source: 'URLhaus API',
        confidence: 98,
        verificationStatus: 'Confirmed Threat',
        tags: ['malware', 'trojan-dropper', 'drive-by-download'],
        firstSeen: new Date(Date.now() - 3600000 * 12).toISOString(),
        lastSeen: new Date().toISOString()
      },
      {
        _id: 'ti_004',
        hostname: 'bankofamerica-auth-session-renew.top',
        threatType: 'Financial Fraud',
        source: 'Google Safe Browsing',
        confidence: 96,
        verificationStatus: 'Confirmed Threat',
        tags: ['banking-trojan', 'credential-stealer'],
        firstSeen: new Date(Date.now() - 3600000 * 24).toISOString(),
        lastSeen: new Date().toISOString()
      },
      {
        _id: 'ti_005',
        hostname: 'netflix-account-onhold-billing.club',
        threatType: 'Phishing',
        source: 'Community Intelligence',
        confidence: 88,
        verificationStatus: 'Confirmed Threat',
        tags: ['credit-card-theft', 'subscription-scam'],
        firstSeen: new Date(Date.now() - 3600000 * 96).toISOString(),
        lastSeen: new Date().toISOString()
      }
    ];
  }

  // Seed community reports if empty
  if (memoryStore.reports.length === 0) {
    memoryStore.reports = [
      {
        _id: 'rep_001',
        reportedBy: {
          _id: 'usr_analyst_002',
          name: 'Sarah Connor',
          email: 'analyst@sentinelx.local'
        },
        url: 'https://paypal-security-verification.fake-bank-login.com/auth/login.php',
        hostname: 'paypal-security-verification.fake-bank-login.com',
        category: 'Brand Impersonation',
        description: 'Sends SMS phishing lure claiming PayPal account suspension. Requests full SSN and debit card details.',
        evidence: 'Lure SMS received: "Your PayPal is restricted. Verify immediately at..." Page clones standard PayPal dark theme checkout.',
        status: 'Confirmed Threat',
        verificationDetails: 'Verified by Admin. Matching DNS lookups to bulletproof hoster and active phishing toolkit.',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
      },
      {
        _id: 'rep_002',
        reportedBy: {
          _id: 'usr_analyst_002',
          name: 'Sarah Connor',
          email: 'analyst@sentinelx.local'
        },
        url: 'https://appleid-support-icloud-secure.info/recover',
        hostname: 'appleid-support-icloud-secure.info',
        category: 'Phishing',
        description: 'Impersonates Apple ID unlock portal asking for two-factor verification codes.',
        evidence: 'Registered 3 days ago. Uses Cloudflare free SSL certificate with deceptive subdomain scheme.',
        status: 'Under Review',
        verificationDetails: '',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        _id: 'rep_003',
        reportedBy: null,
        url: 'https://careers-google-hiring-remote.xyz/apply',
        hostname: 'careers-google-hiring-remote.xyz',
        category: 'Fake Recruitment',
        description: 'Telegram job scam offering $65/hr remote data entry and requesting $150 crypto deposit for equipment.',
        evidence: 'Telegram handle @GoogleRecruiterHR pinned on page. No legitimate Google SSL or corporate domain.',
        status: 'Confirmed Threat',
        verificationDetails: 'Confirmed fraudulent recruitment funnel.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ];
  }

  saveLocalBackup();
}

export async function connectDB() {
  loadLocalBackup();

  try {
    logger.info(`Attempting MongoDB connection to ${ENV.MONGODB_URI}...`);
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    isMongooseConnected = true;
    logger.info('MongoDB connected successfully');
    return true;
  } catch (err) {
    isMongooseConnected = false;
    logger.warn(`MongoDB not available (${err.message}). Activating CYVEX embedded persistent store with full seeded intelligence.`);
    await seedFallbackData();
    return false;
  }
}

export function isConnected() {
  return isMongooseConnected;
}

export function getMemoryStore() {
  return memoryStore;
}

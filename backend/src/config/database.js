import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { User } from '../models/User.js';
import { Scan } from '../models/Scan.js';
import { ThreatIntelligence } from '../models/ThreatIntelligence.js';
import { ThreatReport } from '../models/ThreatReport.js';
import { initializeMemoryStore, seedMemoryStore } from '../models/memoryStore.js';

let databaseConnected = false;
let memoryStoreInitialized = false;

export const getStorageMode = () => databaseConnected ? 'mongodb' : 'memory';

function initializeLocalFallback() {
  if (!memoryStoreInitialized) {
    initializeMemoryStore();
    seedMemoryStore();
    memoryStoreInitialized = true;
    logger.info('CYVEX local data store initialized with seed data.');
  }
}

export async function connectDatabase() {
  if (!env.mongoUri) {
    initializeLocalFallback();
    logger.warn('MONGO_URI is not configured; CYVEX is running with its local fallback data store.');
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
    databaseConnected = true;
    logger.info('Connected to the CYVEX database.');
    return true;
  } catch (error) {
    initializeLocalFallback();
    logger.error(`Database connection failed; using the CYVEX local fallback data store: ${error.message}`);
    return false;
  }
}

export const models = { User, Scan, ThreatIntelligence, ThreatReport };

import mongoose from 'mongoose';
import { isConnected, getMemoryStore, saveLocalBackup } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'analyst', 'admin'], default: 'user' },
  organization: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);

export const User = {
  async findOne(query) {
    if (isConnected()) {
      return MongoUserModel.findOne(query);
    }
    const store = getMemoryStore();
    return store.users.find(u => {
      for (const key of Object.keys(query)) {
        if (key === 'email' && u.email?.toLowerCase() !== query[key]?.toLowerCase()) return false;
        if (key !== 'email' && u[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  async findById(id) {
    if (isConnected()) {
      return MongoUserModel.findById(id);
    }
    const store = getMemoryStore();
    return store.users.find(u => u._id === id || u.id === id) || null;
  },

  async create(data) {
    if (isConnected()) {
      return MongoUserModel.create(data);
    }
    const store = getMemoryStore();
    const newUser = {
      _id: `usr_${uuidv4().slice(0, 8)}`,
      ...data,
      role: data.role || 'user',
      createdAt: new Date().toISOString()
    };
    store.users.push(newUser);
    saveLocalBackup();
    return newUser;
  },

  async find(query = {}) {
    if (isConnected()) {
      return MongoUserModel.find(query).select('-passwordHash');
    }
    const store = getMemoryStore();
    return store.users.map(({ passwordHash, ...safe }) => safe);
  },

  async countDocuments() {
    if (isConnected()) {
      return MongoUserModel.countDocuments();
    }
    return getMemoryStore().users.length;
  }
};

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: true, // Allow frontend dev server and production origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsers with safe limits to prevent large payload DOS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global rate limiter
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CYVEX Cybersecurity Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    integrations: {
      urlhaus: true,
      googleSafeBrowsing: !!ENV.GOOGLE_SAFE_BROWSING_API_KEY,
      geminiAi: !!ENV.GEMINI_API_KEY,
      certificateTransparency: true,
      rdapWhois: true
    }
  });
});

// Mount application API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/ai', aiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);


export default app;

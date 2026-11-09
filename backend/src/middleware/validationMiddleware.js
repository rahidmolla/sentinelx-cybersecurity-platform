import { z } from 'zod';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request body'
      });
    }
  };
}

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organization: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const scanUrlSchema = z.object({
  url: z.string().min(3, 'URL is required').max(2048),
  deepScan: z.boolean().optional().default(true),
  simulate: z.boolean().optional().default(false)
});

export const reportThreatSchema = z.object({
  url: z.string().min(3, 'URL is required').max(2048),
  category: z.enum([
    'Phishing',
    'Fake Recruitment',
    'Fake Payment',
    'Brand Impersonation',
    'Malicious Redirect',
    'Malware Distribution',
    'Credential Harvesting',
    'Other'
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  evidence: z.string().max(3000).optional()
});

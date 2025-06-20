import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Google Cloud Service Account
  googleServiceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Legacy Google APIs (for compatibility)
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  
  // VOICEVOX
  voicevoxEndpoint: process.env.VOICEVOX_ENDPOINT || 'https://voicevox-proto-639959525777.asia-northeast2.run.app',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'your-default-secret-change-in-production',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  
  // AI settings
  maxRetries: 3,
  requestTimeout: 30000, // 30 seconds
  
  // GCP Project
  gcpProjectId: 'aipartner-426616'
};

// Validation for service account
if (!config.googleServiceAccountPath) {
  console.warn('Warning: GOOGLE_APPLICATION_CREDENTIALS not set. Using legacy API key authentication.');
}
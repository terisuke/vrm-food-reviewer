import express from 'express';
import { HealthCheckResponse } from '@vrm-food-reviewer/shared';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import axios from 'axios';

const router = express.Router();

router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  
  logger.info('Health check requested');

  // Check external services
  const services = {
    gemini: false,
    voicevox: false,
    googleMaps: false
  };

  // Check Google AI (Gemini) - basic API key validation
  if (config.googleAiApiKey) {
    services.gemini = true; // We'll assume it's working if key is provided
  }

  // Check VOICEVOX service
  try {
    const voicevoxResponse = await axios.get(`${config.voicevoxEndpoint}/version`, {
      timeout: 5000
    });
    services.voicevox = voicevoxResponse.status === 200;
  } catch (error) {
    logger.warn('VOICEVOX health check failed:', error);
    services.voicevox = false;
  }

  // Check Google Maps API
  if (config.googleMapsApiKey) {
    services.googleMaps = true; // We'll assume it's working if key is provided
  }

  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services
  };

  const responseTime = Date.now() - startTime;
  logger.info(`Health check completed in ${responseTime}ms`, { services });

  res.json(response);
}));

export { router as healthRouter };
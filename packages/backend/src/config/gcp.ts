import { GoogleAuth } from 'google-auth-library';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../..', 'config', 'service-account-key.json');

// Verify service account file exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  logger.error(`Service account key file not found at: ${SERVICE_ACCOUNT_PATH}`);
  throw new Error('Service account key file not found. Please ensure service-account-key.json is in the config directory.');
}

export const googleAuth = new GoogleAuth({
  keyFilename: SERVICE_ACCOUNT_PATH,
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/generative-language.retriever',
    'https://www.googleapis.com/auth/maps-platform'
  ],
  projectId: 'aipartner-426616'
});

export const getAuthenticatedClient = async () => {
  try {
    const authClient = await googleAuth.getClient();
    logger.info('Successfully authenticated with Google Cloud using service account');
    return authClient;
  } catch (error) {
    logger.error('Failed to authenticate with Google Cloud:', error);
    throw error;
  }
};

export const getAccessToken = async () => {
  try {
    const authClient = await googleAuth.getClient();
    const accessTokenResponse = await authClient.getAccessToken();
    
    if (!accessTokenResponse.token) {
      throw new Error('Failed to obtain access token');
    }
    
    logger.debug('Successfully obtained Google Cloud access token');
    return accessTokenResponse.token;
  } catch (error) {
    logger.error('Failed to obtain access token:', error);
    throw error;
  }
};

export const getProjectId = async () => {
  try {
    const projectId = await googleAuth.getProjectId();
    logger.debug(`Using Google Cloud project: ${projectId}`);
    return projectId;
  } catch (error) {
    logger.error('Failed to get project ID:', error);
    throw error;
  }
};

// Initialize authentication on module load to verify setup
googleAuth.getProjectId().then((projectId) => {
  logger.info(`Google Cloud authentication initialized for project: ${projectId}`);
}).catch((error) => {
  logger.error('Failed to initialize Google Cloud authentication:', error);
});
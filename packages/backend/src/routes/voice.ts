import express from 'express';
import axios from 'axios';
import { AudioSynthesisRequest, AudioSynthesisResponse, ApiError } from '@vrm-food-reviewer/shared';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = express.Router();

router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const requestData: AudioSynthesisRequest = req.body;

  if (!requestData.text) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'Text is required for voice synthesis',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  logger.info('Voice synthesis requested', {
    textLength: requestData.text.length,
    speakerId: requestData.speakerId,
    emotion: requestData.emotion
  });

  try {
    // Map emotion to VOICEVOX speaker ID and settings
    const voicevoxConfig = getVoicevoxConfig(requestData.emotion, requestData.speakerId);

    // Step 1: Get audio query from VOICEVOX
    const audioQueryResponse = await axios.post(
      `${config.voicevoxEndpoint}/audio_query`,
      null,
      {
        params: {
          text: requestData.text,
          speaker: voicevoxConfig.speaker
        },
        timeout: config.requestTimeout
      }
    );

    if (audioQueryResponse.status !== 200) {
      throw new Error(`VOICEVOX audio_query failed with status ${audioQueryResponse.status}`);
    }

    const audioQuery = audioQueryResponse.data;

    // Apply emotion-based modifications to the audio query
    if (voicevoxConfig.modifications) {
      Object.assign(audioQuery, voicevoxConfig.modifications);
    }

    // Step 2: Generate audio from the query
    const synthesisResponse = await axios.post(
      `${config.voicevoxEndpoint}/synthesis`,
      audioQuery,
      {
        params: {
          speaker: voicevoxConfig.speaker
        },
        responseType: 'arraybuffer',
        timeout: config.requestTimeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (synthesisResponse.status !== 200) {
      throw new Error(`VOICEVOX synthesis failed with status ${synthesisResponse.status}`);
    }

    // Convert audio data to base64 for frontend
    const audioBuffer = Buffer.from(synthesisResponse.data);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/wav;base64,${audioBase64}`;

    // Estimate duration (rough calculation based on text length and speaking rate)
    const estimatedDuration = Math.max(2000, requestData.text.length * 100); // ~100ms per character

    const response: AudioSynthesisResponse = {
      audioUrl,
      duration: estimatedDuration,
      text: requestData.text
    };

    logger.info('Voice synthesis completed successfully', {
      textLength: requestData.text.length,
      audioSize: audioBuffer.length,
      duration: estimatedDuration,
      speakerId: voicevoxConfig.speaker
    });

    res.json(response);

  } catch (error) {
    logger.error('Voice synthesis failed:', error);

    // Check if it's a VOICEVOX service error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.detail || 'VOICEVOX service error';
      
      const apiError: ApiError = {
        error: 'Voice Synthesis Error',
        message: `Voice synthesis failed: ${message}`,
        statusCode: status >= 400 && status < 500 ? status : 500
      };
      
      return res.status(apiError.statusCode).json(apiError);
    }

    const apiError: ApiError = {
      error: 'Voice Synthesis Error',
      message: 'Failed to synthesize voice',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
}));

// Helper function to map emotions to VOICEVOX speaker configurations
function getVoicevoxConfig(emotion?: string, speakerId?: number) {
  const defaultSpeaker = speakerId || 4; // Default to speaker 4 (四国めたん セクシー)

  const config = {
    speaker: defaultSpeaker,
    modifications: {} as any
  };

  // Modify voice parameters based on emotion
  switch (emotion) {
    case 'happy':
      config.modifications = {
        speedScale: 1.1,
        pitchScale: 0.1,
        intonationScale: 1.2,
        volumeScale: 1.0
      };
      break;
    case 'excited':
      config.modifications = {
        speedScale: 1.2,
        pitchScale: 0.15,
        intonationScale: 1.3,
        volumeScale: 1.1
      };
      break;
    case 'satisfied':
      config.modifications = {
        speedScale: 0.9,
        pitchScale: -0.05,
        intonationScale: 0.9,
        volumeScale: 1.0
      };
      break;
    default: // neutral
      config.modifications = {
        speedScale: 1.0,
        pitchScale: 0.0,
        intonationScale: 1.0,
        volumeScale: 1.0
      };
  }

  return config;
}

export { router as voiceRouter };
import express from 'express';
import multer from 'multer';
import { ImageUploadResponse, ApiError } from '@vrm-food-reviewer/shared';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import fs from 'fs';

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`));
    }
  }
});

router.post('/', upload.single('image'), asyncHandler(async (req: express.Request, res: express.Response) => {
  if (!req.file) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'No image file provided',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  logger.info('Image upload received', {
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });

  try {
    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');
    
    // Basic food detection (placeholder - in real implementation, you might use Google Vision API)
    const isFood = await detectFood(imageBase64);
    const confidence = 0.85; // Mock confidence score - always high since we're accepting all images

    // Validate food detection threshold
    if (!isFood || confidence < 0.7) {
      const error: ApiError = {
        error: 'Invalid Image',
        message: 'The uploaded image does not appear to contain food',
        statusCode: 422
      };
      return res.status(422).json(error);
    }

    const response: ImageUploadResponse = {
      imageBase64: `data:${req.file.mimetype};base64,${imageBase64}`,
      isFood,
      confidence
    };

    logger.info('Image processed successfully', {
      isFood,
      confidence,
      imageSize: imageBase64.length
    });

    res.json(response);
  } catch (error) {
    logger.error('Image processing failed:', error);
    const apiError: ApiError = {
      error: 'Processing Error',
      message: 'Failed to process the uploaded image',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
}));

// Basic food detection function (placeholder)
async function detectFood(imageBase64: string): Promise<boolean> {
  // In a real implementation, this would use Google Vision API or similar
  // For now, we'll accept all images as food to avoid blocking users
  // You can implement proper food detection using Google Vision API later
  
  // Always return true to accept all images
  return true;
}

export { router as uploadRouter };
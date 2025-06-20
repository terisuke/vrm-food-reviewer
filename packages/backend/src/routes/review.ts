import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodReviewRequest, FoodReviewResponse, ApiError, EmotionMarker } from '@vrm-food-reviewer/shared';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import { getAccessToken } from '../config/gcp';

const router = express.Router();

// Initialize Google Generative AI with service account or fallback to API key
const initializeGemini = async (): Promise<GoogleGenerativeAI> => {
  try {
    if (config.googleServiceAccountPath) {
      // Use service account authentication
      const accessToken = await getAccessToken();
      logger.info('Using service account authentication for Gemini API');
      return new GoogleGenerativeAI(accessToken);
    } else {
      // Fallback to API key authentication
      logger.warn('Using legacy API key authentication for Gemini API');
      return new GoogleGenerativeAI(config.googleAiApiKey);
    }
  } catch (error) {
    logger.error('Failed to initialize Gemini with service account, falling back to API key:', error);
    return new GoogleGenerativeAI(config.googleAiApiKey);
  }
};

router.post('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const requestData: FoodReviewRequest = req.body;

  if (!requestData.imageBase64) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'Image data is required',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  logger.info('Food review generation requested', {
    reviewStyle: requestData.reviewStyle,
    hasRestaurantContext: !!requestData.restaurantContext
  });

  try {
    // Initialize Gemini with service account authentication
    const genAI = await initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare the prompt for Gemini
    const restaurantContext = requestData.restaurantContext 
      ? `This food is from ${requestData.restaurantContext.name} (${requestData.restaurantContext.category}), rated ${requestData.restaurantContext.rating}/5 stars.`
      : '';

    const stylePrompt = requestData.reviewStyle === 'passionate' 
      ? 'Write an extremely passionate and enthusiastic food review'
      : 'Write a casual and friendly food review';

    const prompt = `${stylePrompt} in Japanese for this food image. ${restaurantContext}

Please provide:
1. A long passionate review (300-500 characters) expressing excitement about the food
2. A short version for social media (under 140 characters)
3. The type of food shown in the image
4. Emotion markers for VRM character expressions

Format your response as JSON with these fields:
- longReview: string (the full passionate review)
- shortReview: string (social media version)
- foodType: string (what food is shown)
- emotions: array of objects with {timestamp: number, emotion: string, intensity: number}

Emotions should be: 'joy', 'surprised', 'satisfied', or 'neutral'
Timestamps should be in milliseconds from 0-10000 (10 seconds)
Intensity should be 0.0-1.0

Make it sound like a real food enthusiast reviewing delicious food!`;

    // Convert base64 to buffer for Gemini
    const imageData = requestData.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    let parsedResponse;
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse Gemini response as JSON, creating fallback response');
      
      // Fallback response if JSON parsing fails
      parsedResponse = {
        longReview: 'この料理は本当に素晴らしいです！見た目からして美味しそうで、きっと味も最高だと思います。食べるのが楽しみですね！',
        shortReview: 'この料理、めちゃくちゃ美味しそう！🍴✨',
        foodType: '美味しい料理',
        emotions: [
          { timestamp: 0, emotion: 'neutral', intensity: 0.5 },
          { timestamp: 2000, emotion: 'surprised', intensity: 0.8 },
          { timestamp: 5000, emotion: 'joy', intensity: 1.0 },
          { timestamp: 8000, emotion: 'satisfied', intensity: 0.9 }
        ]
      };
    }

    // Validate and format emotion markers
    const emotionMarkers: EmotionMarker[] = parsedResponse.emotions?.map((e: any) => ({
      timestamp: e.timestamp || 0,
      emotion: ['joy', 'surprised', 'satisfied', 'neutral'].includes(e.emotion) ? e.emotion : 'neutral',
      intensity: Math.max(0, Math.min(1, e.intensity || 0.5))
    })) || [
      { timestamp: 0, emotion: 'neutral' as const, intensity: 0.5 },
      { timestamp: 3000, emotion: 'joy' as const, intensity: 0.8 },
      { timestamp: 7000, emotion: 'satisfied' as const, intensity: 0.9 }
    ];

    const reviewResponse: FoodReviewResponse = {
      longReview: parsedResponse.longReview || '美味しそうな料理ですね！',
      shortReview: parsedResponse.shortReview || '美味しそう！',
      foodType: parsedResponse.foodType || '料理',
      emotionMarkers
    };

    logger.info('Food review generated successfully', {
      foodType: reviewResponse.foodType,
      longReviewLength: reviewResponse.longReview.length,
      shortReviewLength: reviewResponse.shortReview.length,
      emotionCount: reviewResponse.emotionMarkers.length
    });

    res.json(reviewResponse);

  } catch (error) {
    logger.error('Food review generation failed:', error);
    
    const apiError: ApiError = {
      error: 'AI Generation Error',
      message: 'Failed to generate food review',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
}));

export { router as reviewRouter };
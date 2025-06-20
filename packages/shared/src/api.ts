import { EmotionMarker } from './emotion';
import { RestaurantInfo } from './restaurant';

export interface FoodReviewRequest {
  imageBase64: string;
  restaurantContext?: RestaurantInfo;
  reviewStyle: 'passionate' | 'casual';
}

export interface FoodReviewResponse {
  longReview: string;           // 300-500 characters
  shortReview: string;          // < 140 characters  
  emotionMarkers: EmotionMarker[];
  foodType: string;
}

export interface ImageUploadRequest {
  file: File;
}

export interface ImageUploadResponse {
  imageBase64: string;
  isFood: boolean;
  confidence: number;
}

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  services: {
    gemini: boolean;
    voicevox: boolean;
    googleMaps: boolean;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
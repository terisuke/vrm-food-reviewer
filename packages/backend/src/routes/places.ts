import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import { PlacesSearchRequest, PlacesSearchResponse, RestaurantInfo, ApiError } from '@vrm-food-reviewer/shared';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import { getAccessToken } from '../config/gcp';

const router = express.Router();

// Initialize Google Maps client with API key (required for Maps API)
const initializeGoogleMapsClient = () => {
  logger.info('Using API key authentication for Google Maps API');
  return new Client({});
};

router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { query, lat, lng, radius = 1000, type = 'restaurant' } = req.query;

  if (!lat || !lng) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'Latitude and longitude are required',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const searchRadius = parseInt(radius as string);

  if (isNaN(latitude) || isNaN(longitude) || isNaN(searchRadius)) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'Invalid latitude, longitude, or radius values',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  logger.info('Places search requested', {
    query,
    location: { lat: latitude, lng: longitude },
    radius: searchRadius,
    type
  });

  try {
    // Initialize Google Maps client
    const googleMapsClient = initializeGoogleMapsClient();
    
    const searchParams: any = {
      location: [latitude, longitude],
      radius: searchRadius,
      type: type,
      key: config.googleMapsApiKey // Always use API key for Maps API
    };

    // Add query if provided
    if (query) {
      searchParams.keyword = query;
    }

    // Use Places API Nearby Search
    const placesResponse = await googleMapsClient.placesNearby({
      params: searchParams
    });

    if (placesResponse.data.status !== 'OK' && placesResponse.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${placesResponse.data.status}`);
    }

    // Transform results to our RestaurantInfo format
    const restaurants: RestaurantInfo[] = placesResponse.data.results.map((place: any) => ({
      name: place.name || 'Unknown Restaurant',
      address: place.vicinity || place.formatted_address || 'Address not available',
      rating: place.rating || 0,
      category: place.types?.[0]?.replace(/_/g, ' ') || 'restaurant',
      placeId: place.place_id,
      location: place.geometry?.location ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      } : undefined,
      priceLevel: place.price_level
    }));

    // Sort by rating (highest first) and limit to top 10
    const sortedRestaurants = restaurants
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    const response: PlacesSearchResponse = {
      restaurants: sortedRestaurants,
      status: placesResponse.data.status === 'OK' ? 'OK' : 'ZERO_RESULTS'
    };

    logger.info('Places search completed successfully', {
      resultCount: sortedRestaurants.length,
      topRating: sortedRestaurants[0]?.rating || 0
    });

    res.json(response);

  } catch (error) {
    logger.error('Places search failed:', error);

    // Check if it's a Google Maps API error
    if (error instanceof Error && error.message.includes('Google Places API error')) {
      const apiError: ApiError = {
        error: 'Places API Error',
        message: error.message,
        statusCode: 400
      };
      return res.status(400).json(apiError);
    }

    const apiError: ApiError = {
      error: 'Places Search Error',
      message: 'Failed to search for nearby restaurants',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
}));

// Get detailed information for a specific place
router.get('/:placeId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { placeId } = req.params;

  if (!placeId) {
    const error: ApiError = {
      error: 'Bad Request',
      message: 'Place ID is required',
      statusCode: 400
    };
    return res.status(400).json(error);
  }

  logger.info('Place details requested', { placeId });

  try {
    // Initialize Google Maps client
    const googleMapsClient = await initializeGoogleMapsClient();
    
    const detailsParams: any = {
      place_id: placeId,
      fields: [
        'name',
        'formatted_address',
        'rating',
        'types',
        'geometry',
        'formatted_phone_number',
        'website',
        'opening_hours',
        'price_level'
      ]
    };

    // Only add key if not using service account
    if (!config.googleServiceAccountPath && config.googleMapsApiKey) {
      detailsParams.key = config.googleMapsApiKey;
    }

    const detailsResponse = await googleMapsClient.placeDetails({
      params: detailsParams
    });

    if (detailsResponse.data.status !== 'OK') {
      throw new Error(`Google Place Details API error: ${detailsResponse.data.status}`);
    }

    const place = detailsResponse.data.result;
    
    const restaurantInfo: RestaurantInfo = {
      name: place.name || 'Unknown Restaurant',
      address: place.formatted_address || 'Address not available',
      rating: place.rating || 0,
      category: place.types?.[0]?.replace(/_/g, ' ') || 'restaurant',
      placeId: placeId,
      location: place.geometry?.location ? {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      } : undefined,
      phoneNumber: place.formatted_phone_number,
      website: place.website,
      openingHours: place.opening_hours?.weekday_text,
      priceLevel: place.price_level
    };

    logger.info('Place details retrieved successfully', {
      name: restaurantInfo.name,
      rating: restaurantInfo.rating
    });

    res.json(restaurantInfo);

  } catch (error) {
    logger.error('Place details request failed:', error);

    const apiError: ApiError = {
      error: 'Place Details Error',
      message: 'Failed to retrieve place details',
      statusCode: 500
    };
    res.status(500).json(apiError);
  }
}));

export { router as placesRouter };
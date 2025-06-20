export interface RestaurantInfo {
  name: string;
  address: string;
  rating: number;
  category: string;
  placeId: string;
  location?: {
    lat: number;
    lng: number;
  };
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  priceLevel?: number; // 0-4 scale
}

export interface LocationRequest {
  latitude: number;
  longitude: number;
  radius?: number; // meters, default 1000
}

export interface PlacesSearchRequest {
  query?: string;
  location?: {
    lat: number;
    lng: number;
  };
  radius?: number;
  type?: 'restaurant' | 'food' | 'meal_takeaway';
}

export interface PlacesSearchResponse {
  restaurants: RestaurantInfo[];
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
}

export interface GoogleMapsAPIs {
  placesAPI: 'Text Search, Nearby Search, Place Details';
  geocodingAPI: 'Address ↔ Coordinates conversion';
  mapsJavaScriptAPI: 'Interactive map display';
}
import { useEffect, useState } from 'react'
import { RestaurantInfo as RestaurantInfoType } from '@vrm-food-reviewer/shared'
import { apiClient } from '../utils/apiClient'
import './RestaurantInfo.css'

interface RestaurantInfoProps {
  location: {
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
  }
  onLocationRequest: () => void
  onRestaurantSelect: (restaurant: RestaurantInfoType) => void
  loading?: boolean
  restaurants: RestaurantInfoType[]
  selectedRestaurant?: RestaurantInfoType | null
}

export const RestaurantInfo = ({
  location,
  onLocationRequest,
  onRestaurantSelect,
  loading = false,
  restaurants,
  selectedRestaurant
}: RestaurantInfoProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [localRestaurants, setLocalRestaurants] = useState<RestaurantInfoType[]>(restaurants)

  useEffect(() => {
    setLocalRestaurants(restaurants)
  }, [restaurants])

  useEffect(() => {
    if (location.latitude && location.longitude && !location.error && !localLoading) {
      searchNearbyRestaurants()
    }
  }, [location.latitude, location.longitude, location.error])

  const searchNearbyRestaurants = async () => {
    if (!location.latitude || !location.longitude) return

    setLocalLoading(true)
    try {
      const response = await apiClient.searchPlaces({
        lat: location.latitude,
        lng: location.longitude,
        radius: 1000,
        type: 'restaurant'
      })

      setLocalRestaurants(response.restaurants)
    } catch (error) {
      console.error('Failed to search restaurants:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const searchByQuery = async () => {
    if (!searchQuery.trim()) return

    setLocalLoading(true)
    try {
      const searchParams: any = {
        query: searchQuery,
        type: 'restaurant'
      }

      if (location.latitude && location.longitude) {
        searchParams.lat = location.latitude
        searchParams.lng = location.longitude
        searchParams.radius = 5000 // Wider search for text queries
      }

      const response = await apiClient.searchPlaces(searchParams)
      setLocalRestaurants(response.restaurants)
    } catch (error) {
      console.error('Failed to search restaurants:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchByQuery()
    }
  }

  const renderRestaurantCard = (restaurant: RestaurantInfoType) => (
    <div
      key={restaurant.placeId}
      className={`restaurant-card ${selectedRestaurant?.placeId === restaurant.placeId ? 'selected' : ''}`}
      onClick={() => onRestaurantSelect(restaurant)}
    >
      <div className="restaurant-main">
        <div className="restaurant-name">{restaurant.name}</div>
        <div className="restaurant-meta">
          <span className="rating">⭐ {restaurant.rating || 'N/A'}/5</span>
          <span className="category">{restaurant.category}</span>
          {restaurant.priceLevel && (
            <span className="price-level">
              {'💰'.repeat(restaurant.priceLevel)}
            </span>
          )}
        </div>
      </div>
      <div className="restaurant-address">{restaurant.address}</div>
    </div>
  )

  return (
    <div className="restaurant-info">
      {/* Location Section */}
      <div className="location-section">
        <div className="location-header">
          <h3>📍 Location</h3>
          {!location.latitude && !location.loading && (
            <button 
              onClick={onLocationRequest}
              className="location-button"
              disabled={location.loading}
            >
              📍 Get My Location
            </button>
          )}
        </div>

        {location.loading && (
          <div className="location-status loading">
            <span className="loading-spinner"></span>
            Getting your location...
          </div>
        )}

        {location.error && (
          <div className="location-status error">
            ⚠️ {location.error}
            <button onClick={onLocationRequest} className="retry-button">
              🔄 Try Again
            </button>
          </div>
        )}

        {location.latitude && location.longitude && (
          <div className="location-status success">
            ✅ Location found ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h3>🔍 Search Restaurants</h3>
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search for restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button 
            onClick={searchByQuery}
            disabled={!searchQuery.trim() || localLoading}
            className="search-button"
          >
            {localLoading ? <span className="loading-spinner"></span> : '🔍'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {(loading || localLoading) && (
          <div className="loading-state">
            <span className="loading-spinner"></span>
            <p>Searching for restaurants...</p>
          </div>
        )}

        {!loading && !localLoading && localRestaurants.length === 0 && (
          <div className="empty-state">
            <p>🍽️ No restaurants found</p>
            <small>Try searching with a different query or enable location access</small>
          </div>
        )}

        {!loading && !localLoading && localRestaurants.length > 0 && (
          <div className="restaurants-list">
            <h4>🍴 Nearby Restaurants ({localRestaurants.length})</h4>
            <div className="restaurants-grid">
              {localRestaurants.map(renderRestaurantCard)}
            </div>
          </div>
        )}
      </div>

      {/* Selected Restaurant Summary */}
      {selectedRestaurant && (
        <div className="selected-summary">
          <h4>✅ Selected Restaurant</h4>
          <div className="selected-restaurant">
            <div className="restaurant-name">{selectedRestaurant.name}</div>
            <div className="restaurant-details">
              <span>⭐ {selectedRestaurant.rating}/5</span>
              <span>{selectedRestaurant.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
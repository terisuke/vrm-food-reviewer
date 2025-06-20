import { FoodReviewResponse, RestaurantInfo } from '@vrm-food-reviewer/shared'
import './FoodReviewDisplay.css'

interface FoodReviewDisplayProps {
  review: FoodReviewResponse
  restaurant?: RestaurantInfo | null
  foodImage?: string | null
}

export const FoodReviewDisplay = ({ review, restaurant, foodImage }: FoodReviewDisplayProps) => {
  const formatEmotions = () => {
    return review.emotionMarkers.map((marker, index) => (
      <span key={index} className={`emotion-marker emotion-${marker.emotion}`}>
        {getEmotionIcon(marker.emotion)}
      </span>
    ))
  }

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'joy': return '😄'
      case 'surprised': return '😲'
      case 'satisfied': return '😌'
      default: return '😐'
    }
  }

  return (
    <div className="food-review-display">
      <div className="review-header">
        <h2>🤖 AI Food Review</h2>
        <div className="review-meta">
          <span className="food-type">{review.foodType}</span>
          <div className="emotion-sequence">
            {formatEmotions()}
          </div>
        </div>
      </div>

      {foodImage && (
        <div className="food-image-container">
          <img 
            src={foodImage} 
            alt={`${review.foodType} food`}
            className="food-image"
          />
        </div>
      )}

      <div className="review-content">
        <div className="long-review">
          <h3>📝 Detailed Review</h3>
          <div className="review-text">
            {review.longReview}
          </div>
        </div>

        <div className="short-review">
          <h3>📱 Social Media Version</h3>
          <div className="review-text short">
            {review.shortReview}
          </div>
          <div className="character-count">
            {review.shortReview.length}/140 characters
          </div>
        </div>
      </div>

      {restaurant && (
        <div className="restaurant-context">
          <h3>📍 Restaurant Information</h3>
          <div className="restaurant-details">
            <div className="restaurant-name">{restaurant.name}</div>
            <div className="restaurant-info">
              <span className="rating">⭐ {restaurant.rating}/5</span>
              <span className="category">{restaurant.category}</span>
            </div>
            <div className="restaurant-address">{restaurant.address}</div>
          </div>
        </div>
      )}

      <div className="review-stats">
        <div className="stat">
          <span className="stat-label">Review Length</span>
          <span className="stat-value">{review.longReview.length} chars</span>
        </div>
        <div className="stat">
          <span className="stat-label">Emotions</span>
          <span className="stat-value">{review.emotionMarkers.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Food Type</span>
          <span className="stat-value">{review.foodType}</span>
        </div>
      </div>
    </div>
  )
}
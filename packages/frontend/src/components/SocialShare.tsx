import { FoodReviewResponse, RestaurantInfo } from '@vrm-food-reviewer/shared'
import './SocialShare.css'

interface SocialShareProps {
  review: FoodReviewResponse
  restaurant?: RestaurantInfo | null
  imageUrl?: string | null
}

export const SocialShare = ({ review, restaurant, imageUrl }: SocialShareProps) => {
  const generateTwitterContent = () => {
    const baseContent = review.shortReview
    const restaurantInfo = restaurant ? `\n\n📍 ${restaurant.name}\n⭐ ${restaurant.rating}/5` : ''
    const hashtags = '\n\n🎬 VRM character food review\n\n#FoodReviewAI #VRM #FoodReview'
    
    let categoryTag = ''
    if (restaurant?.category) {
      const cleanCategory = restaurant.category.replace(/_/g, '').replace(/\s+/g, '')
      categoryTag = ` #${cleanCategory}`
    }
    
    return `${baseContent}${restaurantInfo}${hashtags}${categoryTag}`
  }

  const handleTwitterShare = () => {
    const content = generateTwitterContent()
    const encodedContent = encodeURIComponent(content)
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedContent}`
    
    // Open in new window/tab
    window.open(twitterUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateTwitterContent())
      // You could add a toast notification here
      alert('Content copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }


  return (
    <div className="social-share">
      <div className="share-header">
        <h3>🐦 Share Your Review</h3>
        <p>Share your AI-generated food review on social media</p>
      </div>

      <div className="share-preview">
        <div className="preview-header">
          <span className="platform-icon">🐦</span>
          <span className="platform-name">Twitter Preview</span>
        </div>
        
        <div className="tweet-preview">
          <div className="tweet-content">
            <div className="tweet-text">
              {generateTwitterContent()}
            </div>
            
            {imageUrl && (
              <div className="tweet-image">
                <img src={imageUrl} alt="Food preview" />
              </div>
            )}
            
            <div className="tweet-meta">
              <span className="character-count">
                {generateTwitterContent().length}/280 characters
              </span>
              <div className="tweet-tags">
                <span className="tag">#FoodReviewAI</span>
                <span className="tag">#VRM</span>
                <span className="tag">#FoodReview</span>
                {restaurant?.category && (
                  <span className="tag">
                    #{restaurant.category.replace(/_/g, '').replace(/\s+/g, '')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="share-actions">
        <button 
          onClick={handleTwitterShare}
          className="twitter-share-button"
        >
          <span className="button-icon">🐦</span>
          Share on Twitter
        </button>
        
        <button 
          onClick={copyToClipboard}
          className="copy-button"
        >
          <span className="button-icon">📋</span>
          Copy Text
        </button>
      </div>

      <div className="share-info">
        <div className="info-item">
          <span className="info-label">Review Type:</span>
          <span className="info-value">{review.foodType}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Length:</span>
          <span className="info-value">{review.shortReview.length} chars</span>
        </div>
        {restaurant && (
          <div className="info-item">
            <span className="info-label">Restaurant:</span>
            <span className="info-value">{restaurant.name}</span>
          </div>
        )}
      </div>

      <div className="share-tips">
        <h4>💡 Sharing Tips</h4>
        <ul>
          <li>The preview shows how your tweet will appear</li>
          <li>Hashtags help others discover your review</li>
          <li>Restaurant information adds context</li>
          <li>Images make your posts more engaging</li>
        </ul>
      </div>
    </div>
  )
}
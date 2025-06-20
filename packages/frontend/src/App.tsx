import { useCallback } from 'react'
import { VRMViewer } from './components/VRMViewer'
import { FoodReviewDisplay } from './components/FoodReviewDisplay'
import { RestaurantInfo } from './components/RestaurantInfo'
import { SocialShare } from './components/SocialShare'
import { AudioPlayer } from './components/AudioPlayer'
import { useAppState } from './hooks/useAppState'
import { useLocation } from './hooks/useLocation'
import './App.css'

function App() {
  const { 
    state, 
    handleImageUpload, 
    handleReviewGeneration,
    handleVoiceSynthesis,
    handleRestaurantSelection,
    resetState 
  } = useAppState()

  const { location, requestLocation } = useLocation()

  const handleImageSelect = useCallback(async (file: File) => {
    await handleImageUpload(file)
  }, [handleImageUpload])

  const handleGenerateReview = useCallback(async (restaurantId?: string) => {
    if (!state.uploadedImage) return
    
    await handleReviewGeneration(state.uploadedImage, restaurantId)
  }, [state.uploadedImage, handleReviewGeneration])

  const handleGenerateVoice = useCallback(async () => {
    if (!state.review) return
    
    await handleVoiceSynthesis(state.review.longReview)
  }, [state.review, handleVoiceSynthesis])

  return (
    <div className="app">
      {/* Fullscreen VRM Background */}
      <div className="vrm-background">
        <VRMViewer
          emotionMarkers={state.review?.emotionMarkers}
          isPlaying={!!state.audioUrl}
          loading={state.loading.review}
        />
      </div>

      {/* Header Overlay */}
      <header className="app-header-overlay">
        <h1>🍴 VRM フードレビュー</h1>
        <p>VRMキャラクターによるAI生成グルメレビュー</p>
      </header>

      {/* Control Panel Overlay */}
      <div className="control-overlay">
        {/* Quick Action Buttons */}
        <div className="quick-actions">
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/jpeg,image/png,image/webp'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleImageSelect(file)
              }
              input.click()
            }}
            className="action-button upload-btn"
            disabled={state.loading.upload}
          >
            {state.loading.upload ? (
              <>
                <span className="loading-spinner"></span>
                処理中...
              </>
            ) : (
              <>📁 写真をアップロード</>
            )}
          </button>

          <button
            onClick={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: { facingMode: 'environment' }
                })
                // Simple camera implementation here
                const video = document.createElement('video')
                video.srcObject = stream
                video.play()
                
                // Create modal for camera
                const modal = document.createElement('div')
                modal.className = 'camera-modal'
                modal.innerHTML = `
                  <video autoplay playsinline style="width:100%;height:80%;object-fit:cover;"></video>
                  <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:20px;">
                    <button id="capture-btn" style="background:#4caf50;color:white;border:none;padding:20px 35px;border-radius:25px;font-size:18px;">📸 撮影</button>
                    <button id="cancel-btn" style="background:#f44336;color:white;border:none;padding:20px 35px;border-radius:25px;font-size:18px;">❌ キャンセル</button>
                  </div>
                `
                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10000;'
                
                const videoEl = modal.querySelector('video') as HTMLVideoElement
                videoEl.srcObject = stream
                
                modal.querySelector('#capture-btn')?.addEventListener('click', () => {
                  const canvas = document.createElement('canvas')
                  canvas.width = videoEl.videoWidth
                  canvas.height = videoEl.videoHeight
                  const ctx = canvas.getContext('2d')
                  ctx?.drawImage(videoEl, 0, 0)
                  
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
                      handleImageSelect(file)
                    }
                  })
                  
                  stream.getTracks().forEach(track => track.stop())
                  document.body.removeChild(modal)
                })
                
                modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
                  stream.getTracks().forEach(track => track.stop())
                  document.body.removeChild(modal)
                })
                
                document.body.appendChild(modal)
              } catch (error) {
                alert('カメラアクセスが拒否されました。アップロードをご利用ください。')
              }
            }}
            className="action-button camera-btn"
          >
            📷 写真を撮る
          </button>
        </div>

        {/* Progress Steps */}
        {state.uploadedImage && (
          <div className="progress-panel">
            {/* Restaurant Selection */}
            {!state.selectedRestaurant && (
              <div className="step-card">
                <h3>📍 レストランを選択</h3>
                <RestaurantInfo
                  location={location}
                  onLocationRequest={requestLocation}
                  onRestaurantSelect={handleRestaurantSelection}
                  loading={state.loading.places}
                  restaurants={state.restaurants}
                  selectedRestaurant={state.selectedRestaurant}
                />
              </div>
            )}

            {/* Review Generation */}
            {!state.review && (
              <div className="step-card">
                <h3>🤖 レビューを生成</h3>
                <button
                  onClick={() => handleGenerateReview(state.selectedRestaurant?.placeId)}
                  disabled={state.loading.review}
                  className="primary-button"
                >
                  {state.loading.review ? (
                    <>
                      <span className="loading-spinner"></span>
                      生成中...
                    </>
                  ) : (
                    'AIレビューを生成'
                  )}
                </button>
              </div>
            )}

            {/* Voice & Share */}
            {state.review && (
              <div className="step-card">
                <h3>🎤 音声とシェア</h3>
                <div className="action-row">
                  {state.loading.voice && (
                    <div className="voice-status">
                      <span className="loading-spinner"></span>
                      音声生成中...
                    </div>
                  )}
                  
                  <SocialShare
                    review={state.review}
                    restaurant={state.selectedRestaurant}
                    imageUrl={state.uploadedImage}
                  />
                </div>
                
                {state.audioUrl && (
                  <AudioPlayer
                    audioUrl={state.audioUrl}
                    onPlay={() => {/* VRM animation trigger */}}
                  />
                )}
              </div>
            )}

            {/* Reset */}
            <button onClick={resetState} className="reset-button">
              🔄 最初からやり直す
            </button>
          </div>
        )}

        {/* Review Display */}
        {state.review && (
          <div className="review-overlay">
            <FoodReviewDisplay
              review={state.review}
              restaurant={state.selectedRestaurant}
              foodImage={state.uploadedImage}
            />
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="error-overlay">
            {state.error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
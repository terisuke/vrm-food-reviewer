import { useCallback, useState, useRef } from 'react'
import './ImageUpload.css'

interface ImageUploadProps {
  onImageSelect: (file: File) => Promise<void>
  loading?: boolean
  disabled?: boolean
}

export const ImageUpload = ({ onImageSelect, loading = false, disabled = false }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or WebP image'
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }

    return null
  }

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file)
    if (error) {
      alert(error)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Process file
    try {
      await onImageSelect(file)
    } catch (error) {
      setPreview(null)
      console.error('Failed to upload image:', error)
    }
  }, [onImageSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || loading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [disabled, loading, handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && !loading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled, loading])

  // Camera functionality
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setShowCamera(true)
      }
    } catch (error) {
      console.error('Failed to start camera:', error)
      setCameraError('Unable to access camera. Please check permissions or try uploading a file.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setCameraError(null)
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      // Create File from blob
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })

      // Stop camera
      stopCamera()

      // Process the captured image
      await handleFileSelect(file)
    }, 'image/jpeg', 0.9)
  }, [handleFileSelect, stopCamera])

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled || loading}
          className="file-input"
          aria-label="Upload food image"
        />

{showCamera ? (
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            <div className="camera-controls">
              <button
                type="button"
                onClick={capturePhoto}
                className="capture-button"
                disabled={loading}
              >
                📸 Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="cancel-button"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        ) : preview ? (
          <div className="preview-container">
            <img src={preview} alt="Food preview" className="preview-image" />
            <div className="preview-overlay">
              <span>Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="upload-content">
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <p>Processing image...</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📸</div>
                <h3>Upload Food Photo</h3>
                <p>
                  Drag and drop your food image here, or click to select
                </p>
                <div className="file-requirements">
                  <small>JPEG, PNG, or WebP • Max 10MB</small>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {!showCamera && !preview && !loading && (
        <div className="action-buttons">
          <button
            type="button"
            onClick={startCamera}
            className="camera-button"
            disabled={disabled}
          >
            📷 Take Photo
          </button>
          <button
            type="button"
            onClick={handleClick}
            className="upload-button"
            disabled={disabled}
          >
            📁 Upload File
          </button>
        </div>
      )}

      {preview && !loading && !showCamera && (
        <button
          type="button"
          onClick={handleClick}
          className="change-image-button"
          disabled={disabled}
        >
          📷 Change Image
        </button>
      )}

      {cameraError && (
        <div className="camera-error">
          <p>⚠️ {cameraError}</p>
        </div>
      )}
    </div>
  )
}
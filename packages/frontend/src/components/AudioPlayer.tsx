import { useState, useRef, useEffect } from 'react'
import './AudioPlayer.css'

interface AudioPlayerProps {
  audioUrl: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export const AudioPlayer = ({ audioUrl, onPlay, onPause, onEnded }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedData = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onEnded?.()
    }

    const handleError = () => {
      setError('Failed to load audio')
      setLoading(false)
    }

    const handleCanPlay = () => {
      setLoading(false)
      // Auto-play when audio is ready
      if (audio && !isPlaying) {
        audio.play().then(() => {
          setIsPlaying(true)
          onPlay?.()
        }).catch(error => {
          console.error('Auto-play failed:', error)
          // Auto-play might be blocked by browser policy
        })
      }
    }

    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [audioUrl, onEnded])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio || loading) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
        onPause?.()
      } else {
        await audio.play()
        setIsPlaying(true)
        onPlay?.()
      }
    } catch (error) {
      console.error('Failed to play audio:', error)
      setError('Failed to play audio')
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />

      <div className="player-header">
        <span className="player-title">🎵 音声レビュー</span>
        {error && (
          <span className="error-indicator">⚠️ エラー</span>
        )}
      </div>

      <div className="player-controls">
        <button
          onClick={togglePlayPause}
          disabled={loading || !!error}
          className={`play-button ${isPlaying ? 'playing' : ''}`}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : error ? (
            '⚠️'
          ) : isPlaying ? (
            '⏸️'
          ) : (
            '▶️'
          )}
        </button>

        <div className="progress-container">
          <div className="time-display current">
            {formatTime(currentTime)}
          </div>
          
          <div className="progress-wrapper">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              disabled={loading || !!error}
              className="progress-slider"
            />
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="time-display duration">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="player-status">
          <span className="loading-spinner"></span>
          音声を読み込み中...
        </div>
      )}

      {error && (
        <div className="player-status error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="player-info">
          <div className="audio-details">
            <span className="detail-item">
              <strong>長さ:</strong> {formatTime(duration)}
            </span>
            <span className="detail-item">
              <strong>状態:</strong> {isPlaying ? '再生中' : '一時停止'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useCallback } from 'react'
import { 
  FoodReviewResponse, 
  RestaurantInfo
} from '@vrm-food-reviewer/shared'
import { apiClient } from '../utils/apiClient'

interface AppState {
  uploadedImage: string | null
  review: FoodReviewResponse | null
  restaurants: RestaurantInfo[]
  selectedRestaurant: RestaurantInfo | null
  audioUrl: string | null
  loading: {
    upload: boolean
    review: boolean
    voice: boolean
    places: boolean
  }
  error: string | null
}

const initialState: AppState = {
  uploadedImage: null,
  review: null,
  restaurants: [],
  selectedRestaurant: null,
  audioUrl: null,
  loading: {
    upload: false,
    review: false,
    voice: false,
    places: false
  },
  error: null
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState)

  const setLoading = useCallback((key: keyof AppState['loading'], value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value }
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const handleImageUpload = useCallback(async (file: File) => {
    setLoading('upload', true)
    setError(null)

    try {
      const response = await apiClient.uploadImage(file)
      
      if (!response.isFood || response.confidence < 0.7) {
        throw new Error('The uploaded image does not appear to contain food')
      }

      setState(prev => ({
        ...prev,
        uploadedImage: response.imageBase64,
        // Reset downstream state
        review: null,
        audioUrl: null,
        selectedRestaurant: null
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image'
      setError(message)
    } finally {
      setLoading('upload', false)
    }
  }, [setLoading, setError])

  const handleReviewGeneration = useCallback(async (imageBase64: string, restaurantId?: string) => {
    setLoading('review', true)
    setError(null)

    try {
      const restaurantContext = restaurantId 
        ? state.restaurants.find(r => r.placeId === restaurantId)
        : state.selectedRestaurant || undefined

      const response = await apiClient.generateReview({
        imageBase64,
        restaurantContext,
        reviewStyle: 'passionate'
      })

      setState(prev => ({
        ...prev,
        review: response,
        // Reset downstream state
        audioUrl: null
      }))

      // Automatically generate voice after review is completed
      setLoading('review', false)
      setLoading('voice', true)
      
      try {
        const voiceResponse = await apiClient.synthesizeVoice({
          text: response.longReview,
          emotion: 'happy'
        })

        setState(prev => ({ ...prev, audioUrl: voiceResponse.audioUrl }))
      } catch (voiceError) {
        console.error('Voice synthesis failed:', voiceError)
        // Don't set error state for voice failure - review is still successful
      } finally {
        setLoading('voice', false)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate review'
      setError(message)
      setLoading('review', false)
    }
  }, [state.restaurants, state.selectedRestaurant, setLoading, setError])

  const handleVoiceSynthesis = useCallback(async (text: string) => {
    setLoading('voice', true)
    setError(null)

    try {
      const response = await apiClient.synthesizeVoice({
        text,
        emotion: 'happy'
      })

      setState(prev => ({ ...prev, audioUrl: response.audioUrl }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to synthesize voice'
      setError(message)
    } finally {
      setLoading('voice', false)
    }
  }, [setLoading, setError])

  const handleRestaurantSelection = useCallback((restaurant: RestaurantInfo) => {
    setState(prev => ({ ...prev, selectedRestaurant: restaurant }))
  }, [])

  const setRestaurants = useCallback((restaurants: RestaurantInfo[]) => {
    setState(prev => ({ ...prev, restaurants }))
  }, [])

  const resetState = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    state,
    handleImageUpload,
    handleReviewGeneration,
    handleVoiceSynthesis,
    handleRestaurantSelection,
    setRestaurants,
    resetState
  }
}
import axios from 'axios'
import { 
  ImageUploadResponse,
  FoodReviewRequest,
  FoodReviewResponse,
  AudioSynthesisRequest,
  AudioSynthesisResponse,
  PlacesSearchResponse,
  HealthCheckResponse,
  ApiError
} from '@vrm-food-reviewer/shared'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const apiError: ApiError = error.response.data
      throw new Error(apiError.message || 'API request failed')
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out')
    }
    
    if (error.request) {
      throw new Error('Network error - please check your connection')
    }
    
    throw new Error(error.message || 'Unknown error occurred')
  }
)

export const apiClient = {
  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiInstance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  },

  async generateReview(request: FoodReviewRequest): Promise<FoodReviewResponse> {
    const response = await apiInstance.post('/api/review', request)
    return response.data
  },

  async synthesizeVoice(request: AudioSynthesisRequest): Promise<AudioSynthesisResponse> {
    const response = await apiInstance.post('/api/voice', request)
    return response.data
  },

  async searchPlaces(params: {
    lat: number
    lng: number
    radius?: number
    query?: string
    type?: string
  }): Promise<PlacesSearchResponse> {
    const response = await apiInstance.get('/api/places', { params })
    return response.data
  },

  async getPlaceDetails(placeId: string) {
    const response = await apiInstance.get(`/api/places/${placeId}`)
    return response.data
  },

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await apiInstance.get('/api/health')
    return response.data
  }
}
import axios from 'axios'
import AlleAIService from './alleAI'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const API_TIMEOUT = 10000

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * Main API Service for HealthTrust
 */
export const apiService = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      try {
        const response = await apiClient.post('/auth/login', credentials)
        return response.data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    register: async (userData) => {
      try {
        const response = await apiClient.post('/auth/register', userData)
        return response.data
      } catch (error) {
        console.error('Registration error:', error)
        throw error
      }
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch (error) {
        console.error('Logout error:', error)
        // Still clear local storage even if API call fails
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  },

  // Posts/Feed endpoints
  posts: {
    getAll: async (params = {}) => {
      try {
        const response = await apiClient.get('/posts', { params })
        return response.data
      } catch (error) {
        console.error('Get posts error:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const response = await apiClient.get(`/posts/${id}`)
        return response.data
      } catch (error) {
        console.error('Get post error:', error)
        throw error
      }
    },

    create: async (postData) => {
      try {
        const response = await apiClient.post('/posts', postData)
        return response.data
      } catch (error) {
        console.error('Create post error:', error)
        throw error
      }
    },

    update: async (id, postData) => {
      try {
        const response = await apiClient.put(`/posts/${id}`, postData)
        return response.data
      } catch (error) {
        console.error('Update post error:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        await apiClient.delete(`/posts/${id}`)
      } catch (error) {
        console.error('Delete post error:', error)
        throw error
      }
    },

    like: async (id) => {
      try {
        const response = await apiClient.post(`/posts/${id}/like`)
        return response.data
      } catch (error) {
        console.error('Like post error:', error)
        throw error
      }
    },

    unlike: async (id) => {
      try {
        const response = await apiClient.delete(`/posts/${id}/like`)
        return response.data
      } catch (error) {
        console.error('Unlike post error:', error)
        throw error
      }
    }
  },

  // Comments endpoints
  comments: {
    getByPost: async (postId) => {
      try {
        const response = await apiClient.get(`/posts/${postId}/comments`)
        return response.data
      } catch (error) {
        console.error('Get comments error:', error)
        throw error
      }
    },

    create: async (postId, commentData) => {
      try {
        const response = await apiClient.post(`/posts/${postId}/comments`, commentData)
        return response.data
      } catch (error) {
        console.error('Create comment error:', error)
        throw error
      }
    },

    delete: async (commentId) => {
      try {
        await apiClient.delete(`/comments/${commentId}`)
      } catch (error) {
        console.error('Delete comment error:', error)
        throw error
      }
    }
  },

  // User profile endpoints
  users: {
    getProfile: async (userId) => {
      try {
        const response = await apiClient.get(`/users/${userId}`)
        return response.data
      } catch (error) {
        console.error('Get profile error:', error)
        throw error
      }
    },

    updateProfile: async (userId, profileData) => {
      try {
        const response = await apiClient.put(`/users/${userId}`, profileData)
        return response.data
      } catch (error) {
        console.error('Update profile error:', error)
        throw error
      }
    }
  },

  // Alle AI integration endpoints
  ai: {
    chat: async (message, options = {}) => {
      try {
        console.log('Sending message to Alle AI:', message)
        
        // Use Alle AI service for chat
        const result = await AlleAIService.sendChatMessage(message, options)
        
        if (result.success) {
          return {
            success: true,
            data: result.data
          }
        } else {
          // Use fallback response if AI service fails
          return {
            success: true,
            data: result.fallback,
            fallback: true
          }
        }
      } catch (error) {
        console.error('AI Chat error:', error)
        
        // Return fallback response on error
        return {
          success: true,
          data: {
            message: AlleAIService.getFallbackResponse(message),
            confidence: 0.5,
            sources: ['HealthTrust Knowledge Base'],
            verified: false,
            timestamp: new Date().toISOString()
          },
          fallback: true
        }
      }
    },

    factCheck: async (claim, options = {}) => {
      try {
        console.log('Fact-checking claim:', claim)
        
        const result = await AlleAIService.factCheckClaim(claim, options)
        
        if (result.success) {
          return {
            success: true,
            data: result.data
          }
        } else {
          return {
            success: true,
            data: result.fallback,
            fallback: true
          }
        }
      } catch (error) {
        console.error('AI Fact-check error:', error)
        throw error
      }
    },

    detectMisinformation: async (content, options = {}) => {
      try {
        console.log('Detecting misinformation in content:', content.substring(0, 100) + '...')
        
        const result = await AlleAIService.detectMisinformation(content, options)
        
        if (result.success) {
          return {
            success: true,
            data: result.data
          }
        } else {
          return {
            success: true,
            data: result.fallback,
            fallback: true
          }
        }
      } catch (error) {
        console.error('AI Misinformation detection error:', error)
        throw error
      }
    },

    getHealthInfo: async (topic, options = {}) => {
      try {
        console.log('Getting health info for topic:', topic)
        
        const result = await AlleAIService.getHealthInfo(topic, options)
        
        if (result.success) {
          return {
            success: true,
            data: result.data
          }
        } else {
          return {
            success: true,
            data: result.fallback,
            fallback: true
          }
        }
      } catch (error) {
        console.error('AI Health info error:', error)
        throw error
      }
    }
  },

  // Legacy methods for backward compatibility
  getPosts: async (params = {}) => {
    return apiService.posts.getAll(params)
  },

  likePost: async (id) => {
    return apiService.posts.like(id)
  },

  chatWithAI: async (message, options = {}) => {
    return apiService.ai.chat(message, options)
  }
}

export default apiService

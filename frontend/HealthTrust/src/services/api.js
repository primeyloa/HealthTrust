import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const ALLE_AI_API_KEY = import.meta.env.VITE_ALLE_AI_API_KEY

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  }
}

// Posts Services
export const postsService = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`)
    return response.data
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData)
    return response.data
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  },

  commentOnPost: async (postId, comment) => {
    const response = await api.post(`/posts/${postId}/comments`, { comment })
    return response.data
  },

  requestFactCheck: async (postId) => {
    const response = await api.post(`/posts/${postId}/fact-check`)
    return response.data
  },

  reportPost: async (postId, reason) => {
    const response = await api.post(`/posts/${postId}/report`, { reason })
    return response.data
  }
}

// Alle AI Services for fact-checking and content analysis
export const alleAIService = {
  // Fact-check content using Alle AI
  factCheckContent: async (content) => {
    try {
      const response = await axios.post('https://api.alle-ai.com/v1/fact-check', {
        content,
        model: 'health-fact-checker',
        include_sources: true
      }, {
        headers: {
          'Authorization': `Bearer ${ALLE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Alle AI fact-check error:', error)
      throw error
    }
  },

  // Analyze content for misinformation patterns
  analyzeMisinformation: async (content) => {
    try {
      const response = await axios.post('https://api.alle-ai.com/v1/analyze', {
        content,
        analysis_type: 'misinformation_detection',
        context: 'health_information'
      }, {
        headers: {
          'Authorization': `Bearer ${ALLE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Alle AI analysis error:', error)
      throw error
    }
  },

  // Get trusted sources for health topics
  getTrustedSources: async (topic) => {
    try {
      const response = await axios.post('https://api.alle-ai.com/v1/sources', {
        topic,
        source_type: 'medical_academic',
        limit: 10
      }, {
        headers: {
          'Authorization': `Bearer ${ALLE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Alle AI sources error:', error)
      throw error
    }
  },

  // Generate evidence-based response to health misinformation
  generateResponse: async (misinformationContent) => {
    try {
      const response = await axios.post('https://api.alle-ai.com/v1/generate', {
        prompt: `Generate a fact-based response to this health misinformation: ${misinformationContent}`,
        model: 'health-response-generator',
        include_citations: true,
        tone: 'educational'
      }, {
        headers: {
          'Authorization': `Bearer ${ALLE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Alle AI generation error:', error)
      throw error
    }
  }
}

// Community Services
export const communityService = {
  getUsers: async (page = 1, limit = 20) => {
    const response = await api.get(`/community/users?page=${page}&limit=${limit}`)
    return response.data
  },

  followUser: async (userId) => {
    const response = await api.post(`/community/follow/${userId}`)
    return response.data
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/community/follow/${userId}`)
    return response.data
  },

  getUserProfile: async (userId) => {
    const response = await api.get(`/community/users/${userId}`)
    return response.data
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/community/users/${userId}/followers`)
    return response.data
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/community/users/${userId}/following`)
    return response.data
  }
}

// Combined API service object for easy importing
export const apiService = {
  // Auth methods
  ...authService,
  // Posts methods
  ...postsService,
  // AI methods
  ...alleAIService,
  // Community methods
  ...communityService,
  // Direct API access
  api,
  // Chat with AI method
  chatWithAI: alleAIService.generateResponse,
  // Get posts method
  getPosts: postsService.getFeed,
  // Like post method
  likePost: postsService.likePost
}

export default api

import axios from 'axios'

// Alle AI API Configuration
const ALLE_AI_BASE_URL = import.meta.env.VITE_ALLE_AI_API_URL || 'https://api.alle-ai.com/v1'
const ALLE_AI_API_KEY = import.meta.env.VITE_ALLE_AI_API_KEY

// Create Alle AI axios instance
const alleAIClient = axios.create({
  baseURL: ALLE_AI_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ALLE_AI_API_KEY}`,
    'User-Agent': 'HealthTrust/1.0.0'
  }
})

// Add request interceptor for logging
alleAIClient.interceptors.request.use(
  (config) => {
    console.log('Alle AI Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    })
    return config
  },
  (error) => {
    console.error('Alle AI Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
alleAIClient.interceptors.response.use(
  (response) => {
    console.log('Alle AI Response:', {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('Alle AI Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

/**
 * Alle AI Service for health-related AI interactions
 */
export class AlleAIService {
  /**
   * Send a chat message to Alle AI for health information
   * @param {string} message - User's message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  static async sendChatMessage(message, options = {}) {
    try {
      // Alle AI specific payload format
      const payload = {
        model: options.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a health information AI assistant for HealthTrust, a platform dedicated to combating health misinformation. 

Your role is to:
1. Provide accurate, evidence-based health information
2. Fact-check health claims and identify misinformation
3. Cite reliable medical sources (CDC, WHO, NIH, peer-reviewed journals)
4. Be clear about limitations and recommend consulting healthcare professionals
5. Focus specifically on vaccines, public health initiatives, and medical research

Always respond with:
- Clear, factual information
- Source citations when possible
- Confidence level in your response
- Warnings about misinformation when detected`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        stream: false,
        ...options.additionalParams
      }

      console.log('Attempting Alle AI API call with payload:', payload)
      
      // Try Alle AI specific endpoints
      const endpoints = ['/chat', '/v1/chat', '/chat/completions', '/v1/chat/completions']
      let response = null
      let lastError = null

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying Alle AI endpoint: ${endpoint}`)
          response = await alleAIClient.post(endpoint, payload)
          console.log(`Success with Alle AI endpoint: ${endpoint}`, response.data)
          break
        } catch (error) {
          console.log(`Failed with endpoint ${endpoint}:`, error.response?.status, error.response?.data)
          lastError = error
          continue
        }
      }

      if (!response) {
        throw lastError || new Error('All Alle AI endpoints failed')
      }
      
      // Parse different possible response formats from Alle AI
      const responseData = response.data
      let aiMessage = ''
      
      if (responseData.choices && responseData.choices[0]?.message?.content) {
        aiMessage = responseData.choices[0].message.content
      } else if (responseData.response) {
        aiMessage = responseData.response
      } else if (responseData.text) {
        aiMessage = responseData.text
      } else if (responseData.content) {
        aiMessage = responseData.content
      } else if (typeof responseData === 'string') {
        aiMessage = responseData
      } else {
        aiMessage = 'I apologize, but I couldn\'t generate a response at this time.'
      }
      
      return {
        success: true,
        data: {
          message: aiMessage,
          confidence: responseData.confidence || 0.8,
          sources: responseData.sources || ['Alle AI'],
          verified: responseData.verified || true,
          sessionId: responseData.session_id || options.sessionId,
          timestamp: new Date().toISOString(),
          usage: responseData.usage || null,
          model: responseData.model || payload.model
        }
      }
    } catch (error) {
      console.error('Alle AI Chat Error:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      // Return fallback response for development
      return {
        success: false,
        error: error.message,
        fallback: {
          message: this.getFallbackResponse(message),
          confidence: 0.6,
          sources: ['HealthTrust Knowledge Base'],
          verified: false,
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Fact-check a health claim using Alle AI
   * @param {string} claim - Health claim to fact-check
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Fact-check result
   */
  static async factCheckClaim(claim, options = {}) {
    try {
      const payload = {
        claim: claim,
        task: 'fact_check',
        domain: 'health',
        user_id: options.userId || 'anonymous',
        return_sources: true,
        return_evidence: true,
        ...options.additionalParams
      }

      const response = await alleAIClient.post('/fact-check', payload)
      
      return {
        success: true,
        data: {
          claim: claim,
          verdict: response.data.verdict || 'UNCERTAIN',
          confidence: response.data.confidence || 0.5,
          explanation: response.data.explanation || 'Unable to verify this claim.',
          sources: response.data.sources || [],
          evidence: response.data.evidence || [],
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Alle AI Fact-Check Error:', error)
      
      return {
        success: false,
        error: error.message,
        fallback: {
          claim: claim,
          verdict: 'UNCERTAIN',
          confidence: 0.3,
          explanation: 'Unable to fact-check this claim at this time. Please consult reliable medical sources.',
          sources: ['CDC', 'WHO', 'NIH'],
          evidence: [],
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Detect misinformation in text content
   * @param {string} content - Text content to analyze
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Misinformation detection result
   */
  static async detectMisinformation(content, options = {}) {
    try {
      const payload = {
        content: content,
        task: 'misinformation_detection',
        domain: 'health',
        sensitivity: options.sensitivity || 'medium',
        return_flagged_sections: true,
        ...options.additionalParams
      }

      const response = await alleAIClient.post('/analyze', payload)
      
      return {
        success: true,
        data: {
          content: content,
          risk_level: response.data.risk_level || 'LOW',
          confidence: response.data.confidence || 0.5,
          flagged_sections: response.data.flagged_sections || [],
          warnings: response.data.warnings || [],
          suggestions: response.data.suggestions || [],
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Alle AI Misinformation Detection Error:', error)
      
      return {
        success: false,
        error: error.message,
        fallback: {
          content: content,
          risk_level: 'UNKNOWN',
          confidence: 0.3,
          flagged_sections: [],
          warnings: ['Unable to analyze content at this time'],
          suggestions: ['Please verify information with reliable medical sources'],
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Get health information on a specific topic
   * @param {string} topic - Health topic to get information about
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Health information
   */
  static async getHealthInfo(topic, options = {}) {
    try {
      const payload = {
        topic: topic,
        task: 'health_information',
        format: 'detailed',
        include_sources: true,
        audience: options.audience || 'general',
        ...options.additionalParams
      }

      const response = await alleAIClient.post('/health-info', payload)
      
      return {
        success: true,
        data: {
          topic: topic,
          summary: response.data.summary || '',
          detailed_info: response.data.detailed_info || '',
          key_points: response.data.key_points || [],
          sources: response.data.sources || [],
          last_updated: response.data.last_updated || new Date().toISOString(),
          confidence: response.data.confidence || 0.8
        }
      }
    } catch (error) {
      console.error('Alle AI Health Info Error:', error)
      
      return {
        success: false,
        error: error.message,
        fallback: {
          topic: topic,
          summary: `Information about ${topic} is not available at this time.`,
          detailed_info: 'Please consult with healthcare professionals or visit official health organization websites.',
          key_points: ['Consult healthcare professionals', 'Verify information with official sources'],
          sources: ['CDC', 'WHO', 'NIH'],
          last_updated: new Date().toISOString(),
          confidence: 0.3
        }
      }
    }
  }

  /**
   * Generate fallback responses for development/testing
   * @param {string} message - Original user message
   * @returns {string} Fallback response
   */
  static getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('vaccine') || lowerMessage.includes('vaccination')) {
      return 'Vaccines are safe and effective tools for preventing infectious diseases. They undergo rigorous testing and continuous monitoring. For specific vaccine information, please consult with healthcare professionals or visit the CDC website.'
    }
    
    if (lowerMessage.includes('covid') || lowerMessage.includes('coronavirus')) {
      return 'COVID-19 vaccines have been proven safe and effective in preventing severe illness, hospitalization, and death. For the latest COVID-19 information, please refer to the CDC or WHO guidelines.'
    }
    
    if (lowerMessage.includes('flu') || lowerMessage.includes('influenza')) {
      return 'Annual flu vaccination is recommended for everyone 6 months and older. The flu vaccine is safe and the best way to protect against influenza and its complications.'
    }
    
    if (lowerMessage.includes('side effect') || lowerMessage.includes('adverse')) {
      return 'All medical interventions can have side effects, but serious adverse reactions to vaccines are rare. Common side effects are usually mild and resolve quickly. Always discuss concerns with healthcare professionals.'
    }
    
    return 'I\'m here to help with evidence-based health information. For specific medical advice, please consult with qualified healthcare professionals. You can also find reliable information from official sources like the CDC, WHO, and NIH.'
  }

  /**
   * Check if API is configured and available
   * @returns {boolean} Whether the service is ready
   */
  static isConfigured() {
    return !!(ALLE_AI_API_KEY && ALLE_AI_BASE_URL)
  }

  /**
   * Test the API connection
   * @returns {Promise<boolean>} Whether the API is accessible
   */
  static async testConnection() {
    if (!this.isConfigured()) {
      console.warn('Alle AI not configured')
      return false
    }

    try {
      // Try Alle AI specific health/status endpoints first
      const healthEndpoints = ['/health', '/status', '/v1/health', '/v1/status']
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await alleAIClient.get(endpoint)
          if (response.status === 200) {
            console.log(`Alle AI accessible via ${endpoint}`)
            return true
          }
        } catch {
          // Continue to next endpoint
          continue
        }
      }
      
      // If health endpoints fail, try a minimal chat request to test auth
      try {
        const testPayload = {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
          stream: false
        }
        
        const response = await alleAIClient.post('/chat', testPayload)
        if (response.status === 200) {
          console.log('Alle AI accessible via chat endpoint test')
          return true
        }
      } catch (chatError) {
        console.log('Chat endpoint test result:', chatError.response?.status, chatError.response?.data)
        
        // A 402 (payment required) or 429 (rate limit) means the API is working but has usage limits
        if (chatError.response?.status === 402 || chatError.response?.status === 429) {
          console.log('Alle AI is accessible but has usage restrictions')
          return true
        }
      }
      
      console.warn('All Alle AI connection tests failed')
      return false
    } catch (error) {
      console.warn('Alle AI API not accessible:', error.message)
      return false
    }
  }
}

export default AlleAIService

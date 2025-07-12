// Temporarily disable SDK import to test if it's causing the blank page
// import { AlleAI } from 'alle-ai-sdk'
import axios from 'axios'

// Alle AI Configuration
const ALLE_AI_API_KEY = import.meta.env.VITE_ALLE_AI_API_KEY
const ALLE_AI_BASE_URL = import.meta.env.VITE_ALLE_AI_API_URL || 'https://api.alle-ai.com/api/v1'

// Initialize the official SDK (temporarily disabled)
let alleAISDK = null
/*
try {
  if (ALLE_AI_API_KEY) {
    alleAISDK = new AlleAI({ apiKey: ALLE_AI_API_KEY })
  }
} catch (error) {
  console.warn('Alle AI SDK initialization failed, using axios fallback:', error)
}
*/

// Create axios fallback client
const alleAIClient = ALLE_AI_API_KEY ? axios.create({
  baseURL: ALLE_AI_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': ALLE_AI_API_KEY,
    'User-Agent': 'HealthTrust/1.0.0'
  }
}) : null

console.log('Alle AI Service initialized:', {
  hasApiKey: !!ALLE_AI_API_KEY,
  apiKey: ALLE_AI_API_KEY ? `${ALLE_AI_API_KEY.substring(0, 10)}...` : 'Not set',
  hasSDK: !!alleAISDK,
  hasClient: !!alleAIClient,
  baseURL: ALLE_AI_BASE_URL
})

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
    if (!alleAISDK && !alleAIClient) {
      console.error('Alle AI service not initialized')
      return {
        success: false,
        error: 'AI service not configured',
        fallback: {
          message: this.getFallbackResponse(message),
          confidence: 0.6,
          sources: ['HealthTrust Knowledge Base'],
          verified: false,
          timestamp: new Date().toISOString()
        }
      }
    }

    try {
      console.log('=== ALLE AI CHAT REQUEST ===')
      console.log('Message:', message)
      console.log('Using SDK:', !!alleAISDK)
      console.log('Options:', options)

      let response = null

      // Try SDK first if available
      if (alleAISDK) {
        try {
          console.log('🚀 Trying official Alle AI SDK...')
          response = await alleAISDK.chat({
            model: options.model || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant for HealthTrust, focused on providing accurate, evidence-based health information. Always encourage users to consult healthcare professionals for medical advice.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7
          })
          
          console.log('✅ SDK Response:', response)
          
          return {
            success: true,
            data: {
              message: response.choices?.[0]?.message?.content || response.response || response.content || 'No response content',
              confidence: 0.9,
              sources: ['Alle AI SDK'],
              verified: true,
              timestamp: new Date().toISOString(),
              model: response.model || 'gpt-4o'
            }
          }
          
        } catch (sdkError) {
          console.warn('❌ SDK failed, trying axios fallback:', sdkError)
          
          // If SDK fails with credits error, return that immediately
          if (sdkError.response?.status === 402 || sdkError.message?.includes('credit')) {
            return {
              success: false,
              error: 'API Credits Required',
              data: {
                message: '💳 **Add Credits Required**: Your Alle AI account needs more credits. Please visit your Alle AI dashboard to add credits.',
                confidence: 1.0,
                sources: ['API Credit Check'],
                verified: true,
                timestamp: new Date().toISOString()
              }
            }
          }
        }
      }

      // Fallback to axios client if SDK is not available or failed
      if (alleAIClient && !response) {
        console.log('🔄 Using axios fallback...')
        
        // Try multiple payload formats that Alle AI might accept
        const payloadFormats = [
          // Standard OpenAI format
          {
            model: options.model || 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant for HealthTrust, focused on providing accurate, evidence-based health information. Always encourage users to consult healthcare professionals for medical advice.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7
          },
          // Alternative format 1 - simpler structure
          {
            model: 'gpt-3.5-turbo',
            prompt: message,
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7
          },
          // Alternative format 2 - different model names
          {
            model: 'gpt-4',
            messages: [
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: options.maxTokens || 500
          },
          // Alternative format 3 - text completion style
          {
            prompt: `You are a health AI assistant. User asks: ${message}\n\nResponse:`,
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7
          }
        ]

        // Try the correct endpoint with different payload formats
        const endpoints = ['/chat/completions', '/completions', '/v1/chat/completions', '/api/v1/chat/completions']
        let lastError = null

        for (const payload of payloadFormats) {
          for (const endpoint of endpoints) {
            try {
              console.log(`🎯 Trying: ${ALLE_AI_BASE_URL}${endpoint} with payload:`, JSON.stringify(payload, null, 2))
              response = await alleAIClient.post(endpoint, payload)
              console.log(`✅ Success with ${endpoint}:`, response.data)
              
              // If we get a successful response, break out of both loops
              if (response.data) {
                break
              }
            } catch (error) {
              console.log(`❌ Failed ${endpoint}:`, error.response?.status, error.response?.data)
              
              // If it's a 402 error (insufficient credits), we found the right endpoint
              if (error.response?.status === 402) {
                console.log('🎯 Found correct endpoint but need credits!')
                throw error // Re-throw to handle credits error properly
              }
              
              lastError = error
              continue
            }
          }
          
          // If we got a response, break out of payload loop
          if (response) break
        }

        if (!response) {
          throw lastError || new Error('All endpoint and payload combinations failed')
        }
      }

      // Parse response - handle Alle AI's specific response format
      const responseData = response.data
      let aiMessage = ''
      
      console.log('🔍 Parsing response data:', responseData)
      
      // Handle Alle AI's response structure
      if (responseData.success && responseData.responses) {
        if (responseData.responses.responses && responseData.responses.responses.length > 0) {
          aiMessage = responseData.responses.responses[0].content || responseData.responses.responses[0].text || 'Response received but no content'
        } else if (responseData.responses.length > 0) {
          aiMessage = responseData.responses[0].content || responseData.responses[0].text || 'Response received but no content'
        } else {
          aiMessage = 'API responded successfully but returned empty response. This might indicate the model needs different parameters or your account needs configuration.'
        }
      }
      // Handle OpenAI-compatible format (fallback)
      else if (responseData.choices && responseData.choices[0]) {
        aiMessage = responseData.choices[0].message?.content || responseData.choices[0].text || 'No response content'
      } 
      // Handle direct response field
      else if (responseData.response) {
        aiMessage = responseData.response
      } 
      // Handle content field
      else if (responseData.content) {
        aiMessage = responseData.content
      } 
      // Handle message field
      else if (responseData.message) {
        aiMessage = responseData.message
      }
      else {
        aiMessage = `API Response: ${JSON.stringify(responseData, null, 2)}`
      }

      return {
        success: true,
        data: {
          message: aiMessage,
          confidence: responseData.confidence || (aiMessage.includes('API Response:') ? 0.3 : 0.8),
          sources: responseData.sources || ['Alle AI'],
          verified: responseData.verified || true,
          sessionId: responseData.session_id || options.sessionId,
          timestamp: new Date().toISOString(),
          usage: responseData.usage || null,
          model: responseData.model || options.model || 'gpt-4o',
          rawResponse: responseData // Include raw response for debugging
        }
      }
    } catch (error) {
      console.error('Alle AI Chat Error:', error)
      
      // Check for specific API errors
      if (error.response) {
        const status = error.response.status
        const apiError = error.response.data
        
        if (status === 402) {
          return {
            success: false,
            error: 'API Credits Required',
            data: {
              message: '💳 **Add Credits Required**: Your Alle AI account needs more credits to process requests. Please visit your Alle AI dashboard to add credits and continue using the AI service.',
              confidence: 1.0,
              sources: ['API Credit Check'],
              verified: true,
              apiStatus: status,
              apiError: apiError?.error?.message || 'Insufficient API credits',
              creditsUrl: 'https://alle-ai.com/dashboard',
              timestamp: new Date().toISOString()
            }
          }
        } else if (status === 401) {
          return {
            success: false,
            error: 'Authentication Error',
            data: {
              message: '🔑 **API Key Issue**: There seems to be an issue with your API key. Please check your Alle AI account and API key configuration.',
              confidence: 1.0,
              sources: ['API Authentication'],
              verified: true,
              apiStatus: status,
              timestamp: new Date().toISOString()
            }
          }
        } else if (status === 429) {
          return {
            success: false,
            error: 'Rate Limit Exceeded',
            data: {
              message: '⏱️ **Rate Limit**: Too many requests. Please wait a moment before trying again.',
              confidence: 1.0,
              sources: ['API Rate Limit'],
              verified: true,
              apiStatus: status,
              timestamp: new Date().toISOString()
            }
          }
        }
      }
      
      // Return fallback response
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
    if (!alleAIClient) {
      return {
        success: false,
        error: 'AI service not configured',
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

    try {
      // Use SDK for fact-checking - this might need to be adapted based on SDK API
      const response = await alleAIClient.factCheck ? 
        await alleAIClient.factCheck({
          claim: claim,
          domain: 'health',
          ...options.additionalParams
        }) :
        await alleAIClient.chat({
          messages: [
            {
              role: 'system',
              content: 'You are a health fact-checker. Analyze the given claim and provide a verdict (TRUE, FALSE, UNCERTAIN), confidence level, and explanation with sources.'
            },
            {
              role: 'user',
              content: `Please fact-check this health claim: "${claim}"`
            }
          ],
          model: 'gpt-4o',
          max_tokens: 300
        })
      
      return {
        success: true,
        data: {
          claim: claim,
          verdict: response.verdict || 'UNCERTAIN',
          confidence: response.confidence || 0.5,
          explanation: response.explanation || response.content || 'Unable to verify this claim.',
          sources: response.sources || ['Alle AI'],
          evidence: response.evidence || [],
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
    return !!(ALLE_AI_API_KEY && alleAIClient)
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
      console.log('🔍 Testing Alle AI connection...')
      
      // Try SDK first if available
      if (alleAISDK) {
        try {
          console.log('🚀 Testing SDK connection...')
          await alleAISDK.chat({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 1
          })
          console.log('✅ SDK connection successful!')
          return true
        } catch (sdkError) {
          console.warn('❌ SDK test failed:', sdkError.message)
          
          // If it's a credits error, connection works
          if (sdkError.response?.status === 402 || sdkError.message?.includes('credit')) {
            console.log('✅ SDK connection working (credits needed)')
            return true
          }
        }
      }
      
      // Fallback to axios client testing
      if (alleAIClient) {
        console.log('🔄 Testing axios client...')
        
        // Try a simple GET request first
        try {
          const healthResponse = await alleAIClient.get('/')
          console.log('✅ Base endpoint success:', healthResponse.status)
          return true
        } catch {
          console.log('Base endpoint failed, trying chat...')
        }
        
        // Try a minimal chat request
        const testPayload = {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        }
        
        const testResponse = await alleAIClient.post('/chat/completions', testPayload)
        console.log('✅ Chat endpoint test successful:', testResponse.status)
        return true
      }
      
      return false
    } catch (error) {
      console.warn('❌ Alle AI connection test failed:', error.message, error.response?.status)
      
      // Check if it's a usage/payment error (which means connection works)
      if (error.response?.status === 402 || 
          error.response?.status === 429 ||
          error.message.includes('quota') || 
          error.message.includes('payment')) {
        console.log('Alle AI is accessible but has usage restrictions')
        return true
      }
      
      return false
    }
  }
}

export default AlleAIService

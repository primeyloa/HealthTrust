import React, { useState, useEffect } from 'react'
import AlleAIService from '../services/alleAI'
import axios from 'axios'
import { Bot, AlertCircle, CheckCircle, Loader, Wifi, WifiOff } from 'lucide-react'

const AITestPanel = () => {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [testMessage, setTestMessage] = useState('Tell me about COVID vaccines')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if AI is configured
    const configured = AlleAIService.isConfigured()
    setIsConfigured(configured)
    
    // Test connection if configured
    if (configured) {
      testConnection()
    }
  }, [])

  const testConnection = async () => {
    try {
      const connected = await AlleAIService.testConnection()
      setIsConnected(connected)
    } catch (error) {
      console.error('Connection test failed:', error)
      setIsConnected(false)
    }
  }

  const testDirectAPI = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    const baseUrl = import.meta.env.VITE_ALLE_AI_API_URL
    const apiKey = import.meta.env.VITE_ALLE_AI_API_KEY

    console.log('=== DIRECT API TEST ===')
    console.log('Base URL:', baseUrl)
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET')

    const testPayload = {
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: testMessage }
      ],
      max_tokens: 100,
      temperature: 0.7
    }

    // Try multiple possible URL patterns for Alle AI
    const urlPatterns = [
      `${baseUrl}/v1/chat/completions`,
      `${baseUrl}/api/v1/chat/completions`, 
      `${baseUrl}/chat/completions`,
      `${baseUrl}/chat`,
      `${baseUrl}/v1/chat`,
      `${baseUrl}/api/chat`,
      `${baseUrl}/completions`
    ]

    for (const url of urlPatterns) {
      try {
        console.log(`Trying URL: ${url}`)
        
        const response = await axios.post(url, testPayload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'HealthTrust/1.0.0'
          },
          timeout: 30000
        })

        console.log(`SUCCESS with ${url}:`, response.data)
        setResponse({
          success: true,
          data: {
            message: response.data.choices?.[0]?.message?.content || 
                     response.data.response || 
                     response.data.text ||
                     JSON.stringify(response.data),
            confidence: 1.0,
            sources: [`Direct API Call: ${url}`],
            verified: true
          }
        })
        setLoading(false)
        return // Success, exit the function
        
      } catch (err) {
        console.log(`Failed with ${url}:`, err.response?.status, err.response?.data)
        continue // Try next URL
      }
    }

    // If we get here, all URLs failed
    setError('All API endpoint patterns failed. Check console for details.')
    setResponse({
      success: false,
      error: 'All endpoint patterns failed',
      testedUrls: urlPatterns
    })
    setLoading(false)
  }

  const testChat = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log('=== AI TEST STARTING ===')
      console.log('Environment check:')
      console.log('API URL:', import.meta.env.VITE_ALLE_AI_API_URL)
      console.log('API Key (first 10 chars):', import.meta.env.VITE_ALLE_AI_API_KEY?.substring(0, 10))
      console.log('Message:', testMessage)
      
      console.log('Testing chat with message:', testMessage)
      const result = await AlleAIService.sendChatMessage(testMessage, {
        userId: 'test-user',
        sessionId: 'test-session'
      })

      console.log('=== AI TEST COMPLETE ===')
      console.log('Full chat result:', result)
      setResponse(result)
    } catch (err) {
      console.error('=== AI TEST FAILED ===')
      console.error('Chat test failed:', err)
      console.error('Error stack:', err.stack)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Bot className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold">AI Service Test Panel</h2>
      </div>

      {/* Configuration Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Configuration Status</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            {isConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={isConfigured ? 'text-green-700' : 'text-red-700'}>
              API Key & URL: {isConfigured ? 'Configured' : 'Not Configured'}
            </span>
          </div>
          
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
              API Connection: {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* API Configuration Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Current Configuration</h3>
        <div className="bg-gray-50 p-4 rounded border">
          <p><strong>API URL:</strong> {import.meta.env.VITE_ALLE_AI_API_URL || 'Not set'}</p>
          <p><strong>API Key:</strong> {import.meta.env.VITE_ALLE_AI_API_KEY ? 
            `${import.meta.env.VITE_ALLE_AI_API_KEY.substring(0, 10)}...` : 
            'Not set'
          }</p>
        </div>
      </div>

      {/* Test Chat */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Chat</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Message:</label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none"
              rows="3"
              placeholder="Enter a message to test the AI..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={testChat}
              disabled={loading || !testMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test AI Service'
              )}
            </button>
            
            <button
              onClick={testDirectAPI}
              disabled={loading || !testMessage.trim()}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Direct API'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h4 className="text-red-800 font-semibold">Error</h4>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">AI Response</h3>
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="mb-4">
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                response.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {response.success ? 'Success' : 'Failed'}
              </span>
              
              {response.apiStatus && (
                <span className="ml-2 inline-block px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                  Status: {response.apiStatus}
                </span>
              )}
            </div>
            
            {response.success && response.data ? (
              <div className="space-y-3">
                <div>
                  <strong>Message:</strong>
                  <p className="mt-1 p-3 bg-white border rounded">{response.data.message}</p>
                </div>
                
                {response.data.confidence && (
                  <div>
                    <strong>Confidence:</strong> {Math.round(response.data.confidence * 100)}%
                  </div>
                )}
                
                {response.data.sources && response.data.sources.length > 0 && (
                  <div>
                    <strong>Sources:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {response.data.sources.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : response.fallback ? (
              <div className="space-y-3">
                <p className="text-orange-600 font-medium">Using Fallback Response</p>
                <div>
                  <strong>Message:</strong>
                  <p className="mt-1 p-3 bg-white border rounded">{response.fallback.message}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-red-600">
                  <strong>Error:</strong> {response.error || 'Unknown error occurred'}
                </div>
                
                {response.apiError && (
                  <div className="text-sm">
                    <strong>API Error Details:</strong>
                    <pre className="mt-1 p-3 bg-red-50 border rounded text-xs overflow-x-auto">
                      {JSON.stringify(response.apiError, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-800 font-semibold mb-2">Setup Required</h4>
          <div className="text-yellow-700">
            <p className="mb-2">To enable real-time AI responses, you need to:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Get your Alle AI API key from the Alle AI dashboard</li>
              <li>Update your <code>.env</code> file with the real API key</li>
              <li>Verify the API endpoint URL is correct</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

export default AITestPanel

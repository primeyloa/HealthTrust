import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Send, Bot, User, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { apiService } from '../services/api'

const Chat = () => {
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hi! I'm your AI health assistant powered by Alle AI. I can help you fact-check health information, answer questions about vaccines, detect misinformation, and provide evidence-based health guidance. Ask me anything about health topics and I'll provide verified, accurate information!",
        timestamp: new Date(),
        verified: true,
        sources: ['Alle AI Knowledge Base'],
        confidence: 1.0
      }
    ])
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setLoading(true)
    setError(null)

    try {
      // Call Alle AI service with health context
      const response = await apiService.ai.chat(newMessage, {
        context: 'health_assistance',
        includeFactCheck: true,
        includeVerification: true
      })
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.message,
          timestamp: new Date(),
          verified: response.data.verified || false,
          sources: response.data.sources || [],
          confidence: response.data.confidence || null,
          factCheck: response.data.factCheck || null,
          fallback: response.fallback || false
        }

        setMessages(prev => [...prev, aiMessage])
        
        if (response.fallback) {
          setError('AI assistant is running in offline mode')
        }
      } else {
        throw new Error('AI service returned error')
      }
    } catch (err) {
      console.error('Error sending message:', err)
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting to the AI service right now. Please try again in a moment, or check our community feed for verified health information.",
        timestamp: new Date(),
        verified: false,
        error: true
      }

      setMessages(prev => [...prev, fallbackMessage])
      setError('Unable to connect to Alle AI assistant')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">AI Health Assistant</h1>
        <p className="text-gray-600 mb-6">Sign in to chat with our AI health assistant for fact-checked health information.</p>
        <a href="/login" className="btn btn-primary">Sign In</a>
      </div>
    )
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">AI Health Assistant</h1>
            <p className="text-sm text-gray-500">Powered by Alle AI • Always fact-checked</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`chat-message ${message.type}`}>
            <div className="chat-message-avatar">
              {message.type === 'ai' ? (
                <Bot className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            
            <div className="chat-message-content">
              <div className="chat-message-bubble">
                {message.type === 'ai' && (
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      AI Assistant
                    </span>
                    {message.verified && (
                      <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                    )}
                    {message.error && (
                      <AlertCircle className="w-3 h-3 text-red-500 ml-1" />
                    )}
                  </div>
                )}
                
                <p className="chat-message-text">{message.content}</p>
                
                {message.confidence && (
                  <div className="mt-2 text-xs text-gray-500">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </div>
                )}
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold text-gray-600 mb-1">Sources:</h5>
                    <div className="flex flex-wrap gap-1">
                      {message.sources.map((source, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="chat-message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="chat-message ai">
            <div className="chat-message-avatar">
              <Bot className="w-5 h-5" />
            </div>
            <div className="chat-message-content">
              <div className="chat-message-bubble">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask about health topics, vaccines, or fact-check information..."
              className="chat-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-send-button"
              disabled={!newMessage.trim() || loading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          AI responses are fact-checked against medical sources. Always consult healthcare professionals for medical advice.
        </div>
      </div>
    </div>
  )
}

export default Chat

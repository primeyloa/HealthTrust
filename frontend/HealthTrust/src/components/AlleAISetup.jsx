import React from 'react'
import { CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react'

const AlleAISetup = () => {
  const currentApiKey = import.meta.env.VITE_ALLE_AI_API_KEY
  const isConfigured = currentApiKey && currentApiKey !== 'your_alle_ai_api_key_here'

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Alle AI Setup Guide</h1>
        <div className="flex items-center mb-4">
          {isConfigured ? (
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          )}
          <span className={`font-semibold ${isConfigured ? 'text-green-700' : 'text-red-700'}`}>
            API Status: {isConfigured ? 'Configured' : 'Not Configured'}
          </span>
        </div>
      </div>

      {!isConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">⚡ Quick Setup Required</h2>
          <p className="text-yellow-700 mb-4">
            You need to configure your Alle AI API key to get real-time AI responses. Follow the steps below:
          </p>
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1: Get API Key */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
              1
            </div>
            <h2 className="text-xl font-semibold">Get Your Alle AI API Key</h2>
          </div>
          
          <div className="ml-11">
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
              <li>Visit the Alle AI website or dashboard</li>
              <li>Sign up for an account or log in</li>
              <li>Navigate to the API section</li>
              <li>Generate a new API key for HealthTrust</li>
              <li>Copy the API key (it should start with "alle-")</li>
            </ol>
            
            <a 
              href="https://alle-ai.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Alle AI Dashboard
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>

        {/* Step 2: Configure Environment */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-xl font-semibold">Update Your Environment File</h2>
          </div>
          
          <div className="ml-11">
            <p className="text-gray-700 mb-4">
              Update your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in the project root:
            </p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
              <div className="mb-2"># Alle AI Configuration</div>
              <div className="text-yellow-400">VITE_ALLE_AI_API_KEY=your_actual_api_key_here</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip:</h4>
              <p className="text-blue-700 text-sm">
                Replace <code>your_actual_api_key_here</code> with the API key you copied from Alle AI. 
                Make sure there are no extra spaces or quotes around the key.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Restart Server */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
              3
            </div>
            <h2 className="text-xl font-semibold">Restart Development Server</h2>
          </div>
          
          <div className="ml-11">
            <p className="text-gray-700 mb-4">
              After updating the .env file, restart your development server:
            </p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4 flex items-center justify-between">
              <span>npm run dev</span>
              <button 
                onClick={() => copyToClipboard('npm run dev')}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Step 4: Test */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
              4
            </div>
            <h2 className="text-xl font-semibold">Test Your Setup</h2>
          </div>
          
          <div className="ml-11">
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
              <li>Navigate to the AI Test Panel at <code>/ai-test</code></li>
              <li>Check that the configuration shows as "Configured"</li>
              <li>Test the connection</li>
              <li>Send a test message like "Tell me about vaccines"</li>
              <li>Try the chat feature on the main chat page</li>
            </ol>
          </div>
        </div>

        {/* Current Status */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">API Key:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isConfigured 
                  ? `Configured (${currentApiKey.substring(0, 10)}...)` 
                  : 'Not Configured'
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">SDK:</span>
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Installed (alle-ai-sdk)
              </span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Common Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Do I need to host online to get AI responses?</h3>
              <p className="text-gray-700 mt-1">
                No! The AI will work locally on your development server. You just need a valid API key.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">What if I get quota or billing errors?</h3>
              <p className="text-gray-700 mt-1">
                This means your API key is working but you've reached usage limits. Check your Alle AI billing/quota settings.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">Why am I getting fallback responses?</h3>
              <p className="text-gray-700 mt-1">
                Fallback responses appear when the API is unavailable or not configured. Follow the setup steps above to fix this.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlleAISetup

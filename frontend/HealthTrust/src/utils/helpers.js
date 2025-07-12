// Utility functions for the HealthTrust app

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now - time) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  return time.toLocaleDateString()
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize user input to prevent XSS
export const sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Extract URLs from text
export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

// Check if content might contain health misinformation keywords
export const flagPotentialMisinformation = (content) => {
  const misinformationKeywords = [
    'vaccine causes autism',
    'vaccines are dangerous',
    'covid is fake',
    'masks don\'t work',
    'natural immunity is better',
    'big pharma conspiracy',
    'microchip',
    'population control',
    'DNA altering',
    'experimental vaccine'
  ]
  
  const contentLower = content.toLowerCase()
  const flaggedKeywords = misinformationKeywords.filter(keyword => 
    contentLower.includes(keyword)
  )
  
  return {
    isFlagged: flaggedKeywords.length > 0,
    flaggedKeywords,
    riskLevel: flaggedKeywords.length === 0 ? 'low' : 
               flaggedKeywords.length <= 2 ? 'medium' : 'high'
  }
}

// Generate user avatar placeholder
export const generateAvatar = (name) => {
  if (!name) return 'U'
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name[0].toUpperCase()
}

// Format numbers for display (1.2K, 1.5M, etc.)
export const formatNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}

// Debounce function for search input
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Calculate reading time for posts
export const calculateReadingTime = (text) => {
  const wordsPerMinute = 200
  const words = text.split(' ').length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

// Check if user is verified healthcare professional
export const isHealthcareProfessional = (user) => {
  const professionalTitles = ['dr.', 'dr', 'md', 'phd', 'rn', 'np', 'pa']
  const name = user.name?.toLowerCase() || ''
  const bio = user.bio?.toLowerCase() || ''
  
  return professionalTitles.some(title => 
    name.includes(title) || bio.includes(title)
  ) || user.verified === true
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }
}

// Theme helpers
export const theme = {
  isDarkMode: () => {
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  
  toggleDarkMode: () => {
    document.body.classList.toggle('dark-theme')
  }
}

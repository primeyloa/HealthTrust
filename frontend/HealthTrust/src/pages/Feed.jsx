import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Heart, MessageCircle, Share2, CheckCircle, AlertTriangle, User, Plus, Search, Filter, TrendingUp, Shield } from 'lucide-react'

// Mock data for posts - this will be replaced with API calls
const mockPosts = [
  {
    id: 1,
    author: {
      name: 'Dr. Sarah Johnson',
      title: 'Infectious Disease Specialist',
      verified: true,
      avatar: null
    },
    content: 'New study shows COVID-19 vaccines continue to be highly effective against severe illness. The latest research from Johns Hopkins confirms 94% efficacy in preventing hospitalization.',
    timestamp: '2 hours ago',
    likes: 124,
    comments: 18,
    factChecked: true,
    sources: ['Johns Hopkins Medicine', 'CDC'],
    tags: ['vaccines', 'covid19', 'research'],
    aiInsight: 'This information aligns with current medical consensus and is supported by peer-reviewed research.'
  },
  {
    id: 2,
    author: {
      name: 'Maria Rodriguez',
      title: 'Public Health Educator', 
      verified: false,
      avatar: null
    },
    content: 'Reminder: Getting your flu shot this season is especially important. It helps protect not just you, but also vulnerable community members who cannot be vaccinated.',
    timestamp: '4 hours ago',
    likes: 89,
    comments: 12,
    factChecked: true,
    sources: ['WHO', 'CDC'],
    tags: ['flu', 'vaccines', 'public-health']
  },
  {
    id: 3,
    author: {
      name: 'Dr. Michael Chen',
      title: 'Epidemiologist',
      verified: true,
      avatar: null
    },
    content: 'Addressing concerns about vaccine ingredients: All approved vaccines undergo rigorous safety testing. Each ingredient serves a specific purpose and is present in tiny, safe amounts.',
    timestamp: '6 hours ago',
    likes: 156,
    comments: 24,
    factChecked: true,
    sources: ['FDA', 'NIH'],
    tags: ['vaccines', 'safety', 'ingredients']
  }
]

const Feed = () => {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 1000)
  }, [])

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    const post = {
      id: Date.now(),
      author: {
        name: 'You',
        title: 'Community Member',
        verified: false,
        avatar: null
      },
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      factChecked: false,
      sources: [],
      tags: []
    }

    setPosts([post, ...posts])
    setNewPost('')
    setShowNewPost(false)
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: 'HealthTrust Post',
        text: post.content,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const filters = [
    { id: 'all', label: 'All', icon: TrendingUp },
    { id: 'verified', label: 'Verified', icon: CheckCircle },
    { id: 'discussions', label: 'Discussions', icon: MessageCircle },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ]

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view the feed</h1>
        <p className="text-gray-600 mb-6">Join our community to see and share trusted health information.</p>
        <a href="/login" className="btn btn-primary">Sign In</a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Community Feed</h1>
          <button 
            onClick={() => setShowNewPost(!showNewPost)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline ml-1">New Post</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar mb-4">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search health topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide mb-4">
          {filters.map(filter => {
            const Icon = filter.icon
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`btn btn-sm whitespace-nowrap ${
                  activeFilter === filter.id ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                <Icon size={16} />
                <span className="ml-1">{filter.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="card mb-6">
          <form onSubmit={handlePostSubmit} className="card-body">
            <h3 className="text-lg font-semibold mb-4">Share Health Information</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share trusted health information, scientific studies, or fact-checked content..."
              className="form-input form-textarea mb-4"
              rows="4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                All posts are subject to fact-checking
              </span>
              <div className="space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={!newPost.trim()}
                >
                  Share Post
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="card">
            <div className="card-body">
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="post-avatar">
                  {post.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm">{post.author.name}</h3>
                    {post.author.verified && (
                      <CheckCircle className="w-4 h-4 text-primary-500" />
                    )}
                    {post.factChecked && (
                      <div className="flex items-center bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{post.author.title}</span>
                    <span>•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-700 mb-3">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.sources && post.sources.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Sources:</h5>
                    <div className="flex flex-wrap gap-2">
                      {post.sources.map((source, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.aiInsight && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 text-sm">AI Health Check</h4>
                        <p className="text-blue-700 text-sm">{post.aiInsight}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
                  >
                    <Heart size={18} />
                    <span>{post.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 text-gray-500 text-sm hover:text-primary-600">
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-1 text-gray-500 text-sm hover:text-primary-600"
                  >
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  
                  {!post.factChecked && (
                    <button className="flex items-center space-x-1 text-orange-500 text-sm hover:text-orange-600">
                      <AlertTriangle size={18} />
                      <span className="hidden sm:inline">Check</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try a different search term' : 'Be the first to share health information'}
          </p>
          <button 
            onClick={() => setShowNewPost(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create Post
          </button>
        </div>
      )}
    </div>
  )
}

export default Feed

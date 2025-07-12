import { useState } from 'react'
import { postsService, alleAIService } from '../services/api'
import { flagPotentialMisinformation } from '../utils/helpers'

export const usePosts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Load posts from API
  const loadPosts = async (pageNum = 1, refresh = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await postsService.getFeed(pageNum, 10)
      
      if (refresh || pageNum === 1) {
        setPosts(response.posts)
      } else {
        setPosts(prev => [...prev, ...response.posts])
      }
      
      setHasMore(response.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  // Create a new post
  const createPost = async (content, sources = []) => {
    try {
      setError(null)
      
      // Check for potential misinformation before posting
      const misinfoCheck = flagPotentialMisinformation(content)
      
      if (misinfoCheck.isFlagged && misinfoCheck.riskLevel === 'high') {
        throw new Error('Content flagged for potential misinformation. Please review and provide sources.')
      }
      
      const postData = {
        content,
        sources,
        flagged: misinfoCheck.isFlagged,
        riskLevel: misinfoCheck.riskLevel
      }
      
      const newPost = await postsService.createPost(postData)
      
      // Add the new post to the top of the list
      setPosts(prev => [newPost, ...prev])
      
      return { success: true, post: newPost }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create post'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Like a post
  const likePost = async (postId) => {
    try {
      await postsService.likePost(postId)
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1, isLiked: true }
          : post
      ))
    } catch (err) {
      console.error('Failed to like post:', err)
    }
  }

  // Request fact-check for a post
  const requestFactCheck = async (postId) => {
    try {
      await postsService.requestFactCheck(postId)
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, factCheckRequested: true }
          : post
      ))
      
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to request fact-check'
      return { success: false, error: errorMessage }
    }
  }

  // Report a post
  const reportPost = async (postId, reason) => {
    try {
      await postsService.reportPost(postId, reason)
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to report post'
      return { success: false, error: errorMessage }
    }
  }

  // Load more posts (infinite scroll)
  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1)
    }
  }

  // Refresh posts
  const refresh = () => {
    loadPosts(1, true)
  }

  return {
    posts,
    loading,
    error,
    hasMore,
    loadPosts,
    createPost,
    likePost,
    requestFactCheck,
    reportPost,
    loadMore,
    refresh,
    clearError: () => setError(null)
  }
}

export const useFactCheck = () => {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const factCheckContent = async (content) => {
    setChecking(true)
    setError(null)
    
    try {
      // First check with local keyword flagging
      const localCheck = flagPotentialMisinformation(content)
      
      // If high risk, use AI fact-checking
      if (localCheck.riskLevel === 'high') {
        const aiResult = await alleAIService.factCheckContent(content)
        
        setResult({
          isVerified: aiResult.is_accurate,
          confidence: aiResult.confidence,
          sources: aiResult.sources || [],
          explanation: aiResult.explanation,
          flaggedKeywords: localCheck.flaggedKeywords,
          aiAnalysis: true
        })
      } else {
        setResult({
          isVerified: localCheck.riskLevel === 'low',
          confidence: localCheck.riskLevel === 'low' ? 0.8 : 0.5,
          sources: [],
          explanation: localCheck.riskLevel === 'medium' 
            ? 'Content may require fact-checking' 
            : 'Content appears to be safe',
          flaggedKeywords: localCheck.flaggedKeywords,
          aiAnalysis: false
        })
      }
    } catch (err) {
      setError(err.message || 'Fact-check failed')
    } finally {
      setChecking(false)
    }
  }

  const getTrustedSources = async (topic) => {
    try {
      const sources = await alleAIService.getTrustedSources(topic)
      return sources
    } catch (err) {
      console.error('Failed to get trusted sources:', err)
      return []
    }
  }

  const generateResponse = async (misinformation) => {
    try {
      const response = await alleAIService.generateResponse(misinformation)
      return response
    } catch (err) {
      console.error('Failed to generate response:', err)
      throw err
    }
  }

  return {
    checking,
    result,
    error,
    factCheckContent,
    getTrustedSources,
    generateResponse,
    clearResult: () => setResult(null),
    clearError: () => setError(null)
  }
}

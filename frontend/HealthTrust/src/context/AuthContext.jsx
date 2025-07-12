import { createContext, useReducer, useEffect } from 'react'

// Create the AuthContext
const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (email) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // This will be replaced with actual API call
      // For now, simulate login with mock data
      const mockUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        avatar: null,
        verified: true
      }
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, token: mockToken }
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed'
      })
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      // This will be replaced with actual API call
      const mockUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        avatar: null,
        verified: false
      }
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, token: mockToken }
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Registration failed'
      })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext

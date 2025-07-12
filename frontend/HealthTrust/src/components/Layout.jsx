import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  Home, 
  Heart, 
  User, 
  MessageCircle, 
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  Shield
} from 'lucide-react'
import { useState } from 'react'

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Don't show layout on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  
  if (isAuthPage) {
    return <div className="app-layout">{children}</div>
  }

  const navigationItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      active: location.pathname === '/'
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: Heart,
      active: location.pathname === '/feed'
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: MessageCircle,
      active: location.pathname === '/chat'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      active: location.pathname === '/profile'
    }
  ]

  const handleLogout = () => {
    logout()
    setShowMobileMenu(false)
  }

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <header className="app-header">
        <Link to="/" className="brand">
          <Shield className="brand-icon" />
          <span>HealthTrust</span>
        </Link>

        <div className="header-actions">
          {isAuthenticated && (
            <>
              <button className="header-action">
                <Search size={20} />
              </button>
              <button className="header-action">
                <Bell size={20} />
              </button>
              <button 
                className="header-action"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu size={20} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && isAuthenticated && (
          <div className="mobile-menu">
            <div className="mobile-menu-backdrop" onClick={() => setShowMobileMenu(false)} />
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <div className="mobile-menu-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="mobile-menu-name">{user?.name || 'User'}</div>
                  <div className="mobile-menu-email">{user?.email}</div>
                </div>
              </div>
              
              <div className="mobile-menu-items">
                <Link 
                  to="/profile" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                
                <Link 
                  to="/settings" 
                  className="mobile-menu-item"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
                
                <button 
                  className="mobile-menu-item mobile-menu-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      {isAuthenticated && (
        <nav className="app-bottom-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="nav-item-label">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

export default Layout

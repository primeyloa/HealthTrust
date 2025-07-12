import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, MapPin, Calendar, Edit, CheckCircle } from 'lucide-react'

const Profile = () => {
  const { user, isAuthenticated } = useAuth()
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
    joinDate: 'January 2024'
  })

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <h1>Please log in to view your profile</h1>
        <a href="/login" className="btn btn-primary">Sign In</a>
      </div>
    )
  }

  const handleSave = () => {
    // This will be replaced with actual API call
    setEditing(false)
    // Show success message or update context
  }

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={32} className="text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    {profileData.name}
                    {user?.verified && (
                      <CheckCircle size={20} className="text-blue-500" />
                    )}
                  </h1>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => setEditing(!editing)}
                className="btn btn-secondary"
              >
                <Edit size={18} />
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="grid gap-4">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      className="form-input form-textarea"
                      placeholder="Tell us about yourself and your interest in health advocacy..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-gray-500" />
                  <span>{profileData.email}</span>
                </div>
                
                {profileData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-500" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
                
                {profileData.bio && (
                  <div className="mt-4">
                    <h3>About</h3>
                    <p className="text-gray-600">{profileData.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">12</h3>
              <p className="text-gray-600">Posts Shared</p>
            </div>
          </div>
          
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-2xl font-bold text-green-600 mb-2">8</h3>
              <p className="text-gray-600">Fact-Checks</p>
            </div>
          </div>
          
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">156</h3>
              <p className="text-gray-600">Likes Received</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center gap-3 py-3 border-b border-gray-200">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <p>Fact-checked a post about vaccine safety</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 py-3 border-b border-gray-200">
                <User size={20} className="text-blue-500" />
                <div>
                  <p>Shared a new health research article</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 py-3">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <p>Received community recognition for accurate information</p>
                  <p className="text-sm text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

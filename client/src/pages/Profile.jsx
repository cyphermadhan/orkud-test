import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { trackEvent } from '../utils/vibesignals'
import './Profile.css'

function Profile() {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/user/current')
      setUser(response.data)
      setFormData({
        username: response.data.username || '',
        email: response.data.email || '',
        bio: response.data.bio || ''
      })
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/users/${user.id}`, formData)
      setUser(response.data)
      setIsEditing(false)
      
      // Track Profile Edited event
      const changes = {
        usernameChanged: formData.username !== user.username,
        emailChanged: formData.email !== user.email,
        bioChanged: formData.bio !== user.bio
      }
      
      trackEvent('Profile Edited', {
        userId: user.id,
        changes: changes,
        timestamp: new Date().toISOString()
      })
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleDelete = async () => {
    try {
      // Track Profile Deletion Confirmed event
      trackEvent('Profile Deletion Confirmed', {
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString()
      })
      
      await axios.delete(`/api/users/${user.id}`)
      
      // Track Profile Deleted event (successful deletion)
      trackEvent('Profile Deleted', {
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString()
      })
      
      alert('Profile deleted successfully. You will be redirected to home.')
      navigate('/')
      window.location.reload()
    } catch (error) {
      console.error('Error deleting profile:', error)
      
      // Track Profile Deletion Failed event
      trackEvent('Profile Deletion Failed', {
        userId: user.id,
        username: user.username,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      alert('Failed to delete profile. Please try again.')
    }
  }

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>
  }

  if (!user) {
    return <div className="profile-error">User not found</div>
  }

  return (
    <div className="profile">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-sections">
        {/* Social Details */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Social Details</h2>
            {!isEditing && (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
          </div>
          <div className="section-content">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="form-textarea"
                    rows={4}
                    maxLength={200}
                  />
                </div>
                <div className="form-actions">
                  <button className="save-button" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      username: user.username || '',
                      email: user.email || '',
                      bio: user.bio || ''
                    })
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">@{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Bio:</span>
                  <span className="info-value">{user.bio || 'No bio yet'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login Details */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Login Details</h2>
          </div>
          <div className="section-content">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member since:</span>
                  <span className="info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Details */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Security Details</h2>
          </div>
          <div className="section-content">
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Account Status:</span>
                <span className="info-value status-active">Active</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
            <div className="security-note">
              <p>Note: Sign in and sign up features are not implemented yet. This is a demo profile.</p>
            </div>
          </div>
        </div>

        {/* Delete Profile */}
        <div className="profile-section danger-section">
          <div className="section-header">
            <h2>Delete Profile</h2>
          </div>
          <div className="section-content">
            <p className="delete-warning">
              Once you delete your profile, there is no going back. This will permanently delete your account, posts, comments, and all associated data.
            </p>
            {!showDeleteConfirm ? (
              <button
                className="delete-button"
                onClick={() => {
                  // Track Delete Profile Button Clicked event
                  trackEvent('Delete Profile Button Clicked', {
                    userId: user.id,
                    username: user.username,
                    timestamp: new Date().toISOString()
                  })
                  setShowDeleteConfirm(true)
                }}
              >
                Delete My Profile
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                <div className="delete-actions">
                  <button
                    className="confirm-delete-button"
                    onClick={handleDelete}
                  >
                    Yes, Delete Forever
                  </button>
                  <button
                    className="cancel-delete-button"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

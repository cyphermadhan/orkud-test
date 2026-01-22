import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import PostCard from '../components/PostCard'
import { trackEvent } from '../utils/vibesignals'
import './UserProfile.css'

function UserProfile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
    fetchUser()
    fetchUserPosts()
    checkFollowStatus()
  }, [id])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user/current')
      setCurrentUser(response.data)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/users/${id}`)
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Track Profile Viewed event when both user and currentUser are loaded
  useEffect(() => {
    if (user && currentUser && currentUser.id !== id) {
      trackEvent('Profile Viewed', {
        viewedUserId: id,
        viewedUsername: user.username,
        viewerId: currentUser.id,
        postsCount: user.postsCount || 0,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        timestamp: new Date().toISOString()
      })
    }
  }, [user, currentUser, id])

  const fetchUserPosts = async () => {
    try {
      const url = currentUser ? `/api/posts?userId=${currentUser.id}` : '/api/posts'
      const response = await axios.get(url)
      const userPosts = response.data.filter(post => post.author?.id === id)
      setPosts(userPosts)
    } catch (error) {
      console.error('Error fetching user posts:', error)
    }
  }

  const checkFollowStatus = async () => {
    if (!currentUser || currentUser.id === id) return

    try {
      const response = await axios.get(`/api/users/${id}/follow-status?userId=${currentUser.id}`)
      setIsFollowing(response.data.following)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Please log in to follow users')
      return
    }

    if (currentUser.id === id) {
      alert('You cannot follow yourself')
      return
    }

    try {
      const response = await axios.post(`/api/users/${id}/follow`, {
        userId: currentUser.id
      })
      setIsFollowing(response.data.following)
      fetchUser() // Refresh user data to update follower count
      
      // Track User Followed or User Unfollowed event
      if (response.data.following) {
        trackEvent('User Followed', {
          followerId: currentUser.id,
          followingId: id,
          followingUsername: user?.username,
          timestamp: new Date().toISOString()
        })
      } else {
        trackEvent('User Unfollowed', {
          followerId: currentUser.id,
          unfollowingId: id,
          unfollowingUsername: user?.username,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error following user:', error)
      alert('Failed to follow user. Please try again.')
    }
  }

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
  }

  if (loading) {
    return <div className="user-profile-loading">Loading profile...</div>
  }

  if (!user) {
    return <div className="user-profile-error">User not found</div>
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info-main">
          <h1 className="profile-username">@{user.username}</h1>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{user.postsCount || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          {currentUser && currentUser.id !== id && (
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {currentUser && currentUser.id === id && (
            <Link to="/profile" className="edit-profile-link">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      <div className="profile-posts-section">
        <h2 className="posts-section-title">Posts</h2>
        {posts.length === 0 ? (
          <div className="no-posts">No posts yet</div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onPostUpdated={handlePostUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile

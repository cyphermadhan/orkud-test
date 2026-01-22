import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { trackEvent, identifyUser } from '../utils/vibesignals'
import './Navbar.css'

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] })
  const navigate = useNavigate()
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user/current')
      setCurrentUser(response.data)
      
      // Identify user in VibeSignals
      if (response.data) {
        identifyUser(response.data.id, {
          username: response.data.username,
          email: response.data.email,
          createdAt: response.data.createdAt
        })
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim()) {
      // Debounce search tracking
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const [postsRes, usersRes] = await Promise.all([
            axios.get(`/api/search/posts?q=${encodeURIComponent(query)}`),
            axios.get(`/api/search/users?q=${encodeURIComponent(query)}`)
          ])
          setSearchResults({
            posts: postsRes.data,
            users: usersRes.data
          })
          setShowSearchResults(true)
          
          // Track Search Performed event
          trackEvent('Search Performed', {
            query: query,
            postsFound: postsRes.data.length,
            usersFound: usersRes.data.length,
            totalResults: postsRes.data.length + usersRes.data.length,
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.error('Error searching:', error)
        }
      }, 500) // 500ms debounce
    } else {
      setShowSearchResults(false)
    }
  }

  const handlePostClick = (postId) => {
    const clickedPost = searchResults.posts.find(p => p.id === postId)
    
    // Track Search Result Clicked event
    trackEvent('Search Result Clicked', {
      resultType: 'post',
      resultId: postId,
      searchQuery: searchQuery,
      authorId: clickedPost?.author?.id,
      timestamp: new Date().toISOString()
    })
    
    setShowSearchResults(false)
    setSearchQuery('')
    navigate('/')
    // Scroll to post would be implemented here
  }

  const handleUserClick = (userId) => {
    const clickedUser = searchResults.users.find(u => u.id === userId)
    
    // Track Search Result Clicked event
    trackEvent('Search Result Clicked', {
      resultType: 'user',
      resultId: userId,
      searchQuery: searchQuery,
      username: clickedUser?.username,
      timestamp: new Date().toISOString()
    })
    
    setShowSearchResults(false)
    setSearchQuery('')
    navigate(`/user/${userId}`)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link 
          to="/" 
          className="navbar-brand"
          onClick={() => {
            // Track Navbar Brand Clicked event
            trackEvent('Navbar Brand Clicked', {
              currentPath: window.location.pathname,
              timestamp: new Date().toISOString()
            })
          }}
        >
          <span className="brand-icon">📢</span>
          Orkud
        </Link>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search posts or users..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {showSearchResults && (searchResults.posts.length > 0 || searchResults.users.length > 0) && (
            <div className="search-results">
              {searchResults.posts.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Posts</div>
                  {searchResults.posts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className="search-result-item"
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="search-result-content">{post.content.substring(0, 50)}...</div>
                      <div className="search-result-meta">by {post.author?.username}</div>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.users.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Users</div>
                  {searchResults.users.slice(0, 3).map(user => (
                    <div
                      key={user.id}
                      className="search-result-item"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="search-result-content">@{user.username}</div>
                      {user.bio && <div className="search-result-meta">{user.bio}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          {currentUser && (
            <Link to="/profile" className="nav-link">Profile</Link>
          )}
          <Link to="/help" className="nav-link">Help</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

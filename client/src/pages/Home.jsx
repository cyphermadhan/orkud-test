import { useState, useEffect } from 'react'
import axios from 'axios'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import './Home.css'

function Home() {
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user/current')
      setCurrentUser(response.data)
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchPosts = async (userId = null) => {
    try {
      setLoading(true)
      const url = userId ? `/api/posts?userId=${userId}` : '/api/posts'
      const response = await axios.get(url)
      setPosts(response.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentUser?.id)
  }, [currentUser])

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts])
  }

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
  }

  return (
    <div className="home">
      <h1 className="home-title">Home</h1>
      
      {currentUser && (
        <CreatePost 
          currentUser={currentUser} 
          onPostCreated={handlePostCreated}
        />
      )}

      <div className="posts-container">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Be the first to share your story! 📝</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onPostUpdated={handlePostUpdated}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Home

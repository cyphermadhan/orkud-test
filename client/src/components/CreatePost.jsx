import { useState } from 'react'
import axios from 'axios'
import { trackEvent } from '../utils/vibesignals'
import './CreatePost.css'

function CreatePost({ currentUser, onPostCreated }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await axios.post('/api/posts', {
        content: content.trim(),
        userId: currentUser.id
      })
      onPostCreated(response.data)
      
      // Track Post Created event
      trackEvent('Post Created', {
        postId: response.data.id,
        userId: currentUser.id,
        contentLength: content.trim().length,
        timestamp: new Date().toISOString()
      })
      
      setContent('')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-post">
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-header">
          <div className="user-avatar">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser.username}</div>
          </div>
        </div>
        <textarea
          className="create-post-textarea"
          placeholder="What's on your mind? Share your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <div className="create-post-footer">
          <div className="char-count">
            {content.length}/1000
          </div>
          <button
            type="submit"
            className="create-post-button"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost

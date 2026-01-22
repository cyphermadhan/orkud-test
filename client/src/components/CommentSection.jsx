import { useState, useEffect } from 'react'
import axios from 'axios'
import { trackEvent } from '../utils/vibesignals'
import './CommentSection.css'

function CommentSection({ postId, currentUser, onCommentAdded }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/posts/${postId}`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await axios.post(`/api/posts/${postId}/comment`, {
        content: newComment.trim(),
        userId: currentUser.id
      })
      setComments([...comments, response.data])
      setNewComment('')
      onCommentAdded()
      
      // Track Comment Added event
      trackEvent('Comment Added', {
        commentId: response.data.id,
        postId: postId,
        userId: currentUser.id,
        contentLength: newComment.trim().length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="comment-section">
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          className="comment-input"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          maxLength={500}
        />
        <div className="comment-form-footer">
          <div className="char-count">{newComment.length}/500</div>
          <button
            type="submit"
            className="comment-submit-button"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>

      <div className="comments-list">
        {loading ? (
          <div className="loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-author-avatar">
                {comment.author?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="comment-content-wrapper">
                <div className="comment-header">
                  <span className="comment-author-name">@{comment.author?.username || 'Unknown'}</span>
                  <span className="comment-time">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection

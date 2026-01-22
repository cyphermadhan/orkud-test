import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import CommentSection from './CommentSection'
import { trackEvent } from '../utils/vibesignals'
import './PostCard.css'

function PostCard({ post, currentUser, onPostUpdated }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)

  useEffect(() => {
    setIsLiked(post.isLiked || false)
    setLikesCount(post.likesCount || 0)
    setCommentsCount(post.commentsCount || 0)
    
    // Track Post Viewed event
    if (post.id) {
      trackEvent('Post Viewed', {
        postId: post.id,
        authorId: post.author?.id,
        authorUsername: post.author?.username,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        timestamp: new Date().toISOString()
      })
    }
  }, [post])

  const handleLike = async () => {
    if (!currentUser) return

    try {
      const response = await axios.post(`/api/posts/${post.id}/like`, {
        userId: currentUser.id
      })
      setIsLiked(response.data.liked)
      setLikesCount(response.data.likesCount)
      
      // Track Post Liked or Post Unliked event
      if (response.data.liked) {
        trackEvent('Post Liked', {
          postId: post.id,
          userId: currentUser.id,
          authorId: post.author?.id,
          likesCount: response.data.likesCount,
          timestamp: new Date().toISOString()
        })
      } else {
        trackEvent('Post Unliked', {
          postId: post.id,
          userId: currentUser.id,
          authorId: post.author?.id,
          likesCount: response.data.likesCount,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1)
    onPostUpdated({ ...post, commentsCount: commentsCount + 1 })
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
    <div className="post-card">
      <div className="post-header">
        <Link to={`/user/${post.author?.id}`} className="post-author">
          <div className="author-avatar">
            {post.author?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="author-info">
            <div className="author-name">@{post.author?.username || 'Unknown'}</div>
            <div className="post-time">{formatDate(post.createdAt)}</div>
          </div>
        </Link>
      </div>

      <div className="post-content">
        {post.content}
      </div>

      <div className="post-actions">
        <button
          className={`action-button like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={!currentUser}
        >
          <span className="action-icon">❤️</span>
          <span className="action-count">{likesCount}</span>
        </button>
        <button
          className="action-button comment-button"
          onClick={() => setShowComments(!showComments)}
          disabled={!currentUser}
        >
          <span className="action-icon">💬</span>
          <span className="action-count">{commentsCount}</span>
        </button>
      </div>

      {showComments && currentUser && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  )
}

export default PostCard

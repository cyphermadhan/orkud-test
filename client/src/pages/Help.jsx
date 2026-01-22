import { useState, useEffect } from 'react'
import axios from 'axios'
import { trackEvent } from '../utils/vibesignals'
import './Help.css'

function Help() {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [tickets, setTickets] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [showTickets, setShowTickets] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser !== null) {
      fetchTickets()
    }
  }, [currentUser])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user/current')
      setCurrentUser(response.data)
    } catch (error) {
      console.error('Error fetching current user:', error)
      setCurrentUser(null)
    }
  }

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`/api/support/tickets${currentUser ? `?userId=${currentUser.id}` : ''}`)
      setTickets(response.data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await axios.post('/api/support/tickets', {
        ...formData,
        userId: currentUser?.id || null
      })
      setSubmitted(true)
      setFormData({ subject: '', message: '' })
      fetchTickets()
      
      // Track Support Ticket Created event
      trackEvent('Support Ticket Created', {
        ticketId: response.data.id,
        userId: currentUser?.id || null,
        subject: formData.subject,
        messageLength: formData.message.length,
        timestamp: new Date().toISOString()
      })
      
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting ticket:', error)
      alert('Failed to submit ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="help">
      <h1 className="help-title">Help & Support</h1>

      <div className="help-content">
        <div className="help-section">
          <h2>Get in Touch</h2>
          <p className="help-description">
            Have a question or need assistance? Fill out the form below to contact our support team.
            We'll get back to you as soon as possible.
          </p>

          {submitted && (
            <div className="success-message">
              ✓ Your support ticket has been submitted successfully! We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What is your question about?"
                className="form-input"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please describe your issue or question in detail..."
                className="form-textarea"
                rows={6}
                required
                maxLength={1000}
              />
              <div className="char-count">{formData.message.length}/1000</div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        <div className="help-section">
          <div className="section-header">
            <h2>My Support Tickets</h2>
            <button
              className="toggle-button"
              onClick={() => setShowTickets(!showTickets)}
            >
              {showTickets ? 'Hide' : 'Show'} Tickets
            </button>
          </div>

          {showTickets && (
            <div className="tickets-list">
              {tickets.length === 0 ? (
                <div className="no-tickets">No support tickets yet</div>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-header">
                      <div className="ticket-subject">{ticket.subject}</div>
                      <div className={`ticket-status ticket-status-${ticket.status}`}>
                        {ticket.status}
                      </div>
                    </div>
                    <div className="ticket-message">{ticket.message}</div>
                    <div className="ticket-date">
                      Submitted on {formatDate(ticket.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="help-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3 className="faq-question">How do I create a post?</h3>
              <p className="faq-answer">
                Simply go to the Home page and use the "What's on your mind?" text area to write your post.
                Click the "Post" button to share it with the community.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How do I follow other users?</h3>
              <p className="faq-answer">
                Visit any user's profile page by clicking on their username or avatar, then click the "Follow" button
                to start following them.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I edit my posts?</h3>
              <p className="faq-answer">
                Currently, post editing is not available. You can delete your profile if needed, which will remove all
                your posts and data.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How do I search for posts or users?</h3>
              <p className="faq-answer">
                Use the search bar in the navigation bar at the top of the page. You can search for both posts and users
                by typing keywords.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Help from './pages/Help'
import { trackPageView } from './utils/vibesignals'
import './App.css'

// Component to track page views
function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2)
    trackPageView(pageName, {
      path: location.pathname,
      timestamp: new Date().toISOString()
    })
  }, [location])

  return null
}

function App() {
  return (
    <Router>
      <div className="app">
        <PageViewTracker />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

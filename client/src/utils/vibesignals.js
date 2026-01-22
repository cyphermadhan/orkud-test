// VibeSignals integration with safe error handling
// This module will not break the app if VibeSignals fails to load

let vibesignalsInstance = null
let isInitialized = false

// No-op functions as fallback
const noop = () => {}

// Initialize VibeSignals (non-blocking)
const initializeVibeSignals = async () => {
  if (isInitialized) return
  
  try {
    const module = await import('@vibesignals/observe')
    const { observe } = module
    
    if (observe && typeof observe === 'function') {
      vibesignalsInstance = observe({
        apiKey: 'QRIcBooRT0zSLZ6EHalIztlfSEcKZa0Js1xZdyXurh6'
      })
      isInitialized = true
    }
  } catch (error) {
    // Silently fail - don't break the app
    console.warn('[VibeSignals] Initialization failed, tracking disabled:', error.message)
    isInitialized = true // Mark as initialized to prevent retries
  }
}

// Start initialization (non-blocking)
initializeVibeSignals()

// Helper function to track events
export const trackEvent = (eventName, properties = {}) => {
  try {
    if (vibesignalsInstance && typeof vibesignalsInstance.track === 'function') {
      vibesignalsInstance.track(eventName, properties)
    }
  } catch (error) {
    // Silently fail
    if (import.meta.env.DEV) {
      console.warn('[VibeSignals] Event tracking failed:', error.message)
    }
  }
}

// Helper function to identify users
export const identifyUser = (userId, traits = {}) => {
  try {
    if (vibesignalsInstance && typeof vibesignalsInstance.identify === 'function') {
      vibesignalsInstance.identify(userId, traits)
    }
  } catch (error) {
    // Silently fail
    if (import.meta.env.DEV) {
      console.warn('[VibeSignals] User identification failed:', error.message)
    }
  }
}

// Helper function to track page views
export const trackPageView = (pageName, properties = {}) => {
  try {
    if (vibesignalsInstance && typeof vibesignalsInstance.page === 'function') {
      vibesignalsInstance.page(pageName, properties)
    }
  } catch (error) {
    // Silently fail
    if (import.meta.env.DEV) {
      console.warn('[VibeSignals] Page view tracking failed:', error.message)
    }
  }
}

// Export default (fallback to no-ops)
export default vibesignalsInstance || { track: noop, identify: noop, page: noop }

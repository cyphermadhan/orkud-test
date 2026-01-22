import axios from 'axios'

// Get API URL from environment variable
// In development: uses Vite proxy (/api)
// In production: uses VITE_API_URL env var or defaults to /api
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Configure axios default base URL
axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

export default axios

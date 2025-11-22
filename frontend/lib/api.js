import axios from 'axios'
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If access token expired and we haven't retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Call refresh endpoint
        const res = await api.post('/auth/refresh')

        const newAccessToken = res.data.accessToken

        // Set new token globally
        api.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

        // Retry original request
        return api(originalRequest)
      } catch (err) {
        console.error('Refresh failed:', err)
        // optionally redirect to login
      }
    }

    return Promise.reject(error)
  },
)

export default api

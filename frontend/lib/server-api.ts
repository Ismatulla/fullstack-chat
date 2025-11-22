import { cookies } from 'next/headers'
import axios from 'axios'

// Create an axios instance for server-side requests
const serverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// Add an interceptor to inject the token from cookies
serverApi.interceptors.request.use(async (config) => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }

  return config
})

export default serverApi

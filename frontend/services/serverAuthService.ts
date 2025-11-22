import serverApi from '@/lib/server-api'
import { User } from '@/lib/auth-types'

export async function getCurrentUserServer() {
  try {
    const response = await serverApi.get('/auth/me')
    return response.data as User
  } catch (error) {
    // Token might be missing or invalid
    return null
  }
}

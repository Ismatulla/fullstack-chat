'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { User } from '@/lib/auth-types'

export function useRequireAuth(initialUser: User | null = null) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const router = useRouter()

  useEffect(() => {
    if (initialUser) {
      setLoading(false)
      return
    }

    const verifyAuth = async () => {
      try {
        const response = await api.get('/auth/me')
        setUser(response.data)
      } catch (error) {
        console.error('Auth verification failed:', error)
        // Token invalid or expired - redirect to login
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    verifyAuth()
  }, [router, initialUser])

  return { user, loading }
}

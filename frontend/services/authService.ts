import api from '@/lib/api'

import { Auth } from '@/lib/auth-types'
export function signUp(data: Auth) {
  return api.post('auth/signup', data)
}

export function login(data: Auth) {
  return api.post('auth/login', data)
}

import api from '@/lib/api'


export function allUsers() {
  return api.get('users/user')
}

// Simple in-memory user storage (in production, use a database)
const users: Map<
  string,
  { email: string; password: string; avatar: string; id: string }
> = new Map()

// Pre-populate with demo users
users.set('demo@example.com', {
  id: 'user-1',
  email: 'demo@example.com',
  password: 'demo123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
})

users.set('john@example.com', {
  id: 'user-2',
  email: 'john@example.com',
  password: 'john123',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
})

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function authenticateUser(email: string, password: string) {
  const user = users.get(email)
  if (user && user.password === password) {
    return {
      id: user.id,
      email: user.email,
      avatar: user.avatar,
      createdAt: new Date(),
    }
  }
  return null
}

export function registerUser(email: string, password: string) {
  if (users.has(email)) {
    throw new Error('Email already registered')
  }

  const id = `user-${Date.now()}`
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`

  users.set(email, {
    id,
    email,
    password,
    avatar,
  })

  return {
    id,
    email,
    name,
    avatar,
    createdAt: new Date(),
  }
}

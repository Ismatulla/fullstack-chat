export interface User {
  id?: string
  email: string
  avatar?: string
  createdAt?: Date
  name?: string
}

export interface Auth {
  id?: string
  email: string
  password: string
  name?: string
}

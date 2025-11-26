export interface User {
  id?: string
  email: string
  image?: string
  createdAt?: Date
  name?: string
}

export interface Auth {
  id: string
  email: string
  password: string
  name?: string
}

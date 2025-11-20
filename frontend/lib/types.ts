export interface User {
  id: string
  name: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  email?: string
}

export interface Message {
  id?: string
  content: string
  userId?: string
  roomId: string
  timestamp: Date
  reactions: Record<string, string[]>
  readBy: string[]
  mentions: string[]
  attachments?: {
    type: 'image' | 'file'
    url: string
    name: string
  }[]
  image?: null | string
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  members: string[]
  lastMessage?: Message
  unreadCount: number
  avatar?: string
}

export interface TypingIndicator {
  userId: string
  roomId: string
  isTyping: boolean
}

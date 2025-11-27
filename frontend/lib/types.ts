export interface User {
  id: string
  name: string
  image: string
  status: 'online' | 'offline' | 'away'
  email?: string
}
export interface Reactions {
  id: string
  createdAt: string
  emoji: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface Message {
  id: string
  content: string
  userId?: string
  roomId: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
  email?: string
  reactions: Reactions[]
  readReceipts: {
    id: number
    user: {
      id: string
      name: string
      email: string
      image: string
    }
    readAt: string
  }[]
  mentions: string[]
  image: null | string
  attachments?: {
    type: 'image' | 'file'
    url: string
    name: string
  }[]
  sender?: {
    id: string
    name: string
    image: string
    email: string
  }
  isEdited?: boolean
  editedAt?: string
  isSystemMessage?: boolean
  systemMessage?: string
}

export interface ChatRoom {
  id: string
  name: string
  members?: string[]
  lastMessage?: Message
  unreadCount?: number
  image?: string
  owner?: { id: string; email: string; name: string }
}

export interface TypingIndicator {
  userId: string
  roomId: string
  isTyping: boolean
}

export type Messages = {
  id?: string
  name: string
  createdAt?: Date
  updatedAt?: Date
  image?: string
}

export type Owner = {
  id?: string
  name: string
  email?: string
}

export type ChatRooms = Owner & Messages

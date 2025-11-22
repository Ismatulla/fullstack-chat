// mock-data.ts
import type { User, Message } from './types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '/avatar-alex.png',
    status: 'online',
    email: 'alex@example.com',
  },
  {
    id: '2',
    name: 'Jordan Smith',
    avatar: '/avatar-jordan.jpg',
    status: 'online',
    email: 'jordan@example.com',
  },
  {
    id: '3',
    name: 'Casey Williams',
    avatar: '/avatar-casey.jpg',
    status: 'away',
    email: 'casey@example.com',
  },
  {
    id: '4',
    name: 'Morgan Davis',
    avatar: '/avatar-morgan.jpg',
    status: 'offline',
    email: 'morgan@example.com',
  },
  {
    id: '5',
    name: 'Taylor Brown',
    avatar: '/avatar-taylor.jpg',
    status: 'online',
    email: 'taylor@example.com',
  },
]

// ✅ Use a *fixed snapshot time* for mock data
const baseTime = new Date('2025-10-24T10:00:00Z').getTime()

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hey everyone! How is the project going?',
    userId: '1',
    roomId: 'general',
    timestamp: new Date(baseTime - 60 * 60 * 1000), // 1 hour ago
    reactions: { '👍': ['2', '3'], '❤️': ['5'] },
    readBy: ['2', '3', '4', '5'],
    mentions: [],
  },
  {
    id: '2',
    content: 'Going great! Just finished the design mockups.',
    userId: '2',
    roomId: 'general',
    timestamp: new Date(baseTime - 55 * 60 * 1000),
    reactions: { '🎉': ['1', '5'] },
    readBy: ['1', '3', '4', '5'],
    mentions: [],
  },
  {
    id: '3',
    content: 'Amazing work! Can you share them in the design channel?',
    userId: '1',
    roomId: 'general',
    timestamp: new Date(baseTime - 50 * 60 * 1000),
    reactions: {},
    readBy: ['2', '3', '4', '5'],
    mentions: ['2'],
  },
  {
    id: '4',
    content: 'Already done! Check the design room.',
    userId: '2',
    roomId: 'general',
    timestamp: new Date(baseTime - 45 * 60 * 1000),
    reactions: { '✨': ['1'] },
    readBy: ['1', '3', '4', '5'],
    mentions: [],
  },
  {
    id: '5',
    content: 'The new design system looks incredible!',
    userId: '5',
    roomId: 'design',
    timestamp: new Date(baseTime - 30 * 60 * 1000),
    reactions: { '👀': ['1', '2'] },
    readBy: ['1', '2'],
    mentions: [],
  },
  {
    id: '6',
    content: 'Thanks! We focused on consistency and accessibility.',
    userId: '2',
    roomId: 'design',
    timestamp: new Date(baseTime - 25 * 60 * 1000),
    reactions: {},
    readBy: ['1', '5'],
    mentions: [],
  },
  {
    id: '7',
    content: 'The color palette is perfect for our brand.',
    userId: '1',
    roomId: 'design',
    timestamp: new Date(baseTime - 20 * 60 * 1000),
    reactions: { '💯': ['2', '5'] },
    readBy: ['2', '5'],
    mentions: [],
  },
]

export const currentUserId = '1'

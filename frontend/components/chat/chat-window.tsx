import { useState, useRef, useEffect } from 'react'
import type { ChatRoom, Message, Reactions } from '@/lib/types'
import type { User } from '@/lib/auth-types'
import { MessageItem } from './message-item'
import { MessageInput } from './message-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Phone, Video, Info } from 'lucide-react'
import Image from 'next/image'
import { AvatarImg } from './Avatar'
import { socket } from '@/socket/socket'
import { getRoomMessages } from '@/services/chatService'
import { getErrorMessage } from '@/utils/errorHandler'
import { SOCKET_EMIT, SOCKET_LISTEN } from '@/lib/socket-events'

interface ChatWindowProps {
  room: ChatRoom
  currentUser: User
  selectedRoom: ChatRoom
}

export default function ChatWindow({
  room,
  currentUser,
  selectedRoom,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<
    Array<{ email: string; roomId: string }>
  >([])
  const [isLoading, setIsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // ========== Load messages on room change ==========
  useEffect(() => {
    if (!selectedRoom?.id) return

    const joinRoom = () => {
      socket.emit(SOCKET_EMIT.JOIN_ROOM, { roomId: String(selectedRoom.id) })
    }

    // Join immediately
    if (socket.connected) {
      joinRoom()
    } else {
      socket.connect()
    }

    // Re-join on reconnect
    socket.on('connect', joinRoom)

    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        const res = await getRoomMessages(selectedRoom.id)
        setMessages(res?.data)
      } catch (error) {
        console.error('Failed to load messages:', error)
        const message = getErrorMessage(error)
        console.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    return () => {
      socket.off('connect', joinRoom)
    }
  }, [selectedRoom?.id])

  // ========== WebSocket listeners ==========
  useEffect(() => {
    const handleNewMessage = (data: Message) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === data.id)) return prev
        return [...prev, data]
      })
    }

    const handleTyping = (data: {
      userId: string
      email: string
      isTyping: boolean
      roomId: string
    }) => {
      // Don't show typing indicator for current user
      if (data.email === currentUser.email) return

      if (data.isTyping) {
        setTypingUsers(prev => {
          // Remove any existing entry for this user (in case they switched rooms)
          const filtered = prev.filter(u => u.email !== data.email)
          // Add new entry with roomId
          return [...filtered, { email: data.email, roomId: data.roomId }]
        })
      } else {
        setTypingUsers(prev => prev.filter(u => u.email !== data.email))
      }
    }

    const handleReactionAdded = (data: {
      messageId: number
      userId: number
      emoji: string
    }) => {
      console.log('➕ Reaction Added Event:', data)
      setMessages(prev =>
        prev.map(msg => {
          if (String(msg.id) !== String(data.messageId)) return msg

          const existing = msg.reactions || []

          const alreadyExists = existing.some(
            r =>
              String(r.user?.id) === String(data.userId) &&
              r.emoji === data.emoji,
          )
          if (alreadyExists) return msg

          const filtered = existing.filter(
            r =>
              !(
                String(r.user?.id) === String(data.userId) &&
                r.emoji === data.emoji
              ),
          )

          const newReaction: Reactions = {
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            emoji: data.emoji,
            user: {
              id: String(data.userId),
              name:
                String(data.userId) === String(currentUser.id)
                  ? currentUser.name || 'User'
                  : 'User',
              email:
                String(data.userId) === String(currentUser.id)
                  ? currentUser.email || ''
                  : '',
            },
          }

          return {
            ...msg,
            reactions: [...filtered, newReaction],
          }
        }),
      )
    }

    const handleReactionRemoved = (data: {
      messageId: number
      userId: number
      emoji: string
    }) => {
      setMessages(prev =>
        prev.map(msg => {
          // Ensure both IDs are strings for comparison
          if (String(msg.id) !== String(data.messageId)) return msg

          const existing = msg.reactions || []
          const reactions = existing.filter(
            r =>
              !(
                String(r.user?.id) === String(data.userId) &&
                r.emoji === data.emoji
              ),
          )

          return {
            ...msg,
            reactions,
          }
        }),
      )
    }

    const handleError = (error: unknown) => {
      console.error('Socket Error:', error)
      //revert optimistic updates here ,use React19 useOptimistic update
    }

    socket.connect()
    socket.on(SOCKET_LISTEN.MESSAGE_SENT, handleNewMessage)
    socket.on(SOCKET_LISTEN.MESSAGE_NEW, handleNewMessage)
    socket.on(SOCKET_LISTEN.USER_TYPING, handleTyping)
    socket.on(SOCKET_LISTEN.REACTION_ADDED, handleReactionAdded)
    socket.on(SOCKET_LISTEN.REACTION_REMOVED, handleReactionRemoved)
    socket.on(SOCKET_LISTEN.ERROR, handleError)

    return () => {
      socket.off(SOCKET_LISTEN.MESSAGE_SENT, handleNewMessage)
      socket.off(SOCKET_LISTEN.MESSAGE_NEW, handleNewMessage)
      socket.off(SOCKET_LISTEN.USER_TYPING, handleTyping)
      socket.off(SOCKET_LISTEN.REACTION_ADDED, handleReactionAdded)
      socket.off(SOCKET_LISTEN.REACTION_REMOVED, handleReactionRemoved)
      socket.off(SOCKET_LISTEN.ERROR, handleError)
    }
  }, [currentUser])

  // ========== Auto-scroll to bottom on new messages ==========
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========== Send message ==========
  const handleSendMessage = (content: string, image: string | null) => {
    socket.connect()
    socket.emit(SOCKET_EMIT.SEND_MESSAGE, {
      roomId: String(selectedRoom.id),
      content: content,
      image,
    })
  }

  // ========== Handle reactions ==========
  const handleReact = (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    const hasReacted = message.reactions?.some(
      react =>
        String(react.user?.id) === String(currentUser.id) &&
        react.emoji === emoji,
    )

    // Optimistic Update
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg

        const existing = msg.reactions || []
        let newReactions = [...existing]

        if (hasReacted) {
          // Remove locally
          newReactions = newReactions.filter(
            r =>
              !(
                String(r.user?.id) === String(currentUser.id) &&
                r.emoji === emoji
              ),
          )
        } else {
          // Add locally
          const newReaction: Reactions = {
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            emoji: emoji,
            user: {
              id: String(currentUser.id),
              name: currentUser.name || 'User',
              email: currentUser.email || '',
            },
          }
          newReactions.push(newReaction)
        }
        return { ...msg, reactions: newReactions }
      }),
    )

    socket.connect()
    if (hasReacted) {
      socket.emit(SOCKET_EMIT.REMOVE_REACTION, {
        roomId: String(selectedRoom.id),
        messageId: Number(messageId),
        emoji,
      })
    } else {
      socket.emit(SOCKET_EMIT.ADD_REACTION, {
        roomId: String(selectedRoom.id),
        messageId: Number(messageId),
        emoji,
      })
    }
  }

  const currentRoomTypingUsers = typingUsers.filter(
    user => String(user.roomId) == String(selectedRoom.id), // ✅ Convert both to string
  )

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-linear-to-br">
            {room.image ? (
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover"
              />
            ) : (
              <AvatarImg />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {selectedRoom.name}
            </h2>
            {selectedRoom?.members && (
              <p className="text-xs text-muted-foreground">
                {selectedRoom.members.length} members
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-muted"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-muted"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 hover:bg-muted"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div ref={scrollAreaRef} className="h-full p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-4 mx-auto">
              {messages.map((message, index) => (
                <MessageItem
                  key={index}
                  message={message}
                  onReact={emoji => handleReact(message.id, emoji)}
                  currentUser={currentUser}
                  room={room}
                  selectedRoom={selectedRoom}
                />
              ))}

              {/* Typing Indicator */}
              {currentRoomTypingUsers.length > 0 && (
                <div className="flex gap-3 absolute bottom-0">
                  <div className="w-8 shrink-0" />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {currentRoomTypingUsers.length === 1
                        ? `${currentRoomTypingUsers[0].email} is typing...`
                        : `${currentRoomTypingUsers.length} people are typing...`}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        roomId={String(selectedRoom.id)}
      />
    </div>
  )
}

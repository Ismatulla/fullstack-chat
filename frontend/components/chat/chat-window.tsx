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
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // ========== Load messages on room change ==========
  useEffect(() => {
    if (!selectedRoom?.id) return

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
  }, [selectedRoom.id])

  // ========== WebSocket listeners ==========
  useEffect(() => {
    const handleNewMessage = (data: Message) => {
      console.log('📨 New message received:', data)
      setMessages(prev => [...prev, data])
    }

    const handleTyping = (data: {
      userId: string
      email: string
      isTyping: boolean
    }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...new Set([...prev, data.email])])
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.email))
      }
    }

    const handleReactionAdded = data => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id !== data.messageId) return msg

          const existing = msg.reactions || []

          // remove old reaction of same user
          const filtered = existing.filter(r => r.user?.id !== data.userId)

          return {
            ...msg,
            reactions: [...filtered, data],
          }
        }),
      )
    }

    const handleReactionRemoved = data => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id !== data.messageId) return msg

          const existing = msg.reactions || []
          const reactions = existing.filter(
            r => !(r.user?.id === data.userId && r.emoji === data.emoji),
          )

          return {
            ...msg,
            reactions,
          }
        }),
      )
    }

    socket.connect()
    socket.on(SOCKET_LISTEN.MESSAGE_SENT, handleNewMessage)
    socket.on(SOCKET_LISTEN.MESSAGE_NEW, handleNewMessage)
    socket.on(SOCKET_LISTEN.USER_TYPING, handleTyping)
    socket.on(SOCKET_LISTEN.REACTION_ADDED, handleReactionAdded)
    socket.on(SOCKET_LISTEN.REACTION_REMOVED, handleReactionRemoved)

    return () => {
      socket.off('message-received', handleNewMessage)
      socket.off('user-typing', handleTyping)
      socket.off('reaction-added', handleReactionAdded)
      socket.off('reaction-removed', handleReactionRemoved)
    }
  }, [])

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
    const hasReacted = message?.reactions?.some(
      react => react.user?.id === String(currentUser.id),
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
  console.log(messages)
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
                />
              ))}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-8 shrink-0" />
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : 'Multiple people are typing...'}
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
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

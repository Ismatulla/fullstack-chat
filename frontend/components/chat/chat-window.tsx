import { useState, useRef, useEffect } from 'react'
import type { ChatRoom, Message } from '@/lib/types'
import type { User } from '@/lib/auth-types'
import { mockMessages } from '@/lib/mock-data'
import { MessageItem } from './message-item'
import { MessageInput } from './message-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Phone, Video, Info } from 'lucide-react'
import Image from 'next/image'

interface ChatWindowProps {
  room: ChatRoom
  currentUser?: User
  selectedRoom: ChatRoom
}

export default function ChatWindow({
  room,
  currentUser,
  selectedRoom,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(
    mockMessages.filter(m => m.roomId === room.id),
  )
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = (content: string, image: string | null) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      content,
      userId: currentUser?.id,
      roomId: room.id,
      timestamp: new Date(),
      reactions: {},
      readBy: [],
      mentions: [],
      image,
    }
    setMessages([...messages, newMessage])
  }
  const handleReact = (messageId: string = '', emoji: string) => {
    setMessages(
      messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions }
          Object.keys(reactions).forEach(key => {
            reactions[key] = reactions[key].filter(
              userId => userId !== currentUser?.id,
            )
            // Remove emoji if no users left
            if (reactions[key].length === 0) {
              delete reactions[key]
            }
          })
          if (!reactions[emoji]) {
            reactions[emoji] = []
          }
          if (currentUser?.id) {
            if (!reactions[emoji].includes(currentUser?.id)) {
              reactions[emoji].push(currentUser?.id)
            }
          }

          return { ...msg, reactions }
        }
        return msg
      }),
    )
  }

  const handleTyping = (isTyping: boolean) => {
    // Simulate typing indicator
    if (isTyping && !typingUsers.includes('2')) {
      setTypingUsers(['2'])
      setTimeout(() => setTypingUsers([]), 3000)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-linear-to-br from-purple-400 to-pink-400 shadow-sm">
            <Image
              src={selectedRoom.image || '/general-room.jpg'}
              alt={selectedRoom.name}
              className="object-cover"
              fill
            />
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

      {/* Messages - Added proper height constraint and overflow handling */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div ref={scrollAreaRef} className="h-full p-4">
          <div className="space-y-4 mx-auto">
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null
              const showAvatar =
                !prevMessage || prevMessage.userId !== message.userId

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={message.userId === currentUser?.id}
                  showAvatar={showAvatar}
                  onReact={emoji => handleReact(message.id, emoji)}
                />
              )
            })}

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
                      ? 'Someone is typing...'
                      : 'Multiple people are typing...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  )
}

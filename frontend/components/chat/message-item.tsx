import type { ChatRoom, Message } from '@/lib/types'
import { Button } from '../ui/button'
import {
  SmilePlus,
  Check,
  CheckCheck,
  Pencil,
  Trash2,
  MoreVertical,
  X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { User } from '@/lib/auth-types'
import groupReactionsByEmoji from '@/helpers/groupReactionsByEmoji'
import { Input } from '../ui/input'
import { socket } from '@/socket/socket'
import { SOCKET_EMIT } from '@/lib/socket-events'

interface MessageItemProps {
  message: Message
  onReact?: (emoji: string) => void
  currentUser: User
  selectedRoom: ChatRoom
  room: ChatRoom
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export function MessageItem({
  message,
  room,
  onReact,
  currentUser,
  selectedRoom,
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState<boolean>(false)
  const [showActions, setShowActions] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editContent, setEditContent] = useState<string>(message.content)
  const actionsRef = useRef<HTMLDivElement>(null)

  const isOwn = (message?.sender?.id || message?.userId) === currentUser?.id
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-Us', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEdit = () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false)
      return
    }

    socket.emit(SOCKET_EMIT.EDIT_MESSAGE, {
      roomId: String(room.id),
      messageId: Number(message.id),
      content: editContent,
    })
    setIsEditing(false)
    setShowActions(false)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this message?')) {
      socket.emit(SOCKET_EMIT.DELETE_MESSAGE, {
        roomId: String(room.id),
        messageId: Number(message.id),
      })
    }
    setShowActions(false)
  }

  if (String(selectedRoom.id) !== String(room.id)) return null
  console.log(message, 'message item rendering')

  return (
    <div
      className={clsx('flex gap-3 group ', {
        'flex-row-reverse': isOwn,
      })}
    >
      <div className=" relative h-8 w-8 shrink-0 rounded-full overflow-hidden shadow-sm">
        {' '}
        {/* <Image
          src={currentUser?.image || '/general-room.jpg'}
          alt={currentUser?.name || 'User'}
          // className="object-cover"
          fill
        /> */}
        <img
          src={currentUser?.image || '/general-room.jpg'}
          alt={currentUser?.name || 'User'}
          className="object-cover"
        />
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col gap-1 relative',
          isOwn ? 'items-end' : 'items-start',
        )}
      >
        <div className="flex items-center gap-2 px-3">
          <span className=" text-sm font-medium text-foreground">
            {message?.email?.split('@')[0] ||
              message?.sender?.email.split('@')[0]}
          </span>
          <span className=" text-xs  text-muted-foreground">
            {formatTime(message.timestamp || message.createdAt)}
          </span>
        </div>

        <div
          className={cn(
            'flex gap-2 items-end',
            isOwn ? 'flex-row-reverse' : '',
          )}
        >
          <div
            className={cn(
              'max-w-xs px-2 py-4 rounded-2xl wrap-break-word shadow-sm transition-all relative',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-none'
                : 'bg-muted text-foreground rounded-bl-none',
            )}
          >
            {message.image && (
              <Image src={message.image} alt="image" width={200} height={200} />
            )}

            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <Input
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="bg-background text-foreground h-8"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleEdit()
                    if (e.key === 'Escape') setIsEditing(false)
                  }}
                />
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleEdit}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{message.content}</p>
                {message.isEdited && (
                  <span className="text-[10px] opacity-70 block text-right mt-1">
                    (edited)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Actions & Reactions */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Edit/Delete Actions (Only for own messages) */}
            {isOwn && !isEditing && (
              <div className="relative" ref={actionsRef}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 hover:bg-muted"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showActions && (
                  <div className="absolute bottom-full mb-1 right-0 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[100px] z-10 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowActions(false)
                      }}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted rounded w-full text-left"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-destructive/10 text-destructive rounded w-full text-left"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reaction button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-muted"
              onClick={() => setShowReactions(!showReactions)}
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Reactions Display */}
        {message?.reactions && message.reactions.length > 0 && (
          <div
            className={cn(
              'flex gap-1 flex-wrap mt-1',
              isOwn ? 'justify-end' : 'justify-start',
            )}
          >
            {Object.values(groupReactionsByEmoji(message.reactions)).map(
              group => (
                <button
                  key={group.emoji}
                  onClick={() => onReact?.(group.emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs shadow-sm"
                >
                  <span>{group.emoji}</span>
                  <span className="text-muted-foreground">{group.count}</span>
                </button>
              ),
            )}
          </div>
        )}

        {/* Quick reactions */}
        {showReactions && (
          <div
            className={clsx(
              'flex gap-1 mt-1 p-2 bg-card rounded-lg shadow-md border border-border absolute z-20',
              {
                'left-0': isOwn,
                'right-0': !isOwn,
              },
            )}
          >
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji)
                  setShowReactions(false)
                }}
                className="text-lg hover:scale-125 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {isOwn && (
          <div className="flex items-center gap-1 px-3 text-xs text-muted-foreground">
            {(() => {
              const validReceipts =
                message.readReceipts?.filter(
                  r =>
                    String(r.user?.id) !==
                    String(message.sender?.id || message.userId),
                ) || []

              return validReceipts.length > 0 ? (
                <div
                  title={`Seen by ${validReceipts
                    .map(r => r.user?.name || 'Unknown')
                    .join(', ')}`}
                >
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                  <span> Seen by {validReceipts.length}</span>
                </div>
              ) : (
                <>
                  <Check className="h-3 w-3" />
                  <span>Delivered</span>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

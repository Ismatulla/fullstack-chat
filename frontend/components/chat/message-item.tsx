import type { Message } from '@/lib/types'
import { Button } from '../ui/button'
import { SmilePlus, Check, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { User } from '@/lib/auth-types'
import groupReactionsByEmoji from '@/helpers/groupReactionsByEmoji'

interface MessageItemProps {
  message: Message
  onReact?: (emoji: string) => void
  currentUser: User
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export function MessageItem({
  message,

  onReact,
  currentUser,
}: MessageItemProps) {
  const [showReactions, setShowReactions] = useState<boolean>(false)

  const isOwn = (message?.sender?.id || message?.userId) === currentUser?.id
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-Us', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  console.log(message.reactions, 'reactions')
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
          className="object-cover"
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
            {currentUser?.name}
          </span>
          <span className=" text-xs  text-muted-foreground">
            {formatTime(message.timestamp)}
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
              'max-w-xs px-2 py-4 rounded-2xl wrap-break-word shadow-sm transition-all',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-none'
                : 'bg-muted text-foreground rounded-bl-none',
            )}
          >
            {message.image && (
              <Image src={message.image} alt="image" width={200} height={200} />
            )}
            <p className="text-sm">{message.content}</p>
          </div>
          {/* Reactions */}
          {message?.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {Object.values(groupReactionsByEmoji(message.reactions)).map(
                group => (
                  <button
                    key={group.emoji}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs shadow-sm"
                    // title={group?.users?.map(u => u.name).join(', ')}
                  >
                    <span>{group.emoji}</span>
                    <span className="text-muted-foreground">{group.count}</span>
                  </button>
                ),
              )}
            </div>
          )}

          {/* Reaction button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Quick reactions */}

        {showReactions && (
          <div
            className={clsx(
              'flex gap-1 mt-1 p-2 bg-card rounded-lg shadow-md border border-border absolute ',
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
        {/* Read status  */}
        {isOwn && (
          <div className="flex items-center gap-1 px-3 text-xs text-muted-foreground">
            {message?.readBy?.length > 0 ? (
              <>
                <CheckCheck className="h-3 w-3" />
                <span> Seen by {message.readBy.length}</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span>Delivered</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

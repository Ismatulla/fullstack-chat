import { useEffect, useState } from 'react'
import { Edit, Trash } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ChatRoom } from '@/lib/types'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { AvatarImg } from '../Avatar'
import { socket } from '@/socket/socket'

interface RoomItemProps {
  room: ChatRoom
  isSelected: boolean
  onSelect: (room: ChatRoom) => void
  onDelete: (roomId: string) => void
  onEdit: (room: ChatRoom) => void
}

export function RoomItem({
  room,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: RoomItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useRequireAuth()

  useEffect(() => {
    if (room.id) {
      socket.connect()
      socket.on('joined-room', data => {
        console.log('✅ JOINED ROOM RESPONSE:', data)
      })
    }
  }, [room.id])
  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(room)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
        isSelected
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
          : 'text-sidebar-foreground hover:bg-sidebar-accent',
      )}
    >
      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-linear-to-br">
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

      <div className="flex-1 min-w-0 text-left flex justify-between items-center">
        <div className="font-medium truncate">{room.name}</div>
        {room.unreadCount && room.unreadCount > 0 ? (
          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {room.unreadCount}
          </div>
        ) : null}
      </div>

      {user?.id === room?.owner?.id && isHovered && isSelected && (
        <div className="flex gap-3">
          <div
            onClick={e => {
              e.stopPropagation()
              onDelete(room.id)
            }}
            className="hover:scale-110 transition-transform"
          >
            <Trash color="#e7000b" width="15px" />
          </div>
          <div
            onClick={e => {
              e.stopPropagation()
              onEdit(room)
            }}
            className="hover:scale-110 transition-transform"
          >
            <Edit width="15px" />
          </div>
        </div>
      )}
    </button>
  )
}

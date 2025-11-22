import { useState } from 'react'
import { Edit, Trash } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ChatRoom } from '@/lib/types'
import { useRequireAuth } from '@/hooks/useRequireAuth'

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
  console.log(room, 'room item render')
  console.log(user, 'user in room item')
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
      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-linear-to-br from-purple-400 to-pink-400 shadow-sm">
        <Image
          src={room.image || '/general-room.jpg'}
          alt={room.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="font-medium truncate">{room.name}</div>
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

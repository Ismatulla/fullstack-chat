import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatRoom } from '@/lib/types'
import type { User } from '@/lib/auth-types'
import { mockRooms } from '@/lib/mock-data'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, LogOut } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SidebarProps {
  selectedRoom: ChatRoom | null
  onSelectRoom: (room: ChatRoom) => void
  currentUser?: User
}

export function Sidebar({
  selectedRoom,
  onSelectRoom,
  currentUser,
}: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full w-96 bg-sidebar border-r border-sidebar-border shadow-sm">
      {' '}
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Messages
          </h1>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/50 border-sidebar-border rounded-lg transition-colors focus:ring-2 focus:ring-sidebar-primary/50"
          />
        </div>
      </div>
      {/* Rooms List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredRooms.map(room => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                selectedRoom?.id === room.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-linear-to-br from-purple-400 to-pink-400 shadow-sm">
                <Image
                  src={room.avatar || '/placeholder.svg?height=40&width=40'}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate">{room.name}</div>
                <div className="text-xs opacity-70 truncate">
                  {room.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              {room.unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 bg-purple-500 hover:bg-purple-600"
                >
                  {room.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden shadow-sm">
            <Image
              src={currentUser?.avatar || '/placeholder.svg?height=40&width=40'}
              alt={currentUser?.name || 'User'}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate text-sidebar-foreground">
              {currentUser?.name}
            </div>
            <div className="text-xs opacity-70">Online</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-sidebar-accent text-destructive hover:text-destructive"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

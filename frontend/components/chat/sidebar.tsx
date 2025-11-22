import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChatRoom, Messages } from '@/lib/types'
import type { User } from '@/lib/auth-types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { ThemeToggle } from '@/components/theme-toggle'
import { Search, LogOut } from 'lucide-react'
import Image from 'next/image'
import { logout } from '@/services/authService'
import { CreateChat } from './create-chat'
import { UpdateChat } from './update-chat'
import useSWR from 'swr'
import { deleteSingleChat, getAllRoms } from '@/services/chatService'
import { getErrorMessage } from '@/utils/errorHandler'
import { RoomItem } from './rooms/RoomItem'

interface SidebarProps {
  currentUser?: User
  onSelectRoom: (room: ChatRoom) => void
  selectedRoom: Messages | null
}

export function Sidebar({
  currentUser,
  onSelectRoom,
  selectedRoom,
}: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null)

  const { data: rooms, mutate } = useSWR('chatrooms', getAllRoms)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.log(err)
    }
  }

  const filteredRooms = rooms?.filter((room: Messages) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteChatrooms = async (roomId: string) => {
    if (!rooms) return
    try {
      await deleteSingleChat(roomId)
      const updatedRooms = rooms.filter((room: Messages) => room.id !== roomId)

      if (selectedRoom?.id === roomId) {
        onSelectRoom(updatedRooms[0] || null)
      }
      await mutate(updatedRooms, { revalidate: false })
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      alert(message)
    }
  }

  const handleEditRoom = (room: ChatRoom) => {
    setEditingRoom(room)
  }

  return (
    <div className="flex flex-col h-full w-96 bg-sidebar border-r border-sidebar-border shadow-sm">
      {/* Header */}
      <div className="py-4 px-2 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Messages
          </h1>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/50 border-sidebar-border rounded-lg transition-colors focus:ring-2 focus:ring-sidebar-primary/50"
            />
          </div>
          <CreateChat mutate={mutate} rooms={rooms} />
        </div>
      </div>

      {/* Rooms List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {filteredRooms?.map((room: ChatRoom) => (
            <RoomItem
              key={room.id}
              room={room}
              isSelected={selectedRoom?.id === room.id}
              onSelect={onSelectRoom}
              onDelete={handleDeleteChatrooms}
              onEdit={handleEditRoom}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Update Chat Modal */}
      {editingRoom && (
        <UpdateChat
          room={editingRoom}
          editModalOpen={!!editingRoom}
          setEditModalOpen={open => !open && setEditingRoom(null)}
          mutate={mutate}
          onSelectRoom={onSelectRoom}
        />
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden shadow-sm">
            <Image
              src={currentUser?.avatar || '/general-room.jpg'}
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

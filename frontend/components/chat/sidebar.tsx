import { useState, useEffect } from 'react'
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
import { socket } from '@/socket/socket'

interface SidebarProps {
  currentUser?: User
  onSelectRoom: (room: ChatRoom) => void
  selectedRoom: Messages | null
  isConnected: { message: string; userId: string } | null
}

export function Sidebar({
  currentUser,
  onSelectRoom,
  selectedRoom,
  isConnected,
}: SidebarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [editingRoom, setEditingRoom] = useState<ChatRoom | null>(null)

  const { data: rooms, mutate } = useSWR('chatrooms', getAllRoms)

  const handleLogout = async () => {
    try {
      if (selectedRoom && selectedRoom.id) {
      }
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
        const nextRoom = updatedRooms[0] || null
        onSelectRoom(nextRoom)
        // Join next room if exists
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

  const handleSelectRoom = (room: ChatRoom) => {
    // Update selected room
    onSelectRoom(room)

    // Reset unread count locally
    if (rooms) {
      const updatedRooms = rooms.map((r: ChatRoom) => {
        if (r.id === room.id) {
          return { ...r, unreadCount: 0 }
        }
        return r
      })
      mutate(updatedRooms, { revalidate: false })
    }

    if (!socket.connected) {
      console.error('❌ Socket not connected! Call socket.connect() first')
      return
    }

    socket.emit('join-room', { roomId: String(room.id) })
  }

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!socket.connected) socket.connect()

    const handleNewMessage = (data: { roomId: string; userId: number }) => {
      // Don't increment for own messages
      if (String(data.userId) === String(currentUser?.id)) return

      // Play notification sound
      try {
        // Softer "ding" / chime sound
        const audio = new Audio('/message-sound.wav')
        audio.volume = 0.4 // Slightly lower volume for "softness"
        audio.play().catch(err => console.log('Audio play failed:', err))
      } catch (error) {
        console.error('Error playing sound:', error)
      }

      // If message is for a different room, increment unread count
      if (String(selectedRoom?.id) !== String(data.roomId) && rooms) {
        const updatedRooms = rooms.map((r: ChatRoom) => {
          if (String(r.id) === String(data.roomId)) {
            return { ...r, unreadCount: (r.unreadCount || 0) + 1 }
          }
          return r
        })
        mutate(updatedRooms, { revalidate: false })
      }
    }

    socket.on('new-message', handleNewMessage)
    return () => {
      socket.off('new-message', handleNewMessage)
    }
  }, [rooms, selectedRoom, mutate, currentUser])

  return (
    <div className="flex flex-col h-full w-96 bg-sidebar border-r border-sidebar-border shadow-sm">
      {/* Header */}
      <div className="py-4 px-2 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Messages
          </h1>
          <div className="flex items-center gap-2">
            {/* Connection Status Indicator */}
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={isConnected?.message ? 'Connected' : 'Disconnected'}
            />
            <ThemeToggle />
          </div>
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
              onSelect={handleSelectRoom}
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
              src={currentUser?.image || '/general-room.jpg'}
              alt={currentUser?.name || 'User'}
              fill
              className="object-cover"
              unoptimized
            />
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar ${
                isConnected?.message ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate text-sidebar-foreground">
              {currentUser?.name}
            </div>
            <div className="text-xs opacity-70">
              {isConnected?.message ? 'Online' : 'Offline'}
            </div>
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

'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/chat/sidebar'
import ChatWindow from '@/components/chat/chat-window'
import { ChatRoom } from '@/lib/types'
import { User } from '@/lib/auth-types'
import { getAllRoms } from '@/services/chatService'
import useSWR from 'swr'
import Image from 'next/image'
import { useRequireAuth } from '@/hooks/useRequireAuth'

// socket IO
import { useSocketEvents } from '@/hooks/useSocketEvents'
interface ChatLayoutProps {
  defaultUser?: User | null
  defaultRooms?: ChatRoom[]
}

/**
 * Next.js 15+ Best Practice: Client Component Hydration
 *
 * This component accepts initial data fetched on the server.
 * It passes this data to hooks (like useSWR) as fallback/initial data.
 * This ensures the UI is interactive immediately without a second fetch,
 * while still allowing client-side revalidation/updates.
 */

export function ChatLayout({
  defaultUser = null,
  defaultRooms = [],
}: ChatLayoutProps) {
  const { user, loading } = useRequireAuth(defaultUser)
  const { isConnected } = useSocketEvents(user) // Pass user to connect only when authenticated

  const {
    data: rooms,
    error,
    isLoading,
  } = useSWR('chatrooms', getAllRoms, {
    fallbackData: defaultRooms,
    revalidateOnFocus: false,
  })

  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)

  // Only show loading spinner if we really don't have data and are loading
  if ((isLoading && !rooms) || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  if (!user) return null
  if (error) return <p>Error loading rooms</p>

  return (
    <>
      <Sidebar
        currentUser={user}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        isConnected={isConnected}
      />

      {selectedRoom ? (
        <ChatWindow
          room={
            rooms?.find((r: ChatRoom) => r.id === selectedRoom.id) ||
            selectedRoom
          }
          currentUser={user}
          selectedRoom={selectedRoom}
        />
      ) : (
        <div className=" flex items-center justify-center  w-full flex-col gap-2">
          <Image
            src="/join-room-notification.svg"
            alt="notification "
            width="88"
            height="104"
          />
          <p className="font-bold text-gray-500">
            Please select the channel to see messages
          </p>
        </div>
      )}
    </>
  )
}

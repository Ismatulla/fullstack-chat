'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/chat/sidebar'
import ChatWindow from '@/components/chat/chat-window'
import { ChatRoom } from '@/lib/types'
import { useParams } from 'next/navigation'
import { Auth } from '@/lib/auth-types'
import { allUsers } from '@/services/userService'

interface ChatLayoutProps {
  initialRooms: ChatRoom[]
}

export function ChatLayout({ initialRooms }: ChatLayoutProps) {
  const [selectedRoom, setSelectedRoom] = useState(initialRooms[0])
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<Auth[] | []>([])

  const params = useParams()
  // const router = useRouter()

  const id = params.id
  const user = users?.find(user => user.id === id)

  useEffect(() => {
    async function fetchAllUsers() {
      setIsLoading(true)
      try {
        const { data } = await allUsers()
        setUsers(data)
      } catch (error) {
        console.log(error instanceof Error ? error.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllUsers()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!users) {
    return null
  }
  return (
    <>
      <Sidebar
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        currentUser={user}
      />

      {selectedRoom && <ChatWindow room={selectedRoom} currentUser={user} />}
    </>
  )
}

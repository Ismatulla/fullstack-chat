import { mockRooms } from '@/lib/mock-data'
import { ChatLayout } from '@/components/chat/chat-layout'

export default function Home() {
  return (
    <div className="flex h-screen bg-background  mx-auto w-full">
      <ChatLayout initialRooms={mockRooms} />
    </div>
  )
}

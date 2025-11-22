import { ChatLayout } from '@/components/chat/chat-layout'
import { getAllRoomsServer } from '@/services/serverChatService'
import { getCurrentUserServer } from '@/services/serverAuthService'
import { redirect } from 'next/navigation'

/**
 * Next.js 15+ Best Practice: Async Server Components
 * 
 * This page is a Server Component (default in Next.js app directory).
 * It fetches data directly on the server before rendering, which improves:
 * 1. Performance: Reduces client-side waterfalls.
 * 2. SEO: Content is available in the initial HTML.
 * 3. UX: No loading spinners for initial data.
 */
export default async function Home() {
  const user = await getCurrentUserServer()
  
  // Server-side redirect if not authenticated
  if (!user) {
    redirect('/login')
  }

  const rooms = await getAllRoomsServer()

  return (
    <div className="flex h-screen bg-background  mx-auto w-full">
      <ChatLayout defaultUser={user} defaultRooms={rooms} />
    </div>
  )
}

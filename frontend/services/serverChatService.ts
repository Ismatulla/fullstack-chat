import serverApi from '@/lib/server-api'

export async function getAllRoomsServer() {
  try {
    const response = await serverApi.get('chatrooms')
    return response.data
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return []
  }
}

export async function getSingleChatServer(id: string) {
  try {
    const { data } = await serverApi.get(`chatrooms/${id}`)
    return data
  } catch (error) {
    console.error(`Failed to fetch chat ${id}:`, error)
    return null
  }
}

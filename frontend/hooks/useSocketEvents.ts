import { useEffect } from 'react'
import { socket } from '../socket/socket'
import { useState } from 'react'
import { SOCKET_LISTEN } from '@/lib/socket-events'
interface ConnectedData {
  message: string
  userId: string
}

export function useSocketEvents() {
  const [isConnected, setIsConnected] = useState<ConnectedData | null>(null)

  useEffect(() => {
    if (!socket.connected) socket.connect()

    const handleConnected = (data: ConnectedData) => {
      setIsConnected(data)
      console.log(data, 'connection ')
    }

    socket.on(SOCKET_LISTEN.CONNECTED, handleConnected)

    return () => {
      socket.off(SOCKET_LISTEN.CONNECTED, handleConnected)
    }
  }, [])
  return { isConnected }
}

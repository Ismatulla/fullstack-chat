import { useEffect, useSyncExternalStore } from 'react'
import { socket } from '../socket/socket'
import { SOCKET_LISTEN } from '@/lib/socket-events'
import { User } from '@/lib/auth-types'

interface ConnectedData {
  message: string
  userId: string
}

let connectedDataRef: ConnectedData | null = null

export function useSocketEvents(user?: User | null) {
  // Subscribe to the custom 'connected' event from backend
  const connectedData = useSyncExternalStore<ConnectedData | null>(
    callback => {
      const handleConnected = (data: ConnectedData) => {
        // Store the data in a module-level variable
        connectedDataRef = data
        callback()
      }

      const handleDisconnect = () => {
        connectedDataRef = null
        callback()
      }

      socket.on(SOCKET_LISTEN.CONNECTED, handleConnected)
      socket.on('disconnect', handleDisconnect)

      return () => {
        socket.off(SOCKET_LISTEN.CONNECTED, handleConnected)
        socket.off('disconnect', handleDisconnect)
      }
    },
    () => connectedDataRef,
    () => null,
  )

 
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socket.connected) {
        socket.disconnect()
      }
      return
    }

    // User is authenticated, connect if not already connected
    if (!socket.connected) {
      console.log('🚀 Connecting socket for user:', user.email)
      // Small delay to ensure cookie is available
      const timer = setTimeout(() => {
        socket.connect()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [user])

  // Handle connection errors
  useEffect(() => {
    const handleConnectError = (error: Error) => {
      console.error('❌ Socket connection error:', error)
      // Retry after delay
      if (user) {
        setTimeout(() => {
          if (!socket.connected) {
            console.log('🔄 Retrying connection...')
            socket.connect()
          }
        }, 1000)
      }
    }

    socket.on('connect_error', handleConnectError)
    return () => {
      socket.off('connect_error', handleConnectError)
    }
  }, [user])

  return { isConnected: connectedData }
}

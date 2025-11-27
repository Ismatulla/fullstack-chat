// Emit events (client -> server)
export const SOCKET_EMIT = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  SEND_MESSAGE: 'send-message',
  MESSAGE_READ: 'message-read',
  MARK_ROOM_READ: 'mark-room-read',
  TYPING: 'typing',
  ADD_REACTION: 'add-reaction',
  REMOVE_REACTION: 'remove-reaction',
  CHECK_USER_STATUS: 'check-user-status',
  GET_ROOM_USERS: 'get-room-users',
} as const

// Listen events (server -> client)
export const SOCKET_LISTEN = {
  CONNECTED: 'connected',
  MESSAGE_RECEIVED: 'message-received',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  USER_STATUS: 'user-status',
  USER_TYPING: 'user-typing',
  MESSAGE_STATUS: 'message-status',
  REACTION_ADDED: 'reaction-added',
  REACTION_REMOVED: 'reaction-removed',
  MESSAGE_SENT: 'message-sent',
  MESSAGE_NEW: 'new-message',
  ERROR: 'error',
} as const

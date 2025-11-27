# Chat Application - MVP Feature Guide

Welcome to the Chat Application! This document provides a comprehensive overview of all features available in this MVP.

---

## 🚀 Getting Started

### Authentication

- **Sign Up**: Create a new account with name, email and password
- **Login**: Access your account with credentials
- **Logout**: Securely sign out from any page
- **Session Persistence**: Stay logged in across page refreshes

---

## 💬 Core Chat Features

### Room Management

- **Create Room**: Create new chat rooms with custom names and images
- **Join Room**: Select any room from the sidebar to start chatting
- **Edit Room**: Update room name and image (owner only)
- **Delete Room**: Remove rooms you own
- **Room Ownership**: Each room has an owner with special privileges
- **User left and join room indicator**

### Messaging

- **Send Messages**: Type and send text messages in real-time

- **Emoji Picker**: Insert emojis directly into your messages
  - Click the smile icon in the message input
  - Choose from hundreds of emojis
  - Works in both light and dark mode
- **Message Delivery**: See "Delivered" status on your sent messages
- **Read Receipts**: View "Seen by X" count when others read your messages
- **Real-time Sync**: Messages appear instantly for all users in the room
- **Message History**: All messages are persisted and loaded when you join a room
- **Offline Messages**: Receive messages sent while you were offline

### Message Actions

- **Edit Message**: Click the three-dot menu on your own messages to edit them
  - Shows "(edited)" label on modified messages
  - Only available for your own messages
  - Press Enter to save, Escape to cancel
- **Delete Message**: Remove your own messages permanently
  - Confirmation prompt before deletion
  - Deletes for all users in the room
- **Clear Chat**: Room owners can clear all messages in the room with one click
  - Available in the header (red "Clear Chat" button)
  - Removes all messages for everyone
  - Requires room ownership

### Reactions

- **Add Reaction**: Click the smile icon to add emoji reactions to any message
- **Quick Reactions**: Choose from 6 popular emojis (👍 ❤️ 😂 😮 😢 🔥)
- **Toggle Reactions**: Click an existing reaction to remove it
- **Reaction Count**: See how many users reacted with each emoji
- **Multiple Reactions**: Add different reactions to the same message

---

## 🔔 Notifications & Indicators

### Unread Messages

- **Badge Count**: See the number of unread messages on each room in the sidebar
- **Real-time Updates**: Badge updates instantly when new messages arrive
- **Auto-clear**: Badge disappears when you open the room
- **Smart Filtering**: Only counts messages from others (not your own)

### Notification Sound

- **Audio Alert**: Hear a pleasant chime when receiving new messages
- **Receiver Only**: Sound only plays for incoming messages, not your own
- **Background Notifications**: Get notified even when viewing a different room

### Typing Indicators

- **See Who's Typing**: View when other users are typing in the current room
- **Real-time Updates**: Indicator appears and disappears as users type
- **Multiple Users**: Shows count when multiple people are typing

### Connection Status

- **Online/Offline Indicator**: Green/red dot shows your connection status
- **Sidebar Indicator**: Small dot in the header
- **Profile Indicator**: Larger dot on your avatar at the bottom

---

## 👥 User Experience

### Interface

- **Dark/Light Mode**: Toggle theme with the theme switcher in the sidebar

- **Message Grouping**: Messages are organized by sender with timestamps
- **Auto-scroll**: Chat automatically scrolls to newest messages
- **Avatar Display**: User avatars shown next to each message
- **Image Display**: Inline image preview in messages
- **Emoji Picker**: Full emoji selector with search and categories
- **Image Preview**: See image thumbnails before sending

### Real-time Features

- **Instant Messaging**: Zero-delay message delivery via WebSocket
- **Live Updates**: See edits, deletions, and reactions in real-time
- **Presence Detection**: Know when users are online/offline
- **Synchronized State**: All users see the same state simultaneously

---

## 🎯 User Roles & Permissions

### Regular User

- Send, edit, and delete your own messages
- React to any message
- Join any room
- Create new rooms (become owner)
- View all messages and read receipts

### Room Owner

- All regular user permissions
- Edit room details (name, image)
- Delete the entire room
- Clear all messages in the room

---

## 📱 Technical Highlights

### Performance

- **Optimistic Updates**: UI updates instantly before server confirmation
- **Efficient Queries**: Smart database queries for unread counts
- **Bulk Operations**: Mark entire rooms as read with one action

### Reliability

- **Message Persistence**: All messages saved to database
- **Read Status Persistence**: Read receipts survive page reloads
- **Error Handling**: Graceful error messages for failed operations
- **Connection Recovery**: Automatic reconnection on network issues

### Security

- **Authentication Required**: All features require login
- **Authorization Checks**: Server validates user permissions
- **Owner Verification**: Sensitive actions verify room ownership
- **Session Management**: Secure token-based authentication

---

## 🎨 UI/UX Features

### Visual Feedback

- **Hover Effects**: Interactive elements highlight on hover
- **Loading States**: Clear indicators when fetching data
- **Confirmation Dialogs**: Prompts before destructive actions
- **Status Icons**: Visual indicators for delivery and read status

### Accessibility

- **Keyboard Support**: Enter to send, Escape to cancel edits
- **Tooltips**: Helpful hints on hover
- **Clear Labels**: Descriptive text for all actions
- **Color Contrast**: Readable text in both themes

---

## 📋 Quick Reference

### Keyboard Shortcuts

- `Enter` - Send message / Confirm edit
- `Escape` - Cancel edit mode

### Message Status Icons

- ✓ Single check - Delivered
- ✓✓ Double check (blue) - Seen by others
- (edited) - Message was modified

### Action Locations

- **Three-dot menu** - Edit/Delete (on your messages)
- **Smile icon** (message) - Add reactions
- **Smile icon** (input) - Open emoji picker
- **Paperclip icon** - Attach images
- **Clear Chat button** - Room header (owners only)
- **Theme toggle** - Sidebar header
- **Logout** - Bottom of sidebar

---

## 🎓 Onboarding Flow

1. **Sign Up/Login** → Create account or sign in
2. **Create or Join Room** → Start by creating a room or selecting an existing one
3. **Send First Message** → Type in the input box and press Enter
4. **Try Image Upload** → Click paperclip icon to attach an image
5. **Use Emoji Picker** → Click smile icon in input to add emojis
6. **Try Reactions** → Click smile icon on any message to react
7. **Edit a Message** → Click three dots on your message → Edit
8. **Check Read Status** → Send a message and watch for "Seen by" updates
9. **Explore Features** → Try different rooms, reactions, and settings

---

## 💡 Tips & Best Practices

- **Room Names**: Use descriptive names for easy identification
- **Message Editing**: Edit within a reasonable time for clarity
- **Reactions**: Use reactions for quick responses
- **Clear Chat**: Use sparingly as it affects all users
- **Notifications**: Keep sound on for important conversations
- **Theme**: Choose the theme that's comfortable for your eyes

---

## 🐛 Known Limitations

- Messages cannot be edited after being deleted
- Room images must be valid URLs
- Maximum message length enforced by database
- Reactions limited to emoji characters

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: November 2025

For technical documentation, see the codebase README files.

# Chat Implementation Checklist

## Phase 1: Setup 

- [ ] Install dependencies
  ```bash
  npm install cloudinary @nestjs/platform-socket.io socket.io
  npm install -D @types/multer
  ```
- [ ] Create free Cloudinary account at cloudinary.com
- [ ] Add Cloudinary credentials to `.env`
- [ ] Add `FRONTEND_URL` to `.env`

## Phase 2: Database 

- [ ] Create `entities/message-reaction.entity.ts`
- [ ] Create `entities/message-read.entity.ts`
- [ ] Update `entities/message.entity.ts` (add relations)
- [ ] Generate migration: `npm run migration:generate -- src/migrations/AddReactionsAndReads`
- [ ] Run migration: `npm run migration:run`

## Phase 3: Decorators & Guards

- [ ] Create `decorators/current-user.decorator.ts`
- [ ] Create `decorators/current-chatroom.decorator.ts`
- [ ] Create `guards/chatroom-owner.guard.ts`
- [ ] Create `guards/chatroom-access.guard.ts`
- [ ] Create `guards/message-owner.guard.ts`

## Phase 4: Services

- [ ] Update `services/chatrooms.service.ts` (add verifyUserAccess)
- [ ] Update `services/messages.service.ts` (add all new methods)
- [ ] Create `services/socket-auth.service.ts`
- [ ] Create `services/presence.service.ts`
- [ ] Create `services/room-access.service.ts`
- [ ] Create `services/socket-emitter.service.ts`
- [ ] Create `services/upload.service.ts`

## Phase 5: Event Handlers 

- [ ] Create `handlers/room-event.handler.ts`
- [ ] Create `handlers/message-event.handler.ts`
- [ ] Create `handlers/typing-event.handler.ts`
- [ ] Create `handlers/reaction-event.handler.ts`
- [ ] Create `handlers/presence-event.handler.ts`

## Phase 6: Gateway & Filters 

- [ ] Create `filters/ws-exception.filter.ts`
- [ ] Replace `chat.gateway.ts` with new clean version

## Phase 7: Controllers 

- [ ] Update `controllers/chatrooms.controller.ts`
- [ ] Create `controllers/messages.controller.ts`
- [ ] Create `controllers/upload.controller.ts`

## Phase 8: Module 

- [ ] Update `chat.module.ts` with all providers
- [ ] Import `ChatModule` in your `app.module.ts`

## Phase 9: Testing

- [ ] Test WebSocket authentication
- [ ] Test join/leave rooms
- [ ] Test send messages
- [ ] Test file upload
- [ ] Test reactions
- [ ] Test read receipts
- [ ] Test typing indicators
- [ ] Test presence system
- [ ] Test authorization (try unauthorized access)



## Quick Verification Commands

After implementation, verify everything works:

```bash
# 1. Verify TypeScript compiles
npm run build

# 2. Start the server
npm run start:dev

# 3. Check if WebSocket is running
# Open browser console and test connection
```

## Common Issues & Fixes

**Issue: JWT not found**

- Make sure JwtModule is imported in ChatModule
- Verify JWT_SECRET in .env

**Issue: Entities not recognized**

- Run migrations
- Check TypeOrmModule.forFeature includes all entities

**Issue: Guards not working**

- Ensure JwtAuthGuard is imported from YOUR auth module
- Check if user object is attached to request by JWT guard

**Issue: File upload fails**

- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure file type is allowed

**Issue: WebSocket connection fails**

- Check CORS configuration
- Verify JWT token is sent in handshake
- Check if port is correct

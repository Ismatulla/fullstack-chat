import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentChatroom = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.chatroom;
  },
);

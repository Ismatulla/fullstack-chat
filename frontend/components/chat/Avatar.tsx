import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function AvatarImg() {
  return (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="avatar" />
      <AvatarFallback>A</AvatarFallback>
    </Avatar>
  )
}

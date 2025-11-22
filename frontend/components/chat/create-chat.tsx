import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChatRooms } from '@/lib/types'
import { createChatRoom } from '@/services/chatService'
import { getErrorMessage } from '@/utils/errorHandler'
import Image from 'next/image'
import { useState } from 'react'

interface CreateChatProps {
  mutate: (
    data?: ChatRooms[],
    shouldRevalidate?: boolean,
  ) => Promise<ChatRooms[] | undefined>
  rooms: ChatRooms[]
}
export function CreateChat({ mutate, rooms }: CreateChatProps) {
  const [name, setName] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      mutate([...rooms, { id: 'temp-' + Date.now(), name, image }], false)
      const res = await createChatRoom({ name, image })
      console.log(res)
      mutate()
      setName('')
      setImage('')
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      alert(message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          {' '}
          <Image src="/plus.svg" alt="icon" width={16} height={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleCreateRoom}>
          <DialogHeader>
            <DialogTitle className="mb-4">Create Channel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Channel Name</Label>
              <Input
                onChange={e => setName(e.target.value)}
                id="name"
                name="name"
                placeholder="channel name"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Image </Label>
              <Input
                id="link"
                name="username"
                placeholder=" image url"
                onChange={e => setImage(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter className=" mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" disabled={loading}>
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

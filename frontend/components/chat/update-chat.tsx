import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChatRoom, ChatRooms } from '@/lib/types'
import { getSingleChat, updateSingleChat } from '@/services/chatService'
import { getErrorMessage } from '@/utils/errorHandler'

import { useState } from 'react'
import useSWR from 'swr'
interface EditModalProps {
  room: ChatRoom
  editModalOpen: boolean
  setEditModalOpen: (open: boolean) => void
  onSelectRoom: (room: ChatRoom) => void
  mutate: (
    data?: ChatRooms[],
    shouldRevalidate?: boolean,
  ) => Promise<ChatRooms[] | undefined>
}

export function UpdateChat({
  room,
  editModalOpen,
  setEditModalOpen,
  mutate,
  onSelectRoom,
}: EditModalProps) {
  const { data: singleRoom, isLoading } = useSWR(
    editModalOpen ? `chatroom-${room.id}` : null,
    () => getSingleChat(room.id),
  )

  const [formData, setFormData] = useState<{
    name: string
    image: string
    roomId: string | null
  }>({
    name: '',
    image: '',
    roomId: null,
  })

  const currentName =
    formData.roomId === room.id ? formData.name : singleRoom?.name || ''
  const currentImage =
    formData.roomId === room.id ? formData.image : singleRoom?.image || ''

  const updateForm = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('called')
    try {
      await updateSingleChat({
        name: currentName,
        image: currentImage,
        id: room.id,
      })
      await mutate()
      setEditModalOpen(false)
      // Reset form data
      setFormData({ name: '', image: '', roomId: null })
      if (onSelectRoom) {
        onSelectRoom({
          ...room,
          name: currentName,
          image: currentImage,
        })
      }
    } catch (error) {
      const message = getErrorMessage(error)
      alert(message)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value, image: currentImage, roomId: room.id })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: currentName, image: e.target.value, roomId: room.id })
  }

  return (
    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={updateForm}>
          <DialogHeader>
            <DialogTitle className="mb-4">Update Channel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Channel Name</Label>
              <Input
                onChange={handleNameChange}
                id="name"
                name="name"
                placeholder="channel name"
                required
                disabled={isLoading}
                value={currentName}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Image </Label>
              <Input
                id="link"
                name="username"
                placeholder=" image url"
                onChange={handleImageChange}
                disabled={isLoading}
                value={currentImage}
              />
            </div>
          </div>
          <DialogFooter className=" mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

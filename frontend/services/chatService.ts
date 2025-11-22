import api from '@/lib/api'
import { Messages, } from '@/lib/types'

export function createChatRoom(data: Messages) {
  const res = api.post('chatrooms', { ...data })
  return res
}

export async function getAllRoms() {
  const response = await api.get('chatrooms')
  const { data } = response
  return data
}

export async function deleteSingleChat(id: string) {
  await api.delete(`chatrooms/${id}`)
}

export async function getSingleChat(id: string) {
  const { data } = await api.get(`chatrooms/${id}`)
  return data
}

export async function updateSingleChat({ name, image, id }: Messages) {
  const { data } = await api.put(`chatrooms/${id}`, { name, image })
  return data
}

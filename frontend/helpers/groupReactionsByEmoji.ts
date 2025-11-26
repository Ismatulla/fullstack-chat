import { Reactions } from '@/lib/types'

const groupReactionsByEmoji = (reactions: Reactions[]) => {
  return reactions.reduce(
    (acc, reaction) => {
      const emoji = reaction.emoji
      if (!acc[emoji]) {
        acc[emoji] = {
          emoji,
          count: 0,
          users: [],
          reactionIds: [],
        }
      }
      acc[emoji].count++
      acc[emoji].users.push(reaction.user)
      acc[emoji].reactionIds.push(reaction.id)
      return acc
    },
    {} as Record<
      string,
      {
        emoji: string
        count: number
        users: Array<{ id: string; name: string; email: string }>
        reactionIds: string[]
      }
    >,
  )
}
export default groupReactionsByEmoji

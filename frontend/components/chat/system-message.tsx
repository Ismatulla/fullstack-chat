import { cn } from '@/lib/utils'

interface SystemMessageProps {
  message: string
  timestamp?: Date
}

export function SystemMessage({ message, timestamp }: SystemMessageProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-Us', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center justify-center my-4">
      <div className={cn(
        "px-4 py-2 rounded-full bg-muted/50 text-muted-foreground",
        "text-xs font-medium flex items-center gap-2"
      )}>
        <span>{message}</span>
        {timestamp && (
          <span className="opacity-60">• {formatTime(timestamp)}</span>
        )}
      </div>
    </div>
  )
}

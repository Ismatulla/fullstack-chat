import type React from 'react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Smile, X } from 'lucide-react'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'
import { useTheme } from 'next-themes'
import { FileUploadButton } from './file-uploadbtn'
import Image from 'next/image'

interface MessageInputProps {
  onSendMessage: (message: string, image: string | null) => void
  onTyping?: (isTyping: boolean) => void
}

export function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState<string>('')
  const [showEmoji, setShowEmoji] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()

  const pickerTheme = theme === 'dark' ? Theme.DARK : Theme.LIGHT

  const handleSend = () => {
    if (message.trim()) {
      const imageUrl = selectedFile ? URL.createObjectURL(selectedFile) : null
      console.log(imageUrl)
      onSendMessage(message, imageUrl)

      setMessage('')
      setSelectedFile(null)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setMessage(message + emojiData.emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const clearPreview = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  return (
    <div className="p-4 border-t border-border bg-card shadow-sm">
      <div className="relative">
        {showEmoji && (
          <div className="absolute bottom-16 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiSelect} theme={pickerTheme} />
          </div>
        )}

        <div className="flex items-end gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 hover:bg-muted rounded-lg"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <FileUploadButton onFileSelect={handleFileSelect} />

          {/* Input container */}
          <div className="relative flex-1">
            {preview && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    className="rounded-md object-cover border border-border"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={clearPreview}
                    className="absolute -top-1 -right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={message}
              onChange={e => {
                setMessage(e.target.value)
                onTyping?.(true)
              }}
              onKeyDown={handleKeyDown}
              className={`pl-${
                preview ? '14' : '4'
              } min-h-10 resize-none rounded-lg border-border focus:ring-2 focus:ring-primary/50`}
            />
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
            className="h-10 w-10 rounded-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

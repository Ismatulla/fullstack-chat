import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip } from 'lucide-react'

export function FileUploadButton({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 hover:bg-muted rounded-lg"
        onClick={handleButtonClick}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
    </>
  )
}

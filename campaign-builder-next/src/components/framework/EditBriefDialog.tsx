'use client'

import { useState, useEffect, useRef } from 'react'
import { Framework } from '@/types'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Upload } from 'lucide-react'

interface EditBriefDialogProps {
  open: boolean
  onClose: () => void
  framework: Framework
  onSave: (content: string) => void
  saving: boolean
}

export function EditBriefDialog({ open, onClose, framework, onSave, saving }: EditBriefDialogProps) {
  const [content, setContent] = useState(framework.campaignBrief?.content ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setContent(framework.campaignBrief?.content ?? '')
  }, [framework.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setContent((prev) => prev ? `${prev}\n\n${text}` : text)
    }
    reader.readAsText(file)
    // Reset so same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Campaign Brief"
      description="Paste or write your campaign brief. This will be used as context for content generation."
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            size="sm"
            variant="outline"
            icon={<Upload size={13} />}
            onClick={() => fileRef.current?.click()}
          >
            Upload file (.txt, .md)
          </Button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder="Paste your campaign brief here — strategy, themes, goals, key messages..."
          className="font-mono text-xs"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => { onSave(content); onClose() }}
            loading={saving}
          >
            Save Brief
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

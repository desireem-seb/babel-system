'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Check, MessageSquare } from 'lucide-react'

export function FeedbackClient() {
  const [form, setForm] = useState({
    type: 'feature',
    priority: 'medium',
    title: '',
    description: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit() {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Submission failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 md:px-6 pb-8 space-y-6 max-w-lg">
      <PageHeader
        title="Feedback"
        description="Report bugs, request features, or share ideas"
      />

      {submitted ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={22} className="text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">Thanks for the feedback!</p>
            <p className="text-sm text-zinc-500">We&apos;ll review it soon.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => { setSubmitted(false); setForm({ type: 'feature', priority: 'medium', title: '', description: '', email: '' }) }}
            >
              Submit another
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <MessageSquare size={14} className="text-indigo-600" />
            </div>
            <span className="text-sm font-semibold text-zinc-900">Submit Feedback</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                options={[
                  { value: 'bug', label: 'Bug' },
                  { value: 'feature', label: 'Feature Request' },
                  { value: 'improvement', label: 'Improvement' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
              />
            </div>

            <Input
              label="Title *"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Brief summary of your feedback"
            />

            <Textarea
              label="Description *"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              placeholder="Describe the issue or request in detail…"
            />

            <Input
              label="Email (optional)"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              type="email"
              placeholder="For follow-up questions"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={submit}
              loading={submitting}
              disabled={!form.title.trim() || !form.description.trim()}
            >
              Submit Feedback
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

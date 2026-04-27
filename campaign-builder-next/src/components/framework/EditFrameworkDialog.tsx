'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Framework } from '@/types'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { X, Plus } from 'lucide-react'

interface EditFrameworkDialogProps {
  open: boolean
  onClose: () => void
  framework: Framework
  onSave: (updates: Partial<Framework>) => void
  saving: boolean
}

export function EditFrameworkDialog({
  open,
  onClose,
  framework,
  onSave,
  saving,
}: EditFrameworkDialogProps) {
  const [portfolio, setPortfolio] = useState(framework.portfolio)
  const [tagline, setTagline] = useState(framework.tagline)
  const [personas, setPersonas] = useState<string[]>(framework.personas)
  const [newPersona, setNewPersona] = useState('')
  const [pillars, setPillars] = useState(framework.pillars)
  const personaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPortfolio(framework.portfolio)
    setTagline(framework.tagline)
    setPersonas(framework.personas)
    setNewPersona('')
    setPillars(framework.pillars)
  }, [framework.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  function addPersona() {
    const val = newPersona.trim()
    if (!val || personas.includes(val)) return
    setPersonas((prev) => [...prev, val])
    setNewPersona('')
    personaInputRef.current?.focus()
  }

  function removePersona(p: string) {
    setPersonas((prev) => prev.filter((x) => x !== p))
  }

  function onPersonaKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addPersona() }
  }

  function updatePillar(i: number, field: 'name' | 'description', value: string) {
    setPillars((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }

  function addPillar() {
    setPillars((prev) => [...prev, {
      id: `pillar-${Date.now()}`,
      name: '',
      description: '',
      capabilities: [],
    }])
  }

  function removePillar(i: number) {
    setPillars((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    onSave({ portfolio, tagline, personas, pillars })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit Framework" size="lg">
      <div className="space-y-5">
        <Textarea
          label="Portfolio Message"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          rows={4}
        />

        <Input
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />

        {/* Personas */}
        <div>
          <p className="text-xs font-medium text-zinc-700 mb-2">Target Personas</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {personas.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
              >
                {p}
                <button
                  onClick={() => removePersona(p)}
                  className="hover:text-indigo-900 transition-colors"
                  aria-label={`Remove ${p}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {personas.length === 0 && (
              <span className="text-xs text-zinc-400">No personas yet — add one below</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={personaInputRef}
              value={newPersona}
              onChange={(e) => setNewPersona(e.target.value)}
              onKeyDown={onPersonaKeyDown}
              placeholder="e.g. CMO, VP of Data…"
              className="flex-1 h-9 px-3 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Button size="sm" variant="outline" icon={<Plus size={13} />} onClick={addPersona}>
              Add
            </Button>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Press Enter or click Add</p>
        </div>

        {/* Pillars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-zinc-700">Messaging Pillars</p>
            <Button size="sm" variant="outline" icon={<Plus size={12} />} onClick={addPillar}>
              Add Pillar
            </Button>
          </div>
          <div className="space-y-4">
            {pillars.map((pillar, i) => (
              <div key={pillar.id} className="border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">Pillar {i + 1}</span>
                  </div>
                  <button
                    onClick={() => removePillar(i)}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                    aria-label="Remove pillar"
                  >
                    <X size={14} />
                  </button>
                </div>
                <Input
                  label="Name"
                  value={pillar.name}
                  onChange={(e) => updatePillar(i, 'name', e.target.value)}
                />
                <Textarea
                  label="Description"
                  value={pillar.description}
                  onChange={(e) => updatePillar(i, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

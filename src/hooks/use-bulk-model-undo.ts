'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { applyBulkModelChange, undoBulkModelChange, type ModelUndoEntry } from '@/utils/bulk-model-undo'

export function useBulkModelUndo<Step>(
  steps: Step[],
  setSteps: Dispatch<SetStateAction<Step[]>>,
  keyOf: (step: Step) => string
) {
  const [history, setHistory] = useState<ModelUndoEntry<Step>[] | null>(null)
  return {
    canUndo: history !== null,
    apply(patchFor: (step: Step) => Partial<Step>) {
      const change = applyBulkModelChange(steps, keyOf, patchFor)
      setSteps(change.steps)
      setHistory(change.history)
    },
    protect(key: string) {
      // Even explicitly choosing the same model counts as an individual override.
      setHistory((current) => current?.filter((entry) => entry.key !== key) ?? null)
    },
    clear() { setHistory(null) },
    undo() {
      if (history === null) return
      setSteps((current) => undoBulkModelChange(current, keyOf, history))
      setHistory(null)
    },
  }
}

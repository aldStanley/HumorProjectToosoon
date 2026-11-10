'use client'

import { useState } from 'react'

type ResetPromptProps = {
  value: string
  savedValue: string | undefined
  label: string
  disabled?: boolean
  onReset: (value: string) => void
}

export default function ResetPrompt(props: ResetPromptProps) {
  if (props.savedValue === undefined || props.value === props.savedValue) return null
  return <ResetPromptControl {...props} />
}

function ResetPromptControl({ savedValue, label, disabled, onReset }: ResetPromptProps) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="mb-2 text-xs">
      {confirming ? (
        <div role="group" aria-label={`Confirm reset ${label}`} className="flex flex-wrap items-center gap-2">
          <span>Replace your edits with the last-saved prompt?</span>
          <button type="button" disabled={disabled} className="font-semibold underline disabled:opacity-50" onClick={() => {
            if (savedValue === undefined) return
            onReset(savedValue)
            setConfirming(false)
          }}>Reset prompt</button>
          <button type="button" className="underline" onClick={() => setConfirming(false)}>Keep edits</button>
        </div>
      ) : (
        <button type="button" disabled={disabled} aria-label={`Reset ${label} to last saved`} className="text-[rgb(var(--accent-strong))] underline disabled:opacity-50" onClick={() => setConfirming(true)}>Reset prompt</button>
      )}
    </div>
  )
}

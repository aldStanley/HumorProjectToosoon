'use client'

import type { ModelChoice } from './bulk-model-select'

export default function StepModelSelect({ models, providerModelId, label, disabled, onChange }: {
  models: ModelChoice[]
  providerModelId: string
  label: string
  disabled?: boolean
  onChange: (model: ModelChoice) => void
}) {
  const selected = models.find((model) => model.provider_model_id === providerModelId)
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-semibold">
      Model for this step
      <select
        aria-label={label}
        value={selected?.id ?? ''}
        disabled={disabled}
        onChange={(event) => {
          const model = models.find((entry) => entry.id === Number(event.target.value))
          if (model) onChange(model)
        }}
        className="w-full min-w-0 rounded-md border border-[rgb(var(--primary)/0.3)] bg-[rgb(var(--panel))] px-2 py-1.5 text-xs font-normal text-[rgb(var(--ink))] disabled:opacity-50"
      >
        {!selected ? <option value="">{providerModelId || 'Choose a model…'}</option> : null}
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider_model_id})
          </option>
        ))}
      </select>
    </label>
  )
}

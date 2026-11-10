export type ModelUndoEntry<Step> = {
  key: string
  before: Partial<Step>
  applied: Partial<Step>
}

export function applyBulkModelChange<Step>(
  steps: Step[],
  keyOf: (step: Step) => string,
  patchFor: (step: Step) => Partial<Step>
): { steps: Step[]; history: ModelUndoEntry<Step>[] } {
  const history: ModelUndoEntry<Step>[] = []
  const next = steps.map((step) => {
    const applied = patchFor(step)
    const before: Partial<Step> = {}
    for (const field of Object.keys(applied) as (keyof Step)[]) before[field] = step[field]
    history.push({ key: keyOf(step), before, applied })
    return { ...step, ...applied }
  })
  return { steps: next, history }
}

// Restore only model fields, and only for steps that still have the bulk values.
// Removed steps stay removed; steps added later and unrelated edits are preserved.
export function undoBulkModelChange<Step>(
  steps: Step[],
  keyOf: (step: Step) => string,
  history: ModelUndoEntry<Step>[]
): Step[] {
  const entries = new Map(history.map((entry) => [entry.key, entry]))
  return steps.map((step) => {
    const entry = entries.get(keyOf(step))
    if (!entry) return step
    const fields = Object.keys(entry.applied) as (keyof Step)[]
    if (!fields.every((field) => Object.is(step[field], entry.applied[field]))) return step
    return { ...step, ...entry.before }
  })
}

// Bulk and individual changes use the same assignments. The most recent
// change to a step wins; applying to all does not lock individual choices.
export function assignStepModels<Model>(
  current: Record<string, Model>,
  stepKeys: string[],
  model: Model
): Record<string, Model> {
  const next = { ...current }
  for (const key of stepKeys) next[key] = model
  return next
}

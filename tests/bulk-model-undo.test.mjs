import assert from 'node:assert/strict'
import test from 'node:test'
import { applyBulkModelChange, undoBulkModelChange } from '../src/utils/bulk-model-undo.ts'
import { assignStepModels, undoStepModels } from '../src/utils/step-models.ts'

const keyOf = (step) => step.key
const original = [
  { key: 'a', modelId: 1, temperature: 0.7, systemPrompt: 'original a' },
  { key: 'b', modelId: 2, temperature: 0.2, systemPrompt: 'original b' },
]
const patch = () => ({ modelId: 3, temperature: null })

test('undo restores mixed models and temperatures without reverting prompt edits', () => {
  const change = applyBulkModelChange(original, keyOf, patch)
  const edited = change.steps.map((step) => ({ ...step, systemPrompt: 'edited' }))
  const restored = undoBulkModelChange(edited, keyOf, change.history)
  assert.deepEqual(restored.map(({ modelId, temperature }) => ({ modelId, temperature })),
    original.map(({ modelId, temperature }) => ({ modelId, temperature })))
  assert.ok(restored.every((step) => step.systemPrompt === 'edited'))
  assert.equal(original[0].systemPrompt, 'original a')
})

test('later overrides survive undo, including explicitly selecting the bulk model again', () => {
  const change = applyBulkModelChange(original, keyOf, patch)
  const edited = change.steps.map((step) => step.key === 'a' ? { ...step, modelId: 4 } : step)
  const restored = undoBulkModelChange(edited, keyOf, change.history)
  assert.equal(restored[0].modelId, 4)
  assert.equal(restored[1].modelId, 2)
  const protectedHistory = change.history.filter((entry) => entry.key !== 'a')
  const protectedResult = undoBulkModelChange(change.steps, keyOf, protectedHistory)
  assert.equal(protectedResult[0].modelId, 3)
  assert.equal(protectedResult[1].modelId, 2)
})

test('undo keeps newly added steps and does not resurrect deleted steps', () => {
  const change = applyBulkModelChange(original, keyOf, patch)
  const added = { key: 'new', modelId: 5, temperature: 1, systemPrompt: 'new' }
  const restored = undoBulkModelChange([change.steps[1], added], keyOf, change.history)
  assert.deepEqual(restored, [original[1], added])
})

test('a second bulk change undoes to the immediately preceding configuration', () => {
  const first = applyBulkModelChange(original, keyOf, patch)
  const second = applyBulkModelChange(first.steps, keyOf, () => ({ modelId: 4 }))
  assert.deepEqual(undoBulkModelChange(second.steps, keyOf, second.history), first.steps)
})

test('Ops undo restores configured defaults and prior overrides, preserving later choices', () => {
  const a = { id: 1 }, b = { id: 2 }, c = { id: 3 }
  const previous = { b }
  const applied = assignStepModels(previous, ['a', 'b', 'c'], a)
  const edited = assignStepModels(applied, ['c'], c)
  const restored = undoStepModels(edited, previous, ['a', 'b', 'c'], a)
  assert.deepEqual(restored, { b, c })
  assert.equal(applied.a, a)
})

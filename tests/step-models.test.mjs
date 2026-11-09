import assert from 'node:assert/strict'
import test from 'node:test'
import { assignStepModels } from '../src/utils/step-models.ts'

const modelA = { provider_model_id: 'model-a', is_temperature_supported: true }
const modelB = { provider_model_id: 'model-b', is_temperature_supported: false }
const llmKeys = ['recognize', 'describe', 'write']

test('an individual selection after Apply to all affects only that step', () => {
  const all = assignStepModels({}, llmKeys, modelA)
  const mixed = assignStepModels(all, ['describe'], modelB)
  assert.equal(mixed.recognize, modelA)
  assert.equal(mixed.describe, modelB)
  assert.equal(mixed.write, modelA)
  assert.equal(mixed.describe.is_temperature_supported, false)
  assert.equal(mixed.write.is_temperature_supported, true)
  assert.equal(all.describe, modelA, 'existing run configuration is not mutated')
})

test('Apply to all replaces prior individual choices and still permits another exception', () => {
  const individual = assignStepModels({}, ['write'], modelB)
  const all = assignStepModels(individual, llmKeys, modelA)
  assert.deepEqual(Object.values(all), [modelA, modelA, modelA])
  const mixed = assignStepModels(all, ['write'], modelB)
  assert.deepEqual(llmKeys.map((key) => mixed[key].provider_model_id), ['model-a', 'model-a', 'model-b'])
})

test('individual model choices work before any bulk change', () => {
  const selected = assignStepModels({}, ['write'], modelB)
  assert.equal(selected.write, modelB)
  assert.equal(selected.recognize, undefined, 'other steps retain their configured models')
})

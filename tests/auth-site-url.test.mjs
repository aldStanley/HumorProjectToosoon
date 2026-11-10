import assert from 'node:assert/strict'
import test from 'node:test'
import { getAuthSiteOrigin, getCanonicalLoginRedirect } from '../src/utils/auth-site-url.ts'

const stable = 'https://humor-project-toosoon-seven.vercel.app'

test('the configured origin is stable despite whitespace, trailing slash, or a pasted path', () => {
  assert.equal(getAuthSiteOrigin(` ${stable}/auth/callback `), stable)
  assert.equal(getAuthSiteOrigin('http://localhost:3003/'), 'http://localhost:3003')
})

test('invalid or non-web site URL configuration fails closed', () => {
  for (const value of [undefined, '', 'invalid', 'javascript:alert(1)', 'https://user:password@example.com']) {
    assert.equal(getAuthSiteOrigin(value), null)
  }
})

test('generated deployment login moves to the stable domain before creating OAuth cookies', () => {
  for (const host of ['humor-project-toosoon-i3b35klfz-aldstanleys-projects.vercel.app', 'humor-project-toosoon-nextcommit-aldstanleys-projects.vercel.app']) {
    assert.equal(getCanonicalLoginRedirect(`https://${host}/auth/login`, stable), `${stable}/auth/login`)
  }
})

test('canonical login does not loop and local sign-in keeps its own local origin', () => {
  assert.equal(getCanonicalLoginRedirect(`${stable}/auth/login`, stable), null)
  assert.equal(getCanonicalLoginRedirect('http://localhost:3003/auth/login', 'http://localhost:3003'), null)
})

test('a deployment redirect never forwards an authorization code or user-controlled destination', () => {
  assert.equal(getCanonicalLoginRedirect('https://deployment.vercel.app/auth/login?code=private-code&next=https://example.com', stable), `${stable}/auth/login`)
})

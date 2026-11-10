// Authentication must start and finish on the same origin: the PKCE verifier
// is stored in a host-only cookie. Never carry an auth code between deployments.
export function getAuthSiteOrigin(siteUrl: string | undefined): string | null {
  if (!siteUrl?.trim()) return null
  try {
    const url = new URL(siteUrl.trim())
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    return url.origin
  } catch {
    return null
  }
}

export function getCanonicalLoginRedirect(requestUrl: string, siteOrigin: string): string | null {
  if (new URL(requestUrl).origin === siteOrigin) return null
  return new URL('/auth/login', siteOrigin).toString()
}

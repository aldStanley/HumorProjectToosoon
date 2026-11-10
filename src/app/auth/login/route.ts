import { NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { getAuthSiteOrigin, getCanonicalLoginRedirect } from '@/utils/auth-site-url'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const siteUrl = getAuthSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  const origin = siteUrl ?? requestUrl.origin
  if (!siteUrl) {
    return NextResponse.redirect(
      `${origin}/login?message=` +
        encodeURIComponent(
          'Site URL is not configured. Please try again later.'
        ),
      303
    )
  }

  // Move to the stable domain BEFORE Supabase sets the PKCE verifier cookie.
  // A 307 keeps the form POST, so login continues without another button click.
  const canonicalLogin = getCanonicalLoginRedirect(request.url, siteUrl)
  if (canonicalLogin) return NextResponse.redirect(canonicalLogin, 307)

  const redirectTo = new URL('/auth/callback', siteUrl)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo.toString(),
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect(
      `${origin}/login?message=` +
        encodeURIComponent('Unable to sign in right now. Please try again.'),
      303
    )
  }

  return NextResponse.redirect(data.url, 303)
}

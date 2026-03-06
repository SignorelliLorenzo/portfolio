const productionSiteUrl = 'https://signorellilorenzo.github.io'

const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const siteUrl = (envSiteUrl && envSiteUrl.length > 0 ? envSiteUrl : productionSiteUrl).replace(/\/+$/, '')

export function absoluteUrl(pathname = '/'): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalizedPath, `${siteUrl}/`).toString()
}

import { publicPath } from '@/lib/publicPath'

/** Static brand files (mixed extensions) under `public/images/logos` */
const LOGOS_BASE = 'images/logos'

/**
 * Screenshots / exports keyed by hostname with dots replaced by hyphens
 * (e.g. acp-mn.com → acp-mn-com). Filenames match app/public/images/providers/.
 */
export const PROVIDER_SCREENSHOT_BY_SLUG: Readonly<Record<string, string>> = {
  'healthyminds-io': 'images/providers/healthyminds-io.png',
  'hppsychological-com': 'images/providers/hppsychological-com.png',
  'lmhc-org': 'images/providers/lmhc-org.png',
  'acp-mn-com': 'images/providers/acp-mn-com.png',
  'artofcounselingstpaul-com': 'images/providers/artofcounselingstpaul-com.jpg',
  'autonomycounseling-com': 'images/providers/autonomycounseling-com.png',
  'choicespsychotherapy-net': 'images/providers/choicespsychotherapy-net.png',
  'dbt-ptsdspecialists-com': 'images/providers/dbt-ptsdspecialists-com.png',
  'dbtassociates-com': 'images/providers/dbtassociates-com.png',
  'elevacare-org': 'images/providers/elevacare-org.png',
  'familyservicerochester-org': 'images/providers/familyservicerochester-org.png',
  'healingconnectionsonline-com': 'images/providers/healingconnectionsonline-com.jpg',
  'highlandmeadowscc-com': 'images/providers/highlandmeadowscc-com.png',
  'imaginemhc-com': 'images/providers/imaginemhc-com.png',
  'imsofmn-com': 'images/providers/imsofmn-com.png',
  'lifedrs-com': 'images/providers/lifedrs-com.png',
  'lighthousecfs-com': 'images/providers/lighthousecfs-com.jpg',
  'mapbhc-com': 'images/providers/mapbhc-com.png',
  'mhs-dbt-com': 'images/providers/mhs-dbt-com.png',
  'mindfullyhealing-com': 'images/providers/mindfullyhealing-com.png',
  'minnesotacenterforpsychology-com': 'images/providers/minnesotacenterforpsychology-com.png',
  'natalispsychology-com': 'images/providers/natalispsychology-com.jpg',
  'nbminnesota-com': 'images/providers/nbminnesota-com.png',
  'npmh-org': 'images/providers/npmh-org.png',
  'nystromcounseling-com': 'images/providers/nystromcounseling-com.svg',
  'securebasecounselingcenter-com': 'images/providers/securebasecounselingcenter-com.png',
  'olmstedcounty-gov': 'images/providers/olmstedcounty-gov.png',
  'omnimentalhealth-com': 'images/providers/omnimentalhealth-com.png',
  'parkercollins-com': 'images/providers/parkercollins-com.png',
  'riverstonepsych-com': 'images/providers/riverstonepsych-com.png',
  'solutionsinpractice-org': 'images/providers/solutionsinpractice-org.png',
  'south-metro-org': 'images/providers/south-metro-org.png',
  'southbridgecounseling-com': 'images/providers/southbridgecounseling-com.jpg',
  'tubman-org': 'images/providers/tubman-org.png',
  'voamnwi-org': 'images/providers/voamnwi-org.png',
  'washburn-org': 'images/providers/washburn-org.png',
  'wholeheartedhealingllc-com': 'images/providers/wholeheartedhealingllc-com.png',
  'wmhcinc-org': 'images/providers/wmhcinc-org.png',
}

/**
 * Hosts whose logo lives under `images/logos/` with a different basename than the
 * domain slug used in `images/providers/`.
 */
const LOGO_FILE_BY_HOST: Readonly<Record<string, string>> = {
  'ascpsychological.com': `${LOGOS_BASE}/asc-psychological-services.webp`,
  'abhtherapy.com': `${LOGOS_BASE}/advanded-behavioral-health-inc.png`,
  'alignyoursoulcounseling.com': `${LOGOS_BASE}/align-your-soul.jpg`,
  'tinytreecounseling.com': `${LOGOS_BASE}/tiny-tree-counseling.png`,
}

function normalizeWebsiteHost(website: string): string {
  try {
    const { hostname } = new URL(website)
    return hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * Turn a CMS/local JSON image value into a browser URL.
 * - Full http(s) URLs: unchanged.
 * - Absolute paths: `/images/...` (Vite `public/`) get `BASE_URL`; other roots (e.g. Craft `/uploads/`) unchanged.
 * - Bare filenames resolve under `images/logos/`.
 * If still empty, uses website hostname → providers slug map, then host aliases.
 */
export function resolveProviderLogoUrl(imageField: string, website: string): string {
  const trimmed = imageField.trim()
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('/')) {
      if (trimmed.startsWith('/images/')) {
        return publicPath(trimmed.slice(1))
      }
      return trimmed
    }
    if (trimmed.includes('/')) {
      return publicPath(trimmed)
    }
    return publicPath(`${LOGOS_BASE}/${trimmed}`)
  }

  const host = normalizeWebsiteHost(website)
  if (!host) return ''

  const alias = LOGO_FILE_BY_HOST[host]
  if (alias) return publicPath(alias)

  const slug = host.replace(/\./g, '-')
  const mapped = PROVIDER_SCREENSHOT_BY_SLUG[slug]
  return mapped ? publicPath(mapped) : ''
}

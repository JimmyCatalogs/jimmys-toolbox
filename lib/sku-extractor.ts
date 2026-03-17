export type ClientKey = 'herrschners' | 'veseys'

export interface SkuResult {
  sku: string
  searchSku: string
  searchUrl: string
}

export const CLIENT_CONFIGS: Record<ClientKey, {
  label: string
  pattern: RegExp
  buildSearchSku: (sku: string) => string
  buildUrl: (searchSku: string) => string
}> = {
  herrschners: {
    label: 'Herrschners',
    pattern: /\b[A-Z]{2}\d{6}\b/g,
    buildSearchSku: (sku) => sku.slice(2),
    buildUrl: (searchSku) => `herrschners.com/search.php?search_query=${searchSku}`,
  },
  veseys: {
    label: "Vesey's",
    pattern: /\b\d{5}\b/g,
    buildSearchSku: (sku) => sku,
    buildUrl: (searchSku) => `https://www.veseys.com/ca/catalogsearch/result/?q=${searchSku}`,
  },
}

export function extractSkus(text: string, client: ClientKey): SkuResult[] {
  const config = CLIENT_CONFIGS[client]
  const seen = new Set<string>()
  const results: SkuResult[] = []

  // Reset lastIndex since we reuse the pattern
  const pattern = new RegExp(config.pattern.source, config.pattern.flags)
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const sku = match[0]
    if (!seen.has(sku)) {
      seen.add(sku)
      const searchSku = config.buildSearchSku(sku)
      results.push({
        sku,
        searchSku,
        searchUrl: config.buildUrl(searchSku),
      })
    }
  }

  return results
}

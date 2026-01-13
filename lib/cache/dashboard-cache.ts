/**
 * Cache para dashboard e métricas
 * TTL configurável por tipo de dado
 */

const CACHE_TTL = {
  dashboard: 60 * 1000, // 1 minuto
  metrics: 5 * 60 * 1000, // 5 minutos
  processes: 30 * 1000, // 30 segundos
} as const

type CacheKey = keyof typeof CACHE_TTL

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>()

  get<T>(key: string, type: CacheKey): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, type: CacheKey): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL[type],
    })
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

// Singleton instance
export const dashboardCache = new DashboardCache()

/**
 * Helper para cachear resultados de queries
 */
export async function withCache<T>(
  key: string,
  type: CacheKey,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = dashboardCache.get<T>(key, type)
  if (cached !== null) {
    return cached
  }

  const data = await fn()
  dashboardCache.set(key, data, type)
  return data
}



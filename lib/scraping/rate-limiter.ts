// Rate limiter avançado para nosso sistema de scraping

interface RateLimitInfo {
  maxRequests: number
  timeWindow: number
  currentRequests: number
  nextAvailable: number
}

export class RateLimiter {
  private maxRequests: number
  private timeWindow: number
  private requests: number[]
  private ipLimits: Map<string, { count: number; resetTime: number }>
  
  constructor(maxRequests: number = 5, timeWindow: number = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
    this.ipLimits = new Map()
  }

  async acquire(ip?: string): Promise<void> {
    const now = Date.now()
    
    // Rate limiting por IP (se fornecido)
    if (ip) {
      const ipLimit = this.ipLimits.get(ip)
      
      if (ipLimit && now < ipLimit.resetTime) {
        if (ipLimit.count >= this.maxRequests) {
          const waitTime = ipLimit.resetTime - now
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      } else {
        this.ipLimits.set(ip, { 
          count: 0, 
          resetTime: now + this.timeWindow 
        })
      }
      
      const currentIpLimit = this.ipLimits.get(ip)!
      currentIpLimit.count++
    }
    
    // Rate limiting global
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0]
      const waitTime = this.timeWindow - (now - oldest)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.requests.push(now)
  }

  getInfo(ip?: string): RateLimitInfo {
    const now = Date.now()
    const currentRequests = this.requests.filter(time => now - time < this.timeWindow).length
    
    let nextAvailable = 0
    if (currentRequests >= this.maxRequests) {
      const oldest = this.requests[0]
      nextAvailable = this.timeWindow - (now - oldest)
    }
    
    if (ip) {
      const ipLimit = this.ipLimits.get(ip)
      if (ipLimit && now < ipLimit.resetTime) {
        nextAvailable = Math.max(nextAvailable, ipLimit.resetTime - now)
      }
    }
    
    return {
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
      currentRequests,
      nextAvailable
    }
  }

  clearIpLimit(ip: string) {
    this.ipLimits.delete(ip)
  }

  clearAll() {
    this.requests = []
    this.ipLimits.clear()
  }

  // Método para verificar se pode fazer request sem bloquear
  canMakeRequest(ip?: string): boolean {
    const now = Date.now()
    
    // Verificar limite global
    const currentGlobal = this.requests.filter(time => now - time < this.timeWindow).length
    if (currentGlobal >= this.maxRequests) {
      return false
    }
    
    // Verificar limite por IP
    if (ip) {
      const ipLimit = this.ipLimits.get(ip)
      if (ipLimit && now < ipLimit.resetTime && ipLimit.count >= this.maxRequests) {
        return false
      }
    }
    
    return true
  }
}
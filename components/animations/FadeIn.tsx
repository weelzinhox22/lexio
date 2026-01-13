'use client'

import { useGsapFadeIn } from '@/lib/hooks/useGsapAnimation'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

/**
 * Componente wrapper para animação de fade in
 * 
 * @example
 * <FadeIn delay={0.2}>
 *   <Card>Conteúdo aqui</Card>
 * </FadeIn>
 */
export function FadeIn({ children, delay = 0, duration = 0.6, className = '' }: FadeInProps) {
  const ref = useGsapFadeIn(delay, duration)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}













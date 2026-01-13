'use client'

import { useGsapStagger } from '@/lib/hooks/useGsapAnimation'
import type { ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  staggerTime?: number
  className?: string
}

/**
 * Componente container para animação de stagger
 * Os elementos filhos devem ter a classe 'stagger-item'
 * 
 * @example
 * <StaggerContainer staggerTime={0.1}>
 *   <Card className="stagger-item">Card 1</Card>
 *   <Card className="stagger-item">Card 2</Card>
 *   <Card className="stagger-item">Card 3</Card>
 * </StaggerContainer>
 */
export function StaggerContainer({ 
  children, 
  staggerTime = 0.1, 
  className = '' 
}: StaggerContainerProps) {
  const ref = useGsapStagger(staggerTime)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}













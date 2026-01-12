'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

/**
 * Componente de loading com animação de dots pulsando
 * 
 * @example
 * <LoadingDots size="md" color="bg-primary" />
 */
export function LoadingDots({ size = 'md', color = 'bg-primary' }: LoadingDotsProps) {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  }

  useEffect(() => {
    const validDots = dotsRef.current.filter(Boolean)
    
    gsap.to(validDots, {
      y: -10,
      stagger: 0.15,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      duration: 0.6,
    })
  }, [])

  return (
    <div className={`flex items-center justify-center ${gapClasses[size]}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            dotsRef.current[i] = el
          }}
          className={`${sizeClasses[size]} ${color} rounded-full`}
        />
      ))}
    </div>
  )
}











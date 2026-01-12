'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Hook para animação ao fazer scroll usando Intersection Observer
 * Alternativa ao ScrollTrigger para uso gratuito
 */
export function useScrollAnimation(
  options: {
    trigger?: string | number
    start?: string
    end?: string
    toggleActions?: string
  } = {},
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.from(element, {
              opacity: 0,
              y: 50,
              duration: 0.8,
              ease: 'power3.out',
            })
            observer.unobserve(element)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}

/**
 * Hook para animação de múltiplos elementos com stagger ao fazer scroll
 */
export function useScrollStagger(
  selector: string = '.stagger-item',
  staggerDelay: number = 0.1,
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const container = ref.current
    const items = container.querySelectorAll(selector)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.from(items, {
              opacity: 0,
              y: 60,
              stagger: staggerDelay,
              duration: 0.6,
              ease: 'power2.out',
            })
            observer.unobserve(container)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [selector, staggerDelay])

  return ref
}










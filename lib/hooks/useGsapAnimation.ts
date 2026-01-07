'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Hook para animação de fade in com GSAP
 * @param delay - Delay em segundos antes da animação começar
 * @param duration - Duração da animação em segundos
 * @returns ref - Ref para aplicar no elemento
 */
export function useGsapFadeIn(delay = 0, duration = 0.6) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      opacity: 0,
      y: 20,
      duration,
      delay,
      ease: 'power2.out',
    })
  }, [delay, duration])

  return ref
}

/**
 * Hook para animação de scale in com GSAP
 * @param delay - Delay em segundos antes da animação começar
 * @returns ref - Ref para aplicar no elemento
 */
export function useGsapScaleIn(delay = 0) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      delay,
      ease: 'back.out(1.2)',
    })
  }, [delay])

  return ref
}

/**
 * Hook para animação de slide in (esquerda para direita)
 * @param delay - Delay em segundos antes da animação começar
 * @returns ref - Ref para aplicar no elemento
 */
export function useGsapSlideIn(delay = 0) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.from(ref.current, {
      x: -50,
      opacity: 0,
      duration: 0.6,
      delay,
      ease: 'power3.out',
    })
  }, [delay])

  return ref
}

/**
 * Hook para animação de stagger (múltiplos elementos)
 * @param staggerTime - Tempo entre cada elemento (em segundos)
 * @param selector - Seletor CSS dos elementos filhos
 * @returns ref - Ref para aplicar no elemento container
 */
export function useGsapStagger(staggerTime = 0.1, selector = '.stagger-item') {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const items = ref.current.querySelectorAll(selector)

    gsap.from(items, {
      opacity: 0,
      y: 20,
      stagger: staggerTime,
      duration: 0.5,
      ease: 'power2.out',
    })
  }, [staggerTime, selector])

  return ref
}

/**
 * Hook para animação de rotação/hover customizado
 * @returns ref - Ref para aplicar no elemento
 */
export function useGsapHover() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return ref
}



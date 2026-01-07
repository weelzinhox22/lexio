# 🎨 Guia de Implementação GSAP - Lexio

✅ **GSAP instalado com sucesso!**

## 📦 O Que Foi Criado

### 1. Hooks Customizados (`lib/hooks/useGsapAnimation.ts`)

#### `useGsapFadeIn`
Anima elementos com fade in + movimento vertical
```tsx
import { useGsapFadeIn } from '@/lib/hooks/useGsapAnimation'

function MyComponent() {
  const ref = useGsapFadeIn(0.2) // delay de 0.2s
  return <div ref={ref}>Conteúdo</div>
}
```

#### `useGsapScaleIn`
Anima elementos com efeito de escala (zoom in)
```tsx
const ref = useGsapScaleIn(0.1)
return <Card ref={ref}>Card animado</Card>
```

#### `useGsapSlideIn`
Anima elementos deslizando da esquerda
```tsx
const ref = useGsapSlideIn()
return <div ref={ref}>Slide in!</div>
```

#### `useGsapStagger`
Anima múltiplos elementos em sequência
```tsx
const ref = useGsapStagger(0.1) // 0.1s entre cada
return (
  <div ref={ref}>
    <div className="stagger-item">Item 1</div>
    <div className="stagger-item">Item 2</div>
    <div className="stagger-item">Item 3</div>
  </div>
)
```

#### `useGsapHover`
Adiciona animação de hover automática
```tsx
const ref = useGsapHover()
return <button ref={ref}>Hover me!</button>
```

---

### 2. Componentes Prontos

#### `<FadeIn>` (`components/animations/FadeIn.tsx`)
Wrapper simples para fade in
```tsx
import { FadeIn } from '@/components/animations/FadeIn'

<FadeIn delay={0.2}>
  <Card>Seu conteúdo aqui</Card>
</FadeIn>
```

#### `<StaggerContainer>` (`components/animations/StaggerContainer.tsx`)
Container para animação em cascata
```tsx
import { StaggerContainer } from '@/components/animations/StaggerContainer'

<StaggerContainer staggerTime={0.1}>
  <Card className="stagger-item">Card 1</Card>
  <Card className="stagger-item">Card 2</Card>
  <Card className="stagger-item">Card 3</Card>
</StaggerContainer>
```

#### `<LoadingDots>` (`components/animations/LoadingDots.tsx`)
Loading animado com dots pulsando
```tsx
import { LoadingDots } from '@/components/animations/LoadingDots'

<LoadingDots size="md" color="bg-primary" />
```

---

## 🎯 Como Implementar nos Componentes Existentes

### Dashboard Page (`app/dashboard/page.tsx`)

**Antes:**
```tsx
export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Processos" value="12" />
        <StatsCard title="Prazos" value="5" />
        <StatsCard title="Clientes" value="23" />
      </div>
    </div>
  )
}
```

**Depois:**
```tsx
import { FadeIn } from '@/components/animations/FadeIn'
import { StaggerContainer } from '@/components/animations/StaggerContainer'

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <FadeIn>
        <h1>Dashboard</h1>
      </FadeIn>
      
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard className="stagger-item" title="Processos" value="12" />
        <StatsCard className="stagger-item" title="Prazos" value="5" />
        <StatsCard className="stagger-item" title="Clientes" value="23" />
      </StaggerContainer>
    </div>
  )
}
```

---

### Listas de Processos (`components/processes/process-list.tsx`)

**Antes:**
```tsx
export function ProcessList({ processes }) {
  return (
    <div className="space-y-4">
      {processes.map(p => (
        <ProcessCard key={p.id} process={p} />
      ))}
    </div>
  )
}
```

**Depois:**
```tsx
import { useGsapStagger } from '@/lib/hooks/useGsapAnimation'

export function ProcessList({ processes }) {
  const containerRef = useGsapStagger(0.1)
  
  return (
    <div ref={containerRef} className="space-y-4">
      {processes.map(p => (
        <ProcessCard 
          key={p.id} 
          className="stagger-item"
          process={p} 
        />
      ))}
    </div>
  )
}
```

---

### Cards Individuais (`components/ui/card.tsx`)

Adicione hover suave aos cards:

```tsx
'use client'
import { useGsapHover } from '@/lib/hooks/useGsapAnimation'

export function Card({ children, ...props }) {
  const ref = useGsapHover()
  
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}
```

---

### Modal/Dialog (`components/ui/dialog.tsx`)

Adicione animação de entrada/saída:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Dialog({ isOpen, children }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen && overlayRef.current && contentRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3
      })
      gsap.from(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.2)'
      })
    }
  }, [isOpen])

  return (
    <>
      <div ref={overlayRef} className="dialog-overlay">
        <div ref={contentRef} className="dialog-content">
          {children}
        </div>
      </div>
    </>
  )
}
```

---

### Loading States

Substitua spinners por LoadingDots:

**Antes:**
```tsx
{isLoading && <Spinner />}
```

**Depois:**
```tsx
import { LoadingDots } from '@/components/animations/LoadingDots'

{isLoading && <LoadingDots />}
```

---

## 🎬 Exemplos Avançados

### Scroll Trigger (anima ao rolar)

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function StatsSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    gsap.from(sectionRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 50,
      duration: 0.8
    })
  }, [])

  return (
    <section ref={sectionRef}>
      {/* conteúdo */}
    </section>
  )
}
```

### Contador Animado

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function AnimatedCounter({ value }: { value: number }) {
  const counterRef = useRef({ val: 0 })
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    gsap.to(counterRef.current, {
      val: value,
      duration: 2,
      ease: 'power1.out',
      onUpdate: () => {
        if (displayRef.current) {
          displayRef.current.textContent = Math.floor(counterRef.current.val).toString()
        }
      }
    })
  }, [value])

  return <span ref={displayRef}>0</span>
}
```

### Timeline Complexa (múltiplas animações)

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function ComplexAnimation() {
  const containerRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    
    tl.from('.title', {
      opacity: 0,
      y: -30,
      duration: 0.6
    })
    .from('.subtitle', {
      opacity: 0,
      y: -20,
      duration: 0.5
    }, '-=0.3') // Começa 0.3s antes da anterior terminar
    .from('.content', {
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      ease: 'back.out(1.2)'
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div ref={containerRef}>
      <h1 className="title">Lexio</h1>
      <p className="subtitle">Sistema de Gestão Jurídica</p>
      <div className="content">{/* conteúdo */}</div>
    </div>
  )
}
```

---

## 📋 Checklist de Implementação

### Prioridade Alta (Faça primeiro):
- [ ] Dashboard cards - `<StaggerContainer>`
- [ ] Lista de processos - `useGsapStagger`
- [ ] Lista de clientes - `useGsapStagger`
- [ ] Modais/Dialogs - animação de entrada
- [ ] Loading states - `<LoadingDots>`

### Prioridade Média:
- [ ] Cards com hover - `useGsapHover`
- [ ] Sidebar - slide in/out
- [ ] Forms - `<FadeIn>` nos inputs
- [ ] Notificações/Toasts - slide in
- [ ] Tabs - fade entre conteúdos

### Prioridade Baixa:
- [ ] Gráficos - animação progressiva
- [ ] Calendar - transição entre meses
- [ ] Scroll animations - ScrollTrigger
- [ ] Contadores animados
- [ ] Animações complexas (timeline)

---

## 🎨 Dicas de Uso

### 1. Performance
- Use `will-change: transform` em CSS para elementos animados
- Evite animar `width`, `height`, `top`, `left` (use `transform` em vez)
- Prefira `opacity` e `transform` (são mais performáticos)

### 2. Duração
- **Rápido:** 0.2-0.3s (hover, clicks)
- **Normal:** 0.4-0.6s (entrada de elementos)
- **Lento:** 0.8-1.2s (animações especiais)

### 3. Easing
- `power2.out` - suave e natural
- `back.out()` - bounce sutil
- `elastic.out()` - bounce pronunciado
- `power3.out` - mais agressivo

### 4. Stagger
- Lista pequena: 0.05-0.1s
- Lista média: 0.1-0.15s
- Lista grande: 0.05s (mais rápido)

---

## 🚀 Próximos Passos

1. **Implemente nos componentes prioritários** (dashboard, listas)
2. **Teste em diferentes dispositivos** (mobile, desktop)
3. **Ajuste durações/delays** conforme necessário
4. **Adicione scroll triggers** em seções longas
5. **Crie variações** para diferentes contextos

---

## 🆘 Troubleshooting

### Animação não funciona
- Certifique-se de usar `'use client'` no topo do arquivo
- Verifique se o ref está aplicado corretamente
- Use `console.log` para debug

### Animação "pula"
- Adicione `will-change: transform` no CSS
- Reduza a duração
- Simplifique a animação

### Performance ruim
- Reduza número de elementos animados
- Use `stagger` menor
- Evite animar propriedades pesadas

---

**Animações implementadas! 🎉**
Agora é só aplicar nos componentes conforme a prioridade.



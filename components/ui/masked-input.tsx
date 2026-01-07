'use client'

import { Input } from '@/components/ui/input'
import { formatCPFCNPJ, formatPhone, formatProcessNumber } from '@/lib/utils/masks'
import { useState, useEffect } from 'react'

interface MaskedInputProps extends React.ComponentProps<'input'> {
  mask: 'cpf-cnpj' | 'phone' | 'process'
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function MaskedInput({ mask, value = '', onChange, ...props }: MaskedInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value) {
      let formatted = ''
      switch (mask) {
        case 'cpf-cnpj':
          formatted = formatCPFCNPJ(value)
          break
        case 'phone':
          formatted = formatPhone(value)
          break
        case 'process':
          formatted = formatProcessNumber(value)
          break
      }
      setDisplayValue(formatted)
    } else {
      setDisplayValue('')
    }
  }, [value, mask])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    let formatted = ''
    
    switch (mask) {
      case 'cpf-cnpj':
        formatted = formatCPFCNPJ(inputValue)
        break
      case 'phone':
        formatted = formatPhone(inputValue)
        break
      case 'process':
        formatted = formatProcessNumber(inputValue)
        break
    }
    
    setDisplayValue(formatted)
    
    // Cria um evento sintético com o valor formatado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange?.(syntheticEvent)
  }

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
    />
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CurrencyInputProps {
  value?: number | string
  onChange?: (value: number) => void
  currency?: string
  onCurrencyChange?: (currency: string) => void
  className?: string
  required?: boolean
  id?: string
  name?: string
}

const currencies = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
]

export function CurrencyInput({
  value = 0,
  onChange,
  currency = 'BRL',
  onCurrencyChange,
  className,
  required,
  id,
  name,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (typeof value === 'number' && value > 0) {
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      setDisplayValue(formatted)
    } else if (typeof value === 'string' && value) {
      setDisplayValue(value)
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value

    // Remove tudo exceto números e vírgula
    inputValue = inputValue.replace(/[^\d,]/g, '')

    // Garante apenas uma vírgula
    const parts = inputValue.split(',')
    if (parts.length > 2) {
      inputValue = parts[0] + ',' + parts.slice(1).join('')
    }

    // Limita a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
      inputValue = parts[0] + ',' + parts[1].substring(0, 2)
    }

    setDisplayValue(inputValue)

    // Converte para número (substitui vírgula por ponto)
    const numericValue = parseFloat(inputValue.replace(',', '.')) || 0
    onChange?.(numericValue)
  }

  const selectedCurrency = currencies.find((c) => c.code === currency) || currencies[0]

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          id={id}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          required={required}
          className={className}
        />
      </div>
      <Select value={currency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.code}>
              {curr.symbol} {curr.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}













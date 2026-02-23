'use client'

import { useState, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

function formatInitial(value: number | string | undefined): string {
  if (typeof value === 'number' && value > 0) {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (typeof value === 'string' && value) {
    return value
  }
  return ''
}

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
  // Only format the initial value once, then let the user type freely
  const [displayValue, setDisplayValue] = useState(() => formatInitial(value))
  const initializedRef = useRef(false)

  // If the external value changes and user hasn't interacted yet, update display
  // But once user starts typing, we don't override
  if (!initializedRef.current && typeof value === 'number' && value > 0 && displayValue === '') {
    const formatted = formatInitial(value)
    if (formatted !== displayValue) {
      setDisplayValue(formatted)
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    initializedRef.current = true
    let inputValue = e.target.value

    // Allow digits, comma, and dot
    inputValue = inputValue.replace(/[^\d.,]/g, '')

    // Replace dot with comma for consistency in pt-BR
    inputValue = inputValue.replace(/\./g, ',')

    // Ensure only one comma
    const parts = inputValue.split(',')
    if (parts.length > 2) {
      inputValue = parts[0] + ',' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      inputValue = parts[0] + ',' + parts[1].substring(0, 2)
    }

    setDisplayValue(inputValue)

    // Convert to number
    const numericValue = parseFloat(inputValue.replace(',', '.')) || 0
    onChange?.(numericValue)
  }, [onChange])

  const handleBlur = useCallback(() => {
    // On blur, format nicely if there's a value
    const numericValue = parseFloat(displayValue.replace(',', '.')) || 0
    if (numericValue > 0) {
      setDisplayValue(
        numericValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    } else {
      setDisplayValue('')
    }
  }, [displayValue])

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
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

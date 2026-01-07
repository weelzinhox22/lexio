'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.ComponentProps<'input'> {
  className?: string
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 hover:text-slate-700 transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}


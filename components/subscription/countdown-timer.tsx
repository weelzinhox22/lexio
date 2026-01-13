'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: string | Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        <Clock className="h-4 w-4" />
        <span>Expirado</span>
      </div>
    )
  }

  const isUrgent = timeLeft.days <= 7

  return (
    <div className={`flex items-center gap-3 ${isUrgent ? 'text-orange-600' : 'text-slate-700'}`}>
      <Clock className={`h-4 w-4 ${isUrgent ? 'text-orange-600 animate-pulse' : ''}`} />
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
            <span className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs text-slate-500">dias</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <span className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-slate-500">horas</span>
        </div>
        <div className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <span className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-slate-500">min</span>
        </div>
        <div className="flex flex-col items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-slate-200">
          <span className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-slate-500">seg</span>
        </div>
      </div>
    </div>
  )
}











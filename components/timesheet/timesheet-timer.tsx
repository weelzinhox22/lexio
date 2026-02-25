"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, X, Clock } from "lucide-react"
import { NewEntryDialog } from "./new-entry-dialog"

export function TimesheetTimer({ processes, clients }: { processes: any[], clients: any[] }) {
    const [isRunning, setIsRunning] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [showTimer, setShowTimer] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setSeconds((s) => s + 1)
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRunning])

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        setIsRunning(true)
        setShowTimer(true)
    }

    const handleStop = () => {
        setIsRunning(false)
        setOpenDialog(true)
    }

    const handleClose = () => {
        setIsRunning(false)
        setShowTimer(false)
        setSeconds(0)
    }

    const initialHours = Math.floor(seconds / 3600).toString()
    const initialMinutes = Math.floor((seconds % 3600) / 60).toString()

    return (
        <>
            <Button variant="outline" className="w-full sm:w-auto font-medium" onClick={handleStart} disabled={isRunning}>
                <Play className="h-4 w-4 mr-2 text-green-600" />
                {isRunning ? "Timer Ativo" : "Iniciar Timer"}
            </Button>

            {showTimer && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-4 py-2 px-4 animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                        <span className="font-mono text-xl font-medium tracking-wider w-[100px] text-center">
                            {formatTime(seconds)}
                        </span>
                    </div>

                    <div className="bg-slate-700 w-px h-6 mx-1"></div>

                    <div className="flex items-center gap-2">
                        {isRunning ? (
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-full" onClick={handleStop} title="Parar e Salvar">
                                <Square className="h-4 w-4 fill-current" />
                            </Button>
                        ) : (
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-green-400 hover:text-green-300 hover:bg-slate-800 rounded-full" onClick={handleStart} title="Retomar">
                                <Play className="h-4 w-4 fill-current" />
                            </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-full" onClick={handleClose} title="Descartar">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            {openDialog && (
                <NewEntryDialog
                    processes={processes}
                    clients={clients}
                    injectOpen={openDialog}
                    onInjectOpenChange={(o) => {
                        setOpenDialog(o)
                        if (!o && !isRunning) {
                            handleClose()
                        }
                    }}
                    injectedDuration={{ hours: initialHours, minutes: initialMinutes }}
                />
            )}
        </>
    )
}

"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
    isCollapsed: boolean
    toggleSidebar: () => void
    setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // Initialize from localStorage and screen width
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed")
        if (saved !== null) {
            setIsCollapsed(saved === "true")
        } else {
            // Default behavior: collapsed on smaller screens, expanded on larger
            setIsCollapsed(window.innerWidth < 1280)
        }
        setIsInitialized(true)
    }, [])

    // Save to localStorage when changed
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("sidebar-collapsed", String(isCollapsed))
        }
    }, [isCollapsed, isInitialized])

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // If window gets small but still above mobile breakpoint, maybe collapse automatically?
            // For now, let's just let the user control it unless it's the first visit.
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const toggleSidebar = () => setIsCollapsed((prev) => !prev)
    const setCollapsed = (collapsed: boolean) => setIsCollapsed(collapsed)

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}

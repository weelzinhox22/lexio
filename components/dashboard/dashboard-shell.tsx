"use client"

import React from "react"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
    children: React.ReactNode
    sidebar: React.ReactNode
    header: React.ReactNode
    banner?: React.ReactNode
    notifications?: React.ReactNode
    assistant?: React.ReactNode
}

export function DashboardShell({
    children,
    sidebar,
    header,
    banner,
    notifications,
    assistant,
}: DashboardShellProps) {
    const { isCollapsed } = useSidebar()

    return (
        <div className="flex min-h-screen bg-slate-50">
            {sidebar}
            <div
                className={cn(
                    "flex flex-1 flex-col w-full transition-all duration-300 ease-in-out",
                    isCollapsed ? "lg:pl-20" : "lg:pl-64"
                )}
            >
                {header}
                {banner}
                <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
                {notifications}
                {assistant}
            </div>
        </div>
    )
}

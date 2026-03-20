'use client'

import { useToolsConsent } from '@/lib/hooks/use-tools-consent'
import { ToolsConsentModal } from '@/components/tools/tools-consent-modal'

export function ToolsConsentWrapper({ children }: { children: React.ReactNode }) {
  const { showConsentModal, isLoadingConsent, handleAcceptConsent, userId } = useToolsConsent()

  if (isLoadingConsent) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 text-slate-500 font-medium">
          <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
          Preparando ambiente seguro...
        </div>
      </div>
    )
  }

  return (
    <>
      <ToolsConsentModal
        isOpen={showConsentModal}
        userId={userId}
        onAccept={handleAcceptConsent}
      />
      <div className={showConsentModal ? 'pointer-events-none blur-sm opacity-40 select-none transition-all duration-500' : 'transition-all duration-500'}>
        {children}
      </div>
    </>
  )
}

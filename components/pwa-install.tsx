"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    }
  }

  if (!showInstallPrompt && !isIOS) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-primary/20 bg-card/95 backdrop-blur-sm md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install Faspay</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isIOS
                ? "Tap the share button and select 'Add to Home Screen'"
                : "Install our app for a better experience"}
            </p>
          </div>
          <div className="flex gap-2">
            {!isIOS && (
              <Button size="sm" onClick={handleInstallClick} className="h-8">
                <Download className="h-3 w-3 mr-1" />
                Install
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowInstallPrompt(false)} className="h-8 w-8 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

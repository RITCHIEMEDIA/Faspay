"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { NotificationData } from "@/lib/notifications"

interface ToastNotificationProps {
  notification: NotificationData
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export function ToastNotification({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)

    // Auto close
    if (autoClose && notification.priority !== "urgent") {
      const closeTimer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => {
        clearTimeout(timer)
        clearTimeout(closeTimer)
      }
    }

    return () => clearTimeout(timer)
  }, [autoClose, duration, notification.priority])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case "transaction":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "security":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "account":
        return <Info className="h-5 w-5 text-blue-500" />
      case "system":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "urgent":
        return "border-red-500 bg-red-50 dark:bg-red-950"
      case "high":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950"
      case "medium":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950"
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-950"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className={`w-80 shadow-lg ${getPriorityColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.icon ? <span className="text-lg">{notification.icon}</span> : getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold truncate">{notification.title}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {notification.priority}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleClose}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
              {notification.actionUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => {
                    window.location.href = notification.actionUrl!
                    handleClose()
                  }}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Toast container component
export function ToastContainer() {
  const [toasts, setToasts] = useState<NotificationData[]>([])

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<NotificationData>) => {
      const notification = event.detail
      setToasts((prev) => [...prev, notification])
    }

    window.addEventListener("showToast" as any, handleNewNotification)
    return () => window.removeEventListener("showToast" as any, handleNewNotification)
  }, [])

  const removeToast = (notificationId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== notificationId))
  }

  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} notification={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  )
}

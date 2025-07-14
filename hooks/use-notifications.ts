"use client"

import { useEffect, useState } from "react"
import {
  getUserNotifications,
  addNotification,
  createTransactionNotification,
  createSecurityNotification,
  showLocalNotification,
  type NotificationData,
} from "@/lib/notifications"

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    const loadNotifications = () => {
      const userNotifications = getUserNotifications()
      setNotifications(userNotifications)
    }

    loadNotifications()

    // Listen for new notifications
    const handleNewNotification = () => {
      loadNotifications()
    }

    window.addEventListener("notificationAdded", handleNewNotification)
    return () => window.removeEventListener("notificationAdded", handleNewNotification)
  }, [])

  const sendNotification = (notification: NotificationData) => {
    addNotification(notification)
    showLocalNotification(notification)

    // Show toast notification
    window.dispatchEvent(new CustomEvent("showToast", { detail: notification }))
  }

  const sendTransactionNotification = (
    type: "sent" | "received" | "failed",
    amount: number,
    otherParty: string,
    transactionId: string,
  ) => {
    const notification = createTransactionNotification(type, amount, otherParty, transactionId)
    sendNotification(notification)
  }

  const sendSecurityNotification = (
    type: "login" | "password_change" | "suspicious_activity",
    details: Record<string, any>,
  ) => {
    const notification = createSecurityNotification(type, details)
    sendNotification(notification)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    sendNotification,
    sendTransactionNotification,
    sendSecurityNotification,
  }
}

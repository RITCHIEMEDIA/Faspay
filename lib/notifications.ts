"use client"

export interface NotificationData {
  id: string
  title: string
  message: string
  type: "transaction" | "security" | "account" | "system" | "marketing"
  priority: "urgent" | "high" | "medium" | "low"
  timestamp: string
  read: boolean
  actionUrl?: string
  icon?: string
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  categories: {
    transactions: boolean
    security: boolean
    account: boolean
    system: boolean
    marketing: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: false,
  emailEnabled: true,
  smsEnabled: false,
  categories: {
    transactions: true,
    security: true,
    account: true,
    system: true,
    marketing: false,
  },
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00",
  },
}

// Local storage keys
const NOTIFICATIONS_KEY = "faspay_notifications"
const SETTINGS_KEY = "faspay_notification_settings"

// Get notification settings
export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  const settings = localStorage.getItem(SETTINGS_KEY)
  if (!settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
    return DEFAULT_SETTINGS
  }

  return { ...DEFAULT_SETTINGS, ...JSON.parse(settings) }
}

// Update notification settings
export const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
  if (typeof window === "undefined") return

  const currentSettings = getNotificationSettings()
  const newSettings = { ...currentSettings, ...updates }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))

  // Trigger settings update event
  window.dispatchEvent(new CustomEvent("notificationSettingsUpdated", { detail: newSettings }))
}

// Get user notifications
export const getUserNotifications = (): NotificationData[] => {
  if (typeof window === "undefined") return []

  const notifications = localStorage.getItem(NOTIFICATIONS_KEY)
  if (!notifications) return []

  return JSON.parse(notifications).sort(
    (a: NotificationData, b: NotificationData) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
}

// Add notification
export const addNotification = (notification: NotificationData) => {
  if (typeof window === "undefined") return

  const notifications = getUserNotifications()
  notifications.unshift(notification)

  // Keep only last 100 notifications
  const trimmedNotifications = notifications.slice(0, 100)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmedNotifications))

  // Trigger notification added event
  window.dispatchEvent(new CustomEvent("notificationAdded", { detail: notification }))
}

// Mark notification as read
export const markNotificationAsRead = (notificationId: string) => {
  if (typeof window === "undefined") return

  const notifications = getUserNotifications()
  const updatedNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications))
}

// Mark all notifications as read
export const markAllNotificationsAsRead = () => {
  if (typeof window === "undefined") return

  const notifications = getUserNotifications()
  const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications))
}

// Check if in quiet hours
export const isInQuietHours = (): boolean => {
  const settings = getNotificationSettings()
  if (!settings.quietHours.enabled) return false

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  const [startHour, startMin] = settings.quietHours.start.split(":").map(Number)
  const [endHour, endMin] = settings.quietHours.end.split(":").map(Number)

  const startTime = startHour * 60 + startMin
  const endTime = endHour * 60 + endMin

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime <= endTime
  }
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission === "denied") {
    return "denied"
  }

  const permission = await Notification.requestPermission()
  return permission
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9LUhbXy45ZJAkLTqFkMUFflpQiuXiUOT5BpbtyVa1ZzJSMuF8QX8",
      ),
    })

    // Store subscription (in a real app, send to server)
    localStorage.setItem("faspay_push_subscription", JSON.stringify(subscription))

    return subscription
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error)
    return null
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Show local notification
export const showLocalNotification = (notification: NotificationData) => {
  const settings = getNotificationSettings()

  // Check if category is enabled
  if (!settings.categories[notification.type]) return

  // Check quiet hours for non-urgent notifications
  if (notification.priority !== "urgent" && isInQuietHours()) return

  // Show browser notification if permission granted
  if (settings.pushEnabled && Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: notification.id,
      data: notification,
      requireInteraction: notification.priority === "urgent",
    })
  }
}

// Create transaction notification
export const createTransactionNotification = (
  type: "sent" | "received" | "failed",
  amount: number,
  otherParty: string,
  transactionId: string,
): NotificationData => {
  const baseNotification = {
    id: `txn_${transactionId}_${Date.now()}`,
    type: "transaction" as const,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/dashboard/history`,
    metadata: { transactionId, amount, otherParty },
  }

  switch (type) {
    case "sent":
      return {
        ...baseNotification,
        title: "Money Sent",
        message: `$${amount.toFixed(2)} sent to ${otherParty}`,
        priority: "medium",
        icon: "💸",
      }
    case "received":
      return {
        ...baseNotification,
        title: "Money Received",
        message: `$${amount.toFixed(2)} received from ${otherParty}`,
        priority: "high",
        icon: "💰",
      }
    case "failed":
      return {
        ...baseNotification,
        title: "Transaction Failed",
        message: `Failed to send $${amount.toFixed(2)} to ${otherParty}`,
        priority: "high",
        icon: "❌",
      }
  }
}

// Create security notification
export const createSecurityNotification = (
  type: "login" | "password_change" | "suspicious_activity",
  details: Record<string, any>,
): NotificationData => {
  const baseNotification = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "security" as const,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/dashboard/settings`,
    metadata: details,
  }

  switch (type) {
    case "login":
      return {
        ...baseNotification,
        title: "New Login",
        message: `Login from ${details.location || "unknown location"}`,
        priority: "medium",
        icon: "🔐",
      }
    case "password_change":
      return {
        ...baseNotification,
        title: "Password Changed",
        message: "Your password has been successfully changed",
        priority: "high",
        icon: "🔑",
      }
    case "suspicious_activity":
      return {
        ...baseNotification,
        title: "Suspicious Activity",
        message: details.message || "Unusual activity detected on your account",
        priority: "urgent",
        icon: "⚠️",
      }
  }
}

// Create account notification
export const createAccountNotification = (
  type: "kyc_approved" | "kyc_rejected" | "profile_updated",
  details: Record<string, any> = {},
): NotificationData => {
  const baseNotification = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: "account" as const,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: `/dashboard/settings`,
    metadata: details,
  }

  switch (type) {
    case "kyc_approved":
      return {
        ...baseNotification,
        title: "Account Verified",
        message: "Your identity verification has been approved",
        priority: "high",
        icon: "✅",
      }
    case "kyc_rejected":
      return {
        ...baseNotification,
        title: "Verification Failed",
        message: "Your identity verification was rejected. Please try again.",
        priority: "high",
        icon: "❌",
      }
    case "profile_updated":
      return {
        ...baseNotification,
        title: "Profile Updated",
        message: "Your profile information has been updated",
        priority: "low",
        icon: "👤",
      }
  }
}

// Create system notification
export const createSystemNotification = (
  title: string,
  message: string,
  priority: NotificationData["priority"] = "medium",
): NotificationData => {
  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    message,
    type: "system",
    priority,
    timestamp: new Date().toISOString(),
    read: false,
    icon: "⚙️",
  }
}

// Initialize notifications system
export const initializeNotifications = async () => {
  // Register service worker
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js")
    } catch (error) {
      console.error("Service worker registration failed:", error)
    }
  }

  // Add some demo notifications for new users
  const notifications = getUserNotifications()
  if (notifications.length === 0) {
    const welcomeNotification = createSystemNotification(
      "Welcome to Faspay!",
      "Your account is ready. Start sending and receiving money securely.",
      "high",
    )
    addNotification(welcomeNotification)
  }
}

"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationData,
} from "@/lib/notifications"

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isOpen, setIsOpen] = useState(false)

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

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return "💰"
      case "security":
        return "🔐"
      case "account":
        return "👤"
      case "system":
        return "⚙️"
      default:
        return "📢"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p>}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification.id)
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="text-lg">{notification.icon || getTypeIcon(notification.type)}</div>
                          <div className={`w-2 h-2 rounded-full mt-1 ${getPriorityColor(notification.priority)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(notification.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

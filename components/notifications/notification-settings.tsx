"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, MessageSquare, Clock } from "lucide-react"
import {
  getNotificationSettings,
  updateNotificationSettings,
  subscribeToPushNotifications,
  requestNotificationPermission,
  type NotificationSettings,
} from "@/lib/notifications"

export function NotificationSettingsCard() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default")

  useEffect(() => {
    const currentSettings = getNotificationSettings()
    setSettings(currentSettings)

    if ("Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    if (!settings) return

    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
    updateNotificationSettings({ [key]: value })
  }

  const handleCategoryChange = (category: keyof NotificationSettings["categories"], enabled: boolean) => {
    if (!settings) return

    const updatedCategories = { ...settings.categories, [category]: enabled }
    const updatedSettings = { ...settings, categories: updatedCategories }
    setSettings(updatedSettings)
    updateNotificationSettings({ categories: updatedCategories })
  }

  const handleQuietHoursChange = (key: keyof NotificationSettings["quietHours"], value: any) => {
    if (!settings) return

    const updatedQuietHours = { ...settings.quietHours, [key]: value }
    const updatedSettings = { ...settings, quietHours: updatedQuietHours }
    setSettings(updatedSettings)
    updateNotificationSettings({ quietHours: updatedQuietHours })
  }

  const handleEnablePushNotifications = async () => {
    const permission = await requestNotificationPermission()
    setPermissionStatus(permission)

    if (permission === "granted") {
      const subscription = await subscribeToPushNotifications()
      setPushSubscription(subscription)
      handleSettingChange("pushEnabled", true)
    }
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>Receive instant notifications on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified instantly about important events</p>
            </div>
            <div className="flex items-center space-x-2">
              {permissionStatus === "denied" && <Badge variant="destructive">Blocked</Badge>}
              {permissionStatus === "granted" && <Badge variant="default">Enabled</Badge>}
              {permissionStatus === "default" && (
                <Button size="sm" onClick={handleEnablePushNotifications}>
                  Enable
                </Button>
              )}
              <Switch
                checked={settings.pushEnabled && permissionStatus === "granted"}
                onCheckedChange={(checked) => handleSettingChange("pushEnabled", checked)}
                disabled={permissionStatus !== "granted"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email & SMS */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => handleSettingChange("emailEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
              </div>
            </div>
            <Switch
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => handleSettingChange("smsEnabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>Choose which types of notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>💰 Transactions</Label>
              <p className="text-sm text-muted-foreground">Money sent, received, and payment confirmations</p>
            </div>
            <Switch
              checked={settings.categories.transactions}
              onCheckedChange={(checked) => handleCategoryChange("transactions", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>🔐 Security</Label>
              <p className="text-sm text-muted-foreground">Login alerts, password changes, and security warnings</p>
            </div>
            <Switch
              checked={settings.categories.security}
              onCheckedChange={(checked) => handleCategoryChange("security", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>👤 Account</Label>
              <p className="text-sm text-muted-foreground">Profile updates, verification status, and account changes</p>
            </div>
            <Switch
              checked={settings.categories.account}
              onCheckedChange={(checked) => handleCategoryChange("account", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>⚙️ System</Label>
              <p className="text-sm text-muted-foreground">Maintenance updates and system announcements</p>
            </div>
            <Switch
              checked={settings.categories.system}
              onCheckedChange={(checked) => handleCategoryChange("system", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>📢 Marketing</Label>
              <p className="text-sm text-muted-foreground">Promotions, new features, and product updates</p>
            </div>
            <Switch
              checked={settings.categories.marketing}
              onCheckedChange={(checked) => handleCategoryChange("marketing", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Quiet Hours</span>
          </CardTitle>
          <CardDescription>Pause non-urgent notifications during specific hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={settings.quietHours.enabled}
              onCheckedChange={(checked) => handleQuietHoursChange("enabled", checked)}
            />
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => handleQuietHoursChange("start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => handleQuietHoursChange("end", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

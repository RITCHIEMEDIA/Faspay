"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Lock, Unlock, Shield } from "lucide-react"
import type { User } from "@/lib/auth"

interface AccountFreezeProps {
  user: User
  onStatusChange: (userId: string, isActive: boolean, reason: string) => void
}

export function AccountFreeze({ user, onStatusChange }: AccountFreezeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [freezeType, setFreezeType] = useState("temporary")
  const [showConfirm, setShowConfirm] = useState(false)

  const handleFreeze = async () => {
    if (!reason.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onStatusChange(user.id, false, reason)
      setIsLoading(false)
      setShowConfirm(false)
      setReason("")
    }, 1000)
  }

  const handleUnfreeze = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onStatusChange(user.id, true, "Account unfrozen by admin")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Account Security</span>
        </CardTitle>
        <CardDescription>Freeze or unfreeze user account for security purposes</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            {user.isActive ? <Unlock className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-red-600" />}
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">
                {user.isActive ? "Active and operational" : "Frozen - transactions disabled"}
              </p>
            </div>
          </div>
          <Badge variant={user.isActive ? "default" : "destructive"}>{user.isActive ? "Active" : "Frozen"}</Badge>
        </div>

        {user.isActive ? (
          /* Freeze Account Section */
          <div className="space-y-4">
            {!showConfirm ? (
              <Button variant="destructive" onClick={() => setShowConfirm(true)} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Freeze Account
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert className="border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    This will immediately freeze the account and prevent all transactions.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="freezeType">Freeze Type</Label>
                  <Select value={freezeType} onValueChange={setFreezeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temporary">Temporary (24 hours)</SelectItem>
                      <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                      <SelectItem value="compliance">Compliance Review</SelectItem>
                      <SelectItem value="manual">Manual Review Required</SelectItem>
                      <SelectItem value="permanent">Permanent Closure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Freezing</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide detailed reason for account freeze..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirm(false)
                      setReason("")
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleFreeze}
                    disabled={!reason.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Freezing..." : "Confirm Freeze"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Unfreeze Account Section */
          <div className="space-y-4">
            <Alert className="border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                This account is currently frozen. User cannot perform any transactions.
              </AlertDescription>
            </Alert>

            <Button
              variant="default"
              onClick={handleUnfreeze}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Unlock className="h-4 w-4 mr-2" />
              {isLoading ? "Unfreezing..." : "Unfreeze Account"}
            </Button>
          </div>
        )}

        {/* Freeze History */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Recent Security Actions</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Login</span>
              <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">2FA Status</span>
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                {user.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

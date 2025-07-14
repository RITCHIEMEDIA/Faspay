"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Shield, Key, CheckCircle, AlertTriangle, Clock, Phone } from "lucide-react"

interface RecoveryMethod {
  id: string
  type: "email" | "phone" | "security_questions" | "backup_codes"
  label: string
  description: string
  isEnabled: boolean
  lastUsed?: string
}

export function AccountRecovery() {
  const [step, setStep] = useState<"select" | "verify" | "reset" | "success">("select")
  const [selectedMethod, setSelectedMethod] = useState<RecoveryMethod | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const recoveryMethods: RecoveryMethod[] = [
    {
      id: "email",
      type: "email",
      label: "Email Recovery",
      description: "Send recovery link to your registered email",
      isEnabled: true,
      lastUsed: "2024-01-15",
    },
    {
      id: "phone",
      type: "phone",
      label: "SMS Recovery",
      description: "Send verification code to your phone",
      isEnabled: true,
      lastUsed: "2024-01-10",
    },
    {
      id: "security",
      type: "security_questions",
      label: "Security Questions",
      description: "Answer your security questions",
      isEnabled: true,
      lastUsed: "Never",
    },
    {
      id: "backup",
      type: "backup_codes",
      label: "Backup Codes",
      description: "Use one of your backup recovery codes",
      isEnabled: true,
      lastUsed: "Never",
    },
  ]

  const handleMethodSelect = async (method: RecoveryMethod) => {
    setSelectedMethod(method)
    setIsLoading(true)
    setError("")

    // Simulate sending recovery code/email
    setTimeout(() => {
      setStep("verify")
      setIsLoading(false)
    }, 2000)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode.trim()) return

    setIsLoading(true)
    setError("")

    // Simulate verification
    setTimeout(() => {
      if (verificationCode === "123456" || verificationCode.length >= 6) {
        setStep("reset")
      } else {
        setError("Invalid verification code. Please try again.")
      }
      setIsLoading(false)
    }, 1500)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate password reset
    setTimeout(() => {
      setStep("success")
      setIsLoading(false)
    }, 2000)
  }

  const getMethodIcon = (type: RecoveryMethod["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />
      case "phone":
        return <Phone className="h-5 w-5" />
      case "security_questions":
        return <Shield className="h-5 w-5" />
      case "backup_codes":
        return <Key className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  if (step === "success") {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Reset Successful</h2>
          <p className="text-muted-foreground mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full bg-primary hover:bg-primary/90 text-black"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "reset") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Create a new secure password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            {error && (
              <Alert className="border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Password Requirements:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
                <li>• Include at least one special character</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full bg-primary hover:bg-primary/90 text-black"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (step === "verify") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Your Identity</CardTitle>
          <CardDescription>
            {selectedMethod?.type === "email" && "Check your email for a verification code"}
            {selectedMethod?.type === "phone" && "Enter the code sent to your phone"}
            {selectedMethod?.type === "security_questions" && "Answer your security questions"}
            {selectedMethod?.type === "backup_codes" && "Enter one of your backup codes"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              {selectedMethod && getMethodIcon(selectedMethod.type)}
              <div>
                <p className="font-medium">{selectedMethod?.label}</p>
                <p className="text-sm text-muted-foreground">{selectedMethod?.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">
                {selectedMethod?.type === "backup_codes" ? "Backup Code" : "Verification Code"}
              </Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={selectedMethod?.type === "backup_codes" ? "Enter backup code" : "Enter 6-digit code"}
                required
                maxLength={selectedMethod?.type === "backup_codes" ? 12 : 6}
              />
            </div>

            {error && (
              <Alert className="border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1 bg-transparent"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !verificationCode.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-black"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>

            {selectedMethod?.type === "email" && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => handleMethodSelect(selectedMethod)}
                  className="text-sm"
                >
                  Didn't receive the email? Resend
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Account Recovery</CardTitle>
        <CardDescription>Choose how you'd like to recover your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Select a recovery method to regain access to your account securely.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {recoveryMethods.map((method) => (
            <div key={method.id}>
              <Button
                variant="outline"
                onClick={() => handleMethodSelect(method)}
                disabled={!method.isEnabled || isLoading}
                className="w-full justify-start h-auto p-4 bg-transparent"
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    {getMethodIcon(method.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{method.label}</p>
                      <Badge variant={method.isEnabled ? "default" : "secondary"}>
                        {method.isEnabled ? "Available" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    {method.lastUsed && (
                      <p className="text-xs text-muted-foreground">
                        Last used:{" "}
                        {method.lastUsed === "Never" ? "Never" : new Date(method.lastUsed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Button>
              {isLoading && selectedMethod?.id === method.id && (
                <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending recovery information...
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Still having trouble accessing your account?</p>
          <Button variant="link" className="text-sm">
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

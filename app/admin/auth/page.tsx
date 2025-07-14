"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react"
import { loginAdmin, type AdminCredentials } from "@/lib/auth"

export default function AdminAuthPage() {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    email: "",
    password: "",
    twoFactorCode: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"credentials" | "2fa">("credentials")
  const router = useRouter()

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (credentials.email === "admin@faspay.com" && credentials.password === "FaspayAdmin2024!") {
      setStep("2fa")
    } else {
      setError("Invalid email or password")
    }

    setIsLoading(false)
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const admin = loginAdmin(credentials)
    if (admin) {
      router.push("/admin")
    } else {
      setError("Invalid 2FA code")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold gold-text-gradient">Admin Access</CardTitle>
          <CardDescription>
            {step === "credentials" ? "Enter your admin credentials" : "Enter your 2FA code to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@faspay.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">2FA Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={credentials.twoFactorCode}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, twoFactorCode: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setStep("credentials")
                    setError("")
                  }}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Login"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
            <p className="text-xs text-muted-foreground">Email: admin@faspay.com</p>
            <p className="text-xs text-muted-foreground">Password: FaspayAdmin2024!</p>
            <p className="text-xs text-muted-foreground">2FA Code: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

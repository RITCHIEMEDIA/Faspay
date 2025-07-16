"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react"

export default function AdminAuthPage() {
  const [credentials, setCredentials] = useState({
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

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    })
    const data = await res.json()
    setIsLoading(false)

    if (res.ok) {
      setStep("2fa")
    } else {
      setError(data.error || "Invalid email or password")
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...credentials }),
    })
    const data = await res.json()
    setIsLoading(false)

    if (res.ok) {
      // TODO: Store session/cookie here
      router.push("/admin")
    } else {
      setError(data.error || "Invalid 2FA code")
    }
  }

  // const [formData, setFormData] = useState({
  //   recipientId: "",
  //   amount: "",
  //   type: "admin_credit",
  //   reason: "",
  //   note: "",
  //   senderName: admin ? admin.name : "Admin",
  // })

  const handleSendMoney = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await processTransaction(
        admin.id,
        selectedUser.id,
        amount,
        `${formData.reason} - ${formData.note}`.trim(),
        formData.type,
        formData.senderName
      )
      // handle result (show success, update UI, etc.)
    } catch (error) {
      setError("Transaction failed")
    } finally {
      setIsLoading(false)
    }
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
                  placeholder="admin@gmail.com"
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
                  placeholder="1234"
                  maxLength={6}
                  value={credentials.twoFactorCode}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, twoFactorCode: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the 2FA code (demo: 1234)</p>
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
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, getAllUsers, processTransaction, type User as UserType } from "@/lib/auth"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

export default function SendMoneyPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [recentBeneficiaries, setRecentBeneficiaries] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    note: "",
  })
  const [recipientUser, setRecipientUser] = useState<UserType | null>(null)
  const [step, setStep] = useState<"form" | "confirm" | "processing" | "success" | "pin">("form")
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const router = useRouter()
  const { sendTransactionNotification } = useNotifications()

  useEffect(() => {
    async function fetchData() {
      // Get current user from API
      const userRes = await fetch("/api/current-user")
      if (!userRes.ok) {
        router.push("/auth/login")
        return
      }
      const userData = await userRes.json()
      setUser(userData)

      // Get all users from API
      const usersRes = await fetch("/api/users")
      const users = await usersRes.json()
      setAllUsers(users.filter((u: UserType) => u.role === "user" && u.id !== userData.id))

      // Fetch transactions where user is sender
      const txRes = await fetch("/api/transactions")
      const txs = await txRes.json()
      const sentTxs = txs.filter((t: any) => t.fromUserId === userData.id)

      // Get unique recipient IDs, most recent first
      const uniqueRecipientIds: string[] = []
      sentTxs.forEach((t: any) => {
        if (!uniqueRecipientIds.includes(t.toUserId)) {
          uniqueRecipientIds.push(t.toUserId)
        }
      })

      // Map to user objects
      const beneficiaries = users.filter((u: UserType) => uniqueRecipientIds.includes(u.id))
      setRecentBeneficiaries(beneficiaries)
    }
    fetchData()
  }, [router])

  useEffect(() => {
    if (formData.recipient) {
      const foundUser = allUsers.find(
        (u) => u.email.toLowerCase() === formData.recipient.toLowerCase() || u.phone === formData.recipient,
      )
      setRecipientUser(foundUser || null)
    } else {
      setRecipientUser(null)
    }
  }, [formData.recipient, allUsers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !recipientUser) return

    const amount = Number.parseFloat(formData.amount)
    if (amount <= 0) {
      setAlert({ type: "error", message: "Please enter a valid amount" })
      return
    }

    if (amount > user.balance) {
      setAlert({ type: "error", message: "Insufficient funds" })
      return
    }

    setStep("confirm")
  }

  const handleConfirm = async () => {
    setStep("pin")
  }

  const handlePinAndSend = async () => {
    setPinError("")
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError("PIN must be exactly 4 digits.")
      return
    }
    // Verify PIN via API
    const res = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    })
    if (!res.ok) {
      const data = await res.json()
      setPinError(data.error || "PIN verification failed")
      return
    }
    // If PIN is correct, proceed with transaction as before
    await handleSendTransaction()
  }

  const handleSendTransaction = async () => {
    if (!user || !recipientUser) return

    setStep("processing")
    setIsLoading(true)
    setAlert(null)

    try {
      const amount = Number.parseFloat(formData.amount)
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: recipientUser.id,
          amount,
          description: formData.note || `Payment to ${recipientUser.name}`,
          type: "send",
        }),
      })
      const result = await res.json()

      if (result.success) {
        sendTransactionNotification("sent", amount, recipientUser.name, result.transaction!.id)
        setUser((prev) => (prev ? { ...prev, balance: prev.balance - amount } : null))
        setStep("success")
        setAlert({ type: "success", message: "Money sent successfully!" })
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } else {
        setAlert({ type: "error", message: result.error || "Transaction failed" })
        setStep("form")
      }
    } catch (error) {
      console.error("Transaction error:", error)
      setAlert({ type: "error", message: "An unexpected error occurred" })
      setStep("form")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === "confirm") {
      setStep("form")
    } else {
      router.push("/dashboard")
    }
  }

  const resetForm = () => {
    setFormData({ recipient: "", amount: "", note: "" })
    setRecipientUser(null)
    setStep("form")
    setAlert(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Send Money</h1>
          </div>
          <Badge variant="outline" className="text-xs">
            Balance: ${user.balance.toFixed(2)}
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {alert && (
          <Alert className={alert.type === "error" ? "border-red-500" : "border-green-500"}>
            {alert.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <AlertDescription className={alert.type === "error" ? "text-red-700" : "text-green-700"}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {step === "form" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Send Money</span>
              </CardTitle>
              <CardDescription>Transfer money to another Faspay user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Enter email or phone number"
                    value={formData.recipient}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recipient: e.target.value }))}
                    required
                  />
                  {recipientUser && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {recipientUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{recipientUser.name}</p>
                        <p className="text-xs text-muted-foreground">{recipientUser.email}</p>
                      </div>
                    </div>
                  )}
                  {formData.recipient && !recipientUser && <p className="text-xs text-red-500">User not found</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={user.balance}
                      placeholder="0.00"
                      className="pl-10"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Available balance: ${user.balance.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="What's this for?"
                    value={formData.note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-black"
                  disabled={!recipientUser || !formData.amount || isLoading}
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "confirm" && recipientUser && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Transfer</CardTitle>
              <CardDescription>Please review the details before sending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">To</span>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {recipientUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{recipientUser.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-semibold">${Number.parseFloat(formData.amount).toFixed(2)}</span>
                </div>

                {formData.note && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Note</span>
                    <span className="text-sm">{formData.note}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-muted-foreground">New Balance</span>
                  <span className="text-sm font-medium">
                    ${(user.balance - Number.parseFloat(formData.amount)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("form")}>
                  Back
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-black" onClick={handleConfirm}>
                  Send Money
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "pin" && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Enter PIN to Confirm</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For your security, please enter your 4-digit PIN to confirm the transaction.
              </p>
              <div className="flex flex-col items-center space-y-4">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit PIN"
                  className="border rounded px-2 py-1 w-24 text-center"
                />
                <Button onClick={handlePinAndSend} className="w-full bg-primary hover:bg-primary/90 text-black">
                  Confirm Transaction
                </Button>
                {pinError && <div className="text-red-600 text-sm mt-2">{pinError}</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {step === "processing" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Transfer</h3>
              <p className="text-sm text-muted-foreground">Please wait while we process your transaction...</p>
            </CardContent>
          </Card>
        )}

        {step === "success" && recipientUser && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transfer Successful!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ${Number.parseFloat(formData.amount).toFixed(2)} sent to {recipientUser.name}
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={resetForm}>
                  Send Again
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-black">Done</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Send */}
        {step === "form" && allUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Send</CardTitle>
              <CardDescription>Send to recent beneficiaries</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBeneficiaries.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center">No recent beneficiaries.</div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {recentBeneficiaries.slice(0, 6).map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      onClick={() => setFormData((prev) => ({ ...prev, recipient: contact.email }))}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-center">{contact.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

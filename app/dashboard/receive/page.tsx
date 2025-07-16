"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Copy, Share, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  balance: number
}

interface PaymentRequest {
  id: string
  amount: number
  from: string
  status: string
  date: string
}

export default function ReceiveMoneyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [requestAmount, setRequestAmount] = useState("")
  const [requestNote, setRequestNote] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [recentRequests, setRecentRequests] = useState<PaymentRequest[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const userRes = await fetch("/api/current-user")
      if (!userRes.ok) {
        router.push("/auth/login")
        return
      }
      setUser(await userRes.json())
    }
    fetchUser()
  }, [router])

  useEffect(() => {
    async function fetchRequests() {
      if (!user) return
      const res = await fetch("/api/requests")
      if (res.ok) {
        setRecentRequests(await res.json())
      }
    }
    fetchRequests()
  }, [user])

  const handleCopyLink = () => {
    const paymentLink = `https://faspay.com/pay/${user?.id}?amount=${requestAmount}&note=${encodeURIComponent(requestNote)}`
    navigator.clipboard.writeText(paymentLink)
    alert("Payment link copied to clipboard!")
  }

  const handleShare = async () => {
    const paymentLink = `https://faspay.com/pay/${user?.id}?amount=${requestAmount}&note=${encodeURIComponent(requestNote)}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Faspay Payment Request",
          text: `${user?.name} is requesting ${requestAmount ? `$${requestAmount}` : "a payment"} via Faspay`,
          url: paymentLink,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      handleCopyLink()
    }
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
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Request Money</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowDownLeft className="h-5 w-5 text-primary" />
              <span>Request Payment</span>
            </CardTitle>
            <CardDescription>Create a payment request to share with others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">What's this for?</Label>
              <Textarea
                id="note"
                placeholder="Dinner, rent, etc."
                className="resize-none"
                rows={3}
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleCopyLink} variant="outline" className="w-full bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={handleShare} className="w-full bg-primary hover:bg-primary/90 text-black">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-primary" />
              <span>QR Code</span>
            </CardTitle>
            <CardDescription>Let others scan to pay you instantly</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/30">
              <div className="text-center space-y-2">
                <QrCode className="h-16 w-16 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">QR Code</p>
                <p className="text-xs text-muted-foreground">Scan to pay {user.name}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowQR(!showQR)}>
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Your Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Payment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Faspay ID</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">@{user.name.toLowerCase().replace(" ", "")}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`@${user.name.toLowerCase().replace(" ", "")}`)
                      alert("Faspay ID copied!")
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Email</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(user.email)
                      alert("Email copied!")
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests.length === 0 ? (
              <div className="text-muted-foreground text-sm">No recent requests.</div>
            ) : (
              recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      ${request.amount.toFixed(2)} from {request.from}
                    </p>
                    <p className="text-xs text-muted-foreground">{request.date}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        request.status === "Paid"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

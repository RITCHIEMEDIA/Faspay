"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Plus, Eye, EyeOff, Lock, Unlock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/lib/auth"
import Link from "next/link"

interface BankCard {
  id: string
  type: "virtual" | "physical"
  number: string
  expiryDate: string
  cvv: string
  status: "active" | "frozen" | "cancelled"
  spendingLimit: number
  currentSpending: number
  isDefault: boolean
}

export default function CardsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [cards, setCards] = useState<BankCard[]>([
    {
      id: "card_1",
      type: "virtual",
      number: "4532 1234 5678 9012",
      expiryDate: "12/27",
      cvv: "123",
      status: "active",
      spendingLimit: 5000,
      currentSpending: 1250,
      isDefault: true,
    },
    {
      id: "card_2",
      type: "physical",
      number: "4532 9876 5432 1098",
      expiryDate: "08/26",
      cvv: "456",
      status: "active",
      spendingLimit: 10000,
      currentSpending: 3200,
      isDefault: false,
    },
  ])
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({})
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("faspay_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  const toggleCardStatus = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, status: card.status === "active" ? "frozen" : "active" } : card,
      ),
    )
  }

  const getCardGradient = (type: string, status: string) => {
    if (status === "frozen") return "bg-gradient-to-br from-gray-400 to-gray-600"
    if (type === "virtual") return "bg-gradient-to-br from-primary to-primary/80"
    return "bg-gradient-to-br from-slate-800 to-slate-900"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "frozen":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
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
            <h1 className="text-lg font-semibold">My Cards</h1>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Cards List */}
        {cards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            {/* Card Visual */}
            <div className={`${getCardGradient(card.type, card.status)} p-6 text-white relative`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm opacity-80">Faspay {card.type === "virtual" ? "Virtual" : "Physical"}</p>
                  {card.isDefault && (
                    <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-white/30">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={() => toggleCardDetails(card.id)}
                  >
                    {showCardDetails[card.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-lg font-mono tracking-wider">
                    {showCardDetails[card.id] ? card.number : "•••• •••• •••• " + card.number.slice(-4)}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-80">VALID THRU</p>
                    <p className="font-mono">{showCardDetails[card.id] ? card.expiryDate : "••/••"}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">CVV</p>
                    <p className="font-mono">{showCardDetails[card.id] ? card.cvv : "•••"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80">{user.name.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Card Status</p>
                  <Badge variant="secondary" className={getStatusColor(card.status)}>
                    {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {card.status === "active" ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-yellow-500" />
                  )}
                  <Switch checked={card.status === "active"} onCheckedChange={() => toggleCardStatus(card.id)} />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Spending this month</span>
                    <span>
                      {formatCurrency(card.currentSpending)} / {formatCurrency(card.spendingLimit)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (card.currentSpending / card.spendingLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Card Type</p>
                    <p className="font-medium capitalize">{card.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Spending Limit</p>
                    <p className="font-medium">{formatCurrency(card.spendingLimit)}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${card.status === "active" ? "text-yellow-600" : "text-green-600"}`}
                  onClick={() => toggleCardStatus(card.id)}
                >
                  {card.status === "active" ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Freeze
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unfreeze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Card */}
        <Card className="border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-8 text-center">
            <Plus className="h-12 w-12 mx-auto text-primary/50 mb-4" />
            <h3 className="font-semibold mb-2">Add New Card</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a virtual card instantly or order a physical card
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-black">Create Virtual Card</Button>
              <Button variant="outline" className="w-full bg-transparent">
                Order Physical Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Benefits</CardTitle>
            <CardDescription>Enjoy these features with your Faspay cards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">No foreign transaction fees</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Real-time spending notifications</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Instant freeze/unfreeze controls</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Customizable spending limits</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Contactless payments</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

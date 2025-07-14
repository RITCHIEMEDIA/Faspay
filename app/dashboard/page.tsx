"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Send,
  QrCode,
  CreditCard,
  History,
  Settings,
  Bell,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ToastContainer } from "@/components/notifications/notification-toast"
import { getCurrentUser, getUserTransactions, getAllUsers, type Transaction } from "@/lib/auth"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [allUsers, setAllUsers] = useState([])
  const [showBalance, setShowBalance] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { notifications, unreadCount } = useNotifications()

  useEffect(() => {
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/auth/login")
      return
    }

    setUser(userData)
    const userTransactions = getUserTransactions(userData.id)
    setTransactions(userTransactions.slice(0, 5)) // Show last 5 transactions

    const users = getAllUsers()
    setAllUsers(users)
    setIsLoading(false)

    // Listen for real-time transaction updates
    const handleTransactionUpdate = () => {
      const updatedTransactions = getUserTransactions(userData.id)
      setTransactions(updatedTransactions.slice(0, 5))

      // Update user data to reflect balance changes
      const updatedUser = getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    }

    window.addEventListener("transactionAdded", handleTransactionUpdate)
    window.addEventListener("transactionUpdated", handleTransactionUpdate)

    return () => {
      window.removeEventListener("transactionAdded", handleTransactionUpdate)
      window.removeEventListener("transactionUpdated", handleTransactionUpdate)
    }
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.toUserId === user?.id) {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />
    }
    return <ArrowUpRight className="h-4 w-4 text-red-600" />
  }

  const getTransactionAmount = (transaction: Transaction) => {
    const isReceived = transaction.toUserId === user?.id
    const amount = formatCurrency(transaction.amount)
    return isReceived ? `+${amount}` : `-${amount}`
  }

  const getTransactionColor = (transaction: Transaction) => {
    const isReceived = transaction.toUserId === user?.id
    return isReceived ? "text-green-600" : "text-red-600"
  }

  const getOtherPartyName = (transaction: Transaction) => {
    const otherUserId = transaction.toUserId === user?.id ? transaction.fromUserId : transaction.toUserId
    const otherUser = allUsers.find((u) => u.id === otherUserId)
    return otherUser?.name || "Unknown User"
  }

  const getQuickStats = () => {
    const thisMonth = new Date()
    thisMonth.setDate(1)

    const monthlyTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= thisMonth && t.status === "completed",
    )

    const totalSent = monthlyTransactions.filter((t) => t.fromUserId === user?.id).reduce((sum, t) => sum + t.amount, 0)

    const totalReceived = monthlyTransactions
      .filter((t) => t.toUserId === user?.id)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalSent,
      totalReceived,
      transactionCount: monthlyTransactions.length,
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = getQuickStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <ToastContainer />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="text-xs text-muted-foreground">Account: {user.accountNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationCenter />
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <div className="flex items-center space-x-2">
                  <h2 className="text-3xl font-bold">{showBalance ? formatCurrency(user.balance) : "••••••"}</h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowBalance(!showBalance)}>
                    {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Badge variant={user.kycStatus === "verified" ? "default" : "secondary"}>
                {user.kycStatus === "verified" ? "Verified" : "Pending"}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              <Link href="/dashboard/send">
                <Button className="w-full bg-primary hover:bg-primary/90 text-black flex flex-col h-auto py-3">
                  <Send className="h-5 w-5 mb-1" />
                  <span className="text-xs">Send</span>
                </Button>
              </Link>
              <Link href="/dashboard/receive">
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 bg-transparent">
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-xs">Request</span>
                </Button>
              </Link>
              <Link href="/dashboard/cards">
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 bg-transparent">
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Cards</span>
                </Button>
              </Link>
              <Link href="/dashboard/history">
                <Button variant="outline" className="w-full flex flex-col h-auto py-3 bg-transparent">
                  <History className="h-5 w-5 mb-1" />
                  <span className="text-xs">History</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p className="text-sm font-semibold">{formatCurrency(stats.totalReceived)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="text-sm font-semibold">{formatCurrency(stats.totalSent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-sm font-semibold">{stats.transactionCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Link href="/dashboard/history">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No transactions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start by sending money to someone</p>
                <Link href="/dashboard/send">
                  <Button className="bg-primary hover:bg-primary/90 text-black">
                    <Send className="h-4 w-4 mr-2" />
                    Send Money
                  </Button>
                </Link>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium truncate">
                            {transaction.toUserId === user.id ? "From" : "To"} {getOtherPartyName(transaction)}
                          </p>
                          <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${getTransactionColor(transaction)}`}>
                            {getTransactionAmount(transaction)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < transactions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        {!user.twoFactorEnabled && (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Secure Your Account</h4>
                  <p className="text-xs text-muted-foreground">Enable two-factor authentication for better security</p>
                </div>
                <Link href="/dashboard/settings">
                  <Button size="sm" variant="outline">
                    Enable
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

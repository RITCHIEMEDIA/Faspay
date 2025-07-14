"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllTransactions, getAllUsers, type User, type Transaction } from "@/lib/auth"
import Link from "next/link"

export default function TransactionHistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "send" | "receive" | "deposit">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("faspay_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const currentUser = JSON.parse(userData)
    setUser(currentUser)

    const users = getAllUsers()
    setAllUsers(users)

    // Get transactions for current user
    const allTransactions = getAllTransactions()
    const userTransactions = allTransactions.filter(
      (t) => t.fromUserId === currentUser.id || t.toUserId === currentUser.id,
    )

    setTransactions(userTransactions)
    setFilteredTransactions(userTransactions)
  }, [router])

  useEffect(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((transaction) => {
        const otherUser =
          transaction.fromUserId === user?.id
            ? allUsers.find((u) => u.id === transaction.toUserId)
            : allUsers.find((u) => u.id === transaction.fromUserId)

        return (
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          otherUser?.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((transaction) => {
        if (filterType === "send") return transaction.fromUserId === user?.id
        if (filterType === "receive") return transaction.toUserId === user?.id
        return transaction.type === filterType
      })
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === filterStatus)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType, filterStatus, user, allUsers])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.fromUserId === user?.id) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />
    } else {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />
    }
  }

  const getTransactionAmount = (transaction: Transaction) => {
    const isOutgoing = transaction.fromUserId === user?.id
    return isOutgoing ? -transaction.amount : transaction.amount
  }

  const getOtherUser = (transaction: Transaction) => {
    const otherUserId = transaction.fromUserId === user?.id ? transaction.toUserId : transaction.fromUserId
    return allUsers.find((u) => u.id === otherUserId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const totalIncoming = filteredTransactions
    .filter((t) => t.toUserId === user?.id && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOutgoing = filteredTransactions
    .filter((t) => t.fromUserId === user?.id && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

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
            <h1 className="text-lg font-semibold">Transaction History</h1>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-green-500">{formatCurrency(totalIncoming)}</div>
              <p className="text-xs text-muted-foreground">Money In</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-red-500">{formatCurrency(totalOutgoing)}</div>
              <p className="text-xs text-muted-foreground">Money Out</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="send">Sent</SelectItem>
                  <SelectItem value="receive">Received</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No transactions found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => {
              const otherUser = getOtherUser(transaction)
              const amount = getTransactionAmount(transaction)
              const isOutgoing = amount < 0

              return (
                <Card key={transaction.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {getTransactionIcon(transaction)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {transaction.type === "admin_credit"
                              ? "Admin Credit"
                              : isOutgoing
                                ? `To ${otherUser?.name || "Unknown"}`
                                : `From ${otherUser?.name || "Unknown"}`}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${isOutgoing ? "text-red-500" : "text-green-500"}`}>
                          {isOutgoing ? "-" : "+"}
                          {formatCurrency(Math.abs(amount))}
                        </p>
                        <Badge variant="secondary" className={`text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Load More */}
        {filteredTransactions.length > 0 && (
          <Card className="border-dashed border-2 border-muted hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Load more transactions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

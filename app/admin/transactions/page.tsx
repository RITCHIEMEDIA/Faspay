"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Filter,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react"
import { getAllUsers, getAllTransactions, type User, type Transaction } from "@/lib/auth"

export default function AdminTransactions() {
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all")
  const [filterType, setFilterType] = useState<"all" | "send" | "receive" | "admin_credit">("all")

  useEffect(() => {
    const allUsers = getAllUsers()
    const allTransactions = getAllTransactions()

    setUsers(allUsers)
    setTransactions(allTransactions)
    setFilteredTransactions(allTransactions)
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((transaction) => {
        const fromUser = users.find((u) => u.id === transaction.fromUserId)
        const toUser = users.find((u) => u.id === transaction.toUserId)

        return (
          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fromUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          toUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fromUser?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          toUser?.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === filterStatus)
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === filterType)
    }

    setFilteredTransactions(filtered)
  }, [transactions, users, searchTerm, filterStatus, filterType])

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "admin_credit":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "send":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "receive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "admin_credit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleTransactionAction = (transactionId: string, action: string) => {
    switch (action) {
      case "view":
        console.log("Viewing transaction:", transactionId)
        break
      case "retry":
        console.log("Retrying transaction:", transactionId)
        break
      case "cancel":
        console.log("Cancelling transaction:", transactionId)
        break
    }
  }

  const totalVolume = filteredTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)

  const completedCount = filteredTransactions.filter((t) => t.status === "completed").length
  const pendingCount = filteredTransactions.filter((t) => t.status === "pending").length
  const failedCount = filteredTransactions.filter((t) => t.status === "failed").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gold-text-gradient">Transaction Management</h1>
        <p className="text-muted-foreground">Monitor and manage all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Search and filter all transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, description, or user..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === "failed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("failed")}
                >
                  Failed
                </Button>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All Types
                </Button>
                <Button
                  variant={filterType === "send" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("send")}
                >
                  Send
                </Button>
                <Button
                  variant={filterType === "admin_credit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("admin_credit")}
                >
                  Admin
                </Button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const fromUser = users.find((u) => u.id === transaction.fromUserId)
                  const toUser = users.find((u) => u.id === transaction.toUserId)

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-sm">{transaction.reference}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-32">{transaction.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{fromUser?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{fromUser?.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{toUser?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{toUser?.email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getTypeColor(transaction.type)}>
                          {transaction.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(transaction.createdAt)}</div>
                        {transaction.completedAt && (
                          <div className="text-xs text-muted-foreground">
                            Completed: {formatDate(transaction.completedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleTransactionAction(transaction.id, "view")}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {transaction.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleTransactionAction(transaction.id, "retry")}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                              </DropdownMenuItem>
                            )}
                            {transaction.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleTransactionAction(transaction.id, "cancel")}
                                className="text-red-600"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No transactions found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

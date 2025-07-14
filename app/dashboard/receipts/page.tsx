"use client"

import { useState, useEffect } from "react"
import { TransactionReceipt } from "@/components/receipts/transaction-receipt"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Receipt, Search, Download, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth"
import type { Transaction } from "@/lib/auth"

export default function ReceiptsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, filterType, filterStatus])

  const loadTransactions = () => {
    const stored = localStorage.getItem(`faspay_transactions_${user?.id}`)
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.status === filterStatus)
    }

    setFilteredTransactions(filtered)
  }

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

  const downloadAllReceipts = () => {
    const receiptData = filteredTransactions.map((t) => ({
      id: t.id,
      reference: t.reference,
      amount: t.amount,
      type: t.type,
      status: t.status,
      date: t.createdAt,
      description: t.description,
    }))

    const csvContent = [
      "Transaction ID,Reference,Amount,Type,Status,Date,Description",
      ...receiptData.map(
        (t) => `${t.id},${t.reference},${t.amount},${t.type},${t.status},${t.date},"${t.description}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `faspay-receipts-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (selectedTransaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="bg-transparent">
            ← Back to Receipts
          </Button>
        </div>
        <TransactionReceipt transaction={selectedTransaction} user={user!} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Receipts</h1>
          <p className="text-muted-foreground">View and download receipts for all your transactions</p>
        </div>
        <Button onClick={downloadAllReceipts} className="bg-primary hover:bg-primary/90 text-black">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="admin_credit">Admin Credit</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
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

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </p>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last 30 days</span>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your filters to see more results"
                : "You don't have any transactions yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6" onClick={() => setSelectedTransaction(transaction)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {transaction.reference} • {formatDate(transaction.createdAt)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {transaction.type.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {transaction.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.toUserId === user?.id ? "Received" : "Sent"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

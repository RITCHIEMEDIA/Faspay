"use client"

import { useState, useEffect } from "react"
import { DisputeTransaction } from "@/components/support/dispute-transaction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Search, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import type { Transaction } from "@/lib/auth"

interface Dispute {
  id: string
  transactionId: string
  reason: string
  description: string
  status: "pending" | "investigating" | "resolved" | "rejected"
  createdAt: string
  updatedAt: string
  resolution?: string
}

export default function DisputesPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (user) {
      loadTransactions()
      loadDisputes()
    }
  }, [user])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, disputes])

  const loadTransactions = () => {
    const stored = localStorage.getItem(`faspay_transactions_${user?.id}`)
    if (stored) {
      const allTransactions = JSON.parse(stored)
      // Only show completed transactions that can be disputed
      const disputableTransactions = allTransactions.filter(
        (t: Transaction) => t.status === "completed" && (t.fromUserId === user?.id || t.toUserId === user?.id),
      )
      setTransactions(disputableTransactions)
    }
  }

  const loadDisputes = () => {
    const stored = localStorage.getItem(`faspay_disputes_${user?.id}`)
    if (stored) {
      setDisputes(JSON.parse(stored))
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter out transactions that already have disputes
    const disputedTransactionIds = disputes.map((d) => d.transactionId)
    filtered = filtered.filter((t) => !disputedTransactionIds.includes(t.id))

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleDisputeSubmit = (transactionId: string, reason: string, description: string) => {
    const newDispute: Dispute = {
      id: `DSP${Date.now().toString().slice(-6)}`,
      transactionId,
      reason,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedDisputes = [...disputes, newDispute]
    setDisputes(updatedDisputes)
    localStorage.setItem(`faspay_disputes_${user?.id}`, JSON.stringify(updatedDisputes))

    setSelectedTransaction(null)
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

  const getStatusIcon = (status: Dispute["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "investigating":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: Dispute["status"]) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "investigating":
        return "default"
      case "resolved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (selectedTransaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedTransaction(null)} className="bg-transparent">
            ← Back to Disputes
          </Button>
        </div>
        <div className="max-w-2xl mx-auto">
          <DisputeTransaction transaction={selectedTransaction} onDisputeSubmit={handleDisputeSubmit} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Disputes</h1>
        <p className="text-muted-foreground">Report issues with your transactions and track dispute status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{disputes.filter((d) => d.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-xl font-bold">{disputes.filter((d) => d.status === "investigating").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{disputes.filter((d) => d.status === "resolved").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{disputes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Disputes */}
      {disputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Disputes</CardTitle>
            <CardDescription>Track the status of your submitted disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {disputes.map((dispute) => {
                const transaction = transactions.find((t) => t.id === dispute.transactionId)
                return (
                  <div key={dispute.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(dispute.status)}
                        <span className="font-medium">Dispute #{dispute.id}</span>
                        <Badge variant={getStatusColor(dispute.status)}>{dispute.status.toUpperCase()}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(dispute.createdAt)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transaction</p>
                        <p className="font-medium">{transaction ? formatCurrency(transaction.amount) : "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction?.reference || dispute.transactionId}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reason</p>
                        <p className="font-medium capitalize">{dispute.reason.replace("_", " ")}</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-muted-foreground text-sm">Description</p>
                      <p className="text-sm">{dispute.description}</p>
                    </div>

                    {dispute.resolution && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Resolution</p>
                        <p className="text-sm text-green-700 dark:text-green-300">{dispute.resolution}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File New Dispute */}
      <Card>
        <CardHeader>
          <CardTitle>File New Dispute</CardTitle>
          <CardDescription>Select a transaction to dispute</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions by reference, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              You can only dispute completed transactions. Disputes are typically resolved within 3-5 business days.
            </AlertDescription>
          </Alert>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No transactions available to dispute</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "All your transactions have either been disputed or are not eligible for disputes"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.reference} • {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.toUserId === user?.id ? "Received" : "Sent"}
                    </p>
                  </div>
                </div>
              ))}

              {filteredTransactions.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing first 10 results. Use search to find specific transactions.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

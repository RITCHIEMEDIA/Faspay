"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Share, Printer, CheckCircle } from "lucide-react"
import type { Transaction, User } from "@/lib/auth"

interface TransactionReceiptProps {
  transaction: Transaction
  user: User
  otherParty?: User
}

export function TransactionReceipt({ transaction, user, otherParty }: TransactionReceiptProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const downloadReceipt = async () => {
    setIsDownloading(true)

    // Create receipt content
    const receiptContent = `
FASPAY TRANSACTION RECEIPT
========================

Transaction ID: ${transaction.id}
Reference: ${transaction.reference}
Date: ${formatDate(transaction.createdAt)}
Status: ${transaction.status.toUpperCase()}

TRANSACTION DETAILS
==================
Type: ${transaction.type.replace("_", " ").toUpperCase()}
Amount: ${formatCurrency(transaction.amount)}
Description: ${transaction.description}

FROM
====
Name: ${transaction.fromUserId === "admin" ? "Faspay Admin" : user.name}
Account: ${transaction.fromUserId === "admin" ? "ADMIN001" : user.accountNumber}

TO
==
Name: ${otherParty?.name || "Unknown"}
Account: ${otherParty?.accountNumber || "N/A"}

PROCESSING DETAILS
=================
Created: ${formatDate(transaction.createdAt)}
${transaction.completedAt ? `Completed: ${formatDate(transaction.completedAt)}` : ""}
Location: ${transaction.location || "Online"}

This receipt serves as proof of transaction.
For support, contact: support@faspay.com
Faspay - Secure Digital Banking
    `

    // Create and download file
    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `faspay-receipt-${transaction.reference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setTimeout(() => setIsDownloading(false), 1000)
  }

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Faspay Transaction Receipt",
          text: `Transaction ${transaction.reference} - ${formatCurrency(transaction.amount)}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      const receiptText = `Faspay Transaction: ${transaction.reference} - ${formatCurrency(transaction.amount)} - ${formatDate(transaction.createdAt)}`
      navigator.clipboard.writeText(receiptText)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gold-text-gradient">FASPAY</h1>
          <p className="text-xs text-muted-foreground">Transaction Receipt</p>
        </div>
        <CardTitle className="text-lg">
          {transaction.type === "admin_credit"
            ? "Money Received"
            : transaction.toUserId === user.id
              ? "Money Received"
              : "Money Sent"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div className="text-center py-4">
          <p className="text-3xl font-bold">{formatCurrency(transaction.amount)}</p>
          <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="mt-2">
            {transaction.status.toUpperCase()}
          </Badge>
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono">{transaction.id}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono">{transaction.reference}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date & Time</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{transaction.type.replace("_", " ")}</span>
          </div>

          {transaction.description && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Description</span>
              <span className="text-right max-w-32 truncate">{transaction.description}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Parties */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <div className="text-right">
              <p className="font-medium">
                {transaction.fromUserId === "admin"
                  ? "Faspay Admin"
                  : transaction.fromUserId === user.id
                    ? user.name
                    : otherParty?.name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.fromUserId === "admin"
                  ? "ADMIN001"
                  : transaction.fromUserId === user.id
                    ? user.accountNumber
                    : otherParty?.accountNumber || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <div className="text-right">
              <p className="font-medium">
                {transaction.toUserId === user.id ? user.name : otherParty?.name || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transaction.toUserId === user.id ? user.accountNumber : otherParty?.accountNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReceipt}
            disabled={isDownloading}
            className="bg-transparent"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>

          <Button variant="outline" size="sm" onClick={shareReceipt} className="bg-transparent">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={printReceipt} className="bg-transparent">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">This receipt serves as proof of transaction</p>
          <p className="text-xs text-muted-foreground">For support: support@faspay.com</p>
        </div>
      </CardContent>
    </Card>
  )
}

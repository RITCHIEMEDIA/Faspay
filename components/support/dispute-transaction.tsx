"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Transaction } from "@/lib/auth"

interface DisputeTransactionProps {
  transaction: Transaction
  onDisputeSubmit: (transactionId: string, reason: string, description: string) => void
}

export function DisputeTransaction({ transaction, onDisputeSubmit }: DisputeTransactionProps) {
  const [disputeReason, setDisputeReason] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!disputeReason || !description.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onDisputeSubmit(transaction.id, disputeReason, description)
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 1500)
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Dispute Submitted</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your dispute has been submitted successfully. We'll review it within 3-5 business days.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium">Dispute Reference: #DSP{Date.now().toString().slice(-6)}</p>
            <p className="text-xs text-muted-foreground mt-1">You'll receive email updates about your dispute status</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Dispute Transaction</span>
        </CardTitle>
        <CardDescription>Report an issue with this transaction for investigation</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transaction Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(transaction.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono">{transaction.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>{transaction.status}</Badge>
            </div>
          </div>
        </div>

        <Alert className="border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            Disputes can take 3-5 business days to investigate. Fraudulent disputes may result in account restrictions.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disputeReason">Dispute Reason</Label>
            <Select value={disputeReason} onValueChange={setDisputeReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason for dispute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unauthorized">Unauthorized Transaction</SelectItem>
                <SelectItem value="duplicate">Duplicate Charge</SelectItem>
                <SelectItem value="wrong_amount">Wrong Amount Charged</SelectItem>
                <SelectItem value="not_received">Service/Product Not Received</SelectItem>
                <SelectItem value="cancelled_transaction">Cancelled Transaction</SelectItem>
                <SelectItem value="technical_error">Technical Error</SelectItem>
                <SelectItem value="fraud">Suspected Fraud</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include any relevant details that will help us investigate your dispute
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• We'll review your dispute within 24 hours</li>
              <li>• Investigation typically takes 3-5 business days</li>
              <li>• You'll receive email updates on progress</li>
              <li>• Provisional credit may be issued during investigation</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!disputeReason || !description.trim() || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-black"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Dispute"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

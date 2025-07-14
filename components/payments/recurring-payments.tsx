"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, DollarSign, Repeat, Trash2, Edit, Plus } from "lucide-react"

interface RecurringPayment {
  id: string
  recipientName: string
  recipientEmail: string
  amount: number
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  nextPayment: string
  isActive: boolean
  description: string
  createdAt: string
  lastPayment?: string
}

interface RecurringPaymentsProps {
  userId: string
}

export function RecurringPayments({ userId }: RecurringPaymentsProps) {
  const [payments, setPayments] = useState<RecurringPayment[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null)
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    amount: "",
    frequency: "monthly",
    description: "",
    startDate: "",
  })

  useEffect(() => {
    loadRecurringPayments()
  }, [userId])

  const loadRecurringPayments = () => {
    const stored = localStorage.getItem(`faspay_recurring_${userId}`)
    if (stored) {
      setPayments(JSON.parse(stored))
    } else {
      // Demo data
      const demoPayments: RecurringPayment[] = [
        {
          id: "rp_001",
          recipientName: "Netflix",
          recipientEmail: "billing@netflix.com",
          amount: 15.99,
          frequency: "monthly",
          nextPayment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          description: "Netflix subscription",
          createdAt: new Date().toISOString(),
          lastPayment: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "rp_002",
          recipientName: "Spotify",
          recipientEmail: "billing@spotify.com",
          amount: 9.99,
          frequency: "monthly",
          nextPayment: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          description: "Spotify Premium",
          createdAt: new Date().toISOString(),
          lastPayment: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setPayments(demoPayments)
      localStorage.setItem(`faspay_recurring_${userId}`, JSON.stringify(demoPayments))
    }
  }

  const savePayments = (updatedPayments: RecurringPayment[]) => {
    setPayments(updatedPayments)
    localStorage.setItem(`faspay_recurring_${userId}`, JSON.stringify(updatedPayments))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPayment: RecurringPayment = {
      id: `rp_${Date.now()}`,
      recipientName: formData.recipientName,
      recipientEmail: formData.recipientEmail,
      amount: Number.parseFloat(formData.amount),
      frequency: formData.frequency as RecurringPayment["frequency"],
      nextPayment: formData.startDate || new Date().toISOString(),
      isActive: true,
      description: formData.description,
      createdAt: new Date().toISOString(),
    }

    if (editingPayment) {
      const updatedPayments = payments.map((p) =>
        p.id === editingPayment.id ? { ...newPayment, id: editingPayment.id } : p,
      )
      savePayments(updatedPayments)
      setEditingPayment(null)
    } else {
      savePayments([...payments, newPayment])
    }

    setFormData({
      recipientName: "",
      recipientEmail: "",
      amount: "",
      frequency: "monthly",
      description: "",
      startDate: "",
    })
    setShowAddForm(false)
  }

  const togglePayment = (id: string) => {
    const updatedPayments = payments.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    savePayments(updatedPayments)
  }

  const deletePayment = (id: string) => {
    const updatedPayments = payments.filter((p) => p.id !== id)
    savePayments(updatedPayments)
  }

  const editPayment = (payment: RecurringPayment) => {
    setEditingPayment(payment)
    setFormData({
      recipientName: payment.recipientName,
      recipientEmail: payment.recipientEmail,
      amount: payment.amount.toString(),
      frequency: payment.frequency,
      description: payment.description,
      startDate: payment.nextPayment.split("T")[0],
    })
    setShowAddForm(true)
  }

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
      year: "numeric",
    })
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const getDaysUntilNext = (nextPayment: string) => {
    const days = Math.ceil((new Date(nextPayment).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recurring Payments</h2>
          <p className="text-muted-foreground">Manage your automatic payments and subscriptions</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Repeat className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Payments</p>
                <p className="text-xl font-bold">{payments.filter((p) => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    payments
                      .filter((p) => p.isActive && p.frequency === "monthly")
                      .reduce((sum, p) => sum + p.amount, 0),
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="text-xl font-bold">
                  {payments.filter((p) => p.isActive).length > 0
                    ? `${Math.min(...payments.filter((p) => p.isActive).map((p) => getDaysUntilNext(p.nextPayment)))} days`
                    : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPayment ? "Edit" : "Add"} Recurring Payment</CardTitle>
            <CardDescription>Set up automatic payments for subscriptions and bills</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="e.g., Netflix, John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this payment for?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Next Payment Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingPayment(null)
                    setFormData({
                      recipientName: "",
                      recipientEmail: "",
                      amount: "",
                      frequency: "monthly",
                      description: "",
                      startDate: "",
                    })
                  }}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-black">
                  {editingPayment ? "Update" : "Create"} Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No recurring payments</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set up automatic payments for your subscriptions and bills
              </p>
              <Button onClick={() => setShowAddForm(true)} className="bg-primary hover:bg-primary/90 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment
              </Button>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Repeat className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{payment.recipientName}</h3>
                      <p className="text-sm text-muted-foreground">{payment.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
                        <Badge variant="outline">{getFrequencyLabel(payment.frequency)}</Badge>
                        <Badge variant={payment.isActive ? "default" : "secondary"}>
                          {payment.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-4">
                      <p className="text-sm text-muted-foreground">Next payment</p>
                      <p className="font-medium">{formatDate(payment.nextPayment)}</p>
                      <p className="text-xs text-muted-foreground">{getDaysUntilNext(payment.nextPayment)} days</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch checked={payment.isActive} onCheckedChange={() => togglePayment(payment.id)} />
                      <Button variant="ghost" size="icon" onClick={() => editPayment(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upcoming Payments */}
      {payments.filter((p) => p.isActive).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Payments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments
                .filter((p) => p.isActive)
                .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
                .slice(0, 5)
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.recipientName}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(payment.nextPayment)}</p>
                      <p className="text-xs text-muted-foreground">{getDaysUntilNext(payment.nextPayment)} days</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

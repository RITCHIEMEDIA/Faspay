"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart } from "lucide-react"
import type { Transaction } from "@/lib/auth"

interface SpendingAnalyticsProps {
  transactions: Transaction[]
  userId: string
}

interface SpendingCategory {
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
}

interface MonthlyData {
  month: string
  spent: number
  received: number
  net: number
}

export function SpendingAnalytics({ transactions, userId }: SpendingAnalyticsProps) {
  const [timeframe, setTimeframe] = useState("month")
  const [categories, setCategories] = useState<SpendingCategory[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)
  const [budget, setBudget] = useState(2000) // Default monthly budget

  useEffect(() => {
    analyzeSpending()
  }, [transactions, timeframe, userId])

  const analyzeSpending = () => {
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const filteredTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= startDate && t.status === "completed",
    )

    // Calculate totals
    const spent = filteredTransactions.filter((t) => t.fromUserId === userId).reduce((sum, t) => sum + t.amount, 0)

    const received = filteredTransactions.filter((t) => t.toUserId === userId).reduce((sum, t) => sum + t.amount, 0)

    setTotalSpent(spent)
    setTotalReceived(received)

    // Categorize spending
    const categoryMap = new Map<string, number>()

    filteredTransactions
      .filter((t) => t.fromUserId === userId)
      .forEach((t) => {
        const category = t.category || categorizeTransaction(t.description)
        categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount)
      })

    const categoryColors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ]

    const categoryIcons = {
      food: "🍽️",
      transport: "🚗",
      shopping: "🛍️",
      entertainment: "🎬",
      utilities: "⚡",
      healthcare: "🏥",
      education: "📚",
      housing: "🏠",
      other: "📊",
    }

    const categoriesArray: SpendingCategory[] = Array.from(categoryMap.entries())
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: spent > 0 ? (amount / spent) * 100 : 0,
        color: categoryColors[index % categoryColors.length],
        icon: categoryIcons[name as keyof typeof categoryIcons] || "📊",
      }))
      .sort((a, b) => b.amount - a.amount)

    setCategories(categoriesArray)

    // Generate monthly data for trends
    const monthlyMap = new Map<string, { spent: number; received: number }>()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      monthlyMap.set(monthKey, { spent: 0, received: 0 })
    }

    transactions
      .filter((t) => t.status === "completed")
      .forEach((t) => {
        const date = new Date(t.createdAt)
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (monthlyMap.has(monthKey)) {
          const data = monthlyMap.get(monthKey)!
          if (t.fromUserId === userId) {
            data.spent += t.amount
          }
          if (t.toUserId === userId) {
            data.received += t.amount
          }
        }
      })

    const monthlyArray: MonthlyData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      spent: data.spent,
      received: data.received,
      net: data.received - data.spent,
    }))

    setMonthlyData(monthlyArray)
  }

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase()

    if (desc.includes("food") || desc.includes("restaurant") || desc.includes("coffee")) return "food"
    if (desc.includes("uber") || desc.includes("taxi") || desc.includes("gas")) return "transport"
    if (desc.includes("shop") || desc.includes("store") || desc.includes("amazon")) return "shopping"
    if (desc.includes("movie") || desc.includes("game") || desc.includes("music")) return "entertainment"
    if (desc.includes("electric") || desc.includes("water") || desc.includes("internet")) return "utilities"
    if (desc.includes("doctor") || desc.includes("hospital") || desc.includes("pharmacy")) return "healthcare"
    if (desc.includes("school") || desc.includes("course") || desc.includes("book")) return "education"
    if (desc.includes("rent") || desc.includes("mortgage") || desc.includes("housing")) return "housing"

    return "other"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const budgetUsed = (totalSpent / budget) * 100
  const isOverBudget = budgetUsed > 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Spending Analytics</h2>
          <p className="text-muted-foreground">Track your spending patterns and budget</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">3 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p
                  className={`text-2xl font-bold ${totalReceived - totalSpent >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(totalReceived - totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Monthly Budget</span>
          </CardTitle>
          <CardDescription>Track your spending against your monthly budget</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Budget Progress</span>
            <Badge variant={isOverBudget ? "destructive" : "default"}>{budgetUsed.toFixed(1)}% used</Badge>
          </div>
          <Progress value={Math.min(budgetUsed, 100)} className={`h-3 ${isOverBudget ? "bg-red-100" : ""}`} />
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>{formatCurrency(budget - totalSpent)} remaining</span>
          </div>
          {isOverBudget && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ You've exceeded your monthly budget by {formatCurrency(totalSpent - budget)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Spending by Category</span>
          </CardTitle>
          <CardDescription>Breakdown of your expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No spending data for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium capitalize">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress
                    value={category.percentage}
                    className="h-2"
                    style={{
                      background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${category.percentage}%, #e5e7eb ${category.percentage}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>6-Month Trend</span>
          </CardTitle>
          <CardDescription>Your spending and income trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{month.month}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-red-600">
                    <span className="text-muted-foreground">Spent: </span>
                    {formatCurrency(month.spent)}
                  </div>
                  <div className="text-green-600">
                    <span className="text-muted-foreground">Received: </span>
                    {formatCurrency(month.received)}
                  </div>
                  <div className={month.net >= 0 ? "text-green-600" : "text-red-600"}>
                    <span className="text-muted-foreground">Net: </span>
                    {formatCurrency(month.net)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

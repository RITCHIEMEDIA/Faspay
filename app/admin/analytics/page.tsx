"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Download, RefreshCw } from "lucide-react"

export default function AdminAnalytics() {
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalVolume: 0,
    monthlyVolume: 0,
    avgTransactionSize: 0,
    transactionCount: 0,
    successRate: 0,
    topUsers: [],
    dailyStats: [],
  })

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch("/api/users")
      const transactionsRes = await fetch("/api/transactions")
      const allUsers = await usersRes.json()
      const allTransactions = await transactionsRes.json()

      setUsers(allUsers)
      setTransactions(allTransactions)

      // Calculate analytics
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const userList = allUsers.filter((u) => u.role === "user")
      const newUsersThisMonth = userList.filter((u) => new Date(u.createdAt) >= thisMonth).length

      const completedTransactions = allTransactions.filter((t) => t.status === "completed")
      const totalVolume = completedTransactions.reduce((sum, t) => sum + t.amount, 0)
      const monthlyTransactions = completedTransactions.filter((t) => new Date(t.createdAt) >= thisMonth)
      const monthlyVolume = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)
      const avgTransactionSize = completedTransactions.length > 0 ? totalVolume / completedTransactions.length : 0
      const successRate = allTransactions.length > 0 ? (completedTransactions.length / allTransactions.length) * 100 : 100

      // Top users by volume
      const userVolumes = new Map()
      completedTransactions.forEach((t) => {
        if (t.toUserId !== "admin") {
          userVolumes.set(t.toUserId, (userVolumes.get(t.toUserId) || 0) + t.amount)
        }
        if (t.fromUserId !== "admin") {
          userVolumes.set(t.fromUserId, (userVolumes.get(t.fromUserId) || 0) + t.amount)
        }
      })
      const topUsers = Array.from(userVolumes.entries())
        .map(([userId, volume]) => ({
          user: userList.find((u) => u.id === userId),
          volume,
        }))
        .filter((item) => item.user)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5)

      // Daily stats for last 7 days
      const dailyStats = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        const dayTransactions = allTransactions.filter((t) => t.createdAt.split("T")[0] === dateStr)
        const dayVolume = dayTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)
        dailyStats.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          transactions: dayTransactions.length,
          volume: dayVolume,
        })
      }

      setAnalytics({
        totalUsers: userList.length,
        activeUsers: userList.filter((u) => u.isActive).length,
        newUsersThisMonth,
        totalVolume,
        monthlyVolume,
        avgTransactionSize,
        transactionCount: allTransactions.length,
        successRate,
        topUsers,
        dailyStats,
      })
    }
    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gold-text-gradient">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(analytics.monthlyVolume)} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">+{analytics.newUsersThisMonth} new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.avgTransactionSize)}</div>
            <p className="text-xs text-muted-foreground">{analytics.transactionCount} total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatPercentage(analytics.successRate)}</div>
            <p className="text-xs text-muted-foreground">Transaction success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Daily Activity (Last 7 Days)</span>
            </CardTitle>
            <CardDescription>Transaction volume and count by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dailyStats.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{day.date}</p>
                    <p className="text-xs text-muted-foreground">{day.transactions} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(day.volume)}</p>
                    <div className="w-20 h-2 bg-muted rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (day.volume / Math.max(...analytics.dailyStats.map((d) => d.volume))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Top Users by Volume</span>
            </CardTitle>
            <CardDescription>Users with highest transaction volumes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topUsers.map((item, index) => (
                <div key={item.user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">
                        {item.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.user.name}</p>
                      <p className="text-xs text-muted-foreground">{item.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.volume)}</p>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-semibold">{analytics.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-semibold text-green-500">{analytics.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New This Month</span>
              <span className="font-semibold text-blue-500">+{analytics.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Activation Rate</span>
              <span className="font-semibold">
                {analytics.totalUsers > 0
                  ? formatPercentage((analytics.activeUsers / analytics.totalUsers) * 100)
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Volume</span>
              <span className="font-semibold">{formatCurrency(analytics.totalVolume)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monthly Volume</span>
              <span className="font-semibold text-green-500">{formatCurrency(analytics.monthlyVolume)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Transaction</span>
              <span className="font-semibold">{formatCurrency(analytics.avgTransactionSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="font-semibold text-green-500">{formatPercentage(analytics.successRate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">System Uptime</span>
              <span className="font-semibold text-green-500">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <span className="font-semibold">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Security Alerts</span>
              <span className="font-semibold text-green-500">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">API Calls Today</span>
              <span className="font-semibold">12,543</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

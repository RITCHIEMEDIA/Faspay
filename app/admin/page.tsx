"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { getAllUsers, getAllTransactions, type User, type Transaction } from "@/lib/auth"
import Link from "next/link"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  })

  useEffect(() => {
    const allUsers = getAllUsers()
    const allTransactions = getAllTransactions()

    setUsers(allUsers)
    setTransactions(allTransactions)

    // Calculate stats
    const activeUsers = allUsers.filter((u) => u.isActive && u.role === "user").length
    const totalVolume = allTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.amount, 0)
    const pendingTransactions = allTransactions.filter((t) => t.status === "pending").length
    const failedTransactions = allTransactions.filter((t) => t.status === "failed").length

    setStats({
      totalUsers: allUsers.filter((u) => u.role === "user").length,
      activeUsers,
      totalTransactions: allTransactions.length,
      totalVolume,
      pendingTransactions,
      failedTransactions,
    })
  }, [])

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "admin_credit":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4" />
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gold-text-gradient">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your Faspay banking platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalTransactions} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTransactions > 0
                ? Math.round(((stats.totalTransactions - stats.failedTransactions) / stats.totalTransactions) * 100)
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">{stats.failedTransactions} failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/send-money">
              <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                <DollarSign className="h-4 w-4 mr-2" />
                Send Money to User
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/transactions">
              <Button variant="outline" className="w-full bg-transparent">
                <CreditCard className="h-4 w-4 mr-2" />
                View Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </div>
            <Link href="/admin/transactions">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => {
              const fromUser = users.find((u) => u.id === transaction.fromUserId)
              const toUser = users.find((u) => u.id === transaction.toUserId)

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {fromUser?.name || "Unknown"} → {toUser?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(transaction.amount)}</p>
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered accounts</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {users
              .filter((u) => u.role === "user")
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(user.balance)}</p>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">1.2s</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">Security Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { AccountFreeze } from "@/components/account/account-freeze"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, Lock, Unlock, AlertTriangle } from "lucide-react"
import type { User } from "@/lib/auth"

export default function AdminFreezePage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  const loadUsers = () => {
    const stored = localStorage.getItem("faspay_users")
    if (stored) {
      const allUsers = JSON.parse(stored)
      // Filter out admin users
      const regularUsers = allUsers.filter((u: User) => u.role !== "admin")
      setUsers(regularUsers)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }

  const handleStatusChange = (userId: string, isActive: boolean, reason: string) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            isActive,
            lastStatusChange: new Date().toISOString(),
            statusChangeReason: reason,
          }
        : user,
    )

    setUsers(updatedUsers)

    // Update in localStorage
    const allStoredUsers = JSON.parse(localStorage.getItem("faspay_users") || "[]")
    const updatedAllUsers = allStoredUsers.map((user: User) =>
      user.id === userId
        ? {
            ...user,
            isActive,
            lastStatusChange: new Date().toISOString(),
            statusChangeReason: reason,
          }
        : user,
    )
    localStorage.setItem("faspay_users", JSON.stringify(updatedAllUsers))

    // Show success message
    alert(`Account ${isActive ? "unfrozen" : "frozen"} successfully`)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const activeUsers = users.filter((u) => u.isActive).length
  const frozenUsers = users.filter((u) => !u.isActive).length

  if (selectedUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <button onClick={() => setSelectedUser(null)} className="text-primary hover:underline">
            ← Back to User Management
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Account Security Management</h1>
            <p className="text-muted-foreground">
              Managing account for {selectedUser.name} ({selectedUser.email})
            </p>
          </div>

          <AccountFreeze user={selectedUser} onStatusChange={handleStatusChange} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Freeze Management</h1>
        <p className="text-muted-foreground">Manage user account security and freeze suspicious accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frozen Accounts</p>
                <p className="text-2xl font-bold text-red-600">{frozenUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert for frozen accounts */}
      {frozenUsers > 0 && (
        <Alert className="border-orange-200">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            {frozenUsers} account{frozenUsers > 1 ? "s are" : " is"} currently frozen. Review and unfreeze accounts when
            appropriate.
          </AlertDescription>
        </Alert>
      )}

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No users available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        user.isActive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {user.isActive ? (
                        <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Account: {user.accountNumber}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Frozen"}
                        </Badge>
                        {user.twoFactorEnabled && <Badge variant="outline">2FA Enabled</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(user.balance)}</p>
                    <p className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                    {user.lastLogin && (
                      <p className="text-xs text-muted-foreground">Last login: {formatDate(user.lastLogin)}</p>
                    )}
                    <button onClick={() => setSelectedUser(user)} className="mt-2 text-primary hover:underline text-sm">
                      Manage Account →
                    </button>
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

"use client"

export interface User {
  id: string
  email: string
  name: string
  balance: number
  accountNumber: string
  phone?: string
  avatar?: string
  isActive: boolean
  role: "user" | "admin"
  createdAt: string
  lastLogin?: string
  kycStatus: "pending" | "verified" | "rejected"
  twoFactorEnabled: boolean
  pin?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  dateOfBirth?: string
  ssn?: string
  employmentStatus?: string
  annualIncome?: number
}

export interface Transaction {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: "send" | "receive" | "deposit" | "withdrawal" | "admin_credit" | "admin_debit"
  status: "pending" | "completed" | "failed" | "cancelled"
  description: string
  reference: string
  createdAt: string
  completedAt?: string
  metadata?: Record<string, any>
  category?: string
  location?: string
  merchantName?: string
}

export interface AdminCredentials {
  email: string
  password: string
  twoFactorCode?: string
}

// Enhanced mock data for demonstration
export const mockUsers: User[] = [
  {
    id: "1",
    email: "john@example.com",
    name: "John Doe",
    balance: 2500.0,
    accountNumber: "1234567890",
    phone: "+1234567890",
    isActive: true,
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T10:30:00Z",
    kycStatus: "verified",
    twoFactorEnabled: true,
    pin: "1234",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    dateOfBirth: "1990-01-01",
    ssn: "***-**-1234",
    employmentStatus: "employed",
    annualIncome: 75000,
  },
  {
    id: "2",
    email: "sarah@example.com",
    name: "Sarah Johnson",
    balance: 1800.0,
    accountNumber: "1234567891",
    phone: "+1234567891",
    isActive: true,
    role: "user",
    createdAt: "2024-01-02T00:00:00Z",
    lastLogin: "2024-01-14T15:45:00Z",
    kycStatus: "verified",
    twoFactorEnabled: false,
    pin: "5678",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    dateOfBirth: "1985-05-15",
    ssn: "***-**-5678",
    employmentStatus: "employed",
    annualIncome: 85000,
  },
  {
    id: "3",
    email: "mike@example.com",
    name: "Mike Wilson",
    balance: 3200.0,
    accountNumber: "1234567892",
    phone: "+1234567892",
    isActive: true,
    role: "user",
    createdAt: "2024-01-03T00:00:00Z",
    lastLogin: "2024-01-13T09:20:00Z",
    kycStatus: "verified",
    twoFactorEnabled: true,
    pin: "9012",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    dateOfBirth: "1988-12-10",
    ssn: "***-**-9012",
    employmentStatus: "employed",
    annualIncome: 95000,
  },
  {
    id: "admin",
    email: "admin@faspay.com",
    name: "Admin User",
    balance: 0,
    accountNumber: "ADMIN001",
    isActive: true,
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    lastLogin: "2024-01-15T12:00:00Z",
    kycStatus: "verified",
    twoFactorEnabled: true,
    pin: "0000",
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    fromUserId: "1",
    toUserId: "2",
    amount: 500.0,
    type: "send",
    status: "completed",
    description: "Payment for dinner",
    reference: "REF001",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:30:05Z",
    category: "food",
    location: "New York, NY",
  },
  {
    id: "txn_002",
    fromUserId: "admin",
    toUserId: "1",
    amount: 1000.0,
    type: "admin_credit",
    status: "completed",
    description: "Welcome bonus",
    reference: "ADMIN001",
    createdAt: "2024-01-14T09:00:00Z",
    completedAt: "2024-01-14T09:00:01Z",
    category: "bonus",
  },
  {
    id: "txn_003",
    fromUserId: "2",
    toUserId: "3",
    amount: 250.0,
    type: "send",
    status: "completed",
    description: "Rent payment",
    reference: "REF002",
    createdAt: "2024-01-13T14:20:00Z",
    completedAt: "2024-01-13T14:20:03Z",
    category: "housing",
    location: "Los Angeles, CA",
  },
]

// Admin authentication
export const adminCredentials = {
  email: "admin@faspay.com",
  password: "FaspayAdmin2024!",
  twoFactorSecret: "FASPAY2024ADMIN",
}

export const authenticateAdmin = (credentials: AdminCredentials): boolean => {
  if (credentials.email !== adminCredentials.email || credentials.password !== adminCredentials.password) {
    return false
  }

  // In a real app, you'd verify the 2FA code here
  if (credentials.twoFactorCode && credentials.twoFactorCode !== "123456") {
    return false
  }

  return true
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userData = localStorage.getItem("faspay_user")
  return userData ? JSON.parse(userData) : null
}

export const getCurrentAdmin = (): User | null => {
  if (typeof window === "undefined") return null
  const adminData = localStorage.getItem("faspay_admin")
  return adminData ? JSON.parse(adminData) : null
}

export const loginUser = (email: string, password: string, pin?: string): User | null => {
  const users = getAllUsers()
  const user = users.find((u) => u.email === email && u.role === "user")

  if (!user) return null

  // In a real app, you'd hash and compare passwords
  // For demo purposes, we'll use simple validation
  const validCredentials = email === "john@example.com" && password === "password123"
  const validPin = pin === user.pin

  if (validCredentials && validPin) {
    const updatedUser = { ...user, lastLogin: new Date().toISOString() }
    updateUser(updatedUser)
    localStorage.setItem("faspay_user", JSON.stringify(updatedUser))
    return updatedUser
  }

  return null
}

export const loginAdmin = (credentials: AdminCredentials): User | null => {
  if (!authenticateAdmin(credentials)) return null

  const admin = mockUsers.find((u) => u.role === "admin")
  if (!admin) return null

  const updatedAdmin = { ...admin, lastLogin: new Date().toISOString() }
  localStorage.setItem("faspay_admin", JSON.stringify(updatedAdmin))
  return updatedAdmin
}

export const logoutUser = () => {
  localStorage.removeItem("faspay_user")
}

export const logoutAdmin = () => {
  localStorage.removeItem("faspay_admin")
}

export const updateUserBalance = (userId: string, newBalance: number) => {
  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance
    users[userIndex].lastLogin = new Date().toISOString()
    localStorage.setItem("faspay_users", JSON.stringify(users))

    // Update current user if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      currentUser.balance = newBalance
      localStorage.setItem("faspay_user", JSON.stringify(currentUser))
    }
  }
}

export const updateUser = (updatedUser: User) => {
  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === updatedUser.id)
  if (userIndex !== -1) {
    users[userIndex] = updatedUser
    localStorage.setItem("faspay_users", JSON.stringify(users))
  }
}

export const getAllUsers = (): User[] => {
  if (typeof window === "undefined") return mockUsers
  const users = localStorage.getItem("faspay_users")
  if (!users) {
    localStorage.setItem("faspay_users", JSON.stringify(mockUsers))
    return mockUsers
  }
  return JSON.parse(users)
}

export const getAllTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return mockTransactions
  const transactions = localStorage.getItem("faspay_transactions")
  if (!transactions) {
    localStorage.setItem("faspay_transactions", JSON.stringify(mockTransactions))
    return mockTransactions
  }
  return JSON.parse(transactions)
}

export const getUserTransactions = (userId: string): Transaction[] => {
  const allTransactions = getAllTransactions()
  return allTransactions.filter((t) => t.fromUserId === userId || t.toUserId === userId)
}

export const addTransaction = (transaction: Transaction) => {
  const transactions = getAllTransactions()
  transactions.unshift(transaction)
  localStorage.setItem("faspay_transactions", JSON.stringify(transactions))

  // Trigger real-time update event
  window.dispatchEvent(new CustomEvent("transactionAdded", { detail: transaction }))
}

export const updateTransaction = (transactionId: string, updates: Partial<Transaction>) => {
  const transactions = getAllTransactions()
  const index = transactions.findIndex((t) => t.id === transactionId)
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates }
    localStorage.setItem("faspay_transactions", JSON.stringify(transactions))

    // Trigger real-time update event
    window.dispatchEvent(new CustomEvent("transactionUpdated", { detail: transactions[index] }))
  }
}

export const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateReference = () => {
  return `REF${Date.now().toString().slice(-6)}`
}

export const generateAccountNumber = () => {
  return Math.random().toString().slice(2, 12)
}

// Real-time transaction processing
export const processTransaction = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  description: string,
  type: Transaction["type"] = "send",
): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
  try {
    const users = getAllUsers()
    const fromUser = users.find((u) => u.id === fromUserId)
    const toUser = users.find((u) => u.id === toUserId)

    if (!fromUser || !toUser) {
      return { success: false, error: "User not found" }
    }

    if (fromUser.role !== "admin" && fromUser.balance < amount) {
      return { success: false, error: "Insufficient funds" }
    }

    if (!fromUser.isActive || !toUser.isActive) {
      return { success: false, error: "Account is inactive" }
    }

    // Create pending transaction
    const transaction: Transaction = {
      id: generateTransactionId(),
      fromUserId,
      toUserId,
      amount,
      type,
      status: "pending",
      description,
      reference: generateReference(),
      createdAt: new Date().toISOString(),
      metadata: {
        fromUserName: fromUser.name,
        toUserName: toUser.name,
        processingTime: Date.now(),
      },
    }

    addTransaction(transaction)

    // Simulate processing delay (1-3 seconds)
    const processingTime = Math.random() * 2000 + 1000
    await new Promise((resolve) => setTimeout(resolve, processingTime))

    // Process the transaction
    if (fromUser.role !== "admin") {
      updateUserBalance(fromUserId, fromUser.balance - amount)
    }
    updateUserBalance(toUserId, toUser.balance + amount)

    // Update transaction status
    const completedTransaction = {
      ...transaction,
      status: "completed" as const,
      completedAt: new Date().toISOString(),
    }

    updateTransaction(transaction.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    })

    return { success: true, transaction: completedTransaction }
  } catch (error) {
    console.error("Transaction processing error:", error)
    return { success: false, error: "Transaction processing failed" }
  }
}

// Fraud detection (basic implementation)
export const detectFraud = (transaction: Transaction, user: User): boolean => {
  const userTransactions = getUserTransactions(user.id)
  const recentTransactions = userTransactions.filter(
    (t) => new Date(t.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
  )

  // Flag if more than 5 transactions in 24 hours
  if (recentTransactions.length > 5) return true

  // Flag if transaction is more than 50% of balance
  if (transaction.amount > user.balance * 0.5) return true

  // Flag if transaction is over $5000
  if (transaction.amount > 5000) return true

  return false
}

// Account verification
export const verifyAccount = (userId: string, verificationType: "email" | "phone" | "identity"): boolean => {
  const users = getAllUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return false

  // Simulate verification process
  const updatedUser = { ...user, kycStatus: "verified" as const }
  updateUser(updatedUser)
  return true
}

// Generate account statement
export const generateAccountStatement = (
  userId: string,
  startDate: string,
  endDate: string,
): {
  user: User
  transactions: Transaction[]
  summary: {
    openingBalance: number
    closingBalance: number
    totalCredits: number
    totalDebits: number
    transactionCount: number
  }
} => {
  const user = getAllUsers().find((u) => u.id === userId)!
  const transactions = getUserTransactions(userId).filter((t) => {
    const transactionDate = new Date(t.createdAt)
    return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate)
  })

  const totalCredits = transactions
    .filter((t) => t.toUserId === userId && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalDebits = transactions
    .filter((t) => t.fromUserId === userId && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    user,
    transactions,
    summary: {
      openingBalance: user.balance + totalDebits - totalCredits,
      closingBalance: user.balance,
      totalCredits,
      totalDebits,
      transactionCount: transactions.length,
    },
  }
}

import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = typeof window !== "undefined" ? localStorage.getItem("faspay_user") : null
    setUser(userData ? JSON.parse(userData) : null)
    setLoading(false)
  }, [])

  return { user, loading }
}

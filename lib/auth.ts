"use client"

import prisma from "./db"
import { useEffect, useState } from "react"
import type { NextApiRequest, NextApiResponse } from "next"

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

// Get current user from session/cookie (implement session logic as needed)
export const getCurrentUser = async (): Promise<User | null> => {
  // Implement session/cookie logic here
  return null
}

// Get current admin from session/cookie (implement session logic as needed)
export const getCurrentAdmin = async (): Promise<User | null> => {
  // Implement session/cookie logic here
  return null
}

// Login user (replace with secure password hash check in production)
export const loginUser = async (email: string, password: string, pin?: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({ where: { email, role: "user" } })
  if (!user) return null
  // TODO: Implement password hash check and pin check
  return user
}

// Login admin (replace with secure password hash check in production)
export const loginAdmin = async (credentials: AdminCredentials): Promise<User | null> => {
  const admin = await prisma.user.findFirst({ where: { email: credentials.email, role: "admin" } })
  if (!admin) return null
  // TODO: Implement password hash check and 2FA check
  return admin
}

// Logout logic (clear session/cookie)
export const logoutUser = () => {
  // Implement session/cookie clearing logic
}

export const logoutAdmin = () => {
  // Implement session/cookie clearing logic
}

// Update user balance
export const updateUserBalance = async (userId: string, newBalance: number) => {
  await prisma.user.update({
    where: { id: userId },
    data: { balance: newBalance, lastLogin: new Date().toISOString() },
  })
}

// Update user details
export const updateUser = async (updatedUser: Partial<User> & { id: string }) => {
  await prisma.user.update({
    where: { id: updatedUser.id },
    data: { ...updatedUser },
  })
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  return await prisma.user.findMany()
}

// Get all transactions
export const getAllTransactions = async (): Promise<Transaction[]> => {
  return await prisma.transaction.findMany()
}

// Get transactions for a user
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }
  })
}

// Add a transaction
export const addTransaction = async (transaction: Omit<Transaction, "id">) => {
  return await prisma.transaction.create({ data: transaction })
}

// Update a transaction
export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: updates,
  })
}

// Generate IDs and references
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
    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } })
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } })

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
    const transaction = await prisma.transaction.create({
      data: {
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
    })

    // Simulate processing delay (1-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

    // Process the transaction
    if (fromUser.role !== "admin") {
      await updateUserBalance(fromUserId, fromUser.balance - amount)
    }
    await updateUserBalance(toUserId, toUser.balance + amount)

    // Update transaction status
    const completedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "completed",
        completedAt: new Date().toISOString(),
      }
    })

    return { success: true, transaction: completedTransaction }
  } catch (error) {
    console.error("Transaction processing error:", error)
    return { success: false, error: "Transaction processing failed" }
  }
}

// Fraud detection (basic implementation)
export const detectFraud = async (transaction: Transaction, user: User): Promise<boolean> => {
  const userTransactions = await getUserTransactions(user.id)
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
export const verifyAccount = async (userId: string, verificationType: "email" | "phone" | "identity"): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: "verified" }
  })
  return true
}

// Generate account statement
export const generateAccountStatement = async (
  userId: string,
  startDate: string,
  endDate: string,
): Promise<{
  user: User
  transactions: Transaction[]
  summary: {
    openingBalance: number
    closingBalance: number
    totalCredits: number
    totalDebits: number
    transactionCount: number
  }
}> => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ],
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
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

// React hook for auth (example, should use context/session in production)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch current user from API/session
    setLoading(false)
  }, [])

  return { user, loading }
}

// Create a new user account (admin only)
export const createUserAccount = async (userData: Omit<User, "id" | "createdAt" | "role" | "balance">) => {
  return await prisma.user.create({
    data: {
      ...userData,
      id: generateAccountNumber(),
      createdAt: new Date().toISOString(),
      role: "user",
      balance: 0,
      isActive: true,
      kycStatus: "pending",
      twoFactorEnabled: false,
    }
  })
}

// Admin funds a user's account
export const adminFundAccount = async (
  toUserId: string,
  amount: number,
  senderName: string = "Faspay Admin",
  description: string = "Account funding"
) => {
  const toUser = await prisma.user.findUnique({ where: { id: toUserId } })
  if (!toUser) return { success: false, error: "User not found" }

  await updateUserBalance(toUserId, toUser.balance + amount)

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      id: generateTransactionId(),
      fromUserId: "admin",
      toUserId,
      amount,
      type: "admin_credit",
      status: "completed",
      description: `${description} (Sender: ${senderName})`,
      reference: generateReference(),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      metadata: { senderName },
    }
  })
  return { success: true, transaction }
}

// Admin withdraws money from a user's account
export const adminWithdrawFromAccount = async (
  fromUserId: string,
  amount: number,
  description: string = "Admin withdrawal"
) => {
  const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } })
  if (!fromUser) return { success: false, error: "User not found" }
  if (fromUser.balance < amount) return { success: false, error: "Insufficient funds" }

  await updateUserBalance(fromUserId, fromUser.balance - amount)

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      id: generateTransactionId(),
      fromUserId,
      toUserId: "admin",
      amount,
      type: "admin_debit",
      status: "completed",
      description,
      reference: generateReference(),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      metadata: {},
    }
  })
  return { success: true, transaction }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await prisma.user.findMany()
  res.status(200).json(users)
}

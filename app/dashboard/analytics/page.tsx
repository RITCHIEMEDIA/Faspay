"use client"

import { useState, useEffect } from "react"
import { SpendingAnalytics } from "@/components/analytics/spending-analytics"
import { useAuth } from "@/lib/auth"
import type { Transaction } from "@/lib/auth"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = () => {
    const stored = localStorage.getItem(`faspay_transactions_${user?.id}`)
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <SpendingAnalytics transactions={transactions} userId={user.id} />
    </div>
  )
}

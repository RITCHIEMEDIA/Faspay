"use client"

import { MultiCurrency } from "@/components/currency/multi-currency"
import { useAuth } from "@/lib/auth"

export default function CurrencyPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <MultiCurrency userId={user.id} primaryBalance={user.balance} />
    </div>
  )
}

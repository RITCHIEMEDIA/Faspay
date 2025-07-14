"use client"

import { RecurringPayments } from "@/components/payments/recurring-payments"
import { useAuth } from "@/lib/auth"

export default function RecurringPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <RecurringPayments userId={user.id} />
    </div>
  )
}

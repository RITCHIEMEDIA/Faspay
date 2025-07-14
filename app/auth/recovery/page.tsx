"use client"

import { AccountRecovery } from "@/components/auth/account-recovery"

export default function RecoveryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <AccountRecovery />
    </div>
  )
}

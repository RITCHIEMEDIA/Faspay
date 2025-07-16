"use client"
import PinInput from "@/components/ui/PinInput"
import BiometricButton from "@/components/ui/BiometricButton"
import { useState } from "react"

export default function AdminSettingsPage() {
  const [pin, setPin] = useState("")
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handlePinSubmit = async (newPin: string) => {
    setLoading(true)
    // Save PIN via API
    await fetch("/api/admin/set-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: newPin }),
    })
    setPin(newPin)
    setMessage("PIN updated successfully!")
    setLoading(false)
  }

  const handleBiometricEnable = async () => {
    setBiometricEnabled(true)
    setMessage("Biometric authentication enabled!")
    // Save biometric status via API if needed
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-bold mb-2">Admin Settings</h2>
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <PinInput onSubmit={handlePinSubmit} loading={loading} />
        <BiometricButton onSuccess={handleBiometricEnable} />
        {message && <div className="text-green-600">{message}</div>}
      </div>
    </div>
  )
}
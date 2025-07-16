import { useState } from "react"

export default function PinInput({ onSubmit, loading }: { onSubmit: (pin: string) => void, loading?: boolean }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setPin(value.slice(0, 4))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be 4 digits")
      return
    }
    onSubmit(pin)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2 w-full">
      <input
        type="password"
        inputMode="numeric"
        pattern="\d*"
        maxLength={4}
        value={pin}
        onChange={handleChange}
        className="text-center text-lg p-2 rounded border w-32"
        placeholder="Enter 4-digit PIN"
        disabled={loading}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
      <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
        Confirm PIN
      </button>
    </form>
  )
}
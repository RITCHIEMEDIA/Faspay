"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, DollarSign, AlertCircle, CheckCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/hooks/use-notifications"
import PinInput from "@/components/ui/PinInput"
import BiometricButton from "@/components/ui/BiometricButton"

export default function AdminSendMoneyPage() {
  const [admin, setAdmin] = useState(null)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [formData, setFormData] = useState({
    recipientId: "",
    amount: "",
    type: "admin_credit",
    reason: "",
    note: "",
    senderName: "",
    senderEmail: "",
    senderPhone: "",
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [step, setStep] = useState("form")
  const [pinVerified, setPinVerified] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const router = useRouter()
  const { sendTransactionNotification } = useNotifications()

  useEffect(() => {
    async function fetchData() {
      // Get current admin from API
      const adminRes = await fetch("/api/current-admin")
      if (!adminRes.ok) {
        router.push("/admin/auth")
        return
      }
      const adminData = await adminRes.json()
      setAdmin(adminData)

      // Get all users from API
      const usersRes = await fetch("/api/users")
      const users = await usersRes.json()
      const userList = users.filter((u) => u.role === "user")
      setUsers(userList)
      setFilteredUsers(userList)
    }
    fetchData()
  }, [router])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.accountNumber.includes(searchQuery),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  useEffect(() => {
    if (formData.recipientId) {
      const user = users.find((u) => u.id === formData.recipientId)
      setSelectedUser(user || null)
    } else {
      setSelectedUser(null)
    }
  }, [formData.recipientId, users])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!admin || !selectedUser) return

    const amount = Number.parseFloat(formData.amount)
    if (amount <= 0) {
      setAlert({ type: "error", message: "Please enter a valid amount" })
      return
    }

    if (formData.type === "admin_debit" && amount > selectedUser.balance) {
      setAlert({ type: "error", message: "User has insufficient funds for debit" })
      return
    }

    if (!formData.senderName || !formData.senderEmail) {
      setAlert({ type: "error", message: "Sender name and email are required" })
      return
    }

    setStep("confirm")
  }

  const handleConfirm = async () => {
    if (!admin || !selectedUser) return

    setStep("processing")
    setIsLoading(true)
    setAlert(null)

    try {
      const amount = Number.parseFloat(formData.amount)
      const isCredit = formData.type === "admin_credit"

      // --- Use API route instead of direct processTransaction call ---
      const res = await fetch("/api/admin-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: isCredit ? admin.id : selectedUser.id,
          toUserId: isCredit ? selectedUser.id : admin.id,
          amount,
          description: `${formData.reason} - ${formData.note}`.trim(),
          type: formData.type,
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          senderPhone: formData.senderPhone,
        }),
      })
      const result = await res.json()

      if (result.success) {
        // Send notification to user
        sendTransactionNotification(
          isCredit ? "received" : "sent",
          amount,
          formData.senderName || (isCredit ? "Faspay Admin" : "Admin Debit"),
          result.transaction!.id,
        )

        setStep("success")
        setAlert({
          type: "success",
          message: `Successfully ${isCredit ? "credited" : "debited"} $${amount.toFixed(2)} ${
            isCredit ? "to" : "from"
          } ${selectedUser.name}`,
        })

        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push("/admin")
        }, 3000)
      } else {
        setAlert({ type: "error", message: result.error || "Transaction failed" })
        setStep("form")
      }
    } catch (error) {
      console.error("Admin transaction error:", error)
      setAlert({ type: "error", message: "An unexpected error occurred" })
      setStep("form")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinCheck = async (pin: string) => {
    // Verify PIN via API
    const res = await fetch("/api/admin/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    })
    const result = await res.json()
    if (result.success) {
      setPinVerified(true)
      setShowPinModal(false)
      handleConfirm() // Proceed with transaction
    } else {
      alert("Incorrect PIN")
    }
  }

  const handleBiometricSuccess = () => {
    setPinVerified(true)
    setShowPinModal(false)
    handleConfirm()
  }

  const resetForm = () => {
    setFormData({
      recipientId: "",
      amount: "",
      type: "admin_credit",
      reason: "",
      note: "",
      senderName: "",
      senderEmail: "",
      senderPhone: "",
    })
    setSelectedUser(null)
    setSearchQuery("")
    setStep("form")
    setAlert(null)
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Money to Users</h1>
        <p className="text-muted-foreground">Credit or debit user accounts directly</p>
      </div>

      {alert && (
        <Alert className={alert.type === "error" ? "border-red-500" : "border-green-500"}>
          {alert.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <AlertDescription className={alert.type === "error" ? "text-red-700" : "text-green-700"}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {step === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>Admin Transaction</span>
              </CardTitle>
              <CardDescription>Send money to or from user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* SENDER DETAILS */}
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    placeholder="Sender's Name"
                    value={formData.senderName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, senderName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    placeholder="Sender's Email"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, senderEmail: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Sender Phone (optional)</Label>
                  <Input
                    id="senderPhone"
                    placeholder="Sender's Phone"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, senderPhone: e.target.value }))}
                  />
                </div>
                {/* END SENDER DETAILS */}

                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin_credit">Credit (Add Money)</SelectItem>
                      <SelectItem value="admin_debit">Debit (Remove Money)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Select User</Label>
                  <Select
                    value={formData.recipientId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, recipientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">({user.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedUser && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {selectedUser.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedUser.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                        <p className="text-xs text-muted-foreground">Balance: ${selectedUser.balance.toFixed(2)}</p>
                      </div>
                      <Badge variant={selectedUser.kycStatus === "verified" ? "default" : "secondary"}>
                        {selectedUser.kycStatus}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Welcome Bonus">Welcome Bonus</SelectItem>
                      <SelectItem value="Cashback Reward">Cashback Reward</SelectItem>
                      <SelectItem value="Referral Bonus">Referral Bonus</SelectItem>
                      <SelectItem value="Promotional Credit">Promotional Credit</SelectItem>
                      <SelectItem value="Account Adjustment">Account Adjustment</SelectItem>
                      <SelectItem value="Refund">Refund</SelectItem>
                      <SelectItem value="Fee Reversal">Fee Reversal</SelectItem>
                      <SelectItem value="Penalty">Penalty</SelectItem>
                      <SelectItem value="Maintenance Fee">Maintenance Fee</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Additional Notes</Label>
                  <Textarea
                    id="note"
                    placeholder="Optional additional details..."
                    value={formData.note}
                    onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-black"
                  onClick={() => setShowPinModal(true)}
                  disabled={!selectedUser || !formData.amount || isLoading}
                >
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Users</span>
              </CardTitle>
              <CardDescription>Search and select users for transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or account number..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.recipientId === user.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, recipientId: user.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Balance: ${user.balance.toFixed(2)} • {user.accountNumber}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={user.kycStatus === "verified" ? "default" : "secondary"} className="text-xs">
                            {user.kycStatus}
                          </Badge>
                          <Badge variant={user.isActive ? "default" : "destructive"} className="text-xs">
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "confirm" && selectedUser && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Confirm Transaction</CardTitle>
            <CardDescription>Please review the details before processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant={formData.type === "admin_credit" ? "default" : "destructive"}>
                  {formData.type === "admin_credit" ? "Credit" : "Debit"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User</span>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{selectedUser.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-semibold">${Number.parseFloat(formData.amount).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reason</span>
                <span className="text-sm">{formData.reason}</span>
              </div>

              {formData.note && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Note</span>
                  <span className="text-sm">{formData.note}</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">New User Balance</span>
                <span className="text-sm font-medium">
                  $
                  {(
                    selectedUser.balance +
                    (formData.type === "admin_credit" ? 1 : -1) * Number.parseFloat(formData.amount)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-black" onClick={handleConfirm}>
                Process Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "processing" && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Transaction</h3>
            <p className="text-sm text-muted-foreground">Please wait while we process the admin transaction...</p>
          </CardContent>
        </Card>
      )}

      {step === "success" && selectedUser && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Transaction Successful!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ${Number.parseFloat(formData.amount).toFixed(2)}{" "}
              {formData.type === "admin_credit" ? "credited to" : "debited from"} {selectedUser.name}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={resetForm}>
                New Transaction
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-black"
                onClick={() => router.push("/admin")}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-xs">
            <h3 className="text-lg font-semibold mb-2 text-center">Authenticate Transaction</h3>
            <PinInput onSubmit={handlePinCheck} />
            <BiometricButton onSuccess={handleBiometricSuccess} />
            <button className="mt-4 w-full btn btn-outline" onClick={() => setShowPinModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

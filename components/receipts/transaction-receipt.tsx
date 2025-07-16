"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Share2,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  UserIcon,
  Banknote,
  MapPin,
  ShoppingBag,
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Ensure these types are consistent with your lib/auth or lib/types
type User = {
  id: string
  name: string
  email: string
  accountNumber: string
  balance: number
  kycStatus: string
  twoFactorEnabled: boolean
  phone?: string // Added phone for more complete details
}

type Transaction = {
  id: string
  fromUserId: string
  toUserId: string
  amount: number
  type: string
  status: string
  description: string
  reference: string
  createdAt: string
  completedAt?: string
  metadata?: {
    senderName?: string
    senderEmail?: string
    senderPhone?: string
    receiverName?: string
    receiverEmail?: string
    receiverPhone?: string
  }
  category?: string // Added from schema
  location?: string // Added from schema
  merchantName?: string // Added from schema
}

interface TransactionReceiptProps {
  transaction: Transaction
  user: User // The current logged-in user
  allUsers: User[] // All users to resolve sender/receiver names
}

export function TransactionReceipt({ transaction, user, allUsers }: TransactionReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 text-white dark:bg-green-700 dark:text-green-100 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" /> Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white dark:bg-yellow-700 dark:text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4 mr-1" /> Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500 text-white dark:bg-red-700 dark:text-red-100 px-3 py-1 rounded-full text-sm font-medium">
            <XCircle className="h-4 w-4 mr-1" /> Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            <Info className="h-4 w-4 mr-1" /> {status}
          </Badge>
        )
    }
  }

  // Helper to get user details from allUsers array
  const getPartyDetails = (userId: string) => {
    const party = allUsers.find((u) => u.id === userId)
    return {
      name: party?.name || "Unknown User",
      email: party?.email || "N/A",
      accountNumber: party?.accountNumber || "N/A",
      phone: party?.phone || "N/A",
    }
  }

  // Determine sender and receiver details, prioritizing metadata for admin transactions
  const senderDetails = transaction.fromUserId === user.id ? user : getPartyDetails(transaction.fromUserId)
  const receiverDetails = transaction.toUserId === user.id ? user : getPartyDetails(transaction.toUserId)

  const displaySenderName =
    transaction.fromUserId === "admin" ? "Faspay Admin" : transaction.metadata?.senderName || senderDetails.name
  const displaySenderEmail =
    transaction.fromUserId === "admin" ? "admin@faspay.com" : transaction.metadata?.senderEmail || senderDetails.email
  const displaySenderPhone =
    transaction.fromUserId === "admin" ? "N/A" : transaction.metadata?.senderPhone || senderDetails.phone
  const displaySenderAccount = transaction.fromUserId === "admin" ? "ADMIN001" : senderDetails.accountNumber

  const displayReceiverName = transaction.metadata?.receiverName || receiverDetails.name
  const displayReceiverEmail = transaction.metadata?.receiverEmail || receiverDetails.email
  const displayReceiverPhone = transaction.metadata?.receiverPhone || receiverDetails.phone
  const displayReceiverAccount = receiverDetails.accountNumber

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return
    setIsDownloading(true)

    const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, logging: true }) // Scale for better quality, useCORS for images
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`faspay_receipt_${transaction.reference}.pdf`)
    setIsDownloading(false)
  }

  const handleShareImage = async () => {
    if (!receiptRef.current) return

    const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, logging: true })
    const imgData = canvas.toDataURL("image/png")

    // Attempt to use Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `faspay_receipt_${transaction.reference}.png`, { type: "image/png" })
          try {
            await navigator.share({
              files: [file],
              title: `Faspay Transaction Receipt - ${transaction.reference}`,
              text: `Here's your transaction receipt for ${formatCurrency(transaction.amount)} on ${formatDate(transaction.createdAt)}.`,
            })
            console.log("Shared successfully")
          } catch (error) {
            console.error("Error sharing:", error)
            // Fallback to download if sharing fails or is cancelled
            const a = document.createElement("a")
            a.href = imgData
            a.download = `faspay_receipt_${transaction.reference}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            alert("Failed to share image. It has been downloaded instead.")
          }
        }
      }, "image/png")
    } else {
      // Fallback: direct download if Web Share API is not supported
      const a = document.createElement("a")
      a.href = imgData
      a.download = `faspay_receipt_${transaction.reference}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      alert("Web Share API is not supported in your browser. Image has been downloaded.")
    }
  }

  const printReceipt = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md mx-auto p-0 overflow-hidden shadow-2xl rounded-xl border border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 text-center relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <img
              src="/icon.jpg"
              alt="Faspay Logo"
              className="h-12 w-12 mb-3 rounded-full shadow-lg border-2 border-white"
              crossOrigin="anonymous"
            />
            <CardTitle className="text-3xl font-extrabold tracking-tight mb-1">Faspay</CardTitle>
            <CardDescription className="text-base font-medium text-blue-100">
              Official Transaction Receipt
            </CardDescription>
            <p className="text-xs text-blue-200 mt-1">
              {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 bg-white dark:bg-gray-900" ref={receiptRef}>
          {/* Transaction Summary */}
          <div className="text-center space-y-3">
            <p className="text-muted-foreground text-sm font-semibold">Amount Transacted</p>
            <h2 className="text-5xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
              {formatCurrency(transaction.amount)}
            </h2>
            <div className="flex justify-center">{getStatusBadge(transaction.status)}</div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-blue-500" /> Transaction Details
            </h3>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Transaction ID</p>
                <p className="font-medium text-gray-900 dark:text-gray-50 break-all">{transaction.id}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Reference Number</p>
                <p className="font-medium text-gray-900 dark:text-gray-50 break-all">{transaction.reference}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Transaction Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-50 capitalize">
                  {transaction.type.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Description</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{transaction.description || "N/A"}</p>
              </div>
              {transaction.category && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Category</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{transaction.category}</p>
                </div>
              )}
              {transaction.location && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Location</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {transaction.location}
                  </p>
                </div>
              )}
              {transaction.merchantName && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Merchant</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50 flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" /> {transaction.merchantName}
                  </p>
                </div>
              )}
              {transaction.completedAt && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Completion Time</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">
                    {formatDate(transaction.completedAt)} at {formatTime(transaction.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Sender Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-500" /> Sender Details
            </h3>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displaySenderName}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displaySenderEmail}</p>
              </div>
              {displaySenderPhone !== "N/A" && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{displaySenderPhone}</p>
                </div>
              )}
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Account Number</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displaySenderAccount}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Receiver Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-blue-500" /> Receiver Details
            </h3>
            <div className="grid grid-cols-1 gap-y-3 text-sm">
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Name</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displayReceiverName}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displayReceiverEmail}</p>
              </div>
              {displayReceiverPhone !== "N/A" && (
                <div className="flex flex-col">
                  <p className="font-semibold text-muted-foreground">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{displayReceiverPhone}</p>
                </div>
              )}
              <div className="flex flex-col">
                <p className="font-semibold text-muted-foreground">Account Number</p>
                <p className="font-medium text-gray-900 dark:text-gray-50">{displayReceiverAccount}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground space-y-1 pt-2">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Thank you for choosing Faspay!</p>
            <p className="text-gray-600 dark:text-gray-400">Faspay Inc. | 123 Digital Way, Fintech City, FP 98765</p>
            <p className="text-gray-600 dark:text-gray-400">
              Support:{" "}
              <a href="mailto:support@faspay.app" className="text-blue-600 hover:underline">
                support@faspay.app
              </a>{" "}
              | Website:{" "}
              <a
                href="https://www.faspay.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.faspay.app
              </a>
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-1">
              &copy; {new Date().getFullYear()} Faspay. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Download/Share/Print Buttons outside the printable area */}
      <div className="flex flex-col gap-3 w-full max-w-md mx-auto print:hidden mt-6">
        <Button
          onClick={handleDownloadPdf}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" /> {isDownloading ? "Generating PDF..." : "Download PDF"}
        </Button>
        <Button
          onClick={handleShareImage}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm"
        >
          <Share2 className="h-4 w-4 mr-2" /> Share Image
        </Button>
        <Button
          onClick={printReceipt}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 text-sm"
        >
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
      </div>
    </div>
  )
}

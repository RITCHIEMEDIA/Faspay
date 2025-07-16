import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { generateTransactionId, generateReference } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { fromUserId, toUserId, amount, description, type, senderName, senderEmail, senderPhone } = req.body

  try {
    // Update balances as needed (credit/debit logic)
    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } })
    const toUser = await prisma.user.findUnique({ where: { id: toUserId } })
    if (!fromUser || !toUser) return res.status(404).json({ success: false, error: "User not found" })

    if (type === "admin_debit" && fromUser.balance < amount) {
      return res.status(400).json({ success: false, error: "Insufficient funds" })
    }

    // Update balances
    if (type === "admin_credit") {
      await prisma.user.update({ where: { id: toUserId }, data: { balance: toUser.balance + amount } })
    } else {
      await prisma.user.update({ where: { id: fromUserId }, data: { balance: fromUser.balance - amount } })
    }

    // Create transaction with sender details in metadata
    const transaction = await prisma.transaction.create({
      data: {
        id: generateTransactionId(),
        fromUserId,
        toUserId,
        amount,
        type,
        status: "completed",
        description,
        reference: generateReference(),
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metadata: {
          senderName,
          senderEmail,
          senderPhone,
        },
      },
    })

    res.status(200).json({ success: true, transaction })
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" })
  }
}
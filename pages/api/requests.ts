import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { parse } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const userId = cookies["userId"]
  if (!userId) return res.status(401).json({ error: "Not authenticated" })

  // Get all requests where the current user is the recipient
  const requests = await prisma.paymentRequest.findMany({
    where: { toUserId: userId },
    orderBy: { createdAt: "desc" },
    include: { fromUser: true },
  })

  // Format for frontend
  const formatted = requests.map((req) => ({
    id: req.id,
    amount: req.amount,
    from: req.fromUser?.name || "Unknown",
    status: req.status,
    date: req.createdAt.toLocaleString(),
  }))

  res.status(200).json(formatted)
}
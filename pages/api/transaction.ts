import type { NextApiRequest, NextApiResponse } from "next"
import { processTransaction } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { fromUserId, toUserId, amount, description, type } = req.body

  try {
    const result = await processTransaction(fromUserId, toUserId, amount, description, type)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" })
  }
}
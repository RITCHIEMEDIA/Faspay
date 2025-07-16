import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { parse } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const userId = cookies["userId"]
  if (!userId) return res.status(401).json({ error: "Not authenticated" })

  // Fetch user from DB
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(401).json({ error: "User not found" })

  res.status(200).json(user)
}
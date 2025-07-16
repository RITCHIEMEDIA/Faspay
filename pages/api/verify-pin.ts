import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { parse } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const userId = cookies["userId"]
  if (!userId) return res.status(401).json({ error: "Not authenticated" })

  const { pin } = req.body
  if (!/^\d{4}$/.test(pin)) return res.status(400).json({ error: "Invalid PIN format" })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.pin) return res.status(400).json({ error: "No PIN set" })

  if (user.pin !== pin) return res.status(401).json({ error: "Incorrect PIN" })

  res.status(200).json({ success: true })
}
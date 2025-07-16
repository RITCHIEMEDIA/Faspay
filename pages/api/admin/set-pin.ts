import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { pin } = req.body
  if (!pin || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, error: "Invalid PIN" })

  // Get current admin (replace with your auth logic)
  const adminId = req.cookies.adminId
  if (!adminId) return res.status(401).json({ success: false, error: "Not authenticated" })

  const hashedPin = await bcrypt.hash(pin, 10)
  await prisma.user.update({
    where: { id: adminId },
    data: { pin: hashedPin },
  })
  res.status(200).json({ success: true })
}
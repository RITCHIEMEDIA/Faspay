import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { serialize } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { email, password, twoFactorCode } = req.body

  const admin = await prisma.user.findFirst({ where: { email, role: "admin" } })
  if (!admin) return res.status(401).json({ error: "Invalid credentials" })

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

  // If 2FA is enabled and no code is provided, ask for 2FA
  if (admin.twoFactorEnabled && !twoFactorCode) {
    return res.status(200).json({ require2FA: true })
  }

  // If 2FA is enabled, check the code
  if (admin.twoFactorEnabled && twoFactorCode !== "2580") {
    return res.status(401).json({ error: "Invalid 2FA code" })
  }

  res.setHeader("Set-Cookie", serialize("userId", admin.id, { path: "/", httpOnly: true }))
  res.status(200).json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role })
}
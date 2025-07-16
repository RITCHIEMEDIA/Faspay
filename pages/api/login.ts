import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { serialize } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: "Invalid credentials" })

  res.setHeader("Set-Cookie", serialize("userId", user.id, { path: "/", httpOnly: true }))
  res.status(200).json({ id: user.id, email: user.email, name: user.name })
}
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password, role } = req.body
    const user = await prisma.user.findFirst({ where: { email, role } })
    if (!user) return res.status(401).json({ error: "Invalid credentials" })
    // Add password hash check here in production
    res.status(200).json(user)
  }
}
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { parse } from "cookie"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const adminId = cookies["userId"]
  if (!adminId) return res.status(401).json({ error: "Not authenticated" })

  const admin = await prisma.user.findUnique({ where: { id: adminId, role: "admin" } })
  if (!admin) return res.status(401).json({ error: "Admin not found" })

  res.status(200).json(admin)
}
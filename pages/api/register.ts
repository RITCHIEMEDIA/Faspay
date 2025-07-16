import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()
  const { firstName, lastName, email, password, phone } = req.body

  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(400).json({ error: "All fields are required" })
  }

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
  if (existingUser) return res.status(409).json({ error: "User already exists" })

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password: hashedPassword,
      accountNumber: Math.random().toString().slice(2, 12),
      role: "user",
      balance: 0,
      isActive: true,
      kycStatus: "pending",
    }
  })
  res.status(201).json({ id: user.id, email: user.email, name: user.name, phone: user.phone })
}
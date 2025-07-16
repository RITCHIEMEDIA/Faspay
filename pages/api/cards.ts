import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"
import { parse } from "cookie"

function generateCardNumber() {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(1000 + Math.random() * 9000))
    .join(" ")
}

function generateExpiryDate() {
  const now = new Date()
  const year = now.getFullYear() + 3
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${month}/${String(year).slice(-2)}`
}

function generateCVV() {
  return String(Math.floor(100 + Math.random() * 900))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const userId = cookies["userId"]
  if (!userId) return res.status(401).json({ error: "Not authenticated" })

  if (req.method === "POST") {
    // Create virtual card
    const card = await prisma.card.create({
      data: {
        userId,
        type: "virtual",
        number: generateCardNumber(),
        expiryDate: generateExpiryDate(),
        cvv: generateCVV(),
        status: "active",
        spendingLimit: 2000,
        currentSpending: 0,
        isDefault: false,
      },
    })
    return res.status(201).json(card)
  }

  // GET: return all cards for user
  if (req.method === "GET") {
    const cards = await prisma.card.findMany({ where: { userId } })
    return res.status(200).json(cards)
  }

  res.status(405).end()
}
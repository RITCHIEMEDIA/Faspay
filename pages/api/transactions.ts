import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const transactions = await prisma.transaction.findMany()
    res.status(200).json(transactions)
  }
  if (req.method === "POST") {
    const transaction = await prisma.transaction.create({ data: req.body })
    res.status(201).json(transaction)
  }
}
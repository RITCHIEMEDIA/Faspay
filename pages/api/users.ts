import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const users = await prisma.user.findMany()
    res.status(200).json(users)
  }
  if (req.method === "POST") {
    const user = await prisma.user.create({ data: req.body })
    res.status(201).json(user)
  }
  if (req.method === "PUT") {
    const { id, ...data } = req.body
    const user = await prisma.user.update({ where: { id }, data })
    res.status(200).json(user)
  }
  if (req.method === "DELETE") {
    const { id } = req.body
    await prisma.user.delete({ where: { id } })
    res.status(204).end()
  }
}
// import type { NextApiRequest, NextApiResponse } from "next"
// import { verifyPin } from "@/lib/db"
// import { serialize } from "cookie"

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" })
//   }

//   const { pin } = req.body

//   if (!pin) {
//     return res.status(400).json({ message: "Pin is required" })
//   }

//   try {
//     const adminId = req.cookies.userId

//     if (!adminId) {
//       return res.status(401).json({ message: "Unauthorized" })
//     }

//     const isValid = await verifyPin(adminId, pin)

//     if (!isValid) {
//       return res.status(401).json({ message: "Invalid Pin" })
//     }

//     const token = "valid" // Replace with actual token generation logic

//     const serialized = serialize("adminToken", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 60 * 60 * 24 * 7, // 1 week
//       path: "/",
//     })

//     res.setHeader("Set-Cookie", serialized)

//     return res.status(200).json({ message: "Pin Verified" })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ message: "Internal Server Error" })
//   }
// }

import { PrismaClient, Role } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { createOAuthClient } from "../../../lib/google";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, role } = req.query; // role = SELLER or BUYER from query string

    if (!code || !role) {
      return res.status(400).json({ error: "Missing code or role" });
    }

    const oAuth2Client = createOAuthClient();
    const { tokens } = await oAuth2Client.getToken(code as string);

    // Save/update user
    const user = await prisma.user.upsert({
      where: { email: "some@email.com" }, // replace with profile.email
      update: {
        role: role === "SELLER" ? Role.SELLER : Role.BUYER, // ✅ correct typing
      },
      create: {
        email: "some@email.com",
        name: "Google User",
        role: role === "SELLER" ? Role.SELLER : Role.BUYER, // ✅ correct typing
      },
    });

    res.redirect(`/dashboard?role=${role}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OAuth Callback Error" });
  }
}

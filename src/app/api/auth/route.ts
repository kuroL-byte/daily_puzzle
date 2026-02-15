import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { prisma } from "@/lib/prisma";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: Request) {
  const { token } = await req.json();

  const decoded = await admin.auth().verifyIdToken(token);

  const email = decoded.email!;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return NextResponse.json({ user });
}

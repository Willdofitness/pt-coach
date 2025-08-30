import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, role: "COACH" },
  });

  return NextResponse.json({ ok: true });
}
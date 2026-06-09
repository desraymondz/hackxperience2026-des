import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = readSessionFromCookies(request.cookies);
  if (!session) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  return NextResponse.json({
    session: {
      userId: session.userId,
      username: session.username,
      role: session.role,
      iat: session.iat,
      exp: session.exp,
    },
  });
}

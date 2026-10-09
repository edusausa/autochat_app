import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "liveavatar",
    time: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";

import { stopLiveAvatarSession } from "@/lib/liveavatar-session";
import { forwardBillingRequest } from "../../utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const sessionId =
      typeof body?.session_id === "string" ? body.session_id.trim() : "";
    const providerSessionId =
      typeof body?.provider_session_id === "string"
        ? body.provider_session_id.trim()
        : "";
    if (!token || !sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing token or billing session." },
        { status: 400 },
      );
    }

    if (providerSessionId) {
      await stopLiveAvatarSession(providerSessionId, "USER_CLOSED");
    }

    return await forwardBillingRequest({
      endpoint: "/session_end",
      payload: { token, session_id: sessionId },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid session-end request." },
      { status: 400 },
    );
  }
}

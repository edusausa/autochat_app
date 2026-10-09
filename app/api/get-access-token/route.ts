/**
 * LiveAvatar backend: mint session tokens via the official LiveAvatar API.
 *
 * POST /api/get-access-token
 * Body (optional): { avatarId?: string, contextId?: string, maxSessionDuration?: number }
 *
 * Env required:
 *   LIVEAVATAR_API_KEY  – API key from app.liveavatar.com/developers
 *   LIVEAVATAR_AVATAR_ID (optional fallback) – default avatar when none passed
 *
 * Returns the session token as plain text (legacy contract of this endpoint),
 * with X-LiveAvatar-Session-Id header carrying the session id.
 */
import { NextResponse } from "next/server";

const API_BASE = process.env.LIVEAVATAR_API_BASE ?? "https://api.liveavatar.com";

export async function POST(request: Request) {
  const apiKey = process.env.LIVEAVATAR_API_KEY;

  if (!apiKey) {
    console.error("[liveavatar] LIVEAVATAR_API_KEY missing");
    return NextResponse.json(
      { error: "LiveAvatar API key is not configured." },
      { status: 500 },
    );
  }

  let body: {
    avatarId?: string;
    contextId?: string;
    maxSessionDuration?: number;
    language?: string;
  } = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    body = {};
  }

  const avatarId =
    body.avatarId ||
    (process.env.LIVEAVATAR_AVATAR_ID || undefined);

  if (!avatarId) {
    return NextResponse.json(
      { error: "avatarId is required (no LIVEAVATAR_AVATAR_ID fallback set)." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {
    mode: "FULL",
    avatar_id: avatarId,
  };
  if (body.contextId) payload.context_id = body.contextId;
  // 30-minute cap requested, but LiveAvatar API caps max_session_duration at 300s per token.
  payload.max_session_duration =
    body.maxSessionDuration &&
    body.maxSessionDuration > 0 &&
    body.maxSessionDuration <= 300
      ? body.maxSessionDuration
      : 300;

  // FULL mode now REQUIRES exactly one of voice_agent | avatar_persona.
  // Use the avatar's default voice agent (set per-avatar in LiveAvatar dashboard).
  try {
    const avRes = await fetch(`${API_BASE}/v1/avatars/${avatarId}`, {
      headers: { "X-API-KEY": apiKey },
    });
    const avRaw = await avRes.text();
    let av: {
      data?: { default_voice_agent_id?: string | null } | null;
    } = {};
    try {
      av = JSON.parse(avRaw);
    } catch {
      av = {};
    }
    const agentId = av?.data?.default_voice_agent_id;
    if (!agentId) {
      console.error("[liveavatar] avatar has no default_voice_agent_id", avRes.status, avRaw.slice(0, 300));
      return NextResponse.json(
        {
          error:
            "Avatar has no default voice agent configured. Set one in the LiveAvatar dashboard for this avatar.",
        },
        { status: 502 },
      );
    }
    payload.voice_agent = { id: agentId };
  } catch (e) {
    console.error("[liveavatar] avatar lookup failed:", e);
    return NextResponse.json(
      { error: "Failed to look up avatar voice agent" },
      { status: 502 },
    );
  }

  try {
    const res = await fetch(`${API_BASE}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    let parsed: {
      code?: number;
      data?: { session_id?: string; session_token?: string };
      message?: string;
    } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    if (!res.ok || !parsed?.data?.session_token) {
      console.error(
        "[liveavatar] session token failed",
        res.status,
        raw.slice(0, 500),
      );
      return NextResponse.json(
        {
          error:
            parsed?.message ||
            `LiveAvatar rejected the session request (HTTP ${res.status}).`,
        },
        { status: 502 },
      );
    }

    return new NextResponse(parsed.data.session_token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-LiveAvatar-Session-Id": parsed.data.session_id ?? "",
      },
    });
  } catch (error) {
    console.error("[liveavatar] token fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve LiveAvatar session token" },
      { status: 500 },
    );
  }
}

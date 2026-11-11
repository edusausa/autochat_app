const API_BASE = (
  process.env.LIVEAVATAR_API_BASE ?? "https://api.liveavatar.com"
).replace(/\/$/, "");

export type LiveAvatarStopReason =
  | "UNKNOWN"
  | "USER_DISCONNECTED"
  | "SERVER_ERROR"
  | "IDLE_TIMEOUT"
  | "USER_CLOSED";

/**
 * Ask LiveAvatar to stop a provider session using the documented server API.
 * This is best-effort because billing/session finalization must still run if
 * the provider is already disconnected or the browser is leaving the page.
 */
export async function stopLiveAvatarSession(
  sessionId: string,
  reason: LiveAvatarStopReason,
): Promise<boolean> {
  const apiKey = process.env.LIVEAVATAR_API_KEY?.trim();
  if (!apiKey || !sessionId) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE}/v1/sessions/stop`, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, reason }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn("LiveAvatar provider stop returned a non-success status.");
      return false;
    }

    return true;
  } catch {
    console.warn("LiveAvatar provider stop request failed.");
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

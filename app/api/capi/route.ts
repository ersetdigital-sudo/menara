import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * CAPI (Conversions API) relay route.
 *
 * Client-side MetaPixel fires events to the browser pixel AND mirrors them
 * here with the same eventID. Meta then deduplicates browser + server events
 * into a single counted event — this raises Event Match Quality.
 *
 * Required env: META_CAPI_ACCESS_TOKEN (set in Vercel Environment Variables)
 */

const CAPI_VERSION = "v21.0";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventId, customData, pixelId, eventSourceUrl } = body;

    const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

    // Silently reject if CAPI not configured — don't leak internals
    if (!accessToken || !pixelId) {
      return NextResponse.json({ sent: false, reason: "unconfigured" });
    }

    // Read _fbc / _fbp cookies set by Meta Pixel SDK
    const cookieStore = await cookies();
    const fbc = cookieStore.get("_fbc")?.value || "";
    const fbp = cookieStore.get("_fbp")?.value || "";

    // Read client info from request headers
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "";

    // Build user_data payload for dedup
    const userData: Record<string, string> = { client_user_agent: userAgent };
    if (fbc) userData.fbc = fbc;
    if (fbp) userData.fbp = fbp;
    if (clientIp) userData.client_ip_address = clientIp;

    // Send to Meta Conversions API
    const response = await fetch(
      `https://graph.facebook.com/${CAPI_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl,
              action_source: "website",
              user_data: userData,
              custom_data: customData || {},
            },
          ],
        }),
      }
    );

    const result = await response.json();

    // Log CAPI errors server-side for debugging (visible in Vercel logs)
    if (!response.ok) {
      console.error("[CAPI] Error from Meta:", JSON.stringify(result));
    }

    return NextResponse.json({ sent: true, debug_id: result.debug_id });
  } catch (error) {
    console.error("[CAPI] Route error:", error);
    return NextResponse.json({ sent: false, reason: "server_error" }, { status: 500 });
  }
}

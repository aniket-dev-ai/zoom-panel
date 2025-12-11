// lib/zoom.ts
const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";

export async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom env vars missing");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Zoom token error:", text);
    throw new Error("Failed to get Zoom access token");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

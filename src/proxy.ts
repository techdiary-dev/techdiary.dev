import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

// AuthKit internal headers that must be forwarded as request headers, not response headers.
const AUTHKIT_REQUEST_HEADERS = [
  "x-workos-middleware",
  "x-url",
  "x-redirect-uri",
  "x-sign-up-paths",
  "x-workos-session",
] as const;

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { headers: authkitHeaders } = await authkit(request);

  // Build request headers: start from original, apply authkit headers on top
  const requestHeaders = new Headers(request.headers);
  for (const name of AUTHKIT_REQUEST_HEADERS) {
    const value = authkitHeaders.get(name);
    if (value != null) requestHeaders.set(name, value);
  }
  requestHeaders.set("x-current-path", request.nextUrl.pathname);

  // Build response headers: only set-cookie, cache-control, vary from authkit
  const responseHeaders = new Headers();
  for (const [name, value] of authkitHeaders) {
    const lower = name.toLowerCase();
    if (
      lower === "set-cookie" ||
      lower === "cache-control" ||
      lower === "vary"
    ) {
      responseHeaders.append(name, value);
    }
  }
  if (responseHeaders.has("set-cookie") && !responseHeaders.has("cache-control")) {
    responseHeaders.set("cache-control", "no-store");
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [name, value] of responseHeaders) {
    response.headers.append(name, value);
  }
  return response;
}

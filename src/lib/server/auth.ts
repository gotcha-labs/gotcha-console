import { getAccessToken, AccessTokenError } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

/**
 * Wraps Auth0's getAccessToken(). If the access token has expired and no
 * refresh token is available, forces the user through logout so the UI
 * state stays in sync with the actual auth state (otherwise the session
 * cookie lingers and the user appears logged in while backend calls fail).
 */
export async function getAccessTokenOrLogout(): Promise<string> {
  try {
    const { accessToken } = await getAccessToken();
    if (!accessToken) {
      redirect("/api/auth/logout");
    }
    return accessToken;
  } catch (err) {
    if (err instanceof AccessTokenError) {
      redirect("/api/auth/logout");
    }
    throw err;
  }
}

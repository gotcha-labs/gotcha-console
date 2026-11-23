import { getSession } from "@auth0/nextjs-auth0";

// ADMIN_USERS: comma-separated emails and/or Auth0 user ids (e.g. "github|123").
// Kept in env, not code: this repo is public.
const ADMINS = (process.env.ADMIN_USERS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(): Promise<boolean> {
  const user = (await getSession())?.user;
  if (!user) return false;
  const ids = [user.sub, user.email_verified !== false && user.email]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  return ids.some((id) => ADMINS.includes(id));
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Forbidden: admin only");
}

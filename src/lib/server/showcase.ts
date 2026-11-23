// Server-only helpers for the admin "Games" page and the public /api/showcase feed.
// Talks straight to Supabase (REST), Cloudflare Pages and GitHub — no GitHub Actions involved.
// Not a "use server" file on purpose: nothing here may be callable from the browser.
import { randomBytes } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zdhpbdwcjqyoskhbmslh.supabase.co";
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "05bb2df4451c2a8f2fae5c79182b199a";
export const GITHUB_ORG = process.env.GITHUB_ORG || "gotcha-labs";
const GH_TEMPLATE = process.env.GITHUB_TEMPLATE_REPO || "gotcha-game-template";
const SHOWCASE_DOMAINS = (process.env.SHOWCASE_DOMAINS || "gotcha.land,www.gotcha.land,dev.gotcha.land,localhost").split(",");

export type ShowcaseGame = {
  challenge_url: string;
  site_key: string;
  label: string;
  description: string;
  preview_url: string | null;
  repo: string | null;
  pages_project: string | null;
  position: number;
  visible: boolean;
  challenge: { default_width: number; default_height: number } | null;
};

export type DeployStatus = { stage: string; status: string; at: string | null; repo: string | null } | null;

/** Which integrations have their secrets configured (the page shows what's missing). */
export const configured = {
  supabase: !!process.env.SUPABASE_SECRET_KEY,
  cloudflare: !!process.env.CLOUDFLARE_API_TOKEN,
  github: !!process.env.GITHUB_TOKEN,
};

// ---------- Supabase ----------
export async function db<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set in the console's environment");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: {
      apikey: key,
      ...(!key.startsWith("sb_") && { Authorization: `Bearer ${key}` }),
      "Content-Type": "application/json",
      Prefer: init.prefer ?? "return=minimal",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw new Error(`Supabase ${init.method ?? "GET"} ${path.split("?")[0]}: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const listGames = () =>
  db<ShowcaseGame[]>("showcase_game?select=*,challenge(default_width,default_height)&order=position.asc,created_at.asc");

export async function uploadPreview(slug: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${slug}-${Date.now()}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/showcase/${path}`, {
    method: "POST",
    headers: { apikey: process.env.SUPABASE_SECRET_KEY!, "Content-Type": file.type || "image/png", "x-upsert": "true" },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!res.ok) throw new Error(`Preview upload failed: ${res.status} ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/showcase/${path}`;
}

/** Console that owns the website's showcase keys (taken from an existing showcase game). */
async function showcaseConsoleId(): Promise<string> {
  if (process.env.SHOWCASE_CONSOLE_ID) return process.env.SHOWCASE_CONSOLE_ID;
  const rows = await db<{ api_key: { console_id: string } }[]>(
    "showcase_game?select=api_key(console_id)&limit=1",
  );
  if (!rows[0]) throw new Error("No showcase games yet: set SHOWCASE_CONSOLE_ID");
  return rows[0].api_key.console_id;
}

/** Registers the challenge and gives it its own website site key (same shape as the server's gen_api_key). */
export async function registerChallenge(url: string, label: string, width: number, height: number) {
  await db("challenge?on_conflict=url", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { url, label, default_width: width, default_height: height },
  });
  const site_key = randomBytes(48).toString("base64url");
  await db("api_key", {
    method: "POST",
    body: {
      site_key,
      console_id: await showcaseConsoleId(),
      label: `website: ${label}`,
      allowed_domains: SHOWCASE_DOMAINS,
      encoding_key: randomBytes(48).toString("base64"),
      secret: randomBytes(48).toString("base64"),
    },
  });
  await db("api_key_challenges_pool", { method: "POST", body: { site_key, challenge_url: url } });
  return site_key;
}

// ---------- Cloudflare Pages ----------
async function cf<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not set in the console's environment");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/pages/projects${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(typeof init.body === "string" && { "Content-Type": "application/json" }) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Cloudflare ${path || "/"}: ${res.status} ${json?.errors?.map((e: any) => e.message).join("; ") ?? ""}`);
    (err as any).status = res.status;
    throw err;
  }
  return json.result as T;
}

/** Git-connected Pages project: Cloudflare builds on every push to main (free, not GitHub Actions). */
export async function ensurePagesProject(name: string, repo: string): Promise<string> {
  try {
    const p = await cf<{ subdomain: string }>(`/${name}`);
    return `https://${p.subdomain}/`;
  } catch (e: any) {
    if (e.status !== 404) throw e;
  }
  const [owner, repo_name] = repo.split("/");
  const p = await cf<{ subdomain: string }>("", {
    method: "POST",
    body: JSON.stringify({
      name,
      production_branch: "main",
      build_config: { build_command: "npm install && npm run build", destination_dir: "dist" },
      source: {
        type: "github",
        config: { owner, repo_name, production_branch: "main", deployments_enabled: true, production_deployments_enabled: true },
      },
    }),
  });
  await redeploy(name);
  return `https://${p.subdomain}/`;
}

export const redeploy = (name: string) => cf(`/${name}/deployments`, { method: "POST", body: new FormData() });

export const deletePagesProject = (name: string) => cf(`/${name}`, { method: "DELETE" });

export async function deployStatus(name: string | null): Promise<DeployStatus> {
  if (!name || !configured.cloudflare) return null;
  try {
    const p = await cf<any>(`/${name}`);
    const d = p.latest_deployment;
    const src = p.source?.config;
    return {
      stage: d?.latest_stage?.name ?? "none",
      status: d?.latest_stage?.status ?? "",
      at: d?.created_on ?? null,
      repo: src ? `${src.owner}/${src.repo_name}` : null,
    };
  } catch {
    return null;
  }
}

// ---------- GitHub (only for "new game from game.js") ----------
async function gh(path: string, init: { method?: string; body?: unknown } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set: create the repo on GitHub yourself, or add the token");
  return fetch(`https://api.github.com${path}`, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

/** The org's repos for the admin "pick a repo" list, most recently pushed first ([] if GitHub isn't set up). */
export async function listOrgRepos(): Promise<string[]> {
  if (!process.env.GITHUB_TOKEN) return [];
  const res = await gh(`/orgs/${GITHUB_ORG}/repos?per_page=100&sort=pushed&direction=desc`);
  if (!res.ok) return [];
  const repos: { full_name: string; is_template: boolean; archived: boolean }[] = await res.json();
  return repos.filter((r) => !r.is_template && !r.archived).map((r) => r.full_name);
}

/** Creates `org/name` from the game template if missing, then writes game.js to main (Cloudflare rebuilds). */
export async function pushGameJs(name: string, gameJs: string): Promise<string> {
  const repo = `${GITHUB_ORG}/${name}`;
  if ((await gh(`/repos/${repo}`)).status === 404) {
    const res = await gh(`/repos/${GITHUB_ORG}/${GH_TEMPLATE}/generate`, {
      method: "POST",
      body: { owner: GITHUB_ORG, name, private: true },
    });
    if (!res.ok) throw new Error(`GitHub: could not create ${repo}: ${res.status} ${await res.text()}`);
  }
  // A freshly generated repo needs a few seconds before its contents are writable.
  for (let attempt = 0; ; attempt++) {
    const existing = await gh(`/repos/${repo}/contents/game.js`);
    const sha = existing.ok ? (await existing.json()).sha : undefined;
    const res = await gh(`/repos/${repo}/contents/game.js`, {
      method: "PUT",
      body: { message: "Update game.js from console", content: Buffer.from(gameJs).toString("base64"), sha, branch: "main" },
    });
    if (res.ok) return repo;
    if (attempt >= 5) throw new Error(`GitHub: could not write game.js: ${res.status} ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

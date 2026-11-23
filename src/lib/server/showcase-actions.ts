"use server";

// Admin-only form actions for /console/admin. Each re-checks admin: server actions are public endpoints.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./admin";
import {
  db, deletePagesProject, ensurePagesProject, listGames, pushGameJs, redeploy, registerChallenge, uploadPreview,
} from "./showcase";

const PAGE = "/console/admin";

function done(msg: string, kind: "ok" | "error" = "ok"): never {
  revalidatePath(PAGE);
  redirect(`${PAGE}?${kind}=${encodeURIComponent(msg)}`);
}

async function run(fn: () => Promise<string>): Promise<never> {
  await requireAdmin();
  let msg: string;
  try {
    msg = await fn();
  } catch (e) {
    done(e instanceof Error ? e.message : String(e), "error");
  }
  done(msg);
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const file = (f: FormData, k: string) => {
  const v = f.get(k);
  return v instanceof File && v.size > 0 ? v : null;
};

export async function addGame(form: FormData) {
  return run(async () => {
    let repo = str(form, "repo");
    // Name defaults to the picked repo's name.
    const name = (str(form, "name") || repo.split("/")[1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!/^[a-z0-9][a-z0-9-]{0,56}$/.test(name)) throw new Error("Name: lowercase letters, digits and dashes (e.g. game-rocket)");
    const label = str(form, "label") || name;
    const description = str(form, "description");
    const width = Number(str(form, "width") || 360);
    const height = Number(str(form, "height") || 500);
    const gameJs = file(form, "game_js");

    if (gameJs) repo = await pushGameJs(name, await gameJs.text());
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("Upload a game.js, or give an existing GitHub repo as owner/name");

    const url = await ensurePagesProject(name, repo);
    const games = await listGames();
    const existing = games.find((g) => g.challenge_url === url);
    const preview = file(form, "preview");
    const preview_url = preview ? await uploadPreview(name, preview) : existing?.preview_url ?? null;

    if (existing) {
      await db(`showcase_game?challenge_url=eq.${encodeURIComponent(url)}`, {
        method: "PATCH",
        body: { label, description, preview_url, repo, pages_project: name },
      });
      return `${label} updated — Cloudflare is building ${url}`;
    }
    const site_key = await registerChallenge(url, label, width, height);
    await db("showcase_game", {
      method: "POST",
      body: {
        challenge_url: url, site_key, label, description, preview_url, repo, pages_project: name,
        position: Math.max(-1, ...games.map((g) => g.position)) + 1,
      },
    });
    return `${label} added — Cloudflare is building ${url} (1–2 min), then it's live on gotcha.land`;
  });
}

export async function updateGame(form: FormData) {
  return run(async () => {
    const url = str(form, "challenge_url");
    const label = str(form, "label");
    const preview = file(form, "preview");
    const gameJs = file(form, "game_js");
    const patch: Record<string, unknown> = {
      label,
      description: str(form, "description"),
      position: Number(str(form, "position") || 0),
      visible: form.get("visible") === "on",
    };
    if (preview) patch.preview_url = await uploadPreview(str(form, "pages_project") || "game", preview);
    await db(`showcase_game?challenge_url=eq.${encodeURIComponent(url)}`, { method: "PATCH", body: patch });
    await db(`challenge?url=eq.${encodeURIComponent(url)}`, {
      method: "PATCH",
      body: { label, default_width: Number(str(form, "width")), default_height: Number(str(form, "height")) },
    });
    if (gameJs) {
      const repo = str(form, "repo");
      if (!repo.includes("/")) throw new Error("This game has no GitHub repo on record; re-add it with Add game");
      await pushGameJs(repo.split("/")[1], await gameJs.text());
      return `${label} saved — new game.js pushed, Cloudflare is rebuilding`;
    }
    return `${label} saved`;
  });
}

export async function redeployGame(form: FormData) {
  return run(async () => {
    await redeploy(str(form, "pages_project"));
    return `Rebuild started for ${str(form, "label")}`;
  });
}

export async function deleteGame(form: FormData) {
  return run(async () => {
    if (form.get("confirm") !== "on") throw new Error("Tick the confirmation box to delete");
    const url = encodeURIComponent(str(form, "challenge_url"));
    // Deleting the key and the challenge cascades to the pool and showcase rows.
    await db(`api_key?site_key=eq.${encodeURIComponent(str(form, "site_key"))}`, { method: "DELETE" });
    await db(`challenge?url=eq.${url}`, { method: "DELETE" });
    const project = str(form, "pages_project");
    if (project && form.get("delete_project") === "on") await deletePagesProject(project);
    return `${str(form, "label")} deleted`;
  });
}

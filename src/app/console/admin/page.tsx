import { addGame, deleteGame, redeployGame, updateGame } from "@/lib/server/showcase-actions";
import { configured, deployStatus, listGames, listOrgRepos, ShowcaseGame } from "@/lib/server/showcase";

export const dynamic = "force-dynamic";

const input = "w-full rounded-md bg-gray-900 border border-gray-700 px-3 py-2 text-gray-100 text-sm";
const label = "block text-sm text-gray-400 mb-1";
const button = "rounded-md px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700";
const secondary = "rounded-md px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600";
const card = "rounded-lg bg-gray-800/60 border border-gray-700 p-6";

const statusColor: Record<string, string> = {
  success: "text-green-400", active: "text-yellow-400", idle: "text-yellow-400", failure: "text-red-400", canceled: "text-gray-400",
};

export default async function AdminGamesPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const missing = Object.entries(configured).filter(([, v]) => !v).map(([k]) => k);
  let games: ShowcaseGame[] = [];
  let loadError: string | null = null;
  try {
    games = await listGames();
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }
  const [statuses, allRepos] = await Promise.all([
    Promise.all(games.map((g) => deployStatus(g.pages_project))),
    listOrgRepos(),
  ]);
  // Hide repos already on the website (by saved repo, or the repo its Cloudflare project builds from).
  const used = new Set(games.flatMap((g, i) => [g.repo, statuses[i]?.repo]).map((r) => r?.toLowerCase()));
  const repos = allRepos.filter((r) => !used.has(r.toLowerCase()));
  const isGame = (r: string) => /\/game/i.test(r);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Games (admin)</h2>
        <p className="text-gray-400 mt-2">
          Add a game and it gets built on Cloudflare, registered as a challenge with its own site key, and shown on
          gotcha.land. Visible games appear on the website automatically.
        </p>
      </div>

      {searchParams.ok && <p role="status" className="rounded-md bg-green-900/40 border border-green-700 p-3 text-green-200">{searchParams.ok}</p>}
      {searchParams.error && <p role="alert" className="rounded-md bg-red-900/40 border border-red-700 p-3 text-red-200">{searchParams.error}</p>}
      {missing.length > 0 && (
        <p className="rounded-md bg-yellow-900/30 border border-yellow-700 p-3 text-yellow-200 text-sm">
          Not configured in Vercel yet: {missing.join(", ")}. (supabase → SUPABASE_SECRET_KEY, cloudflare →
          CLOUDFLARE_API_TOKEN, github → GITHUB_TOKEN; GitHub is only needed for uploading game.js.)
        </p>
      )}
      {loadError && <p role="alert" className="rounded-md bg-red-900/40 border border-red-700 p-3 text-red-200">{loadError}</p>}

      <section className={card} aria-labelledby="add-game">
        <h3 id="add-game" className="text-lg font-semibold text-gray-100 mb-4">Add game</h3>
        <form action={addGame} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label} htmlFor="repo">Pick a game from GitHub</label>
            {repos.length > 0 ? (
              <select className={input} id="repo" name="repo" defaultValue="">
                <option value="">— none: upload a game.js below —</option>
                <optgroup label="Games">
                  {repos.filter(isGame).map((r) => <option key={r} value={r}>{r}</option>)}
                </optgroup>
                <optgroup label="Other repos">
                  {repos.filter((r) => !isGame(r)).map((r) => <option key={r} value={r}>{r}</option>)}
                </optgroup>
              </select>
            ) : (
              <input className={input} id="repo" name="repo" placeholder="gotcha-labs/game-rocket" />
            )}
          </div>
          <div>
            <label className={label} htmlFor="game_js">…or upload game.js (from the Game Creator) — creates the repo</label>
            <input className={input} id="game_js" name="game_js" type="file" accept=".js,text/javascript" />
          </div>
          <div>
            <label className={label} htmlFor="label">Title on website</label>
            <input className={input} id="label" name="label" required placeholder="Rocket" />
          </div>
          <div>
            <label className={label} htmlFor="name">Cloudflare project name (optional — defaults to the repo name)</label>
            <input className={input} id="name" name="name" placeholder="game-rocket" pattern="[a-z0-9][a-z0-9-]*" />
          </div>
          <div className="md:col-span-2">
            <label className={label} htmlFor="description">Description</label>
            <input className={input} id="description" name="description" placeholder="One sentence shown under the game" />
          </div>
          <div>
            <label className={label} htmlFor="preview">Preview image</label>
            <input className={input} id="preview" name="preview" type="file" accept="image/*" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="width">Width</label>
              <input className={input} id="width" name="width" type="number" min={1} defaultValue={360} />
            </div>
            <div>
              <label className={label} htmlFor="height">Height</label>
              <input className={input} id="height" name="height" type="number" min={1} defaultValue={500} />
            </div>
          </div>
          <div className="md:col-span-2">
            <button className={button} type="submit">Add game</button>
          </div>
        </form>
      </section>

      <section aria-labelledby="games" className="space-y-4">
        <h3 id="games" className="text-lg font-semibold text-gray-100">Games on gotcha.land ({games.length})</h3>
        {games.map((g, i) => {
          const s = statuses[i];
          return (
            <article key={g.challenge_url} className={card} data-game={g.pages_project ?? g.label}>
              <div className="flex flex-wrap items-start gap-4 mb-4">
                {g.preview_url && <img src={g.preview_url} alt="" className="w-28 h-20 object-cover rounded-md" />}
                <div className="flex-1 min-w-0 text-sm">
                  <p className="text-gray-100 font-semibold text-base">{g.label} {!g.visible && <span className="text-gray-500">(hidden)</span>}</p>
                  <p className="text-gray-400 truncate"><a className="hover:underline" href={g.challenge_url} target="_blank">{g.challenge_url}</a></p>
                  <p className="text-gray-500 truncate">Site key: <code>{g.site_key}</code></p>
                  {g.repo && <p className="text-gray-500">Repo: <a className="hover:underline" href={`https://github.com/${g.repo}`} target="_blank">{g.repo}</a></p>}
                  <p className="text-gray-500">
                    Build:{" "}
                    {s ? <span className={statusColor[s.status] ?? "text-gray-300"}>{s.stage} {s.status}</span> : <span>unknown</span>}
                    {s?.at && <span> · {new Date(s.at).toLocaleString("en-GB")}</span>}
                  </p>
                </div>
                {g.pages_project && (
                  <form action={redeployGame}>
                    <input type="hidden" name="pages_project" value={g.pages_project} />
                    <input type="hidden" name="label" value={g.label} />
                    <button className={secondary} type="submit">Rebuild</button>
                  </form>
                )}
              </div>

              <details>
                <summary className="cursor-pointer text-sm text-blue-400">Edit</summary>
                <form action={updateGame} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input type="hidden" name="challenge_url" value={g.challenge_url} />
                  <input type="hidden" name="pages_project" value={g.pages_project ?? ""} />
                  <input type="hidden" name="repo" value={g.repo ?? ""} />
                  <div><label className={label}>Title<input className={input} name="label" defaultValue={g.label} required /></label></div>
                  <div><label className={label}>Position on website<input className={input} name="position" type="number" defaultValue={g.position} /></label></div>
                  <div className="md:col-span-2"><label className={label}>Description<input className={input} name="description" defaultValue={g.description} /></label></div>
                  <div><label className={label}>Width<input className={input} name="width" type="number" min={1} defaultValue={g.challenge?.default_width ?? 360} /></label></div>
                  <div><label className={label}>Height<input className={input} name="height" type="number" min={1} defaultValue={g.challenge?.default_height ?? 500} /></label></div>
                  <div><label className={label}>New preview image<input className={input} name="preview" type="file" accept="image/*" /></label></div>
                  <div><label className={label}>New game.js (rebuilds the game)<input className={input} name="game_js" type="file" accept=".js,text/javascript" disabled={!g.repo} /></label></div>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" name="visible" defaultChecked={g.visible} /> Show on gotcha.land
                  </label>
                  <div className="md:col-span-2"><button className={button} type="submit">Save</button></div>
                </form>

                <form action={deleteGame} className="mt-6 border-t border-gray-700 pt-4 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <input type="hidden" name="challenge_url" value={g.challenge_url} />
                  <input type="hidden" name="site_key" value={g.site_key} />
                  <input type="hidden" name="pages_project" value={g.pages_project ?? ""} />
                  <input type="hidden" name="label" value={g.label} />
                  <label className="flex items-center gap-2"><input type="checkbox" name="confirm" required /> Delete this game everywhere (also removes it from customers&apos; game pools)</label>
                  {g.pages_project && <label className="flex items-center gap-2"><input type="checkbox" name="delete_project" /> and delete the Cloudflare project</label>}
                  <button className="rounded-md px-4 py-2 font-medium text-white bg-red-700 hover:bg-red-600" type="submit">Delete</button>
                </form>
              </details>
            </article>
          );
        })}
      </section>
    </div>
  );
}

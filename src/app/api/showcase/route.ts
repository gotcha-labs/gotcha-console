import { listGames } from "@/lib/server/showcase";

// Public feed of the games shown on gotcha.land (site keys are public by design).
// Rendered per request (needs runtime secrets); the CDN caches it for 60s.
export const dynamic = "force-dynamic";

export async function GET() {
  const games = (await listGames())
    .filter((g) => g.visible)
    .map(({ label, description, preview_url, site_key, pages_project }) => ({
      slug: pages_project ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      description,
      preview_url,
      site_key,
    }));
  return Response.json(games, {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
  });
}

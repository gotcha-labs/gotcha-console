"use server";

import { Challenge } from "./types";
import env from "./env";

// Read the current catalog so newly registered games are immediately selectable.
export async function getChallenges(accessToken: string): Promise<Challenge[]> {
  const challenges: {
    url: string;
    label: string | null;
    width: number;
    height: number;
    small_width: number;
    small_height: number;
    logo_url: string | null;
  }[] = await fetch(`${env.GOTCHA_ORIGIN}/api/challenge/all`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((r) => {
    if (!r.ok) throw new Error("Failed to load challenge catalog");
    return r.json();
  });

  return challenges.map((c) => ({
    url: c.url,
    label: c.label,
    width: c.width,
    height: c.height,
    smallWidth: c.small_width,
    smallHeight: c.small_height,
    logoUrl: c.logo_url,
  }));
}

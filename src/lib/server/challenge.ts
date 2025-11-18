"use server";

import { unstable_cache } from "next/cache";
import { Challenge } from "./types";
import env from "./env";

// FIXME: should it be a cache? when to invalidate?
export const getChallenges = unstable_cache(
  async (accessToken: string): Promise<Challenge[]> => {
    const challenges: {
      url: string;
      label: string | null;
      width: number;
      height: number;
      small_width: number;
      small_height: number;
      logo_url: string | null;
    }[] = await fetch(`${env.GOTCHA_ORIGIN}/api/challenge/all`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((r) => r.json());

    return challenges.map((c) => ({
      url: c.url,
      label: c.label,
      width: c.width,
      height: c.height,
      smallWidth: c.small_width,
      smallHeight: c.small_height,
      logoUrl: c.logo_url,
    }));
  },
  ["challenges"],
  { tags: ["challenges"] },
);

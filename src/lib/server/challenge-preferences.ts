"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { ChallengePreferences } from "./types";
import env from "./env";

export const getChallengePreferences = unstable_cache(
  async (accessToken: string, appId: string): Promise<ChallengePreferences> => {
    const response = (await fetch(
      `${env.GOTCHA_ORIGIN}/api/console/${appId}/challenge-preferences`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
      .then((r) => r.json())
      .then((challenge) => ({
        width: challenge.width,
        height: challenge.height,
        smallWidth: challenge.small_width,
        smallHeight: challenge.small_height,
        logoUrl: challenge.logo_url,
      }))) as ChallengePreferences;

    return response;
  },
  ["challenge-preferences"],
  { tags: ["challenge-preferences"] },
);

type UpdateChallengePreferences = Partial<ChallengePreferences>;

export async function updateChallengePreferences(
  appId: string,
  update: UpdateChallengePreferences,
): Promise<void> {
  await fetch(
    `${env.GOTCHA_ORIGIN}/api/console/${appId}/challenge-preferences`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
      },
      body: JSON.stringify({
        width: update.width,
        height: update.height,
        small_width: update.smallWidth,
        small_height: update.smallHeight,
        logo_url: update.logoUrl,
      }),
    },
  );

  revalidateTag("challenge-preferences");
}

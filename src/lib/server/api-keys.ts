"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { ApiKey } from "./types";
import { getAccessToken } from "@auth0/nextjs-auth0";
import env from "./env";

export const getApiKeys = unstable_cache(
  async (accessToken: string, appId: string): Promise<ApiKey[]> => {
    const keys: {
      site_key: string;
      secret: string;
      label: string | null;
      allowed_domains?: string[];
    }[] = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).then((r) => r.json());

    return keys.map((k) => ({
      siteKey: k.site_key,
      secretKey: k.secret,
      label: k.label,
      allowedDomains: k.allowed_domains || [], // Placeholder: backend doesn't support this yet
    }));
  },
  ["api-keys"],
  { tags: ["api-keys"] },
);

export async function generateApiKey(appId: string) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  revalidateTag("api-keys");
}

type UpdateApiKey = {
  name?: string;
  allowedDomains?: string[];
};

export async function updateApiKey(
  appId: string,
  siteKey: string,
  update: UpdateApiKey,
) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
    body: JSON.stringify({
      label: update.name ?? null,
      allowed_domains: update.allowedDomains ?? null,
    }),
  });

  revalidateTag("api-keys");
}

export async function revokeApiKey(appId: string, siteKey: string) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  revalidateTag("api-keys");
}

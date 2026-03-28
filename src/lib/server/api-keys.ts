"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { ApiKey, ApiKeyUnstable } from "./types";
import { getAccessToken } from "@auth0/nextjs-auth0";
import env from "./env";

export const getApiKeysUnstable = async (
  accessToken: string,
  appId: string,
): Promise<ApiKeyUnstable[]> => {
  const apiKeys = await getApiKeys(accessToken, appId);
  const apiKeysUnstable = await Promise.all(
    apiKeys.map(async (k) => ({
      ...k,
      challengePool: (
        await getApiKeysChallengePool(accessToken, appId, k.siteKey)
      ).challenges,
    })),
  );

  return apiKeysUnstable;
};

export const getApiKeys = unstable_cache(
  async (accessToken: string, appId: string): Promise<ApiKey[]> => {
    const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.status}`);
    }

    const keys: {
      site_key: string;
      secret: string;
      label: string | null;
      allowed_domains?: string[];
    }[] = await response.json();

    return keys.map((k) => ({
      siteKey: k.site_key,
      secretKey: k.secret,
      label: k.label,
      allowedDomains: k.allowed_domains || [],
    }));
  },
  ["api-keys"],
  { tags: ["api-keys"] },
);

export async function generateApiKey(appId: string) {
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate API key: ${response.status}`);
  }

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
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}`, {
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

  if (!response.ok) {
    throw new Error(`Failed to update API key: ${response.status}`);
  }

  revalidateTag("api-keys");
}

export async function revokeApiKey(appId: string, siteKey: string) {
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to revoke API key: ${response.status}`);
  }

  revalidateTag("api-keys");
}

type ApiKeyChallengePool = {
  challenges: string[];
};

export const getApiKeysChallengePool = unstable_cache(
  async (
    accessToken: string,
    appId: string,
    siteKey: string,
  ): Promise<ApiKeyChallengePool> => {
    const response = await fetch(
      `${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}/challenge-pool`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch challenge pool: ${response.status}`);
    }

    const challengePool: ApiKeyChallengePool = await response.json();

    return challengePool;
  },
  ["api-keys-challenge-pool"],
  { tags: ["api-keys-challenge-pool"] },
);

export async function addChallengeToApiKeyPool(
  appId: string,
  siteKey: string,
  challengeUrl: string,
) {
  const response = await fetch(
    `${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}/challenge-pool`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
      },
      body: JSON.stringify({
        challenge_url: challengeUrl,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to add challenge to pool: ${response.status}`);
  }

  revalidateTag("api-keys-challenge-pool");
}

export async function removeChallengeToApiKeyPool(
  appId: string,
  siteKey: string,
  challengeUrl: string,
) {
  const response = await fetch(
    `${env.GOTCHA_ORIGIN}/api/console/${appId}/api-key/${siteKey}/challenge-pool`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
      },
      body: JSON.stringify({
        challenge_url: challengeUrl,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to remove challenge from pool: ${response.status}`);
  }

  revalidateTag("api-keys-challenge-pool");
}

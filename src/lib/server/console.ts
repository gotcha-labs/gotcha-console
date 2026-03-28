"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { Application } from "./types";
import { getAccessToken } from "@auth0/nextjs-auth0";
import env from "./env";

export const getApplications = unstable_cache(
  async (accessToken: string): Promise<Application[]> => {
    const apps: { id: string; label?: string }[] = await fetch(
      `${env.GOTCHA_ORIGIN}/api/console`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).then(async (r) => {
      if (r.status !== 200) {
        throw new Error(`error fetching applications: ${r.status}`);
      }
      return await r.json();
    });

    return apps.map((a) => ({
      id: a.id,
      name: a.label,
    }));
  },
  ["applications"],
  { tags: ["applications"] },
);

export async function createApplication(name?: string) {
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
    body: JSON.stringify({
      label: name ?? "New Application",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create application: ${response.status}`);
  }

  revalidateTag("applications");
}

export async function deleteApplication(id: string) {
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete application: ${response.status}`);
  }

  revalidateTag("applications");
}

type UpdateApplication = {
  name?: string;
};

export async function updateApplication(
  consoleId: string,
  updateApp: UpdateApplication,
) {
  const response = await fetch(`${env.GOTCHA_ORIGIN}/api/console/${consoleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
    body: JSON.stringify({
      label: updateApp.name ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update application: ${response.status}`);
  }

  revalidateTag("applications");
}

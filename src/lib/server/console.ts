"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { Application } from "./types";
import { getAccessToken } from "@auth0/nextjs-auth0";
import env from "./env";

// Server actions used by the console UI to interact with the Gotcha API.

// Fetch the list of console applications for the authenticated user. The
// result is cached server side and revalidated when applications are mutated.
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

// Create a new application on the Gotcha service. When successful the
// applications cache is revalidated so subsequent calls include the new entry.
export async function createApplication(name?: string) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
    body: JSON.stringify({
      label: name ?? "New Application",
    }),
  });

  revalidateTag("applications");
}

// Delete the specified application and trigger a cache revalidation so the UI
// reflects the removal immediately.
export async function deleteApplication(id: string) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
  });

  revalidateTag("applications");
}

type UpdateApplication = {
  name?: string;
};

// Update an application's metadata and revalidate the applications cache so any
// changes are immediately visible to the user interface.
export async function updateApplication(
  consoleId: string,
  updateApp: UpdateApplication,
) {
  await fetch(`${env.GOTCHA_ORIGIN}/api/console/${consoleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await getAccessToken()).accessToken}`,
    },
    body: JSON.stringify({
      label: updateApp.name ?? null,
    }),
  });

  revalidateTag("applications");
}

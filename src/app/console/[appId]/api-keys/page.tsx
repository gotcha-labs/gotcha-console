import ApiKeyCard from "@/components/api-keys/ApiKeyCard";
import {
  generateApiKey,
  getApiKeys,
  updateApiKey,
} from "@/lib/server/api-keys";
import { getApplications } from "@/lib/server/console";
import { getAccessToken } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage({
  params,
}: {
  params: { appId: string };
}) {
  const accessToken = (await getAccessToken()).accessToken!!;
  const apps = await getApplications(accessToken);
  const keysByApp = await Promise.all(
    apps.map(async (a) => ({ app: a, keys: await getApiKeys(accessToken, a.id) }))
  );

  async function handleGenKey(appId: string) {
    "use server";
    return await generateApiKey(appId);
  }

  async function handleEditKey(appId: string, siteKey: string, label: string) {
    "use server";
    return await updateApiKey(appId, siteKey, { name: label });
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">API Keys</h2>

      <div className="space-y-8">
        {keysByApp.map(({ app, keys: appKeys }) => (
          <div key={app.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-100">
                {app.name ?? "New Application"}
              </h3>
              <form action={handleGenKey.bind(null, app.id)}>
                <input
                  type="submit"
                  value="Generate New API Key"
                  className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md"
                />
              </form>
            </div>

            <div className="space-y-4">
              {appKeys.length === 0 ? (
                <p className="text-gray-400">No API keys yet.</p>
              ) : (
                appKeys.map((key) => (
                  <ApiKeyCard
                    key={key.siteKey}
                    apiKey={key}
                    appId={app.id}
                    onEdit={async (l) => {
                      "use server";
                      await handleEditKey(app.id, key.siteKey, l);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

import ApiKeyCard from "@/components/api-keys/ApiKeyCard";
import {
  addChallengeToApiKeyPool,
  generateApiKey,
  getApiKeysUnstable,
  removeChallengeToApiKeyPool,
  updateApiKey,
} from "@/lib/server/api-keys";
import { getChallenges } from "@/lib/server/challenge";
import { getApplications } from "@/lib/server/console";
import { getAccessTokenOrLogout } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage({
  params,
}: {
  params: { appId: string };
}) {
  const accessToken = await getAccessTokenOrLogout();
  const apps = await getApplications(accessToken);
  const challenges = await getChallenges(accessToken);
  const keysByApp = await Promise.all(
    apps.map(async (a) => ({
      app: a,
      keys: await getApiKeysUnstable(accessToken, a.id),
    })),
  );

  async function handleGenKey(appId: string) {
    "use server";
    return await generateApiKey(appId);
  }

  async function handleEditKey(appId: string, siteKey: string, label: string) {
    "use server";
    return await updateApiKey(appId, siteKey, { name: label });
  }

  async function handleDomainChange(
    appId: string,
    siteKey: string,
    domains: string[],
  ) {
    "use server";
    return await updateApiKey(appId, siteKey, { allowedDomains: domains });
  }

  async function handleAddChallenge(
    appId: string,
    siteKey: string,
    challengeUrl: string,
  ) {
    "use server";
    return await addChallengeToApiKeyPool(appId, siteKey, challengeUrl);
  }

  async function handleRemoveChallenge(
    appId: string,
    siteKey: string,
    challengeUrl: string,
  ) {
    "use server";
    return await removeChallengeToApiKeyPool(appId, siteKey, challengeUrl);
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
                    challenges={challenges}
                    onEdit={async (l) => {
                      "use server";
                      await handleEditKey(app.id, key.siteKey, l);
                    }}
                    onDomainsChange={async (domains) => {
                      "use server";
                      await handleDomainChange(app.id, key.siteKey, domains);
                    }}
                    onAddChallenge={async (challengeUrl) => {
                      "use server";
                      await handleAddChallenge(
                        app.id,
                        key.siteKey,
                        challengeUrl,
                      );
                    }}
                    onRemoveChallenge={async (challengeUrl) => {
                      "use server";
                      await handleRemoveChallenge(
                        app.id,
                        key.siteKey,
                        challengeUrl,
                      );
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

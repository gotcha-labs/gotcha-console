import ApiKeyCard from "@/components/api-keys/ApiKeyCard";
import {
  addChallengeToApiKeyPool,
  generateApiKey,
  getApiKeysUnstable,
  removeChallengeToApiKeyPool,
  updateApiKey,
} from "@/lib/server/api-keys";
import { getChallenges } from "@/lib/server/challenge";

import { getAccessToken } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage({
  params,
}: {
  params: { appId: string };
}) {
  const accessToken = (await getAccessToken()).accessToken!!;
  const [challenges, appKeys] = await Promise.all([
    getChallenges(accessToken),
    getApiKeysUnstable(accessToken, params.appId),
  ]);

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">API Keys</h2>
        <form action={handleGenKey.bind(null, params.appId)}>
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
              appId={params.appId}
              challenges={challenges}
              onEdit={async (l) => {
                "use server";
                await handleEditKey(params.appId, key.siteKey, l);
              }}
              onDomainsChange={async (domains) => {
                "use server";
                await handleDomainChange(params.appId, key.siteKey, domains);
              }}
              onAddChallenge={async (challengeUrl) => {
                "use server";
                await handleAddChallenge(
                  params.appId,
                  key.siteKey,
                  challengeUrl,
                );
              }}
              onRemoveChallenge={async (challengeUrl) => {
                "use server";
                await handleRemoveChallenge(
                  params.appId,
                  key.siteKey,
                  challengeUrl,
                );
              }}
            />
          ))
        )}
      </div>
    </>
  );
}

import ChallengePreferencesCard from "@/components/challenge-preferences/ChallengePreferencesCard";
import {
  getChallengePreferences,
  updateChallengePreferences,
} from "@/lib/server/challenge-preferences";
import { ChallengePreferences } from "@/lib/server/types";
import { getAccessToken } from "@auth0/nextjs-auth0";

export const dynamic = "force-dynamic";

export default async function ChallengePreferencesPage({
  params,
}: {
  params: { appId: string };
}) {
  const accessToken = (await getAccessToken()).accessToken!!;
  const preferences = await getChallengePreferences(accessToken, params.appId);

  async function handleUpdatePreferences(
    update: Partial<ChallengePreferences>,
  ): Promise<void> {
    "use server";
    await updateChallengePreferences(params.appId, update);
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100">
          Challenge Preferences
        </h2>
        <p className="text-gray-400 mt-2">
          Customize the appearance and dimensions of your CAPTCHA challenges
        </p>
      </div>

      <ChallengePreferencesCard
        preferences={preferences}
        onUpdate={handleUpdatePreferences}
      />
    </>
  );
}

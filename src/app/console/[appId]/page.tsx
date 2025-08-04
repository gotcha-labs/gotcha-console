import { createApplication, getApplications } from "@/lib/server/console";
import ApplicationCard from "@/components/console/ApplicationCard";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { PlusIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const tokenRes = await getAccessToken();
  const apps = await getApplications(tokenRes.accessToken!!);

  async function handleSubmit(form: FormData) {
    "use server";
    await createApplication((form.get("name") as string | null) ?? undefined);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">Your Applications</h2>
          <p className="text-gray-400">Manage and create applications for your integration</p>
        </div>
        <form action={handleSubmit} className="mt-4 sm:mt-0">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Application
          </button>
        </form>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.length === 0 ? (
          <p className="text-gray-400">No applications yet.</p>
        ) : (
          apps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))
        )}
      </div>
    </>
  );
}

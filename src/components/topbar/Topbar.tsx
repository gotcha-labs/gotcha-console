import { getSession } from "@auth0/nextjs-auth0";
import { ApplicationSelector } from "./ApplicationSelector";
import { getApplications } from "@/lib/server/console";

type TopbarProps = {
  appId: string;
};

export default async function Topbar({ appId }: TopbarProps) {
  const session = await getSession();
  const appsList = await getApplications();

  return (
    <header className="px-8 h-16 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
      <div className="text-gray-600">
        <ApplicationSelector appsList={appsList} />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 hover:text-gray-900">
          {session?.user?.name}
        </span>
        <a
          href="/api/auth/logout"
          className="text-gray-600 hover:text-gray-900"
        >
          Logout
        </a>
      </div>
    </header>
  );
}

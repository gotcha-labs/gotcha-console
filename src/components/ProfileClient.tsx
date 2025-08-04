"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function ProfileClient() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    user && (
      <div className="space-y-1">
        <p className="text-gray-700 dark:text-gray-300">You're logged in as:</p>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
      </div>
    )
  );
}

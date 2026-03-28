"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-100">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-400">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-block rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-100">404</h1>
        <p className="mt-2 text-gray-400">Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

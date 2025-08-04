"use client";

import Link from "next/link";
import { PropsWithChildren } from "react";
import { UrlObject } from "url";
import { usePathname } from "next/navigation";

export type NavItemProps = PropsWithChildren<{
  href: string | UrlObject;
}>;

export default function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname();
  const hrefPath = typeof href === "string" ? href : href.pathname ?? "";
  const isActive = pathname === hrefPath;

  return (
    <Link
      href={href}
      className={`flex items-center px-6 py-3 rounded-md transition-colors ${
        isActive
          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      }`}
    >
      {children}
    </Link>
  );
}

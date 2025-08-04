"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSidebar } from "../sidebar/SidebarContext";

export default function MenuButton() {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className="md:hidden text-gray-300 hover:text-white mr-2"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}

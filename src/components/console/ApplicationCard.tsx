"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import EditableLabel from "../EditableLabel";
import { deleteApplication, updateApplication } from "@/lib/server/console";
import { Application } from "@/lib/server/types";

// UI component used to display and manage a single application entry. It allows
// inline editing of the application name and reveals management actions when
// expanded.

type ApplicationCardProps = {
  app: Application;
};

export default function ApplicationCard({ app }: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="px-4 flex items-center justify-between">
        <EditableLabel
          value={app.name ?? "New Application"}
          onEdit={async (newName) =>
            await updateApplication(app.id, { name: newName })
          }
        />
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-grow self-stretch cursor-pointer"
        ></div>
        {/* Toggle button expands or collapses the management actions */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="my-4 text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <form action={deleteApplication.bind(null, app.id)}>
              <input type="hidden" name="id" value={app.id} />
              <button
                type="submit"
                className="bg-red-600 text-white p-1 px-3 rounded hover:bg-red-700 text-sm font-medium"
              >
                Delete Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

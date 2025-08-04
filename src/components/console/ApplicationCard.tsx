"use client";

import { useState, useRef } from "react";
import EditableLabel from "../EditableLabel";
import Link from "next/link";
import { deleteApplication, updateApplication } from "@/lib/server/console";
import { Application } from "@/lib/server/types";
import ConfirmModal from "../ConfirmModal";

type ApplicationCardProps = {
  app: Application;
};

export default function ApplicationCard({ app }: ApplicationCardProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm bg-gray-800 transition-shadow hover:shadow">
      <div className="px-6 py-4 flex items-center justify-between">
        <EditableLabel
          value={app.name ?? "New Application"}
          onEdit={async (newName) => await updateApplication(app.id, { name: newName })}
          showEditIcon
        />
        <div className="flex-grow"></div>
      </div>
      <div className="px-6 py-4 bg-gray-800 flex items-center justify-between">

        <Link
          href={`/console/${app.id}/api-keys`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Manage API Keys
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Delete Application
        </button>
        <form ref={formRef} action={deleteApplication.bind(null, app.id)} />
        <ConfirmModal
          open={open}
          title="Delete Application"
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false);
            formRef.current?.requestSubmit();
          }}
        >
          {`Are you sure you want to delete the application "${app.name}"?`}
        </ConfirmModal>
      </div>
    </div>
  );
}

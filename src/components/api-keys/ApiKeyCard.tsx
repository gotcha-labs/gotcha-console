"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import KeyField from "./KeyField";
import EditableLabel from "../EditableLabel";
import ConfirmModal from "../ConfirmModal";
import { revokeApiKey } from "@/lib/server/api-keys";
import { ApiKey } from "@/lib/server/types";

type ApiKeyCardProps = {
  apiKey: ApiKey;
  onEdit?: (label: string) => Promise<void>;
  appId: string;
};

export default function ApiKeyCard({ apiKey, onEdit, appId }: ApiKeyCardProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <EditableLabel
          value={apiKey.label ?? "New API key"}
          onEdit={async (l) => onEdit?.(l)}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-red-500 hover:text-red-600 flex items-center"
        >
          <XCircleIcon className="h-5 w-5 mr-1" />
          Revoke
        </button>
        <form
          ref={formRef}
          action={revokeApiKey.bind(null, appId, apiKey.siteKey)}
        />
        <ConfirmModal
          open={open}
          title="Revoke API Key"
          confirmText="Revoke"
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false);
            formRef.current?.requestSubmit();
          }}
        >
          Are you sure you want to revoke this API key?
        </ConfirmModal>
      </div>

      <div className="space-y-3">
        <KeyField label="Site Key" value={apiKey.siteKey} />
        <KeyField label="Secret Key" value={apiKey.secretKey} isSecret />
      </div>
    </div>
  );
}

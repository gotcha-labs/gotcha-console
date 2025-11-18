"use client";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import KeyField from "./KeyField";
import EditableLabel from "../EditableLabel";
import ConfirmModal from "../ConfirmModal";
import DomainManager from "./DomainManager";
import { revokeApiKey } from "@/lib/server/api-keys";
import { ApiKeyUnstable, Challenge } from "@/lib/server/types";

type ApiKeyCardProps = {
  apiKey: ApiKeyUnstable;
  challenges: Challenge[];
  onEdit?: (label: string) => Promise<void>;
  onDomainsChange?: (domains: string[]) => Promise<void>;
  onAddChallenge?: (challengeUrl: string) => Promise<void>;
  onRemoveChallenge?: (challengeUrl: string) => Promise<void>;
  appId: string;
};

export default function ApiKeyCard({
  apiKey,
  challenges,
  onEdit,
  onDomainsChange,
  onAddChallenge,
  onRemoveChallenge,
  appId,
}: ApiKeyCardProps) {
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

      <div className="space-y-4">
        <div className="space-y-3">
          <KeyField label="Site Key" value={apiKey.siteKey} />
          <KeyField label="Secret Key" value={apiKey.secretKey} isSecret />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <DomainManager
            domains={apiKey.allowedDomains}
            onDomainsChange={onDomainsChange}
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-1">
            Challenge Pool
          </h3>
          <div className="text-xs text-gray-500 mb-2">
            All challenges are in the pool if none are selected.
          </div>
          <div className="space-y-2">
            {challenges.map((challenge) => (
              <div key={challenge.url} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${apiKey.siteKey}-${challenge.url}`}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={apiKey.challengePool.includes(challenge.url)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onAddChallenge?.(challenge.url);
                    } else {
                      onRemoveChallenge?.(challenge.url);
                    }
                  }}
                />
                <label
                  htmlFor={`${apiKey.siteKey}-${challenge.url}`}
                  className="ml-2 block text-sm text-gray-300"
                >
                  <span className="font-bold">
                    {challenge.label ?? "<no label>"}
                  </span>{" "}
                  -{" "}
                  <a href={challenge.url} className="hover:underline">
                    {challenge.url}
                  </a>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

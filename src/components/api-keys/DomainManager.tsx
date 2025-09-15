"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

type DomainManagerProps = {
  domains: string[];
  onDomainsChange?: (domains: string[]) => Promise<void>;
  disabled?: boolean;
};

export default function DomainManager({
  domains,
  onDomainsChange,
  disabled = false,
}: DomainManagerProps) {
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAddDomain = async () => {
    const trimmedDomain = newDomain.trim();

    if (!trimmedDomain) {
      setError("Domain cannot be empty");
      return;
    }

    if (domains.includes(trimmedDomain)) {
      setError("Domain already exists");
      return;
    }

    setError("");
    setIsAdding(true);

    try {
      const updatedDomains = [...domains, trimmedDomain];
      await onDomainsChange?.(updatedDomains);
      setNewDomain("");
    } catch (err) {
      setError("Failed to add domain");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDomain = async (domainToRemove: string) => {
    try {
      const updatedDomains = domains.filter((d) => d !== domainToRemove);
      await onDomainsChange?.(updatedDomains);
    } catch (err) {
      setError("Failed to remove domain");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">
          Allowed Domains
        </span>
        <span className="text-xs text-gray-500">
          {domains.length === 0
            ? "All domains allowed"
            : `${domains.length} domain${domains.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="space-y-2">
        {domains.map((domain) => (
          <div
            key={domain}
            className="flex items-center justify-between bg-gray-700 p-2 rounded border"
          >
            <code className="text-sm text-gray-200">{domain}</code>
            <button
              type="button"
              onClick={() => handleRemoveDomain(domain)}
              disabled={disabled}
              className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove domain"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g., example.com, localhost"
            disabled={disabled || isAdding}
            className="flex-1 bg-gray-700 text-gray-200 px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleAddDomain}
            disabled={disabled || isAdding || !newDomain.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded flex items-center justify-center"
            title="Add domain"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-700/30">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Add domains where this API key can be used.
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import VisibilityToggle from "./VisibilityToggle";

type KeyFieldProps = {
  label: string;
  value: string;
  isSecret?: boolean;
};

export default function KeyField({
  label,
  value,
  isSecret = false,
}: KeyFieldProps) {
  const [showSecret, setShowSecret] = useState(false);
  const displayValue = isSecret && !showSecret ? "•".repeat(20) : value;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 w-24">{label}:</span>
      <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded flex-1">
        {displayValue}
      </code>
      <div className="flex items-center space-x-2 w-[72px] justify-end">
        <CopyButton text={value} />
        {isSecret ? (
          <VisibilityToggle
            show={showSecret}
            onToggle={() => setShowSecret((s) => !s)}
          />
        ) : (
          <div className="w-5" />
        )}
      </div>
    </div>
  );
}

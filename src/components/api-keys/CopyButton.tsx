import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Toast from "../Toast";

type CopyButtonProps = {
  text: string;
};

export default function CopyButton({ text }: CopyButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={copyToClipboard}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        title="Copy to clipboard"
      >
        <ClipboardDocumentIcon className="h-5 w-5" />
      </button>

      <Toast show={showToast} position="inline">
        Copied!
      </Toast>
    </div>
  );
}

"use client";
import { ReactNode } from "react";

export default function ConfirmModal({
  open,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = "Delete",
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{title}</h2>
        {children && <div className="text-gray-300 mb-4">{children}</div>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

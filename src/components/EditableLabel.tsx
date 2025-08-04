import { useState, useRef, useEffect } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

type EditableLabelProps = {
  value: string;
  onEdit: (newValue: string) => Promise<void>;
  autoEdit?: boolean;
  showEditIcon?: boolean;
};

export default function EditableLabel({
  value,
  onEdit,
  autoEdit = false,
  showEditIcon = false,
}: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [originalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = async () => {
    if (inputValue.trim() === "" || inputValue === value) {
      setInputValue(value);
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onEdit(inputValue);
      setIsEditing(false);
    } catch (error) {
      // Revert to original value on error
      setInputValue(originalValue);
      console.error("Failed to update label:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        disabled={isLoading}
        className={`
          font-medium text-gray-700 dark:text-gray-300 px-1 py-0.5 border rounded
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          w-full max-w-[200px]
        `}
      />
    );
  }

  return (
    <div className="flex items-center">
      <h3
        onClick={() => setIsEditing(true)}
        className="font-semibold text-gray-800 dark:text-gray-100 text-xl border border-transparent cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 px-1 py-0.5 transition-colors"
      >
        {inputValue}
      </h3>
      {showEditIcon && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Edit label"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

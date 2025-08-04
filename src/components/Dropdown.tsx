"use client";

import {
  useState,
  useRef,
  useEffect,
  PropsWithChildren,
  cloneElement,
  ReactElement,
  Children,
  forwardRef,
} from "react";

type DropdownProps = PropsWithChildren<{
  label?: string;
  value?: string;
  className?: string;
}>;

export function Dropdown({
  children,
  label,
  value = "",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const optionElements = Children.toArray(children).map((child, index) =>
    cloneElement(child as ReactElement, {
      ref: (el: HTMLLIElement) => {
        optionRefs.current[index] = el;
      },
      tabIndex: focusedIndex === index ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent<HTMLLIElement>) =>
        handleOptionKeyDown(e, index),
    }),
  );

  function handleButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => {
          const dir = e.key === "ArrowDown" ? 1 : -1;
          const count = optionRefs.current.length;
          const next = prev + dir;
          if (next < 0) return count - 1;
          if (next >= count) return 0;
          return next;
        });
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  }

  function handleOptionKeyDown(
    e: React.KeyboardEvent<HTMLLIElement>,
    index: number,
  ) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const count = optionRefs.current.length;
        const next = index + dir;
        if (next < 0) return count - 1;
        if (next >= count) return 0;
        return next;
      });
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).click();
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-center gap-2 ${className}`}
    >
      {label && <label className="sr-only">{label}</label>}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setFocusedIndex(0);
        }}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 text-left"
      >
        {value || "Select option"}
      </button>

      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>

      {isOpen && (
        <ol
          role="listbox"
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10"
        >
          {optionElements}
        </ol>
      )}
    </div>
  );
}

type DropdownOptionProps = PropsWithChildren<{
  value: string;
  className?: string;
}>;

export const DropdownOption = forwardRef<HTMLLIElement, DropdownOptionProps>(
  ({ children, className = "" }, ref) => {
    return (
      <li
        ref={ref}
        role="option"
        tabIndex={-1}
        className={`block overflow-x-hidden text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer ${className}`}
      >
        {children}
      </li>
    );
  },
);
DropdownOption.displayName = "DropdownOption";

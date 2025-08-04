import { PropsWithChildren } from "react";

type ToastProps = PropsWithChildren<{
  show: boolean;
  position?: "inline" | "fixed";
}>;

export default function Toast({
  show,
  children,
  position = "inline",
}: ToastProps) {
  const positionClasses =
    position === "inline"
      ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "fixed bottom-4 right-4";

  return (
    <div
      className={`
        ${positionClasses}
        px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg
        transform transition-all duration-200
        ${show ? "opacity-100 translate-y-0" : "invisible opacity-0 translate-y-1 pointer-events-none"}
      `}
      role="alert"
      aria-live="assertive"
    >
      {children}
    </div>
  );
}

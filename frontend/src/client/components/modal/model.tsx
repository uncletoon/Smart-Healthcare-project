import { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-10 z-[99999]">
      {/* Dimmed backdrop overlay with 6px blur */}
      <div
        className="fixed inset-0 h-full w-full bg-gray-950/40 backdrop-blur-[6px]"
        onClick={onClose}
      ></div>

      {/* Modal Box with max height screen constraint */}
      <div
        ref={modalRef}
        className={`relative w-full max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-50 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white transition shadow-sm"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        )}

        {/* Scrollable Container Body */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

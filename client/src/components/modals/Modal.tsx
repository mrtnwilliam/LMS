import { assets } from "../../assets/assets";
import type { ReactNode } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/50 z-50">
      <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80 z-50">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {/* Close button */}
        <img
          onClick={onClose}
          src={assets.cross_icon}
          className="absolute top-4 right-4 w-4 cursor-pointer"
          alt=""
        />

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}

export default Modal;

import { useEffect } from "react";

export default function ErrorToast({ message, onClose }: any) {
  useEffect(() => {
    const t = setTimeout(() => onClose(), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed top-4 right-4 bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg z-50"
      onClick={onClose}
    >
      ❌ {message}
    </div>
  );
}

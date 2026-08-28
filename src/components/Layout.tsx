import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { role } = useAuth();

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const userRole = role || "viewer";

  // auto close mobile on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden md:block
          ${open ? "w-64" : "w-20"}
          transition-all duration-300
          bg-white border-r shadow-md
        `}
      >
        <Sidebar
          open={open}
          setOpen={setOpen}
          role={userRole}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 md:hidden
          w-64 bg-white shadow-xl border-r
          transform transition-transform duration-300
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <Sidebar
          open={true}
          setOpen={setMobileOpen}
          role={userRole}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 bg-white shadow-sm border-b flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              onClick={() =>
                setMobileOpen(true)
              }
              className="md:hidden text-xl"
            >
              ☰
            </button>

            <h1 className="text-sm md:text-lg font-semibold text-gray-700">
              ZIST Admin Panel
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-3 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
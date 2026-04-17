import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { role } = useAuth();
  const [open, setOpen] = useState(true);

  // Safety fallback
  const userRole = role || "viewer";

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`
          ${open ? "w-64" : "w-20"}
          transition-all duration-300
          bg-white
          shadow-md
          border-r
        `}
      >
        <Sidebar
          open={open}
          setOpen={setOpen}
          role={userRole}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar (Optional future header) */}
        <div className="h-14 bg-white shadow-sm border-b flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-700">
            ZIST Admin Panel
          </h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

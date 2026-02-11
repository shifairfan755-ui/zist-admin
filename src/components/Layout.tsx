import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      <div className={`${open ? "w-64" : "w-20"} fixed h-screen`}>
        <Sidebar open={open} setOpen={setOpen} role={user.role} />
      </div>

      <div className={`flex-1 ml-${open ? "64" : "20"} transition-all`}>
        <header className="p-4 shadow bg-white">
          Role: {user.role}
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

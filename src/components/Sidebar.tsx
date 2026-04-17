import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  role: string | null;
  loading: boolean;
}

export default function Sidebar({
  open,
  setOpen,
  role,
  loading,
}: SidebarProps) {
  const location = useLocation();

  if (loading) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#071A36] text-white p-6 z-40">
        Loading…
      </aside>
    );
  }

  const menuConfig: Record<string, any[]> = {
    admin: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "New Application", to: "/applications/new" },
      { label: "Applications", to: "/applications" },
      { label: "Beneficiaries", to: "/beneficiaries" },
      { label: "Payments", to: "/payments" },
      { label: "Soft Loans", to: "/soft-loans" },
      { label: "Soft Loan Dashboard", to: "/soft-loan-dashboard" },
      { label: "Donors", to: "/donors" },
      { label: "Donor Dashboard", to: "/donor-dashboard" },
      { label: "All Documents", to: "/documents/all" },
      { label: "Upload Documents", to: "/documents/upload" },
      { label: "Users", to: "/users" },
      { label: "Import Data", to: "/import-data" },
      { label: "Success Stories", to: "/success-stories" },
    ],

    staff: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "New Application", to: "/applications/new" },
      { label: "Applications", to: "/applications" },
      { label: "Beneficiaries", to: "/beneficiaries" },
      { label: "Payments", to: "/payments" },
      { label: "Soft Loans", to: "/soft-loans" },
      { label: "Donors", to: "/donors" },
      { label: "Success Stories", to: "/success-stories" },
    ],

    viewer: [
      { label: "Dashboard", to: "/dashboard" },
      { label: "New Application", to: "/applications/new" },
      { label: "Applications", to: "/applications" },
      { label: "Beneficiaries", to: "/beneficiaries" },
      { label: "Success Stories", to: "/success-stories" },
    ],
  };

  const normalizedRole = role?.toLowerCase() || "viewer";
  const menu = menuConfig[normalizedRole] || menuConfig.viewer;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-[#071A36] text-white z-40
        transition-all duration-300 overflow-y-auto
        ${open ? "w-64" : "w-20"}
      `}
    >
      <div className="flex items-center justify-between p-6">
        {open && <h2 className="text-2xl font-bold">ZIST Admin</h2>}
        <button onClick={() => setOpen(!open)}>☰</button>
      </div>

      {open && (
        <p className="text-gray-300 px-6 mb-4 text-sm">
          Role: {normalizedRole}
        </p>
      )}

      <nav className="space-y-2 px-4">
        {menu.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`block py-2 px-3 rounded transition ${
                active
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-[#0A234A]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/logout"
        className="block mx-4 mt-10 mb-6 py-2 text-center bg-red-600 hover:bg-red-700 rounded"
      >
        Logout
      </Link>
    </aside>
  );
}

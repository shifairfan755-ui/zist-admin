import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  role: string | null;
  loading?: boolean;
}

export default function Sidebar({
  open,
  setOpen,
  role,
  loading = false,
}: SidebarProps) {
  const location = useLocation();

  if (loading) {
    return (
      <aside className="h-screen w-64 bg-[#071A36] text-white p-6">
        Loading...
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

  const normalizedRole =
    role?.toLowerCase() || "viewer";

  const menu =
    menuConfig[normalizedRole] ||
    menuConfig.viewer;

  const handleClose = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <aside
      className={`
        h-screen bg-[#071A36] text-white
        transition-all duration-300
        overflow-y-auto
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        {open && (
          <h2 className="text-2xl font-bold">
            ZIST Admin
          </h2>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="text-xl hover:text-gray-300"
        >
          ☰
        </button>
      </div>

      {/* Role */}
      {open && (
        <p className="text-gray-300 px-5 py-4 text-sm">
          Role: {normalizedRole}
        </p>
      )}

      {/* Menu */}
      <nav className="px-3 space-y-1">
        {menu.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(
              item.to + "/"
            );

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleClose}
              className={`
                block rounded-xl px-4 py-3 text-sm transition
                ${
                  active
                    ? "bg-white text-black font-semibold"
                    : "text-white hover:bg-white/10"
                }
              `}
            >
              {open
                ? item.label
                : item.label.charAt(0)}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-6">
        <Link
          to="/logout"
          onClick={handleClose}
          className="block w-full text-center py-3 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-medium"
        >
          {open ? "Logout" : "⎋"}
        </Link>
      </div>
    </aside>
  );
}
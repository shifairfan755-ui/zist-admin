import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  role: string;
  loading: boolean;
}

export default function Sidebar({ open, setOpen, role, loading }: SidebarProps) {
  const location = useLocation();

  if (loading) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#071A36] text-white p-6 z-40">
        Loading…
      </aside>
    );
  }

  const adminMenu = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "New Application", to: "/new-application" },
    { label: "Applications", to: "/applications" },
    { label: "Beneficiaries", to: "/beneficiaries" },
    { label: "Payments", to: "/payments" },
    { label: "Soft Loans", to: "/soft-loans" },
    { label: "Soft Loan Dashboard", to: "/soft-loan-dashboard" },
    { label: "Donors", to: "/donors" },
    { label: "Donor Dashboard", to: "/donor-dashboard" },

    // Documents
    { label: "All Documents", to: "/documents" },
    { label: "Upload Documents", to: "/documents/upload" },
    { label: "Trust Documents", to: "/documents/trust" },
    { label: "BOT Minutes", to: "/documents/bot" },
    { label: "Bank Documents", to: "/documents/bank" },
    { label: "Other Documents", to: "/documents/other" },

    { label: "Users", to: "/users" },
    { label: "Import Data", to: "/import-data" },
  ];

  const viewerMenu = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Applications", to: "/applications" },
    { label: "Beneficiaries", to: "/beneficiaries" },
    { label: "Success Stories", to: "/success-stories" },
  ];

  const menu = role === "admin" ? adminMenu : viewerMenu;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-[#071A36] text-white z-40
        transition-all duration-300 overflow-y-auto
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-6">
        {open && <h2 className="text-2xl font-bold">ZIST Admin</h2>}

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-white"
        >
          <span className="material-icons">menu</span>
        </button>
      </div>

      {/* ROLE */}
      {open && (
        <p className="text-gray-300 px-6 mb-3 text-sm">Role: {role}</p>
      )}

      {/* MENU ITEMS */}
      <nav className="space-y-2 px-4">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`
              block py-2 px-3 rounded transition
              ${
                location.pathname === item.to
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-[#0A234A]"
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* LOGOUT */}
      <Link
        to="/logout"
        className="block mx-4 mt-10 mb-6 py-2 text-center bg-red-600 hover:bg-red-700 rounded"
      >
        Logout
      </Link>
    </aside>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menu = [
    // MAIN
    { name: "Dashboard", path: "/dashboard" },
    { name: "New Application", path: "/new-application" },
    { name: "Applications", path: "/applications" },
    { name: "Beneficiaries", path: "/beneficiaries" },
    { name: "Payments", path: "/payments" },

    // SOFT LOANS
    { name: "Soft Loans", path: "/soft-loans" },
    { name: "Soft Loan Dashboard", path: "/soft-loan-dashboard" },

    // DONORS
    { name: "Donors", path: "/donors" },
    { name: "Donor Dashboard", path: "/donor-dashboard" },

    // DOCUMENTS
    { name: "All Documents", path: "/all-documents" },
    { name: "Upload Documents", path: "/upload-documents" }, // FIXED ROUTE
    { name: "Trust Documents", path: "/trust-documents" },
    { name: "BOT Minutes", path: "/bot-minutes" },
    { name: "Bank Documents", path: "/bank-documents" },
    { name: "Other Documents", path: "/other-documents" },

    // USERS
    { name: "Users", path: "/users" },

    // MISC
    { name: "Import Data", path: "/import-data" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 fixed left-0 top-0 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">ZIST Admin</h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg ${
                isActive ? "bg-gray-700" : "hover:bg-gray-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white py-2 mt-6 rounded"
      >
        Logout
      </button>
    </div>
  );
}

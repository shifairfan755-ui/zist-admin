import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import { 
  FiHome, FiFilePlus, FiUsers, FiUser, FiFile, FiFileText, 
  FiFolder, FiUpload, FiSettings
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menu = [
    // MAIN
    { name: "Dashboard", path: "/dashboard", icon: <FiHome /> },
    { name: "New Application", path: "/new-application", icon: <FiFilePlus /> },
    { name: "Applications", path: "/applications", icon: <FiFileText /> },
    { name: "Beneficiaries", path: "/beneficiaries", icon: <FiUsers /> },
    { name: "Payments", path: "/payments", icon: <FiFile /> },

    // SOFT LOANS
    { name: "Soft Loans", path: "/soft-loans", icon: <FiFileText /> },
    { name: "Soft Loan Dashboard", path: "/soft-loan-dashboard", icon: <MdDashboard /> },

    // DONORS
    { name: "Donors", path: "/donors", icon: <FiUser /> },
    { name: "Donor Dashboard", path: "/donor-dashboard", icon: <MdDashboard /> },

    // DOCUMENTS
    { name: "All Documents", path: "/all-documents", icon: <FiFolder /> },
    { name: "Upload Documents", path: "/upload-documents", icon: <FiUpload /> },
    { name: "Trust Documents", path: "/trust-documents", icon: <FiFolder /> },
    { name: "BOT Minutes", path: "/bot-minutes", icon: <FiFolder /> },
    { name: "Bank Documents", path: "/bank-documents", icon: <FiFolder /> },
    { name: "Other Documents", path: "/other-documents", icon: <FiFolder /> },

    // USERS
    { name: "Users", path: "/users", icon: <FiUsers /> },

    // MISC
    { name: "Import Data", path: "/import-data", icon: <FiSettings /> },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5 fixed left-0 top-0 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">
        ZIST Admin
        <br />
        <span className="text-sm">Management Portal</span>
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white py-2 mt-6 rounded flex items-center justify-center gap-2"
      >
        Logout
      </button>
    </div>
  );
}

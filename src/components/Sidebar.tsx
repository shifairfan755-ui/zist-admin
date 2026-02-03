import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  FolderOpenIcon,
  ChartPieIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

<button onClick={logout} className="...">
  Logout
</button>

  const menuItems = [
    { label: "Dashboard", icon: HomeIcon, to: "/dashboard" },
    { label: "New Application", icon: ClipboardDocumentListIcon, to: "/new-application" },
    { label: "Applications", icon: InboxStackIcon, to: "/applications" },
    { label: "Beneficiaries", icon: UserGroupIcon, to: "/beneficiaries" },
    { label: "Payments", icon: BanknotesIcon, to: "/payments" },
    { label: "Soft Loans", icon: ChartPieIcon, to: "/soft-loans" },
    { label: "Donors", icon: UsersIcon, to: "/donors" },
    { label: "Donor Dashboard", icon: ChartPieIcon, to: "/donor-dashboard" },
    { label: "All Documents", icon: FolderOpenIcon, to: "/documents" },
    { label: "Upload Documents", icon: DocumentDuplicateIcon, to: "/upload-documents" },
    { label: "Users", icon: UsersIcon, to: "/users" },
  ];

  return (
    <div className="h-screen w-64 bg-sidebarBg text-white flex flex-col shadow-xl">
      <div className="p-6 text-center border-b border-grayMid/20">
        <h1 className="text-2xl font-bold tracking-wide">ZIST Admin</h1>
        <p className="text-sm opacity-60">Management Portal</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                isActive
                  ? "bg-primaryLight text-white shadow-md"
                  : "text-gray-200 hover:bg-sidebarHover hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-grayMid/20">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-danger text-white py-3 rounded-lg hover:bg-red-700 transition-smooth"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: string[];
}) {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking permissions...</div>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

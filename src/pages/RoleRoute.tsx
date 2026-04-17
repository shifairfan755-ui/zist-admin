import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  allowedRoles: string[];
}

export default function RoleRoute({ allowedRoles }: Props) {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking permissions...</div>;
  }

  if (!role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

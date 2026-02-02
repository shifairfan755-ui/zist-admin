import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, role, loading } = useAuth();

  // Still checking? Don't block page yet.
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Checking session…
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User logged in BUT role not found yet → ALLOW TEMPORARILY
  if (!role) {
    console.warn("⚠ No role set — allowing temporary access.");
    return <Outlet />;
  }

  // Logged in & has role → show the page
  return <Outlet />;
}

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const GuestRoute: React.FC = () => {
  const { token, loading } = useAuth();

  const activeToken = token || localStorage.getItem("admin_token");

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (activeToken) {
    return <Navigate to="/facility-dashboard" replace />;
  }

  return <Outlet />;
};
export default GuestRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../utils/AuthProvider";

const ProtectedRoute = () => {
  const { loginState } = useAuthContext();

  // if (!loginState.isLogin || loginState.loggedInMemberLevel !== "10") {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;

import React from "react";
import { useAuth } from "../contexts/AuthContext";

const ProtectedElement = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.userName)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedElement;
import React from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "wagmi";

const PrivateRoute = ({ element }) => {
  const { isConnected } = useAccount();

  return isConnected ? element : <Navigate to="/" replace />;
};

export default PrivateRoute;

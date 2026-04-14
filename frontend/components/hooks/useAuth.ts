import { useContext } from "react";
import { AuthContext, AuthContextType } from "../../src/context/AuthContext";
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

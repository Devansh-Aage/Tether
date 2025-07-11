import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type AuthContextType = {
  userId: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const checkAuth = async () => {
    try {
      setIsAuthLoading(true);
      const res = await fetch(`${import.meta.env.VITE_HTTP_URL}app/auth`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_HTTP_URL}auth/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      setUserId(null);
      queryClient.clear();
      navigate("/auth/login");
      toast.info("Logged out!")
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Something went wrong. Try again!")
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    userId,
    isAuthLoading,
    checkAuth,
    logout,
    isAuthenticated: !!userId,
  };

  return <AuthContext.Provider value={value} >{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { User } from "../services/authService";
import storageService from "../services/storageService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await storageService.getUserData();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (userData: User, accessToken: string, refreshToken: string) => {
      try {
        await storageService.saveTokens(accessToken, refreshToken);
        await storageService.saveUserData(userData);
        setUser(userData);
      } catch (error) {
        console.error("Error during login:", error);
        throw error;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await storageService.clear();
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        if (user) {
          const updatedUser = { ...user, ...userData };
          await storageService.saveUserData(updatedUser);
          setUser(updatedUser);
        }
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

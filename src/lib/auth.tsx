import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { trpcMutation, setToken, clearToken } from "./api";

export type Role = "client" | "boutique" | "livreur" | "ramasseur" | "societe_livraison" | "admin";

interface CurrentUser {
  id: string;
  nom: string;
  role: Role;
}

interface AuthContextValue {
  user: CurrentUser | null;
  connexion: (telephone: string, motDePasse: string) => Promise<CurrentUser>;
  definirSession: (token: string, user: CurrentUser) => void;
  deconnexion: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "proxigaz_vitrine_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connexion = useCallback(async (telephone: string, motDePasse: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trpcMutation<{ token: string; user: CurrentUser }>("auth.connexion", {
        telephone,
        motDePasse,
      });
      setToken(data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la connexion");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const definirSession = useCallback((token: string, user: CurrentUser) => {
    setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const deconnexion = useCallback(() => {
    clearToken();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, connexion, definirSession, deconnexion, loading, error, clearError: () => setError(null) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}

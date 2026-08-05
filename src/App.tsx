import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth, Role } from "./lib/auth";
import { PublicHeader } from "./components/PublicHeader";
import { Footer } from "./components/Footer";
import { InstallPrompt } from "./components/InstallPrompt";
import { Home } from "./pages/Home";
import { AuthClient } from "./pages/AuthClient";
import { CommanderGaz } from "./pages/CommanderGaz";
import { DemanderRamassage } from "./pages/DemanderRamassage";
import { MesCommandes } from "./pages/MesCommandes";
import { SuiviCommande } from "./pages/SuiviCommande";
import { LoginPro } from "./pages/LoginPro";
import { InscriptionPro } from "./pages/InscriptionPro";
import { DashboardBoutique } from "./pages/pro/DashboardBoutique";
import { DashboardLivreur } from "./pages/pro/DashboardLivreur";
import { DashboardRamasseur } from "./pages/pro/DashboardRamasseur";

function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={role === "client" ? "/connexion" : "/pro"} replace />;
  }
  if (user.role !== role) {
    // Connecté, mais avec le mauvais rôle : redirige vers son propre espace
    const chemins: Record<string, string> = {
      client: "/commander-gaz",
      boutique: "/pro/boutique",
      livreur: "/pro/livreur",
      ramasseur: "/pro/ramasseur",
      admin: "/",
    };
    return <Navigate to={chemins[user.role] ?? "/"} replace />;
  }
  return <>{children}</>;
}

const DASHBOARDS_PRO = ["/pro/boutique", "/pro/livreur", "/pro/ramasseur"];

function AppRoutes() {
  const { pathname } = useLocation();
  // Les dashboards pro ont leur propre en-tête (ProHeader) et leur propre navigation
  // (BottomNav) — le header/footer publics n'y ont pas leur place, ils feraient double
  // emploi et grignoteraient l'espace précieux sur petit écran.
  const estDashboardPro = DASHBOARDS_PRO.some((r) => pathname.startsWith(r));

  return (
    <div className="flex min-h-screen flex-col">
      {!estDashboardPro && <PublicHeader />}
      <main className="flex-1">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<AuthClient />} />
        <Route path="/pro" element={<LoginPro />} />
        <Route path="/pro/inscription" element={<InscriptionPro />} />

        <Route path="/commander-gaz" element={<CommanderGaz />} />
        <Route path="/demander-ramassage" element={<DemanderRamassage />} />
        <Route
          path="/mes-commandes"
          element={
            <RequireRole role="client">
              <MesCommandes />
            </RequireRole>
          }
        />
        <Route
          path="/commande/:id"
          element={
            <RequireRole role="client">
              <SuiviCommande />
            </RequireRole>
          }
        />

        <Route
          path="/pro/boutique"
          element={
            <RequireRole role="boutique">
              <DashboardBoutique />
            </RequireRole>
          }
        />
        <Route
          path="/pro/livreur"
          element={
            <RequireRole role="livreur">
              <DashboardLivreur />
            </RequireRole>
          }
        />
        <Route
          path="/pro/ramasseur"
          element={
            <RequireRole role="ramasseur">
              <DashboardRamasseur />
            </RequireRole>
          }
        />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!estDashboardPro && <Footer />}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

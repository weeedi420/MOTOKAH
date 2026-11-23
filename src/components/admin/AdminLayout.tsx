import { Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth, checkUserIsAdmin } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

const ADMIN_GATE_KEY = "mtk_adm_unlocked";
// Hard-coded admin master password — do not expose in public repos
const ADMIN_GATE_HASH = "Mtk!Xq9$2026#pNw";

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_GATE_HASH) {
      try { sessionStorage.setItem(ADMIN_GATE_KEY, "1"); } catch {}
      onUnlock();
    } else {
      setError(true);
      setInput("");
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter the admin master password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Master password"
            autoFocus
            className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary transition ${error ? "border-destructive focus:ring-destructive" : "border-border"}`}
          />
          {error && <p className="text-xs text-destructive">Incorrect password</p>}
          <button type="submit" className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [gateOpen, setGateOpen] = useState(() => {
    try { return sessionStorage.getItem(ADMIN_GATE_KEY) === "1"; } catch { return false; }
  });

  const { user, loading: authLoading, isAdmin: authContextAdmin } = useAuth();

  const { data: supabaseIsAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      if (checkUserIsAdmin(user)) return true;
      if (user.id.startsWith("demo-")) return authContextAdmin;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      return Array.isArray(data) && data.length > 0;
    },
    enabled: !!user,
  });

  const isAdmin = authContextAdmin || supabaseIsAdmin || checkUserIsAdmin(user);

  if (!gateOpen) return <AdminGate onUnlock={() => setGateOpen(true)} />;

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-background px-4 gap-3 shrink-0">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

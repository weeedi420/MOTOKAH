import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconCar, IconUsers, IconFlag, IconEye, IconTrendingUp, IconClockHour4, IconBuildingStore, IconLock, IconCheck, IconX } from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { mockListings } from "@/data/mockData";

// Mock stats used when Supabase has no data
const MOCK_STATS = {
  totalListings: 247,
  totalUsers: 1842,
  openReports: 3,
  pendingListings: 12,
  approvedListings: 231,
  newThisWeek: 18,
  pendingDealers: 4,
};

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [listings, profiles, reports, pending, approved, thisWeek, pendingDealers] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("listings").select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .gte("created_at", subDays(new Date(), 7).toISOString()),
        supabase.from("dealer_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      const total = listings.count ?? 0;
      // If DB is empty, use mock stats
      if (total === 0) return { ...MOCK_STATS, _mock: true };
      return {
        totalListings: total,
        totalUsers: profiles.count ?? 0,
        openReports: reports.count ?? 0,
        pendingListings: pending.count ?? 0,
        approvedListings: approved.count ?? 0,
        newThisWeek: thisWeek.count ?? 0,
        pendingDealers: pendingDealers.count ?? 0,
        _mock: false,
      };
    },
  });

  const { data: listingsByDay } = useQuery({
    queryKey: ["admin-listings-by-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("created_at")
        .gte("created_at", subDays(new Date(), 29).toISOString())
        .order("created_at", { ascending: true });

      const dayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        dayMap[format(subDays(new Date(), i), "MMM d")] = 0;
      }
      (data || []).forEach(r => {
        const label = format(parseISO(r.created_at), "MMM d");
        if (label in dayMap) dayMap[label]++;
      });
      const result = Object.entries(dayMap).map(([date, count]) => ({ date, count }));
      // If empty, seed mock chart data
      if (result.every(r => r.count === 0)) {
        return result.map((r, i) => ({ ...r, count: Math.max(0, Math.round(3 + Math.sin(i / 3) * 2 + Math.random() * 4)) }));
      }
      return result;
    },
  });

  const { data: topMakes } = useQuery({
    queryKey: ["admin-top-makes"],
    queryFn: async () => {
      const { data } = await supabase.from("listings").select("make").eq("status", "approved");
      const counts: Record<string, number> = {};
      (data || []).forEach(r => { counts[r.make] = (counts[r.make] || 0) + 1; });
      const result = Object.entries(counts).map(([make, count]) => ({ make, count })).sort((a, b) => b.count - a.count).slice(0, 8);
      if (result.length === 0) {
        // Mock makes from mockListings
        const mockCounts: Record<string, number> = {};
        mockListings.forEach(l => { mockCounts[l.make] = (mockCounts[l.make] || 0) + Math.floor(Math.random() * 30 + 5); });
        return Object.entries(mockCounts).map(([make, count]) => ({ make, count })).sort((a, b) => b.count - a.count).slice(0, 8);
      }
      return result;
    },
  });

  const { data: usersByDay } = useQuery({
    queryKey: ["admin-users-by-day"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("created_at")
        .gte("created_at", subDays(new Date(), 29).toISOString())
        .order("created_at", { ascending: true });

      const dayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        dayMap[format(subDays(new Date(), i), "MMM d")] = 0;
      }
      (data || []).forEach(r => {
        const label = format(parseISO(r.created_at), "MMM d");
        if (label in dayMap) dayMap[label]++;
      });
      const result = Object.entries(dayMap).map(([date, count]) => ({ date, count }));
      if (result.every(r => r.count === 0)) {
        return result.map((r, i) => ({ ...r, count: Math.max(0, Math.round(5 + Math.cos(i / 4) * 3 + Math.random() * 6)) }));
      }
      return result;
    },
  });

  const { data: recentListings, refetch: refetchRecent } = useQuery({
    queryKey: ["admin-recent-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, make, model, status, created_at, price, currency")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!data || data.length === 0) {
        return mockListings.slice(0, 5).map(l => ({
          id: l.id,
          title: l.title,
          make: l.make,
          model: l.model,
          status: "approved",
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000).toISOString(),
          price: l.price,
          currency: l.currency,
          _mock: true,
        }));
      }
      return data.map(r => ({ ...r, _mock: false }));
    },
  });

  const { data: pendingListingsData, refetch: refetchPending } = useQuery({
    queryKey: ["admin-pending-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, make, model, created_at, price, currency, seller_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const approveListingAction = async (id: string) => {
    await supabase.from("listings").update({ status: "approved" }).eq("id", id);
    refetchPending();
    refetchRecent();
  };

  const rejectListingAction = async (id: string) => {
    await supabase.from("listings").update({ status: "rejected" }).eq("id", id);
    refetchPending();
  };

  const cards = [
    { title: "Total Listings",    value: stats?.totalListings ?? "—",    icon: IconCar,          color: "text-blue-500",   bg: "bg-blue-500/10" },
    { title: "Total Users",       value: stats?.totalUsers ?? "—",       icon: IconUsers,        color: "text-green-500",  bg: "bg-green-500/10" },
    { title: "Pending Approval",  value: stats?.pendingListings ?? "—",  icon: IconEye,          color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Open Reports",      value: stats?.openReports ?? "—",      icon: IconFlag,         color: "text-red-500",    bg: "bg-red-500/10" },
    { title: "Approved Listings", value: stats?.approvedListings ?? "—", icon: IconTrendingUp,   color: "text-primary",    bg: "bg-primary/10" },
    { title: "Dealer Applications",value: stats?.pendingDealers ?? "—",  icon: IconBuildingStore,color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "New This Week",     value: stats?.newThisWeek ?? "—",      icon: IconClockHour4,   color: "text-teal-500",   bg: "bg-teal-500/10" },
    { title: "Revenue",           value: "Coming Soon",                   icon: IconLock,         color: "text-muted-foreground", bg: "bg-muted" },
  ];

  const statusColor: Record<string, string> = {
    approved: "text-green-600 bg-green-100 dark:bg-green-900/30",
    pending:  "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    rejected: "text-red-600 bg-red-100 dark:bg-red-900/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        {stats?._mock && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Demo data — connect Supabase to see live stats</span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${typeof card.value === "string" && card.value === "Coming Soon" ? "text-muted-foreground text-base" : "text-foreground"}`}>
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Listings — Last 30 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={listingsByDay || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="listGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#listGrad)" strokeWidth={2} name="Listings" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Top Makes (Approved)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topMakes || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="make" tick={{ fontSize: 11 }} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">New Users — Last 30 Days</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={usersByDay || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--success))" fill="url(#userGrad)" strokeWidth={2} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals quick-action widget */}
      {pendingListingsData && pendingListingsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <IconEye size={16} className="text-yellow-500" />
              Pending Approvals ({pendingListingsData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingListingsData.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.currency} {Number(r.price).toLocaleString()} · {format(parseISO(r.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-success border-success/30 hover:bg-success/10" onClick={() => approveListingAction(r.id)}>
                      <IconCheck size={13} /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => rejectListingAction(r.id)}>
                      <IconX size={13} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent listings */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Recent Listings</CardTitle></CardHeader>
        <CardContent>
          {!recentListings || recentListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          ) : (
            <div className="space-y-2">
              {recentListings.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(r.created_at), "MMM d, yyyy · HH:mm")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{r.currency} {Number(r.price).toLocaleString()}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[r.status] || "text-muted-foreground bg-muted"}`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCar, IconUsers, IconFlag, IconEye, IconTrendingUp, IconClockHour4 } from "@tabler/icons-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [listings, profiles, reports, pending, approved, thisWeek] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("listings").select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .gte("created_at", subDays(new Date(), 7).toISOString()),
      ]);
      return {
        totalListings: listings.count ?? 0,
        totalUsers: profiles.count ?? 0,
        openReports: reports.count ?? 0,
        pendingListings: pending.count ?? 0,
        approvedListings: approved.count ?? 0,
        newThisWeek: thisWeek.count ?? 0,
      };
    },
  });

  // Listings created per day (last 30 days)
  const { data: listingsByDay } = useQuery({
    queryKey: ["admin-listings-by-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("created_at")
        .gte("created_at", subDays(new Date(), 29).toISOString())
        .order("created_at", { ascending: true });

      // Build a map for all 30 days
      const dayMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        dayMap[format(subDays(new Date(), i), "MMM d")] = 0;
      }
      (data || []).forEach(r => {
        const label = format(parseISO(r.created_at), "MMM d");
        if (label in dayMap) dayMap[label]++;
      });
      return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
    },
  });

  // Top makes
  const { data: topMakes } = useQuery({
    queryKey: ["admin-top-makes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("make")
        .eq("status", "approved");
      const counts: Record<string, number> = {};
      (data || []).forEach(r => { counts[r.make] = (counts[r.make] || 0) + 1; });
      return Object.entries(counts)
        .map(([make, count]) => ({ make, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    },
  });

  // User registrations per day (last 30 days)
  const { data: usersByDay } = useQuery({
    queryKey: ["admin-users-by-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
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
      return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
    },
  });

  // Recent listings
  const { data: recentListings } = useQuery({
    queryKey: ["admin-recent-listings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, make, model, status, created_at, price, currency")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const cards = [
    { title: "Total Listings", value: stats?.totalListings ?? 0, icon: IconCar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Users", value: stats?.totalUsers ?? 0, icon: IconUsers, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Pending Approval", value: stats?.pendingListings ?? 0, icon: IconEye, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Open Reports", value: stats?.openReports ?? 0, icon: IconFlag, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Approved Listings", value: stats?.approvedListings ?? 0, icon: IconTrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { title: "New This Week", value: stats?.newThisWeek ?? 0, icon: IconClockHour4, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const statusColor: Record<string, string> = {
    approved: "text-green-600 bg-green-100 dark:bg-green-900/30",
    pending: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    rejected: "text-red-600 bg-red-100 dark:bg-red-900/30",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Listings over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Listings — Last 30 Days</CardTitle>
          </CardHeader>
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
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#listGrad)" strokeWidth={2} name="Listings" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top makes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Makes (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topMakes || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="make" tick={{ fontSize: 11 }} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Listings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">New Users — Last 30 Days</CardTitle>
          </CardHeader>
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
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--success))" fill="url(#userGrad)" strokeWidth={2} name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent listings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Listings</CardTitle>
        </CardHeader>
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

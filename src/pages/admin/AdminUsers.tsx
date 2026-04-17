import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, phone, city, seller_type, verified_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return [];
      return data ?? [];
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading users…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Manage Users</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                <TableCell>{u.phone ?? "—"}</TableCell>
                <TableCell>{u.city ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={u.seller_type === "dealer" ? "default" : "secondary"}>{u.seller_type}</Badge>
                </TableCell>
                <TableCell>{u.verified_at ? "✓" : "—"}</TableCell>
                <TableCell>{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

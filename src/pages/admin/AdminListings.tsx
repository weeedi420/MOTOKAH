import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { createNotification } from "@/lib/notifications";
import { sendEmail, listingApprovedEmail, listingRejectedEmail } from "@/lib/sendEmail";

export default function AdminListings() {
  const qc = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, make, model, year, price, currency, status, city, created_at, views, seller_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, sellerId, title }: { id: string; status: string; sellerId: string; title: string }) => {
      const { error } = await supabase.from("listings").update({ status: status as any }).eq("id", id);
      if (error) throw error;
      const approved = status === "approved";
      await createNotification(
        sellerId,
        approved ? "listing_approved" : "listing_rejected",
        approved ? "Listing approved!" : "Listing rejected",
        approved
          ? `Your listing "${title}" has been approved and is now live.`
          : `Your listing "${title}" was not approved. Please review our guidelines and resubmit.`
      );
      await sendEmail({
        toUserId: sellerId,
        subject: approved ? `Your listing "${title}" is now live` : `Update on your listing "${title}"`,
        html: approved ? listingApprovedEmail(title) : listingRejectedEmail(title),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing status updated");
    },
  });

  const statusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    sold: "bg-blue-100 text-blue-800",
  };

  if (isLoading) return <div className="text-muted-foreground">Loading listings…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Manage Listings</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium max-w-[200px] truncate">{l.title}</TableCell>
                <TableCell>{Number(l.price).toLocaleString()} {l.currency}</TableCell>
                <TableCell>{l.city ?? "—"}</TableCell>
                <TableCell>
                  <Badge className={statusColor[l.status] ?? ""} variant="secondary">{l.status}</Badge>
                </TableCell>
                <TableCell>{l.views}</TableCell>
                <TableCell>{format(new Date(l.created_at), "MMM d, yyyy")}</TableCell>
                <TableCell className="space-x-1">
                  {l.status === "pending" && (
                    <>
                      <Button size="sm" variant="default" onClick={() => updateStatus.mutate({ id: l.id, status: "approved", sellerId: l.seller_id, title: l.title })}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: l.id, status: "rejected", sellerId: l.seller_id, title: l.title })}>Reject</Button>
                    </>
                  )}
                  {l.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: l.id, status: "rejected", sellerId: l.seller_id, title: l.title })}>Reject</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

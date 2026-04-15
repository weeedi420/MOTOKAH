import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { createNotification } from "@/lib/notifications";
import { sendEmail, dealerApprovedEmail, dealerRejectedEmail } from "@/lib/sendEmail";

export default function AdminDealers() {
  const qc = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-dealer-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealer_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, userId, businessName }: { id: string; status: string; userId: string; businessName: string }) => {
      const { error } = await supabase.from("dealer_applications").update({ status: status as any }).eq("id", id);
      if (error) throw error;

      const approved = status === "approved";

      if (approved) {
        // Upgrade user's profile to dealer + set verified_at
        await supabase.from("profiles").update({
          seller_type: "dealer",
          verified_at: new Date().toISOString(),
        }).eq("user_id", userId);
      }

      await createNotification(
        userId,
        approved ? "dealer_approved" : "dealer_rejected",
        approved ? "Dealer application approved!" : "Dealer application rejected",
        approved
          ? `Your dealer application for "${businessName}" has been approved. You now have dealer status.`
          : `Your dealer application for "${businessName}" was not approved at this time.`
      );
      await sendEmail({
        toUserId: userId,
        subject: approved ? `Dealer application approved — ${businessName}` : `Update on your dealer application`,
        html: approved ? dealerApprovedEmail(businessName) : dealerRejectedEmail(businessName),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-dealer-apps"] });
      toast.success("Application updated");
    },
  });

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (isLoading) return <div className="text-muted-foreground">Loading applications…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Dealer Applications</h2>
      {apps.length === 0 ? (
        <p className="text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Reg #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.business_name}</TableCell>
                  <TableCell>{a.city}</TableCell>
                  <TableCell>{a.phone}</TableCell>
                  <TableCell>{a.registration_number ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[a.status] ?? ""} variant="secondary">{a.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(a.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="space-x-1">
                    {a.status === "pending" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => updateStatus.mutate({ id: a.id, status: "approved", userId: a.user_id, businessName: a.business_name })}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: a.id, status: "rejected", userId: a.user_id, businessName: a.business_name })}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

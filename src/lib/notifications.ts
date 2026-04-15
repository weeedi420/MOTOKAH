import { supabase } from "@/integrations/supabase/client";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    read: false,
  });
}

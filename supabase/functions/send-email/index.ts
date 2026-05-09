import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  /** Pass either a user_id (we look up the email) or a direct email address */
  to_user_id?: string;
  to_email?: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { to_user_id, to_email, subject, html } = payload;

    if (!subject || !html || (!to_user_id && !to_email)) {
      return new Response(
        JSON.stringify({ error: "subject, html, and one of to_user_id or to_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      // Log and return success so the rest of the action (notification etc.) still completes
      console.warn("RESEND_API_KEY not configured — email not sent");
      return new Response(JSON.stringify({ skipped: true, reason: "RESEND_API_KEY not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let recipientEmail = to_email;

    if (to_user_id && !recipientEmail) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: userData } = await supabase.auth.admin.getUserById(to_user_id);
      recipientEmail = userData?.user?.email;
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Could not resolve recipient email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Motokah <noreply@motokah.com>",
        to: recipientEmail,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ sent: true, to: recipientEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

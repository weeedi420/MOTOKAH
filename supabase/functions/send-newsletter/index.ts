import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return new Response(JSON.stringify({ error: "subject and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured in Supabase secrets" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all subscriber emails
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (fetchError) throw fetchError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = subscribers.map((s: { email: string }) => s.email);

    // Send via Resend batch API
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        emails.map((to: string) => ({
          from: "Motokah Newsletter <newsletter@motokah.com>",
          to,
          subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">${body.replace(/\n/g, "<br>")}</div><p style="font-size:12px;color:#888;margin-top:32px">You're receiving this because you subscribed to Motokah newsletters.</p>`,
        }))
      ),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend error: ${err}`);
    }

    return new Response(JSON.stringify({ sent: emails.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

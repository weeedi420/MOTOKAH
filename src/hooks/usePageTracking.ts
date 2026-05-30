import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocation as useLocationCtx } from "@/contexts/LocationContext";

function getOrCreateSessionId(): string {
  const key = "motokah_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const { country } = useLocationCtx();

  useEffect(() => {
    const sid = getOrCreateSessionId();
    supabase.from("page_views").insert({
      session_id: sid,
      page: location.pathname + (location.search ? location.search : ""),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      country: country && country !== "All" ? country : null,
      user_id: user?.id ?? null,
    });
  }, [location.pathname, location.search]);
}

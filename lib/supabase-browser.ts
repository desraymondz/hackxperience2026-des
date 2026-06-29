import { createClient } from "@supabase/supabase-js";

// Browser client — uses the anon key, safe to expose publicly.
// Used for direct Storage uploads from the client side.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // 1️⃣ Create Auth User
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: "Temp12345!",
        email_confirm: true,
      });

    if (authError) throw authError;

    const authUserId = authData.user!.id;

    // 2️⃣ Insert into zist_users ONLY
    // Insert into zist_users
const { error: zistError } = await supabaseAdmin
  .from("zist_users")
  .insert({
    id: userId,
    full_name: null,
    email,
  });

if (zistError) throw zistError;


// Insert into user_roles
const { error: roleError } = await supabaseAdmin
  .from("user_roles")
  .insert({
    user_id: userId,
    role,
    status: "active",
  });

if (roleError) throw roleError;

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});

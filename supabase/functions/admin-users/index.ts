import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is admin
    const { data: isAdmin } = await anonClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { action, email, user_id, role } = await req.json();

    switch (action) {
      case "list_admins": {
        // Get all user_roles with admin role
        const { data: roles, error: rolesErr } = await adminClient
          .from("user_roles")
          .select("*")
          .eq("role", "admin");

        if (rolesErr) throw rolesErr;

        // Fetch user details for each
        const admins = [];
        for (const r of roles || []) {
          const {
            data: { user },
          } = await adminClient.auth.admin.getUserById(r.user_id);
          admins.push({
            id: r.id,
            user_id: r.user_id,
            role: r.role,
            email: user?.email || "Unknown",
            created_at: user?.created_at,
          });
        }

        return new Response(JSON.stringify({ admins }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "add_admin": {
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Find user by email
        const { data: users, error: listErr } =
          await adminClient.auth.admin.listUsers();
        if (listErr) throw listErr;

        const targetUser = users.users.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!targetUser) {
          return new Response(
            JSON.stringify({
              error:
                "User not found. They must create an account first before being made an admin.",
            }),
            {
              status: 404,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Check if already admin
        const { data: existingRole } = await adminClient
          .from("user_roles")
          .select("id")
          .eq("user_id", targetUser.id)
          .eq("role", role || "admin")
          .maybeSingle();

        if (existingRole) {
          return new Response(
            JSON.stringify({ error: "User is already an admin" }),
            {
              status: 409,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error: insertErr } = await adminClient
          .from("user_roles")
          .insert({ user_id: targetUser.id, role: role || "admin" });

        if (insertErr) throw insertErr;

        return new Response(
          JSON.stringify({
            success: true,
            message: `${email} has been granted admin access`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "remove_admin": {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "user_id is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Prevent removing yourself
        if (user_id === caller.id) {
          return new Response(
            JSON.stringify({ error: "You cannot remove your own admin access" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error: deleteErr } = await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", user_id)
          .eq("role", "admin");

        if (deleteErr) throw deleteErr;

        return new Response(
          JSON.stringify({ success: true, message: "Admin access removed" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (err) {
    console.error("admin-users error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

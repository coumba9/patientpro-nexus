import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_role"),
    user_id: z.string().uuid(),
    new_role: z.enum(["admin", "doctor", "patient"]),
  }),
  z.object({
    action: z.literal("update_status"),
    user_id: z.string().uuid(),
    is_blocked: z.boolean(),
  }),
  z.object({
    action: z.literal("update_profile"),
    user_id: z.string().uuid(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
  }),
  z.object({
    action: z.literal("delete_user"),
    user_id: z.string().uuid(),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await userClient.auth.getUser();
    if (authError || !caller) throw new Error("Authentication failed");

    // Check admin role
    const { data: isAdmin } = await userClient.rpc("is_admin", { user_id: caller.id });
    if (!isAdmin) throw new Error("Unauthorized: admin role required");

    const body = await req.json();
    const parsed = ActionSchema.parse(body);

    // Prevent self-modification for dangerous actions
    if (parsed.action === "delete_user" && parsed.user_id === caller.id) {
      throw new Error("Cannot delete your own account");
    }
    if (parsed.action === "update_role" && parsed.user_id === caller.id) {
      throw new Error("Cannot change your own role");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let result: any = { success: true };

    switch (parsed.action) {
      case "update_role": {
        // Delete existing role and insert new one
        const { error: delError } = await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", parsed.user_id);
        if (delError) throw delError;

        const { error: insError } = await adminClient
          .from("user_roles")
          .insert({ user_id: parsed.user_id, role: parsed.new_role });
        if (insError) throw insError;

        // If changing to doctor, ensure doctors row exists
        if (parsed.new_role === "doctor") {
          await adminClient
            .from("doctors")
            .upsert({ id: parsed.user_id, license_number: "", is_verified: false }, { onConflict: "id" });
        }

        // Log admin action
        await adminClient.from("admin_audit_logs").insert({
          admin_id: caller.id,
          action_type: "update_role",
          table_name: "user_roles",
          record_id: parsed.user_id,
          details: { new_role: parsed.new_role },
        });

        result.message = "Role updated";
        break;
      }

      case "update_status": {
        if (parsed.is_blocked) {
          // Ban user via auth admin
          const { error } = await adminClient.auth.admin.updateUserById(parsed.user_id, {
            ban_duration: "876000h", // ~100 years
          });
          if (error) throw error;
        } else {
          // Unban
          const { error } = await adminClient.auth.admin.updateUserById(parsed.user_id, {
            ban_duration: "none",
          });
          if (error) throw error;
        }

        await adminClient.from("admin_audit_logs").insert({
          admin_id: caller.id,
          action_type: parsed.is_blocked ? "block_user" : "unblock_user",
          table_name: "profiles",
          record_id: parsed.user_id,
        });

        result.message = parsed.is_blocked ? "User blocked" : "User unblocked";
        break;
      }

      case "update_profile": {
        const { error } = await adminClient
          .from("profiles")
          .update({
            first_name: parsed.first_name,
            last_name: parsed.last_name,
            email: parsed.email,
            phone_number: parsed.phone_number,
          })
          .eq("id", parsed.user_id);
        if (error) throw error;

        // Update auth email if changed
        if (parsed.email) {
          await adminClient.auth.admin.updateUserById(parsed.user_id, {
            email: parsed.email,
          });
        }

        await adminClient.from("admin_audit_logs").insert({
          admin_id: caller.id,
          action_type: "update_profile",
          table_name: "profiles",
          record_id: parsed.user_id,
        });

        result.message = "Profile updated";
        break;
      }

      case "delete_user": {
        // Delete from auth (cascades to profiles, user_roles, etc.)
        const { error } = await adminClient.auth.admin.deleteUser(parsed.user_id);
        if (error) throw error;

        await adminClient.from("admin_audit_logs").insert({
          admin_id: caller.id,
          action_type: "delete_user",
          table_name: "profiles",
          record_id: parsed.user_id,
        });

        result.message = "User deleted";
        break;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("admin-manage-users error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

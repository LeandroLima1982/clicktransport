
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle pre-flight CORS requests
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Setup Supabase Admin Client
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// Verify that the request is from an admin
async function verifyAdmin(supabase: any, token: string) {
  try {
    // Verify token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) throw new Error("Unauthorized: Invalid token");
    if (!user) throw new Error("Unauthorized: User not found");
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (profileError) throw new Error("Unauthorized: Could not verify role");
    if (profile?.role !== "admin") throw new Error("Unauthorized: Not an admin");
    
    return user;
  } catch (error) {
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized: No token provided");
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("Unauthorized: Invalid token format");
    }
    
    // Get request body
    const { driverId } = await req.json();
    if (!driverId) {
      throw new Error("Bad Request: Driver ID is required");
    }
    
    // Get admin Supabase client
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verify admin privileges
    await verifyAdmin(supabaseAdmin, token);
    
    // Get driver data
    const { data: driver, error: driverError } = await supabaseAdmin
      .from("drivers")
      .select("user_id, email")
      .eq("id", driverId)
      .single();
      
    if (driverError || !driver) {
      throw new Error("Not Found: Driver not found");
    }
    
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(10).slice(-2);
    
    if (!driver.user_id) {
      // If no user account exists, we can't reset a password
      return new Response(
        JSON.stringify({
          success: false,
          error: "Driver has no user account",
          message: "Este motorista não possui conta de usuário"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Reset the user's password using the service role
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      driver.user_id,
      { password: tempPassword }
    );
    
    if (passwordError) {
      throw new Error(`Password reset failed: ${passwordError.message}`);
    }
    
    // Update the driver's password status
    const { error: updateError } = await supabaseAdmin
      .from("drivers")
      .update({ is_password_changed: false })
      .eq("id", driverId);
      
    if (updateError) {
      console.warn("Failed to update password status:", updateError);
    }
    
    // Return the temporary password
    return new Response(
      JSON.stringify({
        success: true,
        tempPassword,
        message: "Senha redefinida com sucesso"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: error.message.includes("Unauthorized") ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

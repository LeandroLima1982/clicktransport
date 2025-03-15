
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Executing fix_invalid_queue_positions Edge Function')
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    console.log('Fixing invalid queue positions')

    // Call the database function to fix invalid queue positions
    const { data, error } = await supabaseClient.rpc('fix_invalid_queue_positions')
    
    if (error) {
      console.error('Error fixing invalid queue positions:', error)
      throw error
    }

    console.log('Fixed invalid queue positions:', data)

    return new Response(
      JSON.stringify(data || { fixed_count: 0 }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in fix_invalid_queue_positions:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fixed_count: 0
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

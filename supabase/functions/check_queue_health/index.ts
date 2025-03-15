
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
    console.log('Executing check_queue_health Edge Function')
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    console.log('Checking queue health metrics')

    // Run queue health check function
    const { data, error } = await supabaseClient.rpc('check_queue_health')
    
    if (error) {
      console.error('Error checking queue health:', error)
      throw error
    }

    console.log('Queue health check completed:', data)

    return new Response(
      JSON.stringify(data || {
        active_companies: 0,
        invalid_positions: 0,
        duplicate_positions: 0,
        health_score: 0
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in check_queue_health:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        active_companies: 0,
        invalid_positions: 0,
        duplicate_positions: 0,
        health_score: 0
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

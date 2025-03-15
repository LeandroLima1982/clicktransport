
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
    console.log('Executing update_company_queue_position Edge Function')
    
    // Parse the request body
    let body = {}
    try {
      body = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      body = {}
    }
    
    if (!body.company_id) {
      throw new Error('Missing required parameter: company_id')
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    console.log(`Updating queue position for company ${body.company_id}`)

    // Call the database function to update company queue position
    const { data, error } = await supabaseClient.rpc('update_company_queue_position', {
      company_id: body.company_id
    })
    
    if (error) {
      console.error('Error updating company queue position:', error)
      throw error
    }

    console.log('Updated company queue position:', data)

    return new Response(
      JSON.stringify(data || { success: false, new_position: 0 }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in update_company_queue_position:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
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

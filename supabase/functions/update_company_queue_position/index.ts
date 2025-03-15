
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
    // Parse request body
    const { company_id } = await req.json()
    
    if (!company_id) {
      throw new Error('Company ID is required')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get max queue position
    const { data: maxData, error: maxError } = await supabaseClient
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      
    if (maxError) throw maxError
    
    // Calculate new position (max + 1, or 1 if no companies)
    const maxPosition = maxData && maxData.length > 0 && maxData[0].queue_position 
      ? maxData[0].queue_position 
      : 0
    const newPosition = maxPosition + 1
    
    // Update the company's queue position
    const { data, error } = await supabaseClient
      .from('companies')
      .update({ 
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', company_id)
      .select('queue_position')
      .single()
      
    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        new_position: newPosition 
      }),
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
      JSON.stringify({ error: error.message }),
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

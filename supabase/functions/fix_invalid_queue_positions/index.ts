
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
    
    // Calculate start position for new assignments
    const maxPosition = maxData && maxData.length > 0 && maxData[0].queue_position 
      ? maxData[0].queue_position 
      : 0
    let nextPosition = maxPosition + 1
    
    // Find companies with invalid positions
    const { data: invalidCompanies, error: invalidError } = await supabaseClient
      .from('companies')
      .select('id')
      .or('queue_position.is.null,queue_position.eq.0')
      .eq('status', 'active')
      
    if (invalidError) throw invalidError
    
    if (!invalidCompanies || invalidCompanies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          fixed_count: 0 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Prepare updates for each invalid company
    const updates = invalidCompanies.map(company => {
      const position = nextPosition++
      return {
        id: company.id,
        queue_position: position
      }
    })
    
    // Update all invalid companies
    const { error: updateError } = await supabaseClient
      .from('companies')
      .upsert(updates)
      
    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        fixed_count: invalidCompanies.length 
      }),
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

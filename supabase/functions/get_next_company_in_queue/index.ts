
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

    // Get companies ordered by queue position and last order assigned
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, queue_position, last_order_assigned, status')
      .eq('status', 'active')
      .order('queue_position', { ascending: true, nullsLast: true })
      .order('last_order_assigned', { ascending: true, nullsFirst: true })
      .limit(1)

    if (companiesError) throw companiesError

    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No active companies found' 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_id: companies[0].id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in get_next_company_in_queue:', error)
    
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

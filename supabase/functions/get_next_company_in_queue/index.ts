
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
    console.log('Executing get_next_company_in_queue Edge Function')
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    console.log('Checking for active companies in the queue')

    // Get companies ordered by queue position and last order assigned
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name, queue_position, last_order_assigned, status')
      .eq('status', 'active')
      .order('queue_position', { ascending: true, nullsLast: true })
      .order('last_order_assigned', { ascending: true, nullsFirst: true })
      .limit(1)

    if (companiesError) {
      console.error('Error finding companies:', companiesError)
      throw companiesError
    }

    if (!companies || companies.length === 0) {
      console.warn('No active companies found in the queue')
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

    const nextCompany = companies[0]
    console.log(`Found next company in queue: ${nextCompany.id} (${nextCompany.name}) with position ${nextCompany.queue_position}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        company_id: nextCompany.id,
        company_name: nextCompany.name,
        queue_position: nextCompany.queue_position,
        last_order_assigned: nextCompany.last_order_assigned
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
      JSON.stringify({ 
        error: error.message,
        success: false, 
        stack: error.stack 
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

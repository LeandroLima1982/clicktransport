
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

    // Get all active companies
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id')
      .eq('status', 'active')
      .order('name', { ascending: true })
      
    if (companiesError) throw companiesError
    
    if (!companies || companies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          companies_updated: 0 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Assign new queue positions starting from 1
    const updates = companies.map((company, index) => ({
      id: company.id,
      queue_position: index + 1,
      last_order_assigned: null
    }))
    
    // Update all companies
    const { error: updateError } = await supabaseClient
      .from('companies')
      .upsert(updates)
      
    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true, 
        companies_updated: companies.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in reset_company_queue_positions:', error)
    
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

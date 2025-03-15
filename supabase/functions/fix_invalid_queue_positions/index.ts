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

    // First, let's check for any duplicate positions
    const { data: duplicates, error: duplicatesError } = await supabaseClient
      .from('companies')
      .select('queue_position, count(*)')
      .eq('status', 'active')
      .not('queue_position', 'is', null)
      .gt('queue_position', 0)
      .group('queue_position')
      .having('count(*)', 'gt', 1)
    
    if (duplicatesError) {
      console.error('Error checking duplicate positions:', duplicatesError)
      throw duplicatesError
    }
    
    console.log('Found duplicate positions:', duplicates)
    let dupeFixCount = 0
    
    // Fix duplicate positions if any found
    if (duplicates && duplicates.length > 0) {
      for (const dupe of duplicates) {
        const { data: dupeCompanies, error: dupeError } = await supabaseClient
          .from('companies')
          .select('id, name')
          .eq('queue_position', dupe.queue_position)
          .eq('status', 'active')
          .order('name')
        
        if (dupeError) {
          console.error(`Error fetching companies with duplicate position ${dupe.queue_position}:`, dupeError)
          continue
        }
        
        // Keep first company at current position, reassign others
        if (dupeCompanies && dupeCompanies.length > 1) {
          // Skip the first company (keep its position), process the rest
          for (let i = 1; i < dupeCompanies.length; i++) {
            const result = await supabaseClient.rpc('fix_company_queue_position', {
              company_id: dupeCompanies[i].id
            })
            
            if (result.error) {
              console.error(`Error fixing position for company ${dupeCompanies[i].id}:`, result.error)
            } else {
              console.log(`Fixed duplicate position for company ${dupeCompanies[i].name}`)
              dupeFixCount++
            }
          }
        }
      }
    }

    // Now fix null or zero positions
    const { data, error } = await supabaseClient.rpc('fix_invalid_queue_positions')
    
    if (error) {
      console.error('Error fixing invalid queue positions:', error)
      throw error
    }

    const totalFixed = (data?.fixed_count || 0) + dupeFixCount

    console.log('Fixed invalid queue positions:', { 
      invalid_count: data?.fixed_count || 0,
      duplicate_count: dupeFixCount,
      total_fixed: totalFixed
    })

    return new Response(
      JSON.stringify({
        success: true,
        fixed: totalFixed,
        invalid_fixed: data?.fixed_count || 0,
        duplicate_fixed: dupeFixCount
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
      JSON.stringify({ 
        error: error.message,
        success: false,
        fixed: 0
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

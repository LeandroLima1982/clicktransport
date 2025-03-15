
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

    // Query the database to get queue health metrics
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, queue_position, status')
      
    if (companiesError) throw companiesError
    
    const activeCompanies = companies.filter(c => c.status === 'active').length
    const totalCompanies = companies.length
    
    // Count invalid positions (null or <= 0)
    const invalidPositions = companies.filter(c => 
      c.queue_position === null || c.queue_position <= 0
    ).length
    
    // Find duplicate positions
    const positionCounts = {}
    let duplicatePositions = 0
    
    companies.forEach(company => {
      if (company.queue_position !== null && company.queue_position > 0) {
        if (positionCounts[company.queue_position]) {
          positionCounts[company.queue_position]++
          if (positionCounts[company.queue_position] === 2) {
            // Only count once when a position becomes duplicate
            duplicatePositions++
          }
        } else {
          positionCounts[company.queue_position] = 1
        }
      }
    })
    
    // Calculate health score (0-100)
    // Perfect health: no invalid positions, no duplicates, at least 1 active company
    let healthScore = 100
    
    if (totalCompanies === 0) {
      healthScore = 0
    } else {
      // Deduct points for invalid positions
      if (invalidPositions > 0) {
        healthScore -= Math.min(50, (invalidPositions / totalCompanies) * 100)
      }
      
      // Deduct points for duplicate positions
      if (duplicatePositions > 0) {
        healthScore -= Math.min(50, (duplicatePositions / totalCompanies) * 100)
      }
      
      // If no active companies, that's a critical issue
      if (activeCompanies === 0) {
        healthScore = Math.min(healthScore, 10)
      }
    }
    
    const healthData = {
      health_score: Math.max(0, Math.round(healthScore)),
      invalid_positions: invalidPositions,
      duplicate_positions: duplicatePositions,
      active_companies: activeCompanies
    }

    return new Response(
      JSON.stringify(healthData),
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

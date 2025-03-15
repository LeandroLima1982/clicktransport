
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Default health metrics when there's an error
const defaultHealthMetrics = {
  active_companies: 0,
  invalid_positions: 0,
  duplicate_positions: 0,
  health_score: 0,
  unprocessed_bookings: 0,
  unlinked_orders: 0,
  bookings_sample_size: 0,
  booking_processing_score: 0,
  overall_health_score: 0,
  last_checked_booking_id: '',
  error: null
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

    // Fetch active companies first
    const { data: activeCompanies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, queue_position, name')
      .eq('status', 'active')
      
    if (companiesError) {
      console.error('Error fetching active companies:', companiesError)
      throw companiesError
    }
    
    // Calculate queue health metrics manually
    const companyCount = activeCompanies?.length || 0
    console.log(`Found ${companyCount} active companies`)
    
    // Check for invalid or duplicate positions
    const positions = activeCompanies?.map(c => c.queue_position) || []
    const invalidPositions = positions.filter(p => p === null || p === undefined || p < 0).length
    
    // Check for duplicate positions
    const positionCounts: Record<number, number> = {}
    positions.forEach(pos => {
      if (pos !== null && pos !== undefined) {
        positionCounts[pos] = (positionCounts[pos] || 0) + 1
      }
    })
    
    const duplicatePositions = Object.values(positionCounts).filter(count => count > 1).length
    
    // Calculate health score based on issues found
    const healthScore = companyCount > 0 
      ? 100 - (((invalidPositions + duplicatePositions) / companyCount) * 100)
      : 100
    
    const healthData = {
      active_companies: companyCount,
      invalid_positions: invalidPositions,
      duplicate_positions: duplicatePositions,
      health_score: healthScore
    }
    
    console.log('Base queue health data:', healthData)

    // Check for bookings without service orders
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('id, reference_code')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(100)
      
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }
    
    console.log(`Found ${bookings?.length || 0} pending/confirmed bookings`)
    
    let unprocessedBookings = 0
    let lastCheckedBookingId = ''
    
    // Check the first 20 bookings for service orders
    const bookingsToCheck = bookings?.slice(0, 20) || []
    for (const booking of bookingsToCheck) {
      lastCheckedBookingId = booking.id
      
      const { data: serviceOrders, error: ordersError } = await supabaseClient
        .from('service_orders')
        .select('id')
        .ilike('notes', `%Reserva #${booking.reference_code}%`)
        .limit(1)
        
      if (ordersError) {
        console.error(`Error checking service order for booking ${booking.reference_code}:`, ordersError)
        continue
      }
      
      if (!serviceOrders || serviceOrders.length === 0) {
        unprocessedBookings++
      }
    }
    
    console.log(`Found ${unprocessedBookings} unprocessed bookings out of ${bookingsToCheck.length} checked`)
    
    // Check for service orders without booking references
    const { data: unlinkedOrders, error: unlinkedError } = await supabaseClient
      .from('service_orders')
      .select('id')
      .not('notes', 'ilike', '%Reserva #%')
      .limit(100)
      
    if (unlinkedError) {
      console.error('Error checking unlinked service orders:', unlinkedError)
      throw unlinkedError
    }
    
    const unlinkedCount = unlinkedOrders?.length || 0
    console.log(`Found ${unlinkedCount} service orders without booking references`)
    
    // Combine all health metrics
    const healthMetrics = {
      ...healthData,
      unprocessed_bookings: unprocessedBookings,
      unlinked_orders: unlinkedCount,
      last_checked_booking_id: lastCheckedBookingId,
      bookings_sample_size: bookingsToCheck.length,
      booking_processing_score: bookingsToCheck.length > 0 
        ? Math.round(100 * (1 - (unprocessedBookings / bookingsToCheck.length))) 
        : 100,
      overall_health_score: companyCount > 0
        ? Math.round(
            (healthScore + 
             (bookingsToCheck.length > 0 ? (100 * (1 - (unprocessedBookings / bookingsToCheck.length))) : 100) +
             (100 * (1 - Math.min(1, unlinkedCount / 100)))
            ) / 3
          )
        : 0
    }

    console.log('Queue health check completed:', healthMetrics)

    return new Response(
      JSON.stringify(healthMetrics || defaultHealthMetrics),
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
        ...defaultHealthMetrics,
        error: error.message 
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

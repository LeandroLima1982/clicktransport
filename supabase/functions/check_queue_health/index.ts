
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
    const { data: healthData, error: healthError } = await supabaseClient.rpc('check_queue_health')
    
    if (healthError) {
      console.error('Error checking queue health:', healthError)
      throw healthError
    }

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
    
    let unprocessedBookings = 0
    let lastCheckedBookingId = ''
    
    // Check the first 20 bookings for service orders
    const bookingsToCheck = bookings.slice(0, 20)
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
      overall_health_score: healthData && healthData.active_companies > 0
        ? Math.round(
            (healthData.health_score + 
             (bookingsToCheck.length > 0 ? (100 * (1 - (unprocessedBookings / bookingsToCheck.length))) : 100) +
             (100 * (1 - Math.min(1, unlinkedCount / 100)))
            ) / 3
          )
        : 0
    }

    console.log('Queue health check completed:', healthMetrics)

    return new Response(
      JSON.stringify(healthMetrics || {
        active_companies: 0,
        invalid_positions: 0,
        duplicate_positions: 0,
        health_score: 0,
        unprocessed_bookings: 0,
        unlinked_orders: 0,
        overall_health_score: 0
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
        health_score: 0,
        unprocessed_bookings: 0,
        unlinked_orders: 0,
        overall_health_score: 0
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

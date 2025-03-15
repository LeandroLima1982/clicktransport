
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

    // First check if the company exists and is active
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('id, name, status, queue_position')
      .eq('id', body.company_id)
      .single()
      
    if (companyError) {
      console.error('Error fetching company:', companyError)
      throw new Error(`Company not found: ${companyError.message}`)
    }
    
    if (company.status !== 'active') {
      console.error(`Company ${company.id} is not active (status: ${company.status})`)
      throw new Error(`Company is not active (status: ${company.status})`)
    }

    // Call the database function to update company queue position
    const { data, error } = await supabaseClient.rpc('update_company_queue_position', {
      company_id: body.company_id
    })
    
    if (error) {
      console.error('Error updating company queue position:', error)
      throw error
    }

    console.log('Updated company queue position:', data)
    
    // Also update the booking-company relationship if a booking_id is provided
    let bookingData = null
    if (body.booking_id) {
      const { data: booking, error: bookingError } = await supabaseClient
        .from('bookings')
        .select('reference_code')
        .eq('id', body.booking_id)
        .single()
        
      if (!bookingError && booking) {
        bookingData = booking
        console.log(`Updating notes for service orders related to booking ${body.booking_id}`)
        
        // Find any service orders for this company without proper booking reference
        const { data: orders, error: ordersError } = await supabaseClient
          .from('service_orders')
          .select('id, notes')
          .eq('company_id', body.company_id)
          .not('notes', 'ilike', `%Reserva #${booking.reference_code}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          
        if (!ordersError && orders && orders.length > 0) {
          // Update the most recent order with booking reference
          const orderId = orders[0].id
          const updatedNotes = orders[0].notes 
            ? `${orders[0].notes} - Reserva #${booking.reference_code}`
            : `Reserva #${booking.reference_code}`
            
          const { error: updateError } = await supabaseClient
            .from('service_orders')
            .update({ notes: updatedNotes })
            .eq('id', orderId)
            
          if (updateError) {
            console.error(`Error updating service order ${orderId}:`, updateError)
          } else {
            console.log(`Updated service order ${orderId} with booking reference ${booking.reference_code}`)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true, 
        new_position: data.new_position,
        booking: bookingData
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


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
    console.log('Executing process_specific_booking Edge Function')
    
    // Parse the request body
    let body = {}
    try {
      body = await req.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    }
    
    if (!body.booking_id) {
      throw new Error('Missing required parameter: booking_id')
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    
    console.log(`Processing booking ID: ${body.booking_id}`)

    // Get the booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', body.booking_id)
      .single()
      
    if (bookingError) {
      console.error('Error fetching booking:', bookingError)
      throw new Error(`Booking not found: ${bookingError.message}`)
    }
    
    console.log('Found booking:', booking)
    
    // Check booking status
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      console.error(`Invalid booking status: ${booking.status}`)
      return new Response(
        JSON.stringify({
          success: false,
          message: `Booking status (${booking.status}) is not valid for processing`
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    // Check if a service order already exists for this booking
    const { data: existingOrders, error: checkError } = await supabaseClient
      .from('service_orders')
      .select('id')
      .ilike('notes', `%Reserva #${booking.reference_code}%`)
      .limit(1)
      
    if (checkError) {
      console.error('Error checking for existing service order:', checkError)
      throw checkError
    }
    
    if (existingOrders && existingOrders.length > 0) {
      console.log(`Service order already exists for booking ${booking.reference_code}`)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'A service order already exists for this booking'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    console.log('No existing service order, continuing with processing')
    
    let companyId
    let companyName
    
    // Check if a specific company ID was provided for direct assignment
    if (body.company_id) {
      console.log(`Direct company assignment requested with company ID: ${body.company_id}`)
      
      // Verify the company exists and is active
      const { data: company, error: companyError } = await supabaseClient
        .from('companies')
        .select('id, name, status')
        .eq('id', body.company_id)
        .single()
        
      if (companyError) {
        console.error('Error fetching specified company:', companyError)
        throw new Error(`Specified company not found: ${companyError.message}`)
      }
      
      if (company.status !== 'active') {
        console.error(`Specified company ${company.id} is not active (status: ${company.status})`)
        return new Response(
          JSON.stringify({
            success: false,
            message: `Specified company is not active (status: ${company.status})`
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        )
      }
      
      companyId = company.id
      companyName = company.name
      console.log(`Using directly assigned company: ${companyId} (${companyName})`)
    } else {
      // If no company ID was provided, use the queue system
      console.log('No company ID provided, using queue system')
      
      // Get the next company in the queue
      const companyResponse = await supabaseClient.functions.invoke('get_next_company_in_queue', {
        method: 'POST',
        body: {}
      })
      
      if (companyResponse.error) {
        console.error('Error getting next company in queue:', companyResponse.error)
        throw companyResponse.error
      }
      
      if (!companyResponse.data.success || !companyResponse.data.company_id) {
        console.error('No company found in queue:', companyResponse.data)
        return new Response(
          JSON.stringify({
            success: false,
            message: 'No active company found in the queue'
          }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        )
      }
      
      companyId = companyResponse.data.company_id
      companyName = companyResponse.data.company_name || 'Empresa não identificada'
      console.log(`Found company from queue to assign order: ${companyId} (${companyName})`)
    }
    
    // Create service order with booking details
    const serviceOrderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      delivery_date: booking.return_date || null,
      status: 'pending',
      notes: `Reserva #${booking.reference_code} - Empresa: ${companyName} - ${booking.additional_notes || 'Sem observações'}`,
    }
    
    // Create the service order
    const { data, error } = await supabaseClient
      .from('service_orders')
      .insert(serviceOrderData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating service order:', error)
      throw error
    }
    
    console.log('Service order created successfully:', data)
    
    // Update the booking status to confirmed after service order is created
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id)
      
    if (updateError) {
      console.error('Error updating booking status:', updateError)
      // We don't throw here because the service order was created successfully
    }
    
    // Update the company's queue position and last order timestamp
    console.log(`Updating queue position for company ${companyId}`)
    const updateResponse = await supabaseClient.functions.invoke('update_company_queue_position', {
      method: 'POST',
      body: { company_id: companyId, booking_id: booking.id }
    })
    
    if (updateResponse.error) {
      console.error('Error updating company queue position:', updateResponse.error)
      // We don't throw here because the service order was created successfully
    }
    
    console.log('Successfully processed booking')
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Booking processed successfully',
        service_order_id: data.id,
        company_id: companyId,
        company_name: companyName
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in process_specific_booking:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message || 'Unknown error occurred',
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

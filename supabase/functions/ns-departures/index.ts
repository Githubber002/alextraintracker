import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('NS_API_KEY')
    if (!apiKey) {
      throw new Error('NS_API_KEY not configured')
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'departures'
    
    if (action === 'stations') {
      const query = url.searchParams.get('q') || ''
      const nsUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations?q=${encodeURIComponent(query)}`
      const response = await fetch(nsUrl, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      })
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'departures') {
      const station = url.searchParams.get('station') || 'UT'
      const nsUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?station=${encodeURIComponent(station)}`
      const response = await fetch(nsUrl, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      })
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'trips') {
      const fromStation = url.searchParams.get('fromStation') || ''
      const toStation = url.searchParams.get('toStation') || ''
      if (!fromStation || !toStation) {
        throw new Error('fromStation and toStation are required')
      }
      const nsUrl = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/trips?fromStation=${encodeURIComponent(fromStation)}&toStation=${encodeURIComponent(toStation)}&dateTime=${encodeURIComponent(new Date().toISOString())}`
      const response = await fetch(nsUrl, {
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      })
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

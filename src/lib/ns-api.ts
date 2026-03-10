import { supabase } from "@/integrations/supabase/client";

export interface Departure {
  direction: string;
  name: string;
  plannedDateTime: string;
  actualDateTime?: string;
  plannedTrack?: string;
  actualTrack?: string;
  trainCategory: string;
  cancelled: boolean;
  departureStatus: string;
  routeStations?: { mediumName: string }[];
}

export interface Station {
  UICCode: string;
  code: string;
  namen: {
    kort: string;
    middel: string;
    lang: string;
  };
  land: string;
}

export async function fetchDepartures(stationCode: string): Promise<Departure[]> {
  const { data, error } = await supabase.functions.invoke('ns-departures', {
    body: null,
    method: 'GET',
    headers: {},
  });

  // Use query params via URL construction
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/ns-departures?action=departures&station=${encodeURIComponent(stationCode)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch departures');
  const result = await response.json();
  return result.payload?.departures || [];
}

export async function searchStations(query: string): Promise<Station[]> {
  if (!query || query.length < 2) return [];
  
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/ns-departures?action=stations&q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) throw new Error('Failed to search stations');
  const result = await response.json();
  return (result.payload || []).filter((s: Station) => s.land === 'NL');
}

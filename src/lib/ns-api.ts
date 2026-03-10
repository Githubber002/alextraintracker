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

export interface TripLeg {
  origin: {
    name: string;
    plannedDateTime: string;
    actualDateTime?: string;
    plannedTrack?: string;
    actualTrack?: string;
  };
  destination: {
    name: string;
    plannedDateTime: string;
    actualDateTime?: string;
  };
  cancelled: boolean;
  product?: {
    categoryCode: string;
    shortCategoryName: string;
  };
}

export interface Trip {
  legs: TripLeg[];
  status: string;
  plannedDurationInMinutes: number;
  actualDurationInMinutes?: number;
}

export interface RouteConfig {
  id: string;
  fromStations: Station[]; // up to 2
  toStation: Station;
  label?: string;
}

const BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ns-departures`;

async function fetchFromNS(params: Record<string, string>) {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  
  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) throw new Error('API request failed');
  return response.json();
}

export async function fetchDepartures(stationCode: string): Promise<Departure[]> {
  const result = await fetchFromNS({ action: 'departures', station: stationCode });
  return result.payload?.departures || [];
}

export async function searchStations(query: string): Promise<Station[]> {
  if (!query || query.length < 2) return [];
  const result = await fetchFromNS({ action: 'stations', q: query });
  return (result.payload || []).filter((s: Station) => s.land === 'NL');
}

export async function fetchTrips(fromStation: string, toStation: string): Promise<Trip[]> {
  const result = await fetchFromNS({ action: 'trips', fromStation, toStation });
  return result.trips || [];
}

// Route storage helpers
const ROUTES_KEY = 'train-routes';

export function loadRoutes(): RouteConfig[] {
  try {
    const stored = localStorage.getItem(ROUTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRoutes(routes: RouteConfig[]) {
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}

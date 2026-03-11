import { fetchTrips, RouteConfig, Trip } from "./ns-api";

export interface RouteTripData {
  route: RouteConfig;
  fromStationCode: string;
  fromStationName: string;
  trips: ParsedTrip[];
  loading: boolean;
  error?: string;
}

export interface ParsedTrip {
  departureTime: string;
  actualDepartureTime?: string;
  arrivalTime: string;
  actualArrivalTime?: string;
  track?: string;
  actualTrack?: string;
  cancelled: boolean;
  minutesUntil: number;
  trainType?: string;
  crowdForecast?: string;
}

function parseTrips(trips: Trip[]): ParsedTrip[] {
  const now = new Date();
  return trips
    .filter(t => t.status !== 'CANCELLED' || t.legs.some(l => l.cancelled))
    .map(trip => {
      const firstLeg = trip.legs[0];
      const lastLeg = trip.legs[trip.legs.length - 1];
      if (!firstLeg || !lastLeg) return null;

      const depTime = new Date(firstLeg.origin.actualDateTime || firstLeg.origin.plannedDateTime);
      const minutesUntil = Math.round((depTime.getTime() - now.getTime()) / 60000);

      return {
        departureTime: firstLeg.origin.plannedDateTime,
        actualDepartureTime: firstLeg.origin.actualDateTime,
        arrivalTime: lastLeg.destination.plannedDateTime,
        actualArrivalTime: lastLeg.destination.actualDateTime,
        track: firstLeg.origin.plannedTrack,
        actualTrack: firstLeg.origin.actualTrack,
        cancelled: trip.legs.some(l => l.cancelled),
        minutesUntil,
        trainType: firstLeg.product?.shortCategoryName,
        crowdForecast: trip.crowdForecast,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null && t.minutesUntil >= -1)
    .slice(0, 5);
}

export async function fetchRouteTrips(route: RouteConfig): Promise<RouteTripData[]> {
  const results: RouteTripData[] = [];

  for (const fromStation of route.fromStations) {
    try {
      const trips = await fetchTrips(fromStation.code, route.toStation.code);
      results.push({
        route,
        fromStationCode: fromStation.code,
        fromStationName: fromStation.namen.lang,
        trips: parseTrips(trips),
        loading: false,
      });
    } catch (err) {
      results.push({
        route,
        fromStationCode: fromStation.code,
        fromStationName: fromStation.namen.lang,
        trips: [],
        loading: false,
        error: 'Kon reizen niet laden',
      });
    }
  }

  return results;
}

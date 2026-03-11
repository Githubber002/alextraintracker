import { RouteTripData } from "@/lib/route-trips";
import { format } from "date-fns";
import { Zap } from "lucide-react";

interface RouteDisplayProps {
  data: RouteTripData;
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

function formatMinutesUntil(minutes: number): string {
  if (minutes <= 0) return "vertrekt nu";
  return `${minutes} min.`;
}

export function RouteDisplay({ data }: RouteDisplayProps) {
  const title = `${data.fromStationName} → ${data.route.toStation.namen.lang}`;

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h3 className="text-lg font-bold text-card-foreground mb-1">{title}</h3>
      <div className="h-0.5 bg-secondary mb-3 rounded-full" />

      {data.error && (
        <p className="text-destructive text-sm py-4 text-center">{data.error}</p>
      )}

      {data.loading && (
        <div className="space-y-3 py-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded animate-pulse" />
          ))}
        </div>
      )}

      {!data.loading && !data.error && data.trips.length === 0 && (
        <p className="text-muted-foreground text-sm py-4 text-center">Geen treinen gevonden</p>
      )}

      {!data.loading && data.trips.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 px-2 font-medium">Over</th>
                <th className="text-center py-2 px-2 font-medium">Vertrek</th>
                <th className="text-center py-2 px-2 font-medium">Spoor</th>
                <th className="text-right py-2 px-2 font-medium">Aankomst</th>
              </tr>
            </thead>
            <tbody>
              {data.trips.map((trip, i) => {
                const trackChanged = trip.actualTrack && trip.actualTrack !== trip.track;
                const delayed = trip.actualDepartureTime && 
                  new Date(trip.actualDepartureTime).getTime() - new Date(trip.departureTime).getTime() > 60000;

                return (
                  <tr
                    key={i}
                    className={`border-t border-border/50 ${trip.cancelled ? "opacity-50 line-through" : ""}`}
                  >
                    <td className="py-3 px-2 text-left font-semibold text-secondary">
                      {formatMinutesUntil(trip.minutesUntil)}
                    </td>
                    <td className={`py-3 px-2 text-center font-mono ${delayed ? "text-destructive" : "text-card-foreground"}`}>
                      {formatTime(trip.actualDepartureTime || trip.departureTime)}
                    </td>
                    <td className={`py-3 px-2 text-center font-bold ${trackChanged ? "text-destructive" : "text-secondary"}`}>
                      {trip.actualTrack || trip.track || "-"}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-card-foreground">
                      {formatTime(trip.actualArrivalTime || trip.arrivalTime)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

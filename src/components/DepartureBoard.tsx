import { Departure } from "@/lib/ns-api";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Train, Clock, AlertTriangle } from "lucide-react";

interface DepartureBoardProps {
  departures: Departure[];
  loading: boolean;
  stationName?: string;
}

function getDelay(planned: string, actual?: string): number {
  if (!actual) return 0;
  const diff = new Date(actual).getTime() - new Date(planned).getTime();
  return Math.round(diff / 60000);
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

export function DepartureBoard({ departures, loading, stationName }: DepartureBoardProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 animate-pulse border border-border">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Train className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg font-medium">Geen vertrektijden gevonden</p>
        <p className="text-sm mt-1">Zoek een station om vertrektijden te zien</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stationName && (
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          Vertrektijden {stationName}
        </h2>
      )}
      {departures.map((dep, i) => {
        const delay = getDelay(dep.plannedDateTime, dep.actualDateTime);
        const track = dep.actualTrack || dep.plannedTrack;
        const trackChanged = dep.actualTrack && dep.actualTrack !== dep.plannedTrack;

        return (
          <div
            key={`${dep.direction}-${dep.plannedDateTime}-${i}`}
            className={`bg-card rounded-xl p-4 border transition-all hover:shadow-md ${
              dep.cancelled ? "border-destructive/40 opacity-70" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-card-foreground text-lg truncate">
                    {dep.direction}
                  </span>
                  {dep.cancelled && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-xs font-semibold">
                      <AlertTriangle className="h-3 w-3" />
                      Vervallen
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-medium text-xs">
                    <Train className="h-3 w-3" />
                    {dep.trainCategory}
                  </span>
                  {dep.routeStations && dep.routeStations.length > 0 && (
                    <span className="truncate">
                      via {dep.routeStations.map(s => s.mediumName).join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-mono font-bold ${dep.cancelled ? "line-through text-muted-foreground" : "text-card-foreground"}`}>
                    {formatTime(dep.plannedDateTime)}
                  </span>
                  {delay > 0 && !dep.cancelled && (
                    <span className="text-sm font-bold text-destructive">+{delay}</span>
                  )}
                </div>
                {track && (
                  <span className={`text-sm font-semibold ${trackChanged ? "text-destructive" : "text-muted-foreground"}`}>
                    Spoor {track}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

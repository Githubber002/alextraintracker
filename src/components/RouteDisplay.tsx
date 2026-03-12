import { useState } from "react";
import { RouteTripData } from "@/lib/route-trips";
import { format } from "date-fns";
import { Zap, Users, ArrowLeftRight, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function CrowdIndicator({ level }: { level?: string }) {
  if (!level) return null;
  const map: Record<string, { bars: number; label: string; color: string }> = {
    LOW: { bars: 1, label: "Rustig", color: "text-green-600 dark:text-green-400" },
    MEDIUM: { bars: 2, label: "Gemiddeld", color: "text-yellow-600 dark:text-yellow-400" },
    HIGH: { bars: 3, label: "Druk", color: "text-orange-500" },
    UNKNOWN: { bars: 0, label: "", color: "text-muted-foreground" },
  };
  const info = map[level] || map.UNKNOWN;
  if (info.bars === 0) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 ${info.color}`} title={info.label}>
      {[1, 2, 3].map(n => (
        <span
          key={n}
          className={`inline-block w-1 rounded-sm ${n <= info.bars ? "bg-current" : "bg-current opacity-20"}`}
          style={{ height: `${8 + n * 3}px` }}
        />
      ))}
    </span>
  );
}

interface RouteDisplayProps {
  data: RouteTripData;
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

export function RouteDisplay({ data }: RouteDisplayProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 5;
  const title = `${data.fromStationName} → ${data.route.toStation.namen.lang}`;

  function formatMinutesUntil(minutes: number): string {
    if (minutes <= 0) return t("departsNow");
    return `${minutes} ${t("min")}`;
  }

  const visibleTrips = expanded ? data.trips : data.trips.slice(0, INITIAL_COUNT);
  const arrivals = data.trips.map(t => new Date(t.actualArrivalTime || t.arrivalTime).getTime());
  const fastestIdx = arrivals.indexOf(Math.min(...arrivals));

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
        <p className="text-muted-foreground text-sm py-4 text-center">{t("noTrains")}</p>
      )}

      {!data.loading && data.trips.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">{t("over")}</th>
                  <th className="text-center py-2 px-2 font-medium">{t("departure")}</th>
                  <th className="text-center py-2 px-2 font-medium">{t("track")}</th>
                  <th className="text-center py-2 px-2 font-medium"><Users className="h-3.5 w-3.5 mx-auto" /></th>
                  <th className="text-center py-2 px-2 font-medium"><ArrowLeftRight className="h-3.5 w-3.5 mx-auto" /></th>
                  <th className="text-right py-2 px-2 font-medium">{t("arrival")}</th>
                </tr>
              </thead>
              <tbody>
                {visibleTrips.map((trip, i) => {
                  const trackChanged = trip.actualTrack && trip.actualTrack !== trip.track;
                  const depDelayed = trip.actualDepartureTime && 
                    new Date(trip.actualDepartureTime).getTime() - new Date(trip.departureTime).getTime() > 60000;
                  const arrDelayed = trip.actualArrivalTime &&
                    new Date(trip.actualArrivalTime).getTime() - new Date(trip.arrivalTime).getTime() > 60000;
                  const isFastest = i === fastestIdx && data.trips.length > 1 && !trip.cancelled;

                  return (
                    <tr
                      key={i}
                      className={`border-t border-border/50 ${trip.cancelled ? "opacity-50 line-through" : ""}`}
                    >
                      <td className="py-3 px-2 text-left font-semibold text-secondary">
                        {formatMinutesUntil(trip.minutesUntil)}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-card-foreground">
                        {depDelayed ? (
                          <span className="inline-flex flex-col items-center leading-tight">
                            <span className="line-through text-muted-foreground text-[11px]">{formatTime(trip.departureTime)}</span>
                            <span className="text-destructive">{formatTime(trip.actualDepartureTime!)}</span>
                          </span>
                        ) : (
                          formatTime(trip.actualDepartureTime || trip.departureTime)
                        )}
                      </td>
                      <td className={`py-3 px-2 text-center font-bold ${trackChanged ? "text-destructive" : "text-secondary"}`}>
                        {trip.actualTrack || trip.track || "-"}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <CrowdIndicator level={trip.crowdForecast} />
                      </td>
                      <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                        {trip.transfers > 0 ? `${trip.transfers}×` : "—"}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-card-foreground">
                        <span className="inline-flex items-center gap-1">
                          {isFastest && <Zap className="h-3.5 w-3.5 text-secondary fill-secondary" />}
                          {arrDelayed ? (
                            <span className="inline-flex flex-col items-end leading-tight">
                              <span className="line-through text-muted-foreground text-[11px]">{formatTime(trip.arrivalTime)}</span>
                              <span className="text-destructive">{formatTime(trip.actualArrivalTime!)}</span>
                            </span>
                          ) : (
                            formatTime(trip.actualArrivalTime || trip.arrivalTime)
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.trips.length > INITIAL_COUNT && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-card-foreground flex items-center justify-center gap-1 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3" />{t("showLess")}</>
              ) : (
                <><ChevronDown className="h-3 w-3" />{t("showMore")} ({data.trips.length - INITIAL_COUNT})</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
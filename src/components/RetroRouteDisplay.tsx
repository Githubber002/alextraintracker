import { useState } from "react";
import { RouteTripData, ParsedTrip } from "@/lib/route-trips";
import { format } from "date-fns";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface RetroRouteDisplayProps {
  data: RouteTripData;
}

function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

function formatMinutesUntil(minutes: number): string {
  if (minutes <= 0) return "NU";
  return `${minutes}'`;
}

function FlipChar({ char, delay = 0 }: { char: string; delay?: number }) {
  return (
    <span className="flip-char" style={{ animationDelay: `${delay}ms` }}>
      {char}
    </span>
  );
}

function FlipText({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <FlipChar key={i} char={char} delay={startDelay + i * 40} />
      ))}
    </span>
  );
}

function RetroRow({ trip, isFastest, index }: { trip: ParsedTrip; isFastest: boolean; index: number }) {
  const delayed =
    trip.actualDepartureTime &&
    new Date(trip.actualDepartureTime).getTime() - new Date(trip.departureTime).getTime() > 60000;
  const trackChanged = trip.actualTrack && trip.actualTrack !== trip.track;
  const depTime = formatTime(trip.actualDepartureTime || trip.departureTime);
  const arrTime = formatTime(trip.actualArrivalTime || trip.arrivalTime);
  const track = trip.actualTrack || trip.track || "-";
  const baseDelay = index * 250;
  const crowdMap: Record<string, string> = { LOW: "●○○", MEDIUM: "●●○", HIGH: "●●●" };
  const crowdLabel = crowdMap[trip.crowdForecast || ""] || "—";

  return (
    <tr className={`retro-table-row ${trip.cancelled ? "opacity-40 line-through" : ""}`}>
      <td className="retro-td">
        <div className={`flap-tile ${delayed ? "flap-delayed" : ""}`}>
          <FlipText text={depTime} startDelay={baseDelay} />
        </div>
      </td>
      <td className="retro-td">
        <div className={`flap-tile flap-tile-sm ${trackChanged ? "flap-delayed" : ""}`}>
          <FlipText text={track.padStart(2, " ")} startDelay={baseDelay + 120} />
        </div>
      </td>
      <td className="retro-td retro-td-type">
        <div className="flap-tile">
          <FlipText text={(trip.trainType || "Trein").padEnd(6, " ")} startDelay={baseDelay + 200} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm" style={{ fontSize: '0.7rem', letterSpacing: 0 }}>
          <FlipText text={crowdLabel} startDelay={baseDelay + 250} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm" style={{ fontSize: '0.9rem' }}>
          <FlipText text={trip.transfers > 0 ? `${trip.transfers}x` : "—"} startDelay={baseDelay + 260} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm flap-minutes">
          <FlipText text={formatMinutesUntil(trip.minutesUntil).padStart(3, " ")} startDelay={baseDelay + 80} />
        </div>
      </td>
      <td className="retro-td">
        <div className={`flap-tile ${isFastest ? "flap-fastest" : ""}`}>
          {isFastest && <Zap className="h-3.5 w-3.5 flap-zap" />}
          <FlipText text={arrTime} startDelay={baseDelay + 300} />
        </div>
      </td>
    </tr>
  );
}

export function RetroRouteDisplay({ data }: RetroRouteDisplayProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 5;
  const title = `${data.fromStationName} → ${data.route.toStation.namen.lang}`;

  const arrivals = data.trips.map(t => new Date(t.actualArrivalTime || t.arrivalTime).getTime());
  const fastestIdx = arrivals.length > 1 ? arrivals.indexOf(Math.min(...arrivals)) : -1;

  return (
    <div className="retro-board">
      <div className="retro-header">
        <FlipText text={title.toUpperCase()} startDelay={0} />
      </div>

      {data.error && <p className="retro-status">{t("disruptionRetro")}</p>}

      {data.loading && (
        <div className="retro-body p-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded mb-1 animate-pulse" />
          ))}
        </div>
      )}

      {!data.loading && !data.error && data.trips.length === 0 && (
        <p className="retro-status">{t("noTrainsRetro")}</p>
      )}

      {!data.loading && data.trips.length > 0 && (
        <div className="retro-body">
          <table className="retro-table">
            <thead>
              <tr>
                <th className="retro-th">{t("departure")}</th>
                <th className="retro-th">{t("track")}</th>
                <th className="retro-th retro-th-type">{t("type")}</th>
                <th className="retro-th">{t("crowd")}</th>
                <th className="retro-th">{t("transfers")}</th>
                <th className="retro-th">{t("over")}</th>
                <th className="retro-th">{t("arrival")}</th>
              </tr>
            </thead>
            <tbody>
              {(expanded ? data.trips : data.trips.slice(0, INITIAL_COUNT)).map((trip, i) => (
                <RetroRow
                  key={i}
                  trip={trip}
                  isFastest={i === fastestIdx && !trip.cancelled}
                  index={i}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

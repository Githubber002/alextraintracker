import { RouteTripData, ParsedTrip } from "@/lib/route-trips";
import { format } from "date-fns";
import { Zap } from "lucide-react";

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
    <span
      className="flip-char"
      style={{ animationDelay: `${delay}ms` }}
    >
      {char}
    </span>
  );
}

function FlipText({ text, startDelay = 0 }: { text: string; startDelay?: number }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <FlipChar key={i} char={char} delay={startDelay + i * 30} />
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
  const baseDelay = index * 200;

  return (
    <div
      className={`retro-row ${trip.cancelled ? "opacity-40 line-through" : ""}`}
    >
      {/* Vertrek time */}
      <div className="retro-cell retro-cell-time">
        <span className="retro-label">Vertrek</span>
        <span className={`retro-value ${delayed ? "retro-delayed" : ""}`}>
          <FlipText text={depTime} startDelay={baseDelay} />
        </span>
      </div>

      {/* Spoor */}
      <div className={`retro-cell retro-cell-track ${trackChanged ? "retro-track-changed" : ""}`}>
        <span className="retro-label">Spoor</span>
        <span className="retro-value">
          <FlipText text={track} startDelay={baseDelay + 150} />
        </span>
      </div>

      {/* Type */}
      <div className="retro-cell retro-cell-type">
        <span className="retro-label">Type</span>
        <span className="retro-value">
          <FlipText text={trip.trainType || "Trein"} startDelay={baseDelay + 250} />
        </span>
      </div>

      {/* Over */}
      <div className="retro-cell retro-cell-mins">
        <span className="retro-value retro-minutes">
          <FlipText text={formatMinutesUntil(trip.minutesUntil)} startDelay={baseDelay + 100} />
        </span>
      </div>

      {/* Aankomst */}
      <div className="retro-cell retro-cell-arrival">
        <span className="retro-label">Aankomst</span>
        <span className="retro-value inline-flex items-center gap-1">
          {isFastest && <Zap className="h-3 w-3 text-primary fill-primary" />}
          <FlipText text={arrTime} startDelay={baseDelay + 350} />
        </span>
      </div>
    </div>
  );
}

export function RetroRouteDisplay({ data }: RetroRouteDisplayProps) {
  const title = `${data.fromStationName} → ${data.route.toStation.namen.lang}`;

  const arrivals = data.trips.map(t => new Date(t.actualArrivalTime || t.arrivalTime).getTime());
  const fastestIdx = arrivals.length > 1 ? arrivals.indexOf(Math.min(...arrivals)) : -1;

  return (
    <div className="retro-board">
      {/* Top header bar */}
      <div className="retro-header">
        <FlipText text={title.toUpperCase()} startDelay={0} />
      </div>

      {data.error && (
        <p className="retro-error">STORING</p>
      )}

      {data.loading && (
        <div className="retro-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="retro-row retro-row-loading">
              <div className="retro-cell"><span className="retro-value"><FlipText text="--:--" /></span></div>
            </div>
          ))}
        </div>
      )}

      {!data.loading && !data.error && data.trips.length === 0 && (
        <p className="retro-empty">GEEN TREINEN</p>
      )}

      {!data.loading && data.trips.length > 0 && (
        <div className="retro-rows">
          {data.trips.map((trip, i) => (
            <RetroRow
              key={i}
              trip={trip}
              isFastest={i === fastestIdx && !trip.cancelled}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
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

function RetroLiveCountdown({ departureTime, baseDelay }: { departureTime: string; baseDelay: number }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = new Date(departureTime).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(departureTime).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(diff / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [departureTime]);

  if (secondsLeft <= 0) return <FlipText text=" NU" startDelay={baseDelay} />;

  const display = `0:${String(secondsLeft).padStart(2, "0")}`;
  return <span className="animate-pulse"><FlipText text={display} startDelay={baseDelay} /></span>;
}

const hasAnimatedKey = 'retro-first-load-animated';

function FlipChar({ char, delay = 0, animate = true }: { char: string; delay?: number; animate?: boolean }) {
  if (!animate) {
    return (
      <span className="flip-char-wrapper">
        <span className="flip-char-top">{char}</span>
        <span className="flip-char-bottom" style={{ opacity: 1 }}>{char}</span>
      </span>
    );
  }
  return (
    <span className="flip-char-wrapper">
      <span className="flip-char-top">{char}</span>
      <span className="flip-char-bottom" style={{ opacity: 0, animation: `bottom-reveal 0.01s ease-out ${delay + 250}ms forwards` }}>{char}</span>
      <span className="flip-char-flap" style={{ animationDelay: `${delay}ms` }}>{char}</span>
    </span>
  );
}

function FlipText({ text, startDelay = 0, animate = true }: { text: string; startDelay?: number; animate?: boolean }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <FlipChar key={i} char={char} delay={startDelay + i * 50} animate={animate} />
      ))}
    </span>
  );
}

function RetroRow({ trip, isFastest, index, animate }: { trip: ParsedTrip; isFastest: boolean; index: number; animate: boolean }) {
  const depDelayed =
    trip.actualDepartureTime &&
    new Date(trip.actualDepartureTime).getTime() - new Date(trip.departureTime).getTime() > 60000;
  const arrDelayed =
    trip.actualArrivalTime &&
    new Date(trip.actualArrivalTime).getTime() - new Date(trip.arrivalTime).getTime() > 60000;
  const trackChanged = trip.actualTrack && trip.actualTrack !== trip.track;
  const depTime = formatTime(trip.actualDepartureTime || trip.departureTime);
  const plannedDepTime = formatTime(trip.departureTime);
  const arrTime = formatTime(trip.actualArrivalTime || trip.arrivalTime);
  const plannedArrTime = formatTime(trip.arrivalTime);
  const track = trip.actualTrack || trip.track || "-";
  const baseDelay = index * 250;
  const crowdMap: Record<string, string> = { LOW: "●○○", MEDIUM: "●●○", HIGH: "●●●" };
  const crowdLabel = crowdMap[trip.crowdForecast || ""] || "—";

  return (
    <tr className={`retro-table-row ${trip.cancelled ? "opacity-40 line-through" : ""}`}>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm flap-minutes">
          {trip.minutesUntil <= 1 && trip.minutesUntil > 0 ? (
            <RetroLiveCountdown departureTime={trip.actualDepartureTime || trip.departureTime} baseDelay={baseDelay + 80} />
          ) : (
            <FlipText text={formatMinutesUntil(trip.minutesUntil).padStart(3, " ")} startDelay={baseDelay + 80} animate={animate} />
          )}
        </div>
      </td>
      <td className="retro-td">
        <div className={`flap-tile ${depDelayed ? "flap-delayed" : ""}`}>
          {depDelayed && (
            <span style={{ fontSize: '0.45rem', textDecoration: 'line-through', opacity: 0.5, marginRight: 2 }}>
              <FlipText text={plannedDepTime} startDelay={baseDelay} animate={animate} />
            </span>
          )}
          <FlipText text={depTime} startDelay={baseDelay + (depDelayed ? 100 : 0)} animate={animate} />
        </div>
      </td>
      <td className="retro-td">
        <div className={`flap-tile flap-tile-sm ${trackChanged ? "flap-delayed" : ""}`}>
          <FlipText text={track.padStart(2, " ")} startDelay={baseDelay + 120} animate={animate} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile" style={{ fontSize: '0.7rem' }}>
          <FlipText text={(trip.trainType || "Trein").padEnd(4, " ")} startDelay={baseDelay + 200} animate={animate} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm" style={{ fontSize: '0.7rem', letterSpacing: 0 }}>
          <FlipText text={crowdLabel} startDelay={baseDelay + 250} animate={animate} />
        </div>
      </td>
      <td className="retro-td">
        <div className="flap-tile flap-tile-sm" style={{ fontSize: '0.9rem' }}>
          <FlipText text={trip.transfers > 0 ? `${trip.transfers}x` : "—"} startDelay={baseDelay + 260} animate={animate} />
        </div>
      </td>
      <td className="retro-td">
        <div className={`flap-tile ${isFastest ? "flap-fastest" : ""} ${arrDelayed ? "flap-delayed" : ""}`} style={{ minWidth: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          <span style={{ width: 16, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            {isFastest && <Zap className="h-3.5 w-3.5 flap-zap" />}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {arrDelayed && (
              <span style={{ fontSize: '0.55rem', textDecoration: 'line-through', opacity: 0.5, marginRight: 4 }}>
                <FlipText text={plannedArrTime} startDelay={baseDelay + 300} animate={animate} />
              </span>
            )}
            <FlipText text={arrTime} startDelay={baseDelay + (arrDelayed ? 400 : 300)} animate={animate} />
          </span>
        </div>
      </td>
    </tr>
  );
}

export function RetroRouteDisplay({ data }: RetroRouteDisplayProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(() => {
    if (sessionStorage.getItem(hasAnimatedKey)) return false;
    return true;
  });
  const INITIAL_COUNT = 5;
  const title = `${data.fromStationName} → ${data.route.toStation.namen.lang}`;

  useEffect(() => {
    if (animate) {
      // Mark as animated after the animation completes
      const timer = setTimeout(() => {
        sessionStorage.setItem(hasAnimatedKey, 'true');
        setAnimate(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const arrivals = data.trips.map(t => new Date(t.actualArrivalTime || t.arrivalTime).getTime());
  const fastestIdx = arrivals.length > 1 ? arrivals.indexOf(Math.min(...arrivals)) : -1;

  return (
    <div className="retro-board">
      <div className="retro-header">
        <FlipText text={title.toUpperCase()} startDelay={0} animate={animate} />
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
                <th className="retro-th">{t("over")}</th>
                <th className="retro-th">{t("departure")}</th>
                <th className="retro-th">{t("track")}</th>
                <th className="retro-th retro-th-type">{t("type")}</th>
                <th className="retro-th">{t("crowd")}</th>
                <th className="retro-th">{t("transfers")}</th>
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
                  animate={animate}
                />
              ))}
            </tbody>
          </table>
          {data.trips.length > INITIAL_COUNT && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-full mt-1 py-2 text-xs flex items-center justify-center gap-1 transition-colors"
              style={{ color: '#fbbf24' }}
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3" />{t("showLess")}</>
              ) : (
                <><ChevronDown className="h-3 w-3" />{t("showMore")} ({data.trips.length - INITIAL_COUNT})</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { StationSearch } from "@/components/StationSearch";
import { DepartureBoard } from "@/components/DepartureBoard";
import { fetchDepartures, Departure, Station } from "@/lib/ns-api";
import { Train, RefreshCw } from "lucide-react";

const POPULAR_STATIONS: Station[] = [
  { UICCode: "8400058", code: "ASD", namen: { kort: "A'dam C", middel: "Amsterdam C.", lang: "Amsterdam Centraal" }, land: "NL" },
  { UICCode: "8400621", code: "UT", namen: { kort: "Utrecht C", middel: "Utrecht C.", lang: "Utrecht Centraal" }, land: "NL" },
  { UICCode: "8400530", code: "RTD", namen: { kort: "R'dam C", middel: "Rotterdam C.", lang: "Rotterdam Centraal" }, land: "NL" },
  { UICCode: "8400282", code: "GVC", namen: { kort: "Den Haag C", middel: "Den Haag C.", lang: "Den Haag Centraal" }, land: "NL" },
  { UICCode: "8400206", code: "EHV", namen: { kort: "Eindhoven", middel: "Eindhoven", lang: "Eindhoven Centraal" }, land: "NL" },
];

const Index = () => {
  const [station, setStation] = useState<Station | null>(null);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadDepartures = useCallback(async (stationCode: string) => {
    setLoading(true);
    try {
      const deps = await fetchDepartures(stationCode);
      setDepartures(deps);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to load departures:", err);
      setDepartures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!station) return;
    loadDepartures(station.code);
    const interval = setInterval(() => loadDepartures(station.code), 30000);
    return () => clearInterval(interval);
  }, [station, loadDepartures]);

  const handleSelectStation = (s: Station) => {
    setStation(s);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary py-5 px-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/10 p-2 rounded-lg">
              <Train className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground tracking-tight">Vertrektijden</h1>
              <p className="text-xs text-primary-foreground/70 font-medium">Live treininformatie</p>
            </div>
          </div>
          {station && (
            <button
              onClick={() => loadDepartures(station.code)}
              disabled={loading}
              className="p-2.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 
                         transition-colors text-primary-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Station search */}
        <StationSearch onSelect={handleSelectStation} selectedStation={station} />

        {/* Quick picks */}
        {!station && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Populaire stations</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_STATIONS.map((s) => (
                <button
                  key={s.code}
                  onClick={() => handleSelectStation(s)}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium 
                             text-card-foreground hover:bg-accent hover:text-accent-foreground 
                             transition-colors shadow-sm"
                >
                  {s.namen.middel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Last update */}
        {lastUpdate && (
          <p className="text-xs text-muted-foreground text-right">
            Laatst bijgewerkt: {lastUpdate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}

        {/* Departure board */}
        <DepartureBoard
          departures={departures}
          loading={loading}
          stationName={station?.namen.lang}
        />
      </main>
    </div>
  );
};

export default Index;

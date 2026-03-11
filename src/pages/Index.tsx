import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { RouteDisplay } from "@/components/RouteDisplay";
import { DisruptionTicker } from "@/components/DisruptionTicker";
import { RetroRouteDisplay } from "@/components/RetroRouteDisplay";
import { RouteSettings } from "@/components/RouteSettings";
import { loadRoutes, RouteConfig } from "@/lib/ns-api";
import { fetchRouteTrips, RouteTripData } from "@/lib/route-trips";
import { Train, Settings, RefreshCw, ChevronLeft, ChevronRight, Tv, Monitor, Sun, Moon, Globe } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";

const Index = () => {
  const { t, lang, setLang } = useI18n();
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [tripData, setTripData] = useState<RouteTripData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [reversed, setReversed] = useState(false);
  const [retro, setRetro] = useState(() => localStorage.getItem('retro-mode') === 'true');
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) return saved === 'true';
    return false;
  });

  // Apply dark class to html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark-mode', String(dark));
  }, [dark]);

  // Swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setReversed(prev => !prev);
    }
  };

  // Reverse routes: toStation becomes single fromStation, all fromStations become separate "toStation" routes
  const activeRoutes = useMemo(() => {
    if (!reversed) return routes;
    return routes.map(r => ({
      ...r,
      fromStations: [r.toStation],
      toStation: r.fromStations[0], // use first fromStation as destination
    }));
  }, [routes, reversed]);

  useEffect(() => {
    const saved = loadRoutes();
    setRoutes(saved);
    if (saved.length === 0) setShowSettings(true);
  }, []);

  const refreshTrips = useCallback(async (currentRoutes: RouteConfig[]) => {
    if (currentRoutes.length === 0) return;
    setLoading(true);
    try {
      const promises = currentRoutes.map(route => fetchRouteTrips(route));
      const results = await Promise.all(promises);
      setTripData(results.flat());
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to load trips:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeRoutes.length === 0) return;
    refreshTrips(activeRoutes);
    const interval = setInterval(() => refreshTrips(activeRoutes), 30000);
    return () => clearInterval(interval);
  }, [activeRoutes, refreshTrips]);

  const handleSaveRoutes = (newRoutes: RouteConfig[]) => {
    setRoutes(newRoutes);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Train className="h-6 w-6 text-secondary-foreground" />
            <h1 className="text-lg font-bold text-secondary-foreground tracking-tight">{t("departures")}</h1>
          </div>
          <div className="flex items-center gap-1">
            {/* Retro toggle */}
            <button
              onClick={() => {
                setRetro(r => {
                  localStorage.setItem('retro-mode', String(!r));
                  return !r;
                });
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                retro 
                  ? "bg-primary text-primary-foreground" 
                  : "text-secondary-foreground hover:bg-secondary-foreground/10"
              }`}
              title={retro ? "Moderne weergave" : "Retro klapperbord"}
            >
              {retro ? <Tv className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              <span className="hidden sm:inline">{retro ? "Retro" : "Modern"}</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground"
              title={dark ? "Licht thema" : "Donker thema"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Refresh */}
            {routes.length > 0 && (
              <button
                onClick={() => refreshTrips(activeRoutes)}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <DisruptionTicker />
      {routes.length > 0 && (
        <div
          onClick={() => setReversed(r => !r)}
          className="max-w-2xl mx-auto px-4 pt-3 cursor-pointer select-none"
        >
          <div className="relative bg-muted rounded-full p-1 flex items-center h-10 overflow-hidden">
            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-secondary rounded-full transition-all duration-300 ease-in-out ${
                reversed ? "left-[calc(50%+2px)]" : "left-1"
              }`}
            />
            <div className="relative z-10 flex-1 flex items-center justify-center gap-1">
              {!reversed && <ChevronRight className="h-3 w-3 text-secondary-foreground animate-pulse" />}
              <span className={`text-xs font-semibold transition-colors ${
                !reversed ? "text-secondary-foreground" : "text-muted-foreground"
              }`}>Heen</span>
            </div>
            <div className="relative z-10 flex-1 flex items-center justify-center gap-1">
              <span className={`text-xs font-semibold transition-colors ${
                reversed ? "text-secondary-foreground" : "text-muted-foreground"
              }`}>Terug</span>
              {reversed && <ChevronLeft className="h-3 w-3 text-secondary-foreground animate-pulse" />}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1">swipe of tik om te wisselen</p>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="min-h-[60vh]"
      >
        <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {lastUpdate && (
            <p className="text-xs text-muted-foreground text-right">
              {lastUpdate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {routes.length === 0 && !showSettings && (
            <div className="text-center py-16 text-muted-foreground">
              <Train className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">Geen routes ingesteld</p>
              <button
                onClick={() => setShowSettings(true)}
                className="mt-4 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Routes instellen
              </button>
            </div>
          )}

          {loading && tripData.length === 0 && activeRoutes.length > 0 && (
            <div className="space-y-4">
              {[...Array(activeRoutes.length)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse">
                  <div className="h-6 w-48 bg-muted rounded mb-3" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-8 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tripData.map((data, i) => (
            retro ? (
              <RetroRouteDisplay key={`retro-${data.fromStationCode}-${data.route.toStation.code}-${i}`} data={data} />
            ) : (
              <RouteDisplay key={`${data.fromStationCode}-${data.route.toStation.code}-${i}`} data={data} />
            )
          ))}
        </main>
      </div>

      <footer className="max-w-2xl mx-auto px-4 py-8 mt-8 border-t border-border">
        <p className="text-xs text-muted-foreground text-center mb-3">
          Vibe Coded by Alex
        </p>
        <details className="text-center">
          <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Release notes
          </summary>
          <ul className="mt-2 text-[10px] text-muted-foreground space-y-1 list-none">
            <li>⚡ Snelste trein indicator</li>
            <li>📺 Retro split-flap bord modus</li>
            <li>⚠️ Live storingen ticker</li>
            <li>↔ Heen/terug wissel met swipe</li>
            <li>🚂 Multi-route configuratie</li>
          </ul>
        </details>
      </footer>

      {showSettings && (
        <RouteSettings
          routes={routes}
          onSave={handleSaveRoutes}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default Index;

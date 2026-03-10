import { useState, useEffect, useCallback, useRef } from "react";
import { RouteDisplay } from "@/components/RouteDisplay";
import { RouteSettings } from "@/components/RouteSettings";
import { loadRoutes, RouteConfig, RouteDirection } from "@/lib/ns-api";
import { fetchRouteTrips, RouteTripData } from "@/lib/route-trips";
import { Train, Settings, RefreshCw } from "lucide-react";

const DIRECTIONS: { key: RouteDirection; label: string }[] = [
  { key: "heen", label: "Heen" },
  { key: "terug", label: "Terug" },
];

const Index = () => {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [tripData, setTripData] = useState<RouteTripData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activePage, setActivePage] = useState<RouteDirection>("heen");

  // Swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold && activePage === "heen") {
      setActivePage("terug");
    } else if (diff < -threshold && activePage === "terug") {
      setActivePage("heen");
    }
  };

  useEffect(() => {
    const saved = loadRoutes();
    setRoutes(saved);
    if (saved.length === 0) {
      setShowSettings(true);
    }
  }, []);

  const refreshTrips = useCallback(async (currentRoutes: RouteConfig[]) => {
    if (currentRoutes.length === 0) return;
    setLoading(true);
    try {
      const promises = currentRoutes.map(route => fetchRouteTrips(route));
      const results = await Promise.all(promises);
      const allData: RouteTripData[] = [];
      results.forEach(routeResults => allData.push(...routeResults));
      setTripData(allData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to load trips:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routes.length === 0) return;
    refreshTrips(routes);
    const interval = setInterval(() => refreshTrips(routes), 30000);
    return () => clearInterval(interval);
  }, [routes, refreshTrips]);

  const handleSaveRoutes = (newRoutes: RouteConfig[]) => {
    setRoutes(newRoutes);
  };

  const activeRoutes = routes.filter(r => r.direction === activePage);
  const activeTrips = tripData.filter(d => d.route.direction === activePage);
  const hasHeen = routes.some(r => r.direction === "heen");
  const hasTerug = routes.some(r => r.direction === "terug");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Train className="h-6 w-6 text-secondary-foreground" />
            <h1 className="text-lg font-bold text-secondary-foreground tracking-tight">Vertrektijden</h1>
          </div>
          <div className="flex items-center gap-2">
            {routes.length > 0 && (
              <button
                onClick={() => refreshTrips(routes)}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Direction tabs */}
      {hasHeen && hasTerug && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {DIRECTIONS.map(dir => (
              <button
                key={dir.key}
                onClick={() => setActivePage(dir.key)}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  activePage === dir.key
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swipeable content */}
      <div
        ref={containerRef}
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

          {loading && activeTrips.length === 0 && activeRoutes.length > 0 && (
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

          {activeTrips.map((data, i) => (
            <RouteDisplay key={`${data.fromStationCode}-${data.route.toStation.code}-${i}`} data={data} />
          ))}

          {routes.length > 0 && activeRoutes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">Geen routes voor "{activePage === "heen" ? "Heen" : "Terug"}"</p>
              <button
                onClick={() => setShowSettings(true)}
                className="mt-3 text-sm text-secondary font-medium hover:underline"
              >
                Route toevoegen
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Dot indicators */}
      {hasHeen && hasTerug && (
        <div className="flex justify-center gap-2 pb-6">
          {DIRECTIONS.map(dir => (
            <button
              key={dir.key}
              onClick={() => setActivePage(dir.key)}
              className={`w-2 h-2 rounded-full transition-all ${
                activePage === dir.key ? "bg-secondary w-6" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

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

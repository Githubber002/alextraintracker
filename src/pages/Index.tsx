import { useState, useEffect, useCallback } from "react";
import { RouteDisplay } from "@/components/RouteDisplay";
import { RouteSettings } from "@/components/RouteSettings";
import { loadRoutes, RouteConfig } from "@/lib/ns-api";
import { fetchRouteTrips, RouteTripData } from "@/lib/route-trips";
import { Train, Settings, RefreshCw } from "lucide-react";

const Index = () => {
  const [routes, setRoutes] = useState<RouteConfig[]>([]);
  const [tripData, setTripData] = useState<RouteTripData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
      const allData: RouteTripData[] = [];
      const promises = currentRoutes.map(route => fetchRouteTrips(route));
      const results = await Promise.all(promises);
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

        {loading && tripData.length === 0 && routes.length > 0 && (
          <div className="space-y-4">
            {[...Array(routes.length)].map((_, i) => (
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
          <RouteDisplay key={`${data.fromStationCode}-${data.route.toStation.code}-${i}`} data={data} />
        ))}
      </main>

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

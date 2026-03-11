import { useState } from "react";
import { RouteConfig, Station, saveRoutes } from "@/lib/ns-api";
import { StationSearch } from "./StationSearch";
import { Plus, Trash2, ArrowRight, X, Save } from "lucide-react";

interface RouteSettingsProps {
  routes: RouteConfig[];
  onSave: (routes: RouteConfig[]) => void;
  onClose: () => void;
}

export function RouteSettings({ routes: initialRoutes, onSave, onClose }: RouteSettingsProps) {
  const [routes, setRoutes] = useState<RouteConfig[]>(initialRoutes);

  const addRoute = () => {
    if (routes.length >= 5) return;
    setRoutes([...routes, {
      id: crypto.randomUUID(),
      fromStations: [null as any],
      toStation: null as any,
    }]);
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  const updateFromStation = (routeId: string, index: number, station: Station) => {
    setRoutes(routes.map(r => {
      if (r.id !== routeId) return r;
      const fromStations = [...r.fromStations];
      fromStations[index] = station;
      return { ...r, fromStations };
    }));
  };

  const addFromStation = (routeId: string) => {
    setRoutes(routes.map(r => {
      if (r.id !== routeId || r.fromStations.length >= 2) return r;
      return { ...r, fromStations: [...r.fromStations, null as any] };
    }));
  };

  const removeFromStation = (routeId: string, index: number) => {
    setRoutes(routes.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, fromStations: r.fromStations.filter((_, i) => i !== index) };
    }));
  };

  const updateToStation = (routeId: string, station: Station) => {
    setRoutes(routes.map(r => r.id === routeId ? { ...r, toStation: station } : r));
  };

  const handleSave = () => {
    const validRoutes = routes.filter(r => r.fromStations.length > 0 && r.fromStations.every(s => s) && r.toStation);
    saveRoutes(validRoutes);
    onSave(validRoutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">Routes instellen</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Stel je heenroute in. De terugreis wordt automatisch omgedraaid via het ⇄ icoon.
        </p>

        <div className="space-y-6">
          {routes.map((route, routeIndex) => (
            <div key={route.id} className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Route {routeIndex + 1}</span>
                <button
                  onClick={() => removeRoute(route.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Van (max 2 stations)</label>
                {route.fromStations.map((fromStation, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <StationSearch
                        onSelect={(s) => updateFromStation(route.id, i, s)}
                        selectedStation={fromStation}
                        compact
                      />
                    </div>
                    {route.fromStations.length > 1 && fromStation && (
                      <button
                        onClick={() => removeFromStation(route.id, i)}
                        className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {route.fromStations.length < 2 && (
                  <button
                    onClick={() => addFromStation(route.id)}
                    className="text-xs text-secondary hover:text-secondary/80 font-medium flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Nog een vertrekstation
                  </button>
                )}
              </div>

              <div className="flex justify-center my-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Naar</label>
                <div className="mt-1">
                  <StationSearch
                    onSelect={(s) => updateToStation(route.id, s)}
                    selectedStation={route.toStation}
                    compact
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {routes.length < 5 && (
          <button
            onClick={addRoute}
            className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground 
                       hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Route toevoegen
          </button>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

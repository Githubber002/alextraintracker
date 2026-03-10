import { useState, useEffect, useCallback } from "react";
import { searchStations, Station } from "@/lib/ns-api";
import { Search, MapPin } from "lucide-react";

interface StationSearchProps {
  onSelect: (station: Station) => void;
  selectedStation?: Station | null;
}

export function StationSearch({ onSelect, selectedStation }: StationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const stations = await searchStations(q);
      setResults(stations.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Zoek station..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-4 py-3.5 bg-card text-card-foreground rounded-xl border border-border 
                     focus:outline-none focus:ring-2 focus:ring-ring shadow-sm
                     font-medium text-base placeholder:text-muted-foreground"
        />
      </div>

      {selectedStation && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{selectedStation.namen.lang}</span>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {results.map((station) => (
            <button
              key={station.code}
              onClick={() => {
                onSelect(station);
                setQuery(station.namen.lang);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors
                         flex items-center gap-3 border-b border-border last:border-0"
            >
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              <div>
                <span className="font-medium text-card-foreground">{station.namen.lang}</span>
                <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider">{station.code}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg p-4 text-center text-muted-foreground">
          Zoeken...
        </div>
      )}
    </div>
  );
}

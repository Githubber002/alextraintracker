import { useState, useEffect, useCallback } from "react";
import { searchStations, Station } from "@/lib/ns-api";
import { Search, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface StationSearchProps {
  onSelect: (station: Station) => void;
  selectedStation?: Station | null;
  compact?: boolean;
}

export function StationSearch({ onSelect, selectedStation, compact }: StationSearchProps) {
  const { t } = useI18n();
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStation) {
      setQuery(selectedStation.namen.lang);
    }
  }, [selectedStation]);

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

  const inputClass = compact
    ? "w-full pl-9 pr-3 py-2.5 bg-card text-card-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm placeholder:text-muted-foreground"
    : "w-full pl-12 pr-4 py-3.5 bg-card text-card-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring shadow-sm font-medium text-base placeholder:text-muted-foreground";

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className={`absolute ${compact ? "left-3 h-4 w-4" : "left-4 h-5 w-5"} top-1/2 -translate-y-1/2 text-muted-foreground`} />
        <input
          type="text"
          placeholder="Zoek station..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className={inputClass}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {results.map((station) => (
            <button
              key={station.code}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(station);
                setQuery(station.namen.lang);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-accent/50 transition-colors
                         flex items-center gap-2 border-b border-border last:border-0 text-sm"
            >
              <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
              <span className="font-medium text-card-foreground">{station.namen.lang}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{station.code}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-3 text-center text-sm text-muted-foreground">
          Zoeken...
        </div>
      )}
    </div>
  );
}

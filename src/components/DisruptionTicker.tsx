import { useState, useEffect } from "react";
import { fetchDisruptions, Disruption } from "@/lib/ns-api";
import { AlertTriangle } from "lucide-react";

export function DisruptionTicker() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDisruptions();
        setDisruptions(data.filter(d => d.isActive));
        setError(false);
      } catch {
        setError(true);
      }
    };
    load();
    const interval = setInterval(load, 120000); // refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  if (error || disruptions.length === 0) return null;

  const tickerText = disruptions
    .map(d => {
      const cause = d.timespans?.[0]?.cause?.label;
      return `⚠ ${d.title}${cause ? ` — ${cause}` : ""}`;
    })
    .join("     •     ");

  return (
    <div className="disruption-ticker">
      <div className="disruption-ticker-icon">
        <AlertTriangle className="h-3.5 w-3.5" />
      </div>
      <div className="disruption-ticker-track">
        <div className="disruption-ticker-text">
          <span>{tickerText}</span>
          <span aria-hidden="true">{tickerText}</span>
        </div>
      </div>
    </div>
  );
}

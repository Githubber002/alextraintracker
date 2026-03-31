import { useState, useEffect, useRef } from "react";
import { fetchDisruptions } from "@/lib/ns-api";

type Status = "ok" | "degraded" | "error";

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<Status>("ok");
  const failCount = useRef(0);

  useEffect(() => {
    const check = async () => {
      try {
        await fetchDisruptions();
        failCount.current = 0;
        setStatus("ok");
      } catch {
        failCount.current += 1;
        setStatus(failCount.current >= 2 ? "error" : "degraded");
      }
    };
    check();
    const interval = setInterval(check, 1800000);
    return () => clearInterval(interval);
  }, []);

  const color =
    status === "ok"
      ? "bg-green-500"
      : status === "degraded"
      ? "bg-yellow-500"
      : "bg-red-500";

  const label =
    status === "ok"
      ? "API OK"
      : status === "degraded"
      ? "API slow"
      : "API offline";

  return (
    <div className="flex items-center gap-1.5 justify-center" title={label}>
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { searchMedicationNames } from "../services/drugApi";
import { MEDICATION_CATALOG } from "../data/profile";

/**
 * Debounced, live medication name search against RxNorm (NIH). Falls back to the
 * local catalog if the live request fails, so the flow still works offline.
 */
export function useLiveDrugSearch(query: string, exclude: string[] = []) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    controllerRef.current?.abort();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setOffline(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const names = await searchMedicationNames(trimmed, controller.signal);
        setOffline(false);
        setResults(names);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setOffline(true);
        setResults(
          MEDICATION_CATALOG.filter((n) => n.toLowerCase().includes(trimmed.toLowerCase())),
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const filtered = results.filter(
    (name) => !exclude.some((e) => e.toLowerCase() === name.toLowerCase()),
  );

  return { results: filtered, loading, offline };
}

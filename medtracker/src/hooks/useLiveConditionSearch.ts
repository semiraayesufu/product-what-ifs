import { useEffect, useRef, useState } from "react";
import { searchConditionNames, type ConditionMatch } from "../services/conditionApi";
import { CONDITION_CATALOG } from "../data/profile";

/**
 * Debounced, live condition/diagnosis name search against the NIH's ICD-10-CM
 * database. Falls back to a small local list if the live request fails.
 */
export function useLiveConditionSearch(query: string, exclude: string[] = []) {
  const [results, setResults] = useState<ConditionMatch[]>([]);
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
        const matches = await searchConditionNames(trimmed, controller.signal);
        setOffline(false);
        setResults(matches);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setOffline(true);
        setResults(
          CONDITION_CATALOG.filter((n) => n.toLowerCase().includes(trimmed.toLowerCase())).map(
            (name) => ({ code: "", name }),
          ),
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
    (m) => !exclude.some((e) => e.toLowerCase() === m.name.toLowerCase()),
  );

  return { results: filtered, loading, offline };
}

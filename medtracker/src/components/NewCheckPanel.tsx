import { useMemo, useState } from "react";
import closeIcon from "../assets/icons/close.svg";
import closeSmallIcon from "../assets/icons/close-14.svg";
import searchIcon from "../assets/icons/search-lg.svg";
import { MEDICATION_CATALOG } from "../data/profile";

export default function NewCheckPanel({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (items: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return MEDICATION_CATALOG.filter(
      (name) =>
        name.toLowerCase().includes(query.toLowerCase()) &&
        !items.some((item) => item.toLowerCase() === name.toLowerCase()),
    ).slice(0, 5);
  }, [query, items]);

  function addItem(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (items.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    setItems((prev) => [...prev, trimmed]);
    setQuery("");
  }

  function removeItem(name: string) {
    setItems((prev) => prev.filter((item) => item !== name));
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xl font-semibold text-slate-800">New check</p>
          <p className="text-xs leading-4 text-slate-600">
            Use our drug interaction checker to find potentially harmful drug, food, and allergy interactions.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] shadow-xs"
        >
          <img src={closeIcon} alt="Close" className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
        <div className="relative flex flex-col gap-2.5">
          <div className="flex w-full items-center gap-2 rounded-base border border-slate-200 bg-slate-50 px-3.5 py-3 shadow-xs">
            <img src={searchIcon} alt="" className="size-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem(query);
              }}
              placeholder="Search or type to add..."
              autoFocus
              className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-[52px] z-10 flex w-full flex-col overflow-hidden rounded-base border border-slate-200 bg-white shadow-xs">
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addItem(name)}
                  className="w-full px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase text-slate-600">Checking</p>
            <div className="flex flex-col gap-2">
              {items.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-slate-50 p-3.5"
                >
                  <p className="text-sm font-medium text-slate-800">{name}</p>
                  <button type="button" onClick={() => removeItem(name)}>
                    <img src={closeSmallIcon} alt="Remove" className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-2 rounded-lg bg-slate-100 p-3.5 text-slate-600">
          <p className="text-[11px] font-semibold">NOTE:</p>
          <p className="text-xs leading-4">
            Not all drugs interact, and not every interaction means you must stop taking one of your medications. Always consult your healthcare provider about how drug interactions should be managed before making any changes to your current prescription.
          </p>
        </div>
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => onSave(items)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-sm font-semibold text-white">Save</span>
        </button>
      </div>
    </div>
  );
}

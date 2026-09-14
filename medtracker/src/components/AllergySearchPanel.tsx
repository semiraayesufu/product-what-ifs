import { useState } from "react";
import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import searchIcon from "../assets/icons/search.svg";
import { useLiveDrugSearch } from "../hooks/useLiveDrugSearch";

export default function AllergySearchPanel({
  onBack,
  onClose,
  onSelect,
}: {
  onBack: () => void;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { results: matches, loading, offline } = useLiveDrugSearch(query);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-6">
      <div className="flex w-full items-start justify-between">
        <BackButton onClick={onBack} />
        <button type="button" onClick={onClose} className="rounded-sm">
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex w-full items-center gap-2 rounded-base border border-slate-200 bg-slate-50 px-3.5 py-3 shadow-xs">
        <img src={searchIcon} alt="" className="size-5" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a medication or substance"
          autoFocus
          className="w-full bg-transparent text-base text-slate-500 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-600">MATCHES</p>
          {query.trim().length >= 2 && (
            <p className="text-[10px] font-medium uppercase text-slate-400">
              {offline ? "Offline — local matches" : "Live — NIH RxNorm"}
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2">
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className="w-full rounded-[10px] bg-slate-100 p-3.5 text-left"
            >
              <p className="text-sm font-medium text-slate-800">{name}</p>
            </button>
          ))}
          {matches.length === 0 && query.trim().length < 2 && (
            <p className="text-sm text-slate-500">Start typing to search the live medication database.</p>
          )}
          {matches.length === 0 && query.trim().length >= 2 && loading && (
            <p className="text-sm text-slate-500">Searching…</p>
          )}
          {matches.length === 0 && query.trim().length >= 2 && !loading && (
            <p className="text-sm text-slate-500">
              No matches found. You can still add it with Manual entry.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

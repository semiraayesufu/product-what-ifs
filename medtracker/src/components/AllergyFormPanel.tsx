import { useState } from "react";
import BackButton from "./BackButton";
import closeIcon from "../assets/icons/close.svg";
import angleDown from "../assets/icons/chevron-down.svg";
import { useLiveDrugSearch } from "../hooks/useLiveDrugSearch";
import { SEVERITY_OPTIONS } from "../data/profile";

export interface AllergyValues {
  name: string;
  reactionName: string;
  severity: string;
}

export default function AllergyFormPanel({
  mode,
  initialValues,
  onBack,
  onClose,
  onSave,
  submitLabel = "Add allergy",
}: {
  mode: "add" | "edit";
  initialValues?: Partial<AllergyValues>;
  onBack?: () => void;
  onClose: () => void;
  onSave: (values: AllergyValues) => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [reaction, setReaction] = useState(initialValues?.reactionName ?? "");
  const [severity, setSeverity] = useState(initialValues?.severity ?? SEVERITY_OPTIONS[2]);

  const { results: suggestions, loading: suggestionsLoading, offline } = useLiveDrugSearch(name);

  const canSave = name.trim().length > 0;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full items-center gap-5">
        {onBack && <BackButton onClick={onBack} />}
        <p className="flex-1 text-xl font-semibold text-slate-800">
          {mode === "add" ? "Add allergy" : "Edit allergy"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-[#e5e7eb] bg-[#f9fafb] shadow-xs"
        >
          <img src={closeIcon} alt="Close" className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] overflow-y-auto">
        <div className="relative flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Allergen</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            placeholder="Search or type a medication name"
            autoFocus
            className="w-full rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
          {showSuggestions && name.trim().length >= 2 && (suggestions.length > 0 || suggestionsLoading) && (
            <div className="absolute top-[68px] z-10 flex w-full flex-col overflow-hidden rounded-base border border-slate-200 bg-white shadow-xs">
              {suggestionsLoading && suggestions.length === 0 ? (
                <p className="px-3.5 py-2.5 text-sm text-slate-500">Searching…</p>
              ) : (
                suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setName(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {s}
                  </button>
                ))
              )}
              <p className="border-t border-slate-100 px-3.5 py-1.5 text-[10px] font-medium uppercase text-slate-400">
                {offline ? "Offline — showing local matches" : "Live results — NIH RxNorm"}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Reaction</label>
          <textarea
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            placeholder="e.g. Rash, swelling"
            rows={3}
            className="w-full resize-none rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-500 shadow-xs focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#101828]">Severity</label>
          <div className="relative">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full appearance-none rounded-base border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <img
              src={angleDown}
              alt=""
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={() => onSave({ name, reactionName: reaction || "Not specified", severity })}
        className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-sm font-semibold text-white">{submitLabel}</span>
      </button>
    </div>
  );
}

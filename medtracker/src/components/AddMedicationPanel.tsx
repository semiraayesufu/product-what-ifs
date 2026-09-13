import arrowLeft from "../assets/icons/arrow-left.svg";
import closeIcon from "../assets/icons/close.svg";
import searchIcon from "../assets/icons/search-md.svg";

export default function AddMedicationPanel({
  query,
  onQueryChange,
  matches,
  onBack,
  onClose,
  onSelect,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  matches: string[];
  onBack: () => void;
  onClose: () => void;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-6">
      <div className="flex w-full items-start justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-sm"
        >
          <img src={arrowLeft} alt="" className="size-3.5" />
          <span className="text-xs font-medium text-slate-600">Back</span>
        </button>
        <button type="button" onClick={onClose} className="rounded-sm">
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex w-full items-center gap-2 rounded-base border border-slate-200 bg-slate-50 px-3.5 py-3 shadow-xs">
        <img src={searchIcon} alt="" className="size-5" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          autoFocus
          className="w-full bg-transparent text-base text-slate-500 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <p className="text-[11px] font-semibold text-slate-600">MATCHES</p>
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
          {matches.length === 0 && (
            <p className="text-sm text-slate-500">No matches found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

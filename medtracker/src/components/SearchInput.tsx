import searchIcon from "../assets/icons/search-sm.svg";

export default function SearchInput({
  size = "sm",
  value,
  onChange,
  placeholder = "Search",
}: {
  size?: "sm" | "md";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const isMd = size === "md";
  return (
    <div
      className={`flex w-full items-center gap-2 rounded-base border border-slate-200 bg-slate-50 shadow-xs ${
        isMd ? "px-3.5 py-3" : "px-3 py-2.5"
      }`}
    >
      <img src={searchIcon} alt="" className={isMd ? "size-5" : "size-4"} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-slate-500 placeholder:text-slate-500 focus:outline-none ${
          isMd ? "text-base" : "text-sm"
        }`}
      />
    </div>
  );
}

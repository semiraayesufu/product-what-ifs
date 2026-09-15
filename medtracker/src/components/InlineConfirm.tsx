export default function InlineConfirm({
  question,
  confirmLabel = "Yes, remove",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  className = "",
}: {
  question: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-medium text-slate-700">{question}</span>
      <button
        type="button"
        onClick={onConfirm}
        className="shrink-0 rounded-sm bg-[#e7000b] px-2.5 py-1 text-xs font-semibold text-white"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded-sm border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
      >
        {cancelLabel}
      </button>
    </div>
  );
}

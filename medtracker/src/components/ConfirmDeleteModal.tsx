import { useEffect } from "react";
import closeIcon from "../assets/icons/close.svg";
import alertIcon from "../assets/icons/alert-circle.svg";

export default function ConfirmDeleteModal({
  message,
  confirmLabel = "Yes, delete",
  cancelLabel = "No, cancel",
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative flex w-full max-w-[360px] flex-col items-center gap-5 rounded-2xl bg-white p-7 shadow-xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex size-6 items-center justify-center"
        >
          <img src={closeIcon} alt="Close" className="size-3.5" />
        </button>
        <img src={alertIcon} alt="" className="size-9" />
        <p className="text-center text-base font-semibold leading-6 text-slate-800">{message}</p>
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center rounded-lg bg-[#e7000b] px-4 py-2.5"
          >
            <span className="text-sm font-semibold text-white">{confirmLabel}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5"
          >
            <span className="text-sm font-semibold text-slate-700">{cancelLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

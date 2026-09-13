import { useRef, useState } from "react";
import arrowLeft from "../assets/icons/arrow-left.svg";
import closeIcon from "../assets/icons/close.svg";
import uploadIcon from "../assets/icons/upload.svg";

export default function UploadMedicationPanel({
  onBack,
  onClose,
  onContinue,
}: {
  onBack: () => void;
  onClose: () => void;
  onContinue: (fileName: string) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 py-5">
      <div className="flex w-full items-start justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5">
          <img src={arrowLeft} alt="" className="size-3.5" />
          <span className="text-xs font-medium text-slate-700">Back</span>
        </button>
        <button type="button" onClick={onClose}>
          <img src={closeIcon} alt="Close" className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xl font-semibold text-slate-800">Upload prescription</p>
        <p className="text-xs text-slate-600">
          Upload an image or file containing your prescription
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-3 rounded-base border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center"
      >
        <img src={uploadIcon} alt="" className="size-6" />
        {fileName ? (
          <p className="text-sm font-medium text-slate-800">{fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700">Click to choose a file</p>
            <p className="text-xs text-slate-500">Image or PDF of your prescription</p>
          </>
        )}
      </button>

      <div className="flex flex-col gap-2 rounded-lg bg-slate-100 p-3.5 text-slate-600">
        <p className="text-[11px] font-semibold">NOTE:</p>
        <p className="text-xs leading-4">
          We can't automatically read prescription files yet — after uploading, you'll confirm the
          details yourself on the next screen.
        </p>
      </div>

      <button
        type="button"
        disabled={!fileName}
        onClick={() => fileName && onContinue(fileName)}
        className="mt-auto flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="text-sm font-semibold text-white">Continue</span>
      </button>
    </div>
  );
}

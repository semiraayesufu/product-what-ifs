import { useMemo, useState } from "react";
import Sidebar, { type NavKey } from "../components/Sidebar";
import SearchInput from "../components/SearchInput";
import ListRow from "../components/ListRow";
import AllergyDetailPanel from "../components/AllergyDetailPanel";
import AllergyFormPanel from "../components/AllergyFormPanel";
import EmptyState from "../components/EmptyState";
import plusIcon from "../assets/icons/plus.svg";
import { useAppStore, slugify } from "../store/AppStore";

export default function AllergiesScreen({
  onNavigate,
}: {
  onNavigate?: (key: NavKey) => void;
}) {
  const { allergies, addAllergy, updateAllergy, removeAllergy } = useAppStore();
  const [listQuery, setListQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(allergies[0]?.id ?? null);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");

  const filtered = useMemo(
    () => allergies.filter((a) => a.name.toLowerCase().includes(listQuery.toLowerCase())),
    [allergies, listQuery],
  );

  const selected = allergies.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="allergies" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 max-w-[480px] flex-1 flex-col gap-6 overflow-hidden border-r border-slate-200 bg-white px-8 py-5">
          <div className="flex w-full items-center gap-5">
            <p className="flex-1 text-xl font-semibold text-[#1a1a1a]">Allergies</p>
            <button
              type="button"
              onClick={() => setMode("add")}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 shadow-xs"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">Add allergy</span>
            </button>
          </div>

          {allergies.length > 0 && <SearchInput value={listQuery} onChange={setListQuery} />}

          <div className="flex w-full flex-col gap-3 overflow-y-auto">
            {filtered.map((allergy) => (
              <ListRow
                key={allergy.id}
                title={allergy.name}
                subtitle={allergy.severityLabel}
                active={allergy.id === selectedId && mode === "view"}
                onClick={() => {
                  setSelectedId(allergy.id);
                  setMode("view");
                }}
              />
            ))}
          </div>
        </div>

        {mode === "add" ? (
          <AllergyFormPanel
            mode="add"
            onClose={() => setMode("view")}
            onSave={({ name, reactionName, severity }) => {
              addAllergy({
                name,
                severityLabel: severity,
                reactionName,
                reactionSeverity: `${severity} reaction`,
              });
              setSelectedId(slugify(name));
              setMode("view");
            }}
          />
        ) : mode === "edit" && selected ? (
          <AllergyFormPanel
            mode="edit"
            initial={selected}
            onClose={() => setMode("view")}
            onSave={({ name, reactionName, severity }) => {
              updateAllergy(selected.id, {
                name,
                severityLabel: severity,
                reactionName,
                reactionSeverity: `${severity} reaction`,
              });
              setMode("view");
            }}
          />
        ) : selected ? (
          <AllergyDetailPanel
            allergy={selected}
            onEdit={() => setMode("edit")}
            onDelete={() => {
              removeAllergy(selected.id);
              setSelectedId(null);
            }}
          />
        ) : allergies.length === 0 ? (
          <div className="flex h-full min-w-0 flex-1 flex-col px-8 py-5">
            <EmptyState
              icon={<p className="text-[28px]">⚠️</p>}
              title="No allergies recorded"
              description="Add any known allergies so we can check new medications against them automatically, from day one."
              ctaLabel="Add your first allergy"
              onCta={() => setMode("add")}
            />
          </div>
        ) : (
          <div className="flex h-full min-w-0 flex-1 items-center justify-center px-8 py-5">
            <p className="text-sm text-slate-500">Select an allergy to see its details.</p>
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-5 py-3.5 text-slate-600">
        <p className="text-[13px] font-bold">ⓘ</p>
        <p className="text-xs">
          MedTracker shares information only — It is not a replacement for professional medical advice. — It does not diagnose, prescribe, or replace advice from a licensed provider.
        </p>
      </div>
    </div>
  );
}

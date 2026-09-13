import Sidebar, { type NavKey } from "../components/Sidebar";
import plusIcon from "../assets/icons/plus.svg";
import medicationsIcon from "../assets/icons/medications.svg";
import { useAppStore } from "../store/AppStore";

export default function DashboardScreen({
  onNavigate,
  onAddMedication,
}: {
  onNavigate?: (key: NavKey) => void;
  onAddMedication?: () => void;
}) {
  const { medications, allergies, conditions, log } = useAppStore();

  const isEmpty =
    medications.length === 0 && allergies.length === 0 && conditions.length === 0 && log.length === 0;

  const needsAttention = log.filter((entry) => !entry.decision);
  const recentActivity = log.slice(0, 6);

  return (
    <div className="flex h-screen w-full flex-col items-start bg-white">
      <div className="flex min-h-0 flex-1 w-full items-start overflow-hidden border border-slate-200 bg-white">
        <Sidebar active="home" onNavigate={onNavigate} />

        <div className="flex h-full min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-10 py-5">
          <div className="flex w-full items-center gap-5">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-2xl font-semibold text-[#1a1a1a]">Hi, Zayd</p>
              <p className="text-sm text-[#737373]">Here's where things stand today</p>
            </div>
            <button
              type="button"
              onClick={onAddMedication}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
            >
              <img src={plusIcon} alt="" className="size-4" />
              <span className="text-sm font-semibold text-white">Add medication</span>
            </button>
          </div>

          <div className="flex w-full items-start gap-3">
            <div className="flex flex-1 flex-col gap-1 rounded-[10px] bg-slate-100 p-[18px]">
              <p className="text-2xl font-bold text-slate-800">{medications.length}</p>
              <p className="text-xs text-slate-600">Medications</p>
            </div>
            <div className="flex flex-1 flex-col gap-1 rounded-[10px] bg-slate-100 p-[18px]">
              <p className="text-2xl font-bold text-slate-800">{allergies.length}</p>
              <p className="text-xs text-slate-600">Allergies</p>
            </div>
            <div className="flex flex-1 flex-col gap-1 rounded-[10px] bg-slate-100 p-[18px]">
              <p className="text-2xl font-bold text-slate-800">{conditions.length}</p>
              <p className="text-xs text-slate-600">Conditions</p>
            </div>
          </div>

          {isEmpty ? (
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
              <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-teal-100">
                <img src={medicationsIcon} alt="" className="size-7" />
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <p className="text-lg font-bold text-[#141414]">Your dashboard will fill in as you go</p>
                <p className="w-[420px] text-[13px] leading-4 text-[#737373]">
                  Once you add medications, this is where you'll see today's doses, anything that needs your attention, and recent activity.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddMedication}
                className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2.5 shadow-xs"
              >
                <img src={plusIcon} alt="" className="size-4" />
                <span className="text-sm font-semibold text-white">Add your first medication</span>
              </button>
            </div>
          ) : (
            <div className="flex w-full items-start gap-5">
              <div className="flex flex-1 flex-col gap-4">
                <p className="text-[11px] font-semibold text-slate-600">RECENT ACTIVITY</p>
                <div className="flex w-full flex-col gap-3">
                  {recentActivity.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onNavigate?.("history")}
                      className="flex w-full flex-col gap-1 rounded-lg border border-slate-200 p-3 text-left"
                    >
                      <div className="flex w-full items-start gap-2">
                        <p className="flex-1 text-xs font-semibold text-slate-800">{entry.title}</p>
                        <p className="shrink-0 text-[10px] text-slate-600">{entry.timeLabel}</p>
                      </div>
                      <p className="text-[11px] text-slate-600">{entry.summary}</p>
                    </button>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-slate-500">No recent activity yet.</p>
                  )}
                </div>
              </div>

              <div className="flex w-[320px] shrink-0 flex-col gap-4">
                <p className="text-[11px] font-semibold text-slate-600">
                  NEEDS ATTENTION ({needsAttention.length})
                </p>
                <div className="flex w-full flex-col gap-3">
                  {needsAttention.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onNavigate?.("history")}
                      className={`flex w-full items-center gap-2.5 rounded-lg p-3 text-left ${
                        entry.severity === "unresolved" ? "bg-orange-50" : "bg-[#fef2f2]"
                      }`}
                    >
                      <p
                        className={`text-[15px] font-bold ${
                          entry.severity === "unresolved" ? "text-slate-800" : "text-[#fb2c36]"
                        }`}
                      >
                        {entry.severity === "unresolved" ? "?" : "⚠"}
                      </p>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-xs font-semibold text-slate-800">{entry.title}</p>
                        <p className="text-[11px] text-slate-600">{entry.summary}</p>
                      </div>
                    </button>
                  ))}
                  {needsAttention.length === 0 && (
                    <p className="text-sm text-slate-500">Nothing needs your attention.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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

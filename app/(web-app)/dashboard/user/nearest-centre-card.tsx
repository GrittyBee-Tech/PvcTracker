import Link from "next/link";

export function NearestCentreCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
            📍 Nearest Centre
          </span>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            LUTH Collection Hub
          </h3>
          <p className="text-sm text-slate-500">Idi-Araba, Surulere, Lagos</p>
        </div>
        {/* Dynamic Live Status Badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Low Queue
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
        <span>⏱️ Avg. wait time: ~20 mins</span>
        <span>Updated 10m ago</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={'/dashboard/user/find-centre'} className="flex justify-center items-center gap-1 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900 transition">
          View Map
        </Link>
        <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          Report Crowd
        </button>
      </div>
    </div>
  );
}
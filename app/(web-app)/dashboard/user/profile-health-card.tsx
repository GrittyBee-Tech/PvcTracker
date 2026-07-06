import Link from "next/link";

export function ProfileHealthCard({
  ninStatus,
  vin,
}: {
  ninStatus?: "verified" | "rejected" | "pending";
  vin?: string | null;
}) {
  // Example state tracker
  const completionPercentage = 66;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          ⚙️ Verification Progress
        </h3>
        <span className="text-sm font-bold text-emerald-700">
          {completionPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Actionable Tasks List */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {ninStatus === "verified" ? (
            <>
              <span className="text-emerald-600 font-bold">✓</span>
              <span className="line-through text-slate-400">NIN Verified</span>
            </>
          ) : ninStatus === "rejected" ? (
            <>
              <span className="text-red-500 font-bold">✓</span>
              <span className="line-through text-red-400">NIN Rejected</span>
            </>
          ) : (
            <>
              <span className="text-amber-500 font-bold">⚠️</span>
              <span className=" text-slate-400">Verify your NIN</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-800 font-medium">
          {vin ? (
            <>
              <span className="text-emerald-600 animate-bounce">✓</span>
              <span className="flex-1 line-through text-slate-400">
                VIN saved
              </span>
            </>
          ) : (
            <>
              <span className="text-amber-500 animate-bounce">⚠️</span>
              <span className="flex-1">VIN Number Needed</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Action Contextualizes Based on Needs */}
      <div className="mt-4">
        <Link
          href={"/dashboard/user/edit-profile"}
          className="w-full flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-600 transition shadow-sm"
        >
          Complete Missing Info →
        </Link>
      </div>
    </div>
  );
}

import { CompletenessResult } from "@/utils/profile";
import Link from "next/link";

export function ProfileHealthCard({
  ninStatus,
  vin,
  // completionPercentage,
  profileCompleteness,
}: {
  ninStatus?: "verified" | "rejected" | "pending";
  vin?: string | null;
  // completionPercentage: number;
  profileCompleteness: CompletenessResult;
}) {
  console.log(profileCompleteness);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          ⚙️ Verification Progress
        </h3>
        <span className="text-sm font-bold text-emerald-700">
          {profileCompleteness.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="my-2 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${profileCompleteness.percentage}%` }}
        />
      </div>

      {/* Actionable Tasks List */}
      <div className="space-y-2">
        {profileCompleteness?.missingFields.length === 0 ? (
          <p className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="text-emerald-600 font-bold text-xl mr-2">✓</span>
            All fields are complete!
          </p>
        ) : (
          <>
            <h4 className="font-semibold text-red-500">Missing Info:</h4>
            <ul className="list-none space-y-1.5 text-sm text-slate-600">
              {profileCompleteness?.missingFields.slice(0, 3).map((field) => (
                <li key={field} className="animate-bounce duration-50">
                  <span className="text-amber-500 font-bold mr-2">⚠️</span>
                  {field}
                </li>
              ))}
            </ul>
          </>
        )}
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

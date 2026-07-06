"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  FaCheck,
  FaCopy,
  FaHandsClapping,
  FaHourglassStart,
  FaLocationDot,
} from "react-icons/fa6";
import {
  FaAddressCard,
  FaUser,
  FaUserCheck,
  FaUserEdit,
  FaUserTimes,
} from "react-icons/fa";
import { NearestCentreCard } from "./nearest-centre-card";
import { ProfileHealthCard } from "./profile-health-card";
import { useState } from "react";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [ninCopied, setNinCopied] = useState(false);
  const [vinCopied, setVinCopied] = useState(false);

  // Safely grab dynamic variables
  const isNinVerified = user?.ninStatus === "verified";
  const hasVin = !!user?.vin;
  const isPvcCollected = user?.pvcStatus === "collected";

  const handleCopyVin = () => {
    if (user?.vin) {
      navigator.clipboard.writeText(user.vin);
      setVinCopied(true);
      setTimeout(() => setVinCopied(false), 2500);
    }
  };
  const handleCopyNin = () => {
    if (user?.nin) {
      navigator.clipboard.writeText(user.nin);
      setNinCopied(true);
      setTimeout(() => setNinCopied(false), 2500);
    }
  };

  return (
    <div className="relative space-y-10">
      <div>
        <div className="flex items-center gap-2 w-max">
          <h1 className="md:text-3xl text-xl font-space-grotesk font-bold text-primary">
            Welcome, {user?.lastName} {user?.firstName}
          </h1>
          <FaHandsClapping className="text-primary text-3xl animate-bounce" />
        </div>
        <p className="text-muted-foreground mt-2 font-dm-sans">
          Here&apos;s a quick overview of your PVC WAKA journey and important
          actions.
        </p>
      </div>

      {/* Unified Journey Step Tracker */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 font-space-grotesk">
              Your PVC Progress Timeline
            </h2>
            <p className="text-xs text-muted-foreground font-dm-sans">
              Track milestones sequentially from dynamic voter verification to
              pickup.
            </p>
          </div>
          <span className="w-max bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
            {isPvcCollected
              ? "100%"
              : hasVin
                ? "66%"
                : isNinVerified
                  ? "33%"
                  : "0%"}{" "}
            Completed
          </span>
        </div>

        {/* 3-Step Continuous Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1: NIN Verification Status */}
          <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 justify-between min-h-24">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isNinVerified
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {isNinVerified ? <FaCheck className="size-4" /> : "1"}
              </div>
              <span className="font-semibold text-slate-900">
                NIN Verification
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1 rounded text-sm font-mono text-slate-700">
              <span className="truncate max-w-36">
                {user?.nin
                  ? `${user.nin.slice(0, 4)}*****${user.nin.slice(-2)}`
                  : "Not Linked Yet"}
              </span>
              {user?.nin && (
                <button
                  onClick={handleCopyNin}
                  className="text-emerald-800 p-1 hover:bg-slate-100 rounded transition flex items-center gap-1"
                  title="Copy permanent NIN"
                >
                  <FaCopy className="size-4" />
                  <span
                    className={`font-sans ${ninCopied ? "text-sm" : "text-xs"}`}
                  >
                    {ninCopied ? "Copied" : "Copy"}
                  </span>
                </button>
              )}
            </div>
            {/* <div className="mt-4">
              <span
                className={`text-sm font-medium px-2 py-0.5 rounded capitalize ${
                  user?.ninStatus === "verified"
                    ? "bg-emerald-50 text-emerald-700"
                    : user?.ninStatus === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {user?.ninStatus
                  ? user.ninStatus.replace("_", " ")
                  : "Pending Verification"}
              </span>
            </div> */}
          </div>

          {/* Step 2: Custom Encrypted VIN Field */}
          <div className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 justify-between min-h-24">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  hasVin
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-300 text-slate-600"
                }`}
              >
                {hasVin ? <FaCheck className="size-4" /> : "2"}
              </div>
              <span className="font-semibold text-slate-900">
                Registered VIN
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1 rounded text-sm font-mono text-slate-700">
              <span className="truncate max-w-36">
                {user?.vin
                  ? `${user.vin.slice(0, 6)}••••${user.vin.slice(-3)}`
                  : "Not Linked Yet"}
              </span>
              {user?.vin && (
                <button
                  onClick={handleCopyVin}
                  className="text-emerald-800 p-1 hover:bg-slate-100 rounded transition flex items-center gap-1"
                  title="Copy permanent VIN"
                >
                  <FaCopy className="size-4" />
                  <span
                    className={`font-sans ${vinCopied ? "text-sm" : "text-xs"}`}
                  >
                    {vinCopied ? "Copied" : "Copy"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Polling Unit Collection */}
          <div
            className={`flex flex-col p-4 rounded-xl justify-between min-h-24 border ${
              isPvcCollected
                ? "bg-emerald-50/40 border-emerald-200"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isPvcCollected
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-300 text-slate-600"
                }`}
              >
                {isPvcCollected ? <FaCheck className="size-4" /> : "3"}
              </div>
              <span className="font-semibold text-slate-900">
                PVC Collection
              </span>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium px-2.5 py-0.75 rounded capitalize ${
                  isPvcCollected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {isPvcCollected ? "Collected" : "Not Picked Up Yet"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="">
        <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 mt-4">
          {/* <Card className="border-gray-400 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Find INEC Centre
              </CardTitle>
              <FaLocationDot className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Locate the nearest registration or collection center.
              </p>
              <Link href="/dashboard/user/find-centre" passHref>
                <Button className="w-full bg-primary text-white">
                  Go to Centre Finder
                </Button>
              </Link>
            </CardContent>
          </Card> */}
          <NearestCentreCard />
          {/* <Card className="border-gray-400 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Update Profile
              </CardTitle>
              <FaUserEdit className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-8">
                Edit your personal details or PVC information.
              </p>
              <Link href="/dashboard/user/edit-profile" passHref>
                <Button className="w-full bg-primary text-white">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card> */}
          <ProfileHealthCard ninStatus={user?.ninStatus} vin={user?.vin} />
        </div>
      </div>
    </div>
  );
}

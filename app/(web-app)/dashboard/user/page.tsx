"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
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

export default function UserDashboardPage() {
  const { user } = useAuth();

  // const paystack = new PaystackPop();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVerifying, setIsVerifying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ninError, setNinError] = useState<string | null>(null);

  const getNinStatusDisplay = (status?: string) => {
    switch (status) {
      case "verified":
        return {
          text: "Verified",
          icon: <FaUserCheck className="w-5 h-5 text-green-500" />,
          colorClass: "text-green-400",
          description:
            "Your National Identification Number has been successfully verified.",
        };
      case "rejected":
        return {
          text: "Rejected",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-red-400",
          description:
            "Your NIN verification was rejected. Please check your profile for details.",
        };
      case "pending":
      default:
        return {
          text: "Pending Verification",
          icon: <FaUserTimes className="w-5 h-5 text-yellow-400 " />,
          colorClass: "text-yellow-400",
          description:
            "Your National Identification Number is being processed.",
        };
    }
  };

  const getPvcStatusDisplay = (status?: string) => {
    switch (status) {
      case "collected":
        return {
          text: "Collected",

          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          colorClass: "text-green-400",
          description:
            "You have successfully collected your Permanent Voter Card.",
        };
      case "not_collected":
      default:
        return {
          text: "Not Collected",
          icon: <FaHourglassStart className="w-5 h-5 text-red-400" />,
          colorClass: "text-red-400",
          description: "You have not yet collected your Permanent Voter Card.",
        };
    }
  };

  const ninDisplay = getNinStatusDisplay(user?.ninStatus);
  const pvcDisplay = getPvcStatusDisplay(user?.pvcStatus);

  return (
    <div className="relative space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="grid grid-flow-col items-center w-max gap-2">
            <h1 className="text-3xl font-space-grotesk font-bold text-primary">
              Welcome, {user?.lastName} {user?.firstName}
            </h1>
            <FaHandsClapping className="text-primary text-4xl" />
          </div>

          <p className="text-muted-foreground mt-3 font-dm-sans">
            Here&apos;s a quick overview of your PVC WAKA journey and important
            actions.
          </p>
        </div>
      </div>
      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row  items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-primary">
              NIN Verification
            </CardTitle>
            {ninDisplay.icon}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl  font-dm-sans font-bold ${ninDisplay.colorClass}`}
            >
              {ninDisplay.text}
            </div>
            <p className="text-xs font-dm-sans text-muted-foreground mt-1">
              {ninDisplay.description}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base  font-medium text-primary">
              PVC Collection
            </CardTitle>
            {pvcDisplay.icon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pvcDisplay.colorClass}`}>
              {pvcDisplay.text}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pvcDisplay.description}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium text-primary">
              Registered By
            </CardTitle>
            <FaUser className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {user ? `${user.firstName} ${user.lastName}` : "N/A"}
            </div>
            <p className="text-xs font-dm-sans text-muted-foreground mt-1">
              You registered yourself on the platform.
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-primary">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <Card className="border-gray-400 shadow-md ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Registered VIN
              </CardTitle>
              <FaAddressCard className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {user?.vin ? user.vin : "Pending VIN"}
              </div>
              <p className="text-sm text-muted-foreground mt-5">
                Yes, it&apos;s Sensitive. safe like a bank reference, not like a
                username.
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-400 shadow-md">
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
          </Card>
          <Card className="border-gray-400 shadow-md">
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
          </Card>
        </div>
      </div>
    </div>
  );
}

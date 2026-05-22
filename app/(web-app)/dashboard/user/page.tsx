import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, User, Pencil } from "lucide-react";

export default async function UserDashboardPage() {
  // In a real application, you would fetch user-specific data here
  // For now, we'll use dummy data or a simplified representation
  const user = {
    name: "Normal User",
    ninStatus: "Pending Verification", // Can be "Pending Verification", "Verified", "Rejected"
    pvcStatus: "Not Collected", // Can be "Not Collected", "Collected", "Pending"
    registeredBy: "Self",
  };

  const getNinStatusDisplay = (status: string) => {
    switch (status) {
      case "Verified":
        return {
          text: "Verified",
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          colorClass: "text-green-400",
          description:
            "Your National Identification Number has been successfully verified.",
        };
      case "Rejected":
        return {
          text: "Rejected",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-red-400",
          description:
            "Your NIN verification was rejected. Please check your profile for details.",
        };
      case "Pending Verification":
      default:
        return {
          text: "Pending Verification",
          icon: <Clock className="w-5 h-5 text-primary " />,
          colorClass: "text-yellow-400",
          description:
            "Your National Identification Number is being processed.",
        };
    }
  };

  const getPvcStatusDisplay = (status: string) => {
    switch (status) {
      case "Collected":
        return {
          text: "Collected",
          icon: <CheckCircle2 className="w-5 h-5 text-primary" />,
          colorClass: "text-green-400",
          description:
            "You have successfully collected your Permanent Voter Card.",
        };
      case "Pending":
        return {
          text: "Pending",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-yellow-400",
          description: "Your PVC collection status is pending update.",
        };
      case "Not Collected":
      default:
        return {
          text: "Not Collected",
          icon: <Clock className="w-5 h-5 text-primary" />,
          colorClass: "text-red-400",
          description: "You have not yet collected your Permanent Voter Card.",
        };
    }
  };

  const ninDisplay = getNinStatusDisplay(user.ninStatus);
  const pvcDisplay = getPvcStatusDisplay(user.pvcStatus);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-primary">
            Welcome, {user.name}!
          </h1>
          <p className="text-muted-foreground mt-1 font-dm-sans">
            Here's a quick overview of your PVC WAKA journey and important
            actions.
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-10">
        <Card className="border-gray-400 shadow-md">
          <CardHeader className="flex flex-row  items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
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
            <CardTitle className="text-sm font-space-grotesk font-medium text-primary">
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
            <CardTitle className="text-sm font-medium text-primary">
              Registered By
            </CardTitle>
            <User className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {user.registeredBy}
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
          <Card className="border-gray-400 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-primary">
                Find INEC Centre
              </CardTitle>
              <MapPin className="w-5 h-5 text-primary" />
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
              <Pencil className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-8">
                Edit your personal details or PVC information.
              </p>
              <Link href="/dashboard/user/profile" passHref>
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

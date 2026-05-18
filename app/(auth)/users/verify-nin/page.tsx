import SetupForm from "@/components/auth/user/SetupForm";
import Logo from "@/components/ui/Logo";

export default function UserSetupPage() {
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="hero-grid absolute inset-0 z-0"></div>
      <div className="hero-bg absolute inset-0 z-0"></div>
      <div className="sm:mx-auto w-fit">
        <Logo />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 overflow-clip">
        <div className="bg-white/20 backdrop-blur-lg py-8 px-4 shadow-xl sm:rounded-lg sm:px-8 border border-green-500/20">
          <SetupForm />
        </div>
      </div>
    </div>
  );
}

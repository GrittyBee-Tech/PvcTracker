import bg from "@/public/auth-bg.png";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="flex justify-center items-center w-full md:h-screen bg-linear-to-br hero-bg"
    >
      <div
        className="w-11/12 sm:w-4/5 md:w-2/3 max-w-4xl p-6 sm:p-8 lg:p-12 bg-white rounded-lg flex flex-col"
        style={{ boxShadow: "1px 5px 14px 0px #0000001A" }}
      >
        <h1 className="text-4xl font-extrabold text-[#10200e]/80 text-center">
          PVC Waka Logo
        </h1>
        {children}
      </div>
    </div>
  );
}

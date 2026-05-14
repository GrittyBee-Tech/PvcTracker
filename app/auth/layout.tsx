import bg from "@/public/auth-bg.png";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col md:flex-row items-stretch h-[calc(100vh+280px)] sm:h-[calc(100vh+200px)] md:h-screen relative bg-[#10200e] z-10">
      <Image
        src={bg}
        loading="eager"
        alt="Background"
        className="-mt-2 -z-10 h-full md:w-1/2 xl:w-[45%] w-full"
      />
      {/* </div> */}

      <div
        className="md:right-[8%] xl:right-[12%] w-11/12 sm:w-4/5 md:w-2/3 max-w-4xl p-6 sm:p-8 lg:p-12 absolute not-md:right-1/2 not-md:translate-x-1/2 top-1/2 -translate-y-1/2 bg-white rounded-lg flex flex-col"
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

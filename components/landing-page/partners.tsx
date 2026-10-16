import React from "react";
import Image from "next/image";
const Partners = () => {
  return (
    <section
      aria-label="Our partner"
      className="border-y border-[#E5EDE7] bg-[#F3F8F4] px-6 py-8 md:py-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-5 rounded-2xl border border-[#E4ECE5] bg-white px-6 py-6 shadow-sm sm:flex-row sm:px-10">
        <div className="text-center sm:text-left">
          <p className="font-dm-sans text-xs font-bold uppercase tracking-[0.18em] text-[#64806B]">
            Our partner
          </p>
          <h2 className="mt-1 font-space-grotesk text-xl font-bold text-[#103724]">
            In partnership with
          </h2>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-[#EEF2EE] bg-[#FAFCFA] px-5 py-2">
          <Image
            src="/NYFF-logo.png"
            alt="Nigeria Youth Futures Fund"
            width={250}
            height={139}
            className="h-20 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default Partners;

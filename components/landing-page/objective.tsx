"use client";

import { OBJECTIVE_SCHEMA } from "@/utils/constants/objective";
import Link from "next/link";
import HowItWorks from "./howItWorks";

const Objective = () => {
  return (
    <section className="lg:px-20 md:py-20 py-12 px-6 border-b border-border">
      <header className="max-w-3xl mb-8 md:mb-10">
        <p className="font-dm-sans font-bold tracking-[0.14em] text-sm uppercase text-primary">
          <hr className="inline-block w-10 md:mb-1 font-space-grotesk  mb-2 md:border-[1.25px] uppercase" />{" "}
          Core Objectives
        </p>
        <h2 className="text-3xl  font-space-grotesk md:text-2xl font-extrabold text-[#0A140F] mt-2">
          Everything you need to move your PVC journey forward.
        </h2>
        <p className="font-dm-sans text-[#4B5B4F] mt-3 ">
          Whether you&apos;re checking your own progress, helping someone in
          your community, or reporting a problem, PVC WAKA gives you a clearer
          path from registration to participation.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OBJECTIVE_SCHEMA.map((item, index) => (
          <article
            key={index}
            className="relative overflow-hidden rounded-3xl border border-[#DDE6DF] bg-linear-to-b from-white to-[#F5FBF7] p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#3fbcaa]/10 blur-xl" />

            <span className="relative text-xl font-bold mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF5ED] border border-[#D4E3D7]">
              {item.slug}
            </span>

            <h3 className="relative text-xl md:text-xl font-space-grotesk h-4 text-[#0A140F] font-bold">
              {item.title}
            </h3>

            <p className="relative text-[#27362C] font-dm-sans md:mt-8 mt-4 flex-1">
              {item.description}
            </p>

            {item.btnLink && item.btntext ? (
              <Link
                href={item.btnLink}
                className="relative mt-6 inline-flex items-center justify-center rounded-lg bg-[#1A5C38] px-5 py-3 text-white font-dm-sans font-bold hover:bg-[#c9a84c] transition-colors"
              >
                {item.btntext}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
      <HowItWorks />
    </section>
  );
};

export default Objective;

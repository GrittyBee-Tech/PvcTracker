import React from "react";
import { HOWITWORKS_SCHEMA } from "@/utils/constants/objective";
import Link from "next/link";

const HowItWorks = () => {
  return (
    <section className=" md:py-20 py-12 px-6">
      <header className="max-w-3xl mb-8 md:mb-6">
        <p className="font-dm-sans font-bold tracking-[0.14em] text-sm uppercase text-primary">
          <hr className="inline-block w-10 md:mb-1 font-space-grotesk  mb-2 md:border-[1.25px] uppercase" />{" "}
          How it works
        </p>
        <h2 className="text-3xl  font-space-grotesk md:text-2xl font-extrabold text-[#0A140F] mt-2">
          Getting started is simple.
        </h2>
        <p className="font-dm-sans text-lg  mt-3 ">
          Your journey doesn&apos;t have to be confusing.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HOWITWORKS_SCHEMA.map((item, index) => (
          <article
            key={index}
            className="relative overflow-hidden rounded-3xl border border-[#DDE6DF] bg-linear-to-b from-white to-[#F5FBF7] p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <h3 className="relative text-primary text-xl md:text-sm font-space-grotesk h-4  font-bold">
              {item.title}
            </h3>
            <h3 className="relative text-xl  md:mt-6 md:text-xl font-space-grotesk h-4 text-[#0A140F] font-bold">
              {item.slug}
            </h3>
            <p className="relative text-[#27362C] font-dm-sans md:mt-4 mt-4 flex-1">
              {item.description}
            </p>
          </article>
        ))}
      </div>
      <article className="rounded-3xl border border-[#DDE3DE] bg-[#F5FBF7] p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between mt-7 gap-4">
        <div>
          <p className="font-space-grotesk text-2xl font-bold text-[#0A140F]">
            Don&apos;t just register. Be ready to vote.
          </p>
          <p className="font-dm-sans text-[#4E5E52] mt-2">
            Get the information, updates and support you need to move from
            registration to participation with confidence.
          </p>
        </div>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-dm-sans font-semibold text-white hover:bg-[#c9a84c] transition-colors"
        >
          Start My PVC Journey
        </Link>
      </article>
    </section>
  );
};

export default HowItWorks;

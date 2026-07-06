import Link from "next/link";
import React from "react";

const LandingPage = () => {
  return (
    <section className="grid md:py-20 py-5 lg:px-20 border-b border-border px-6">
      <div className="md:text-xl font-bold font-dm-sans mt-20 md:mt-30 text-primary">
        <hr className="inline-block w-10 md:mb-1.5 mb-1 md:border-[1.25px]" />{" "}
        Permanent Voter&apos;s Card Action Movement
      </div>
      <h1 className="md:text-7xl font-extrabold md:w-11/12 mt-2 font-space-grotesk text-[#0A140F] leading-tight">
        Empowering Voters, Strengthening Democracy.
      </h1>
      <h5 className="text-md font-dm-sans font-bold text-[#0A140F] mt-3">
        Join the Movement for Electoral Reform
      </h5>
      <p className="text-md text-[#0A140F] font-dm-sans md:w-7/12 mt-3 leading-8">
        Millions of eligible Nigerian voters remain unregistered or have
        uncollected PVCs due to low awareness, difficulty locating INEC centres,
        and fragmented grassroots mobilisation efforts.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-dm-sans font-bold hover:bg-[#c9a84c] transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center justify-center rounded-lg border border-[#BFD2C2] px-6 py-3 text-[#1A5C38] font-dm-sans font-bold hover:bg-white transition-colors"
        >
          Learn More
        </Link>
        <Link
          href="/partner"
          className="inline-flex items-center justify-center rounded-lg border border-[#1A5C38] px-6 py-3 text-[#1A5C38] font-dm-sans font-bold hover:bg-[#1A5C38] hover:text-white transition-colors"
        >
          Partner with us
        </Link>
      </div>
      <div className="mt-10 grid lg:grid-cols-5 gap-5">
        <article className="lg:col-span-3 rounded-2xl bg-white border border-[#DCE6DE] p-6 md:p-8">
          <h2 className="font-space-grotesk text-2xl font-bold text-[#0A140F]">
            Why This Matters Now
          </h2>
          <p className="font-dm-sans text-[#233226] mt-3 leading-8">
            Youth participation is central to credible elections, yet many
            first-time voters still struggle with process clarity, logistics,
            and timely support. PVC WAKA bridges this gap with digital tools,
            grassroots mobilization, and coordinated assistance that makes civic
            participation easier and more inclusive.
          </p>
        </article>
        <article className="lg:col-span-2 rounded-2xl bg-[#103724] border border-[#1A5C38] p-6 md:p-8 text-white">
          <p className="font-space-grotesk text-xl font-bold">
            Ready to take action?
          </p>
          <p className="font-dm-sans text-[#DCF1E3] mt-3 leading-8">
            Create an account, track your PVC progress, and get trusted support
            when you need help completing any registration step.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex mt-4 rounded-lg bg-white text-[#103724] px-5 py-2.5 font-dm-sans font-bold hover:bg-[#c9a84c] hover:text-white transition-colors"
          >
            Create Account
          </Link>
        </article>
      </div>
    </section>
  );
};

export default LandingPage;

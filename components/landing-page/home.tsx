import Link from "next/link";
import React from "react";

const LandingPage = () => {
  return (
    <section className="grid md:py-20 py-5 lg:px-20 border-b border-border px-6">
      <div className="md:text-sm text-xl font-bold  mt-10 md:mt-4 text-primary uppercase">
        <hr className="inline-block w-10 md:mb-1 font-space-grotesk  mb-1 md:border-[1.25px] uppercase" />{" "}
        Permanent Voter&apos;s Card Action Movement
      </div>
      <h1 className="md:text-7xl font-space-grotesk text-2xl font-extrabold md:w-7/12 md:mt-5 mt-3  text-[#0A140F] ">
        Your PVC, Your voice. Your next step.
      </h1>
      <p className="text-lg text-[#0A140F] font-dm-sans md:w-6/12 md:mt-6 mt-3 ">
        Your voter journey shouldn't end after registration. PVC WAKA helps you
        track your PVC progress, find the right INEC centre, get reliable
        information, and know what to do when something goes wrong.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-7">
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white  font-bold hover:bg-[#c9a84c] transition-colors"
        >
          Start Your PVC Journey
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
          <h2 className=" text-3xl font-bold font-space-grotesk text-[#0A140F]">
            Registered is not the same as ready.
          </h2>
          <p className="font-dm-sans text-[#233226] mt-3 ">
            Registering to vote is only the beginning. For many Nigerians, the
            journey continues with unanswered questions: Where do I collect my
            PVC? Is it ready? What happens when there is a delay? Who can I ask
            for help?
          </p>
          <p className="mt-10 font-bold text-[#103724]">
            PVC WAKA exists to help you find those answers.
          </p>
        </article>
        <article className="lg:col-span-2 rounded-2xl bg-[#103724] border border-[#1A5C38] p-6 md:p-8 text-white">
          <p className="text-2xl md:w-9/12 font-bold font-space-grotesk">
            Don't get stuck after registration.
          </p>
          <p className="font-dm-sans text-[#DCF1E3] mt-3 leading-8">
            Track your journey, find relevant INEC centres, stay informed and
            get support when you need it.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex md:mt-10 mt-4 rounded-lg bg-white text-[#103724] px-5 py-2.5 font-dm-sans font-bold hover:bg-[#c9a84c] hover:text-white transition-colors"
          >
            Start Tracking
          </Link>
        </article>
      </div>
    </section>
  );
};

export default LandingPage;

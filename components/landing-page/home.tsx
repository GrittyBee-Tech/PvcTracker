import Link from "next/link";
import React from "react";

const impactHighlights = [
  {
    label: "Communities reached",
    value: "500K+",
  },
  {
    label: "States activated",
    value: "8",
  },
  {
    label: "Ambassadors target",
    value: "500",
  },
  {
    label: "2027 mobilisation goal",
    value: "1M+",
  },
];

const processSteps = [
  {
    title: "Find Verified Support",
    description:
      "Locate trusted volunteers and guidance channels close to your community.",
  },
  {
    title: "Complete PVC Tasks",
    description:
      "Get help with registration, transfer, detail correction, and replacement quickly.",
  },
  {
    title: "Track Progress",
    description:
      "Monitor your requests and receive updates so nothing falls through the cracks.",
  },
];

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
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactHighlights.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[#DCE6DE] bg-white/90 px-5 py-4"
          >
            <p className="font-space-grotesk text-3xl font-extrabold text-primary">
              {item.value}
            </p>
            <p className="font-dm-sans text-sm text-[#4D5D51] mt-1">
              {item.label}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-[#DCE6DE] bg-linear-to-r from-[#F5FBF7] via-[#F7FCF9] to-[#EEF7F1] p-6 md:p-8">
        <h2 className="font-space-grotesk text-2xl md:text-3xl font-bold text-[#0A140F]">
          How PVC WAKA Works
        </h2>
        <p className="font-dm-sans text-[#3F4E43] mt-2 leading-7 md:w-8/12">
          From registration support to issue escalation, we provide a practical,
          community-first path to help every eligible voter complete their PVC
          journey.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {processSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl bg-white border border-[#E2EAE3] p-5"
            >
              <p className="font-space-grotesk text-xl font-bold text-[#1A5C38]">
                0{index + 1}
              </p>
              <h3 className="font-space-grotesk text-lg font-bold text-[#0A140F] mt-2">
                {step.title}
              </h3>
              <p className="font-dm-sans text-sm text-[#4D5D51] mt-2 leading-7">
                {step.description}
              </p>
            </article>
          ))}
        </div>
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

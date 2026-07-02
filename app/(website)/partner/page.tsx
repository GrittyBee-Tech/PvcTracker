import Link from "next/link";

const partnershipModels = [
  {
    title: "Program Sponsorship",
    description:
      "Fund civic education drives, field support, and targeted registration outreach in underserved communities.",
  },
  {
    title: "Technology Partnership",
    description:
      "Contribute tools, engineering support, or product collaborations that improve voter access and verification workflows.",
  },
  {
    title: "Community Activation",
    description:
      "Co-host town halls, campus campaigns, and local mobilization events with our volunteer network.",
  },
  {
    title: "Knowledge & Training",
    description:
      "Provide experts, curriculum support, or content partnerships for voter education and digital literacy.",
  },
];

const supportAreas = [
  "Voter awareness campaigns",
  "PVC registration and collection guidance",
  "Volunteer capacity building",
  "Data and insights for outreach planning",
  "Digital tools for citizen access",
  "Grassroots logistics support",
];

export default function Partner() {
  return (
    <main className="py-12 md:py-20 md:pt-40">
      <section className="lg:px-20 px-6 mx-auto">
        <p className="md:text-xl font-bold font-dm-sans text-primary">
          <hr className="inline-block w-10 md:mb-1.5 mb-1 md:border-[1.25px]" />{" "}
          Partnership Hub
        </p>

        <h1 className="mt-3 md:text-6xl text-3xl font-extrabold font-space-grotesk text-[#0A140F] md:w-10/12 leading-tight">
          Partner with PVC WAKA to strengthen voter participation at scale.
        </h1>

        <p className="mt-5 text-[#233226] font-dm-sans text-base md:text-lg leading-8 md:w-8/12">
          We collaborate with institutions, companies, civil society groups, and
          development partners to remove barriers to voter registration and
          civic participation. Together, we can deliver trusted information,
          practical support, and measurable community impact.
        </p>
      </section>

      <section className="max-w-6xl mx-auto mt-6">
        <div className="max-w-3xl"></div>
      </section>

      <section className="md:px-20 mx-auto mt-16">
        <div className="rounded-2xl border border-[#1A5C38]/15 bg-[#F4FAF6] p-6 md:p-8">
          <p className="text-sm font-dm-sans font-bold tracking-[0.2em] text-primary uppercase">
            Focus Areas
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-space-grotesk font-bold text-[#0A140F]">
            What your support can power
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {supportAreas.map((area) => (
              <div
                key={area}
                className="rounded-xl border border-[#CFE1D2] bg-white px-4 py-3 font-dm-sans text-[#1D3327] font-medium"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="md:px-20 mx-auto mt-16 mb-6">
        <div className="rounded-2xl bg-[#103724] p-8 md:p-10 text-white">
          <h2 className="font-space-grotesk text-3xl md:text-4xl font-bold leading-tight md:w-8/12">
            Ready to co-create high-impact civic participation programs?
          </h2>
          <p className="mt-4 font-dm-sans text-[#DCF1E3] md:w-8/12 leading-7">
            Let&apos;s build a partnership plan with clear outcomes, practical
            implementation support, and transparent reporting.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-white text-[#103724] px-6 py-3 font-dm-sans font-bold hover:bg-[#c9a84c] hover:text-white transition-colors"
            >
              Contact Partnership Team
            </Link>
            <Link
              href="mailto:partnerships@pvcwaka.org"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 font-dm-sans font-bold text-white hover:bg-white/10 transition-colors"
            >
              partnerships@pvcwaka.org
            </Link>
          </div>

          <div className="mt-10 grid lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
              <p className="text-xl font-space-grotesk font-bold">Wema Bank</p>
              <p className="mt-3 font-dm-sans text-[#DCF1E3]">
                Account Name:{" "}
                <span className="font-bold">ABENOL Foundation LTD/GTE</span>
              </p>
              <p className="mt-3 font-dm-sans text-[#DCF1E3]">
                Account Number (NGN):{" "}
                <span className="font-bold text-white">0125016610</span>
              </p>
              <p className="mt-2 font-dm-sans text-[#DCF1E3]">
                Account Number (USD):{" "}
                <span className="font-bold text-white">0621392779</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
              <p className="text-xl font-space-grotesk font-bold">Union Bank</p>
              <p className="mt-3 font-dm-sans text-[#DCF1E3]">
                Account Name:{" "}
                <span className="font-bold">ABENOL Foundation LTD/GTE</span>
              </p>
              <p className="mt-3 font-dm-sans text-[#DCF1E3]">
                Account Number (NGN):{" "}
                <span className="font-bold text-white">0203588698</span>
              </p>
              <p className="mt-2 font-dm-sans text-[#DCF1E3]">
                Account Number (USD):{" "}
                <span className="font-bold text-white">0203744430</span>
              </p>
              <p className="mt-2 font-dm-sans text-[#DCF1E3]">
                Account Number (GBP):{" "}
                <span className="font-bold text-white">0203745097</span>
              </p>
              <p className="mt-2 font-dm-sans text-[#DCF1E3]">
                Account Number (EUR):{" "}
                <span className="font-bold text-white">0203745932</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
              <p className="text-xl font-space-grotesk font-bold">
                Flutterwave
              </p>
              <p className="mt-3 font-dm-sans text-[#DCF1E3]">Donation Link</p>
              <a
                className="mt-2 inline-block underline font-bold text-white"
                href="https://bit.ly/donatetoABENOL"
                target="_blank"
                rel="noopener noreferrer"
              >
                bit.ly/donatetoABENOL
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

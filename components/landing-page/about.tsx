import Link from "next/link";

const impactStats = [
  {
    label: "Young Nigerians supported",
    value: "500,000+",
  },
  {
    label: "States reached in 2022",
    value: "8",
  },
  {
    label: "Waka Ambassadors target",
    value: "500",
  },
  {
    label: "People to mobilize",
    value: "1M+",
  },
];

const platformSupport = [
  "New voter registration",
  "Transfer of voter registration",
  "Correction of personal details",
  "Replacement of lost or damaged PVCs",
];

const About = () => {
  return (
    <section className="px-6 lg:px-20 pt-36 pb-20">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="relative overflow-hidden rounded-3xl border border-[#DDE3DE] bg-linear-to-br from-[#E9F7EE] via-[#F5FBF7] to-[#EEF8F0] p-8 md:p-12">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#3fbcaa]/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#1A5C38]/10 blur-2xl" />

          <div className="relative max-w-3xl space-y-4">
            <p className="font-dm-sans font-bold tracking-[0.2em] text-xs text-primary uppercase">
              About PVC Waka
            </p>
            <h1 className="font-space-grotesk text-3xl md:text-5xl font-extrabold text-[#0A140F] leading-tight">
              Youth-powered civic action for stronger voter participation.
            </h1>
            <p className="font-dm-sans text-[#33463A] text-base md:text-lg leading-8">
              PVC WAKA is a youth-led civic engagement initiative helping
              first-time and historically disengaged voters navigate voter
              registration and participation across Nigeria
            </p>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {impactStats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[#DDE3DE] bg-white  p-5 shadow-sm"
            >
              <p className="font-space-grotesk text-3xl font-extrabold text-primary">
                {item.value}
              </p>
              <p className="font-dm-sans text-sm text-[#5C675D] mt-2">
                {item.label}
              </p>
            </article>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <article className="lg:col-span-3 rounded-3xl border border-[#DDE3DE] bg-white p-7 md:p-9 shadow-sm">
            <h2 className="font-space-grotesk text-2xl md:text-3xl font-bold text-[#0A140F] mb-4">
              Project Overview
            </h2>
            <p className="font-dm-sans text-[#1E2C22] leading-8">
              Since 2021, PVC WAKA has supported more than 500,000 young people
              online and offline to navigate Continuous Voter Registration (CVR)
              ahead of the 2023 general elections. For the 2027 electoral cycle,
              we are executing a focused, low-cost pilot that reaches
              hard-to-reach communities through structured outreach, student-led
              peer mobilization, and direct coordination with electoral
              stakeholders.
            </p>
          </article>

          <article className="lg:col-span-2 rounded-3xl border border-[#DDE3DE] bg-[#0F2F1E] p-7 md:p-9 text-white shadow-sm">
            <p className="font-space-grotesk text-xl font-bold mb-3">
              The Goal
            </p>
            <p className="font-dm-sans leading-8 text-[#E7F5EC]">
              Mobilize at least 500 Waka Ambassadors and reach over 1 million
              people through digital and physical advocacy campaigns, scaling
              momentum from our 2022 work across 8 states.
            </p>
          </article>
        </div>

        <article className="rounded-3xl border border-[#DDE3DE] bg-white p-7 md:p-9 shadow-sm">
          <h2 className="font-space-grotesk text-2xl md:text-3xl font-bold text-[#0A140F] mb-3">
            About the Platform
          </h2>
          <p className="font-dm-sans text-[#1E2C22] leading-8 mb-6">
            PVC Collection tracker is a civic-tech web application designed to
            increase Permanent Voter Card registration and collection rates
            across Nigeria. The platform supports users with:
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {platformSupport.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-[#F5FBF7] border border-[#E3ECE5] px-4 py-3 font-dm-sans text-[#213226]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#DDE3DE] bg-[#F5FBF7] p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-space-grotesk text-2xl font-bold text-[#0A140F]">
              Join the movement for electoral inclusion
            </p>
            <p className="font-dm-sans text-[#4E5E52] mt-2">
              Register, volunteer, or report issues in your community.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-dm-sans font-semibold text-white hover:bg-[#c9a84c] transition-colors"
          >
            Get Started
          </Link>
        </article>
      </div>
    </section>
  );
};

export default About;

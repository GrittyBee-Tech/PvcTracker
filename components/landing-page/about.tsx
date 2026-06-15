

const About = () => {
  return (
    <section className="py-20 pt-40 px-6 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white  border border-gray-200 rounded-3xl shadow-xl p-8 md:p-12">
          <div className="space-y-8 text-slate-900">
            <div>
              <div className="grid grid-flow-col w-max items-center mb-3">
                <p className="text-2xl  font-space-grotesk font-bold uppercase text-[#0A140F] mb-3">
                  Project Overview
                </p>
                <span>
                  {" "}
                  {/* <FaBowlingBall className="text-2xl text-[#c9a84c]" /> */}
                </span>
              </div>
              <p className="text-md font-dm-sans text-[#0A140F] leading-8">
                PVC WAKA is a youth-led civic engagement initiative focused on
                increasing voter registration and participation among young
                Nigerians, especially first-time and historically disengaged
                voters. Since 2021, PVC WAKA has supported over 500,000 young
                people online and offline to navigate Continuous Voter
                Registration (CVR) processes ahead of the 2023 general
                elections. For the 2027 electoral cycle, this project proposes a
                focused, low-cost pilot designed to reach offline and
                hard-to-reach youth populations through structured community
                outreach, student-led peer mobilization, and direct coordination
                with electoral stakeholders.
              </p>
            </div>

            <div>
              <p className="text-xl font-space-grotesk font-bold uppercase text-[#0A140F] mb-3">
                The Goal
              </p>
              <p className="text-md font-dm-sans text-[#0A140F] leading-8">
                To mobilize at least 500 &quot;Waka Ambassadors&quot; and reach over 1
                million people through digital and physical advocacy campaigns.
                This is double what we achieved in 2022, when we helped over 1
                million Nigerians with their CVR (Continuous Voter Registration)
                and Permanent Voter Card across 8 states in Nigeria.
              </p>
            </div>

            <div>
              <p className="text-md font-space-grotesk font-bold uppercase text-[#0A140F] mb-3">
                About the Platform
              </p>
              <p className="text-lg  font-dm-sans text-[#0A140F]  leading-8 mb-5">
                PVC WAKA is a civic-tech web application designed to increase
                Permanent Voter Card (PVC) registration and collection rates
                across Nigeria. The platform aids with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-md font-dm-sans leading-8">
                <li>New voter registration</li>
                <li>Transfer of voter registration</li>
                <li>Correction of personal details</li>
                <li>Replacement of lost or damaged PVCs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

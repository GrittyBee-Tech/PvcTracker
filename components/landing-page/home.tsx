import React from "react";

const LandingPage = () => {
  return (
    <section className="grid py-20 lg:px-20 border-b border-border px-6">
      <p className="md:text-xl font-bold font-dm-sans mt-20 md:mt-30 text-primary">
        <hr className="inline-block w-10 mb-1.5 border-[1.25px]" />{" "}
        Permanent Voter's Card Action Movement
      </p>
      <h1 className="md:text-7xl font-extrabold md:w-11/12 mt-2  font-space-grotesk  text-[#0A140F]">
        Empowering <span className="">Voters</span>, Strengthening Democracy.
      </h1>
      <h5 className="text-md font-dm-sans font-bold text-[#0A140F] mt-3">
        Join the Movement for Electoral Reform
      </h5>
      <p className="text-md  text-[#0A140F] font-dm-sans md:w-7/12 mt-3">
        Millions of eligible Nigerian voters remain unregistered or have
        uncollected PVCs due to lack of awareness, difficulty locating INEC
        centres, and fragmented grassroots mobilisation efforts.
      </p>
    </section>
  );
};

export default LandingPage;

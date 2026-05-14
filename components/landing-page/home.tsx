import React from "react";

const LandingPage = () => {
  return (
    <section className="grid  py-20 lg:px-20">
      <h1 className=" text-xl font-bold text-[#3fbcaa]">
        Permanent Voter's Card Action Movement
      </h1>
      <h2 className="text-6xl font-bold w-8/12 mt-2 text-gray-300">
        Empowering Voters, Strengthening Democracy
      </h2>
      <h5 className="text-md text-gray-400 mt-2">
        Join the Movement for Electoral Reform
      </h5>
      <p className="text-md text-gray-400 md:w-1/2 mt-3">
        Millions of eligible Nigerian voters remain unregistered or have
        uncollected PVCs due to lack of awareness, difficulty locating INEC
        centres, and fragmented grassroots mobilisation efforts. No single
        digital platform currently addresses all three gaps simultaneously with
        an identity-verified, trackable system.
      </p>
    </section>
  );
};

export default LandingPage;

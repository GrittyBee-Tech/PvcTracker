import React from "react";

const LandingPage = () => {
  return (
    <section className="grid  py-16 lg:px-20 px-6">
      <h1 className=" md:text-xl font-bold font-playfair-display  mt-20 md:mt-30 text-[#3fbcaa]">
        <hr className="border-t border-[#3fbcaa] inline-block w-10 mb-1.5" />{" "}
        Permanent Voter's Card Action Movement
      </h1>
      <h2 className="md:text-6xl font-bold md:w-8/12 mt-2 font-playfair-display  text-gray-300">
        Empowering <span className="text-[#c9a84c]">Voters</span>, Strengthening
        Democracy
      </h2>
      <h5 className="text-md text-gray-400 mt-3">
        Join the Movement for Electoral Reform
      </h5>
      <p className="text-md text-gray-400 md:w-7/12 mt-3">
        Millions of eligible Nigerian voters remain unregistered or have
        uncollected PVCs due to lack of awareness, difficulty locating INEC
        centres, and fragmented grassroots mobilisation efforts.
      </p>
    </section>
  );
};

export default LandingPage;

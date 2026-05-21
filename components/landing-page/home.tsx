import React from "react";

const LandingPage = () => {
  return (
    <section className="grid py-20 lg:px-20 border-b border-b-gray-200 px-6">
      <h1 className=" md:text-xl font-bold font-dm-sans   mt-20 md:mt-30 text-black">
        <hr className="border-t border-black inline-block text-[#0A140F] w-10 mb-1.5" />{" "}
        Permanent Voter's Card Action Movement
      </h1>
      <h2 className="md:text-7xl font-extrabold md:w-11/12 mt-2  font-space-grotesk  text-[#0A140F]">
        Empowering <span className="">Voters</span>, Strengthening Democracy.
      </h2>
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

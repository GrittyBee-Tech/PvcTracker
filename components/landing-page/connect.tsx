import React from "react";

const Connect = () => {
  return (
    <section className="py-20 lg:px-20  px-6 text-center border-b border-border">
      <h2 className="md:text-3xl font-bold mb-4 font-space-grotesk  ">
        <hr className="border-t border-[#4B6F52]  font-space-grotesk  inline-block w-10 mb-2" />
        A civic platform built by ABENOL Foundation.
      </h2>
      <p className="mt-4 text-[#0A140F] md:w-7/12 md:mt-5 md:mb-10  md:mx-auto font-bold font-dm-sans mb-6">
        PVC WAKA was created by ABENOL Foundation to help address the
        information and support gaps that can make the voter journey
        unnecessarily difficult. We believe access to clear, reliable
        information should never be a barrier to civic participation.
      </p>
      <a
        className=" bg-[#4B6F52] px-7 py-4  font-bold rounded-xl text-white  hover:bg-[#a58a3a]"
        href="https://www.abenolfoundation.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn About ABENOL Foundation
      </a>
    </section>
  );
};

export default Connect;

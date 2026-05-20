import React from "react";

const Connect = () => {
  return (
    <section className="py-20 lg:px-20 text-white px-6 text-center">
      <h2 className="md:text-3xl font-bold mb-4 font-space-grotesk text-[#3fbcaa]">
        <hr className="border-t border-[#3fbcaa] font-space-grotesk  inline-block w-10 mb-2" />
        Connect with ABENOL Foundation
      </h2>
      <p className="mt-4 text-black font-dm-sans mb-6">
        To learn more about ABENOL Foundation and our other initiatives, please
        visit our official website:
      </p>
      <a
        className=" bg-[#3fbcaa]  px-7 py-4 font-bold rounded-xl text-white  hover:bg-[#a58a3a]"
        href="https://www.abenolfoundation.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit ABENOL Foundation Website
      </a>
    </section>
  );
};

export default Connect;

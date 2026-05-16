import React from "react";

const Connect = () => {
  return (
    <section className="py-20 lg:px-20 text-white px-6 text-center">
      <h2 className="md:text-3xl font-bold mb-4 font-playfair-display text-[#3fbcaa]">
        <hr className="border-t border-[#3fbcaa] inline-block w-10 mb-2" />
        Connect with ABENOL Foundation
      </h2>
      <p className="mt-4 mb-6">
        To learn more about ABENOL Foundation and our other initiatives, please
        visit our official website:
      </p>
      <a
        className=" bg-[#c9a84c]  px-7 py-4 font-bold rounded-xl text-white  hover:bg-[#a58a3a]"
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

"use client";

import { useEffect, useState } from "react";
import { IoFootstepsSharp } from "react-icons/io5";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scrolling effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`grid grid-flow-col lg:px-20 border-b border-b-[#ffffff] bg-[#10200e] items-center justify-between p-6 fixed top-0 w-full ${
        isScrolled ? "backdrop-blur-sm shadow-2xl" : ""
      }`}
    >
      <div className=" grid grid-flow-col   gap-2 text-2xl text-[#7ec992] font-bold">
        <h1 className="text-3xl">PVC WAKA</h1>
        <IoFootstepsSharp className=" text-4xl" />
      </div>

      <div className="  hidden md:grid grid-flow-col items-center  gap-10 text-lg">
        <a href="#about" className="hover:underline text-white font-bold  ">
          About
        </a>
        <a href="#contact" className="hover:underline text-white font-bold ">
          Contact
        </a>
        <a
          href="/users"
          className="border-[#c9a84c] hover:bg-[#c9a84c] hover:text-white cursor-pointer border px-10 text-white font-bold py-3 rounded-lg"
        >
          Get Started
        </a>
      </div>
    </nav>
  );
};

export default Navbar;

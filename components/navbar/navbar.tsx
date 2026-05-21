"use client";

import { useEffect, useState } from "react";
import { IoFootstepsSharp } from "react-icons/io5";
import Logo from "../ui/Logo";

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
    <>
      <nav
        className={`hidden md:grid grid-flow-col lg:px-20 border-b border-b-[#ffffff] bg-[#F9FDFA] items-center justify-between py-3 fixed top-0 w-full ${
          isScrolled ? "backdrop-blur-sm shadow-primary/40" : ""
        }`}
      >
        <Logo />

        <div className="  hidden md:grid grid-flow-col items-center  gap-10 text-lg">
          <a
            href="/about"
            className="hover:underline font-dm-sans text-[#5C675D] font-bold  "
          >
            About
          </a>
          <a
            href="/contact"
            className="hover:underline font-dm-sans text-[#5C675D] font-bold "
          >
            Contact
          </a>
          <a
            href="/users/auth"
            className="border-[#DDE3DE] bg-[#4B6F52] font-dm-sans text-[white] hover:bg-[#c9a84c] hover:text-white cursor-pointer border px-10  font-bold py-2 rounded-lg"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Navbar mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg shadow-primary/40 shadow border-t border-t-[#10200e] z-50">
        <div className="flex justify-between items-center w-full px-8 py-3">
          <Logo />

          <a
            href="/about"
            className="hover:underline text-white font-bold text-lg"
          >
            About
          </a>
          <a
            href="/contact"
            className="hover:underline text-white font-bold text-lg"
          >
            Contact
          </a>
          <a
            href="/users/auth"
            className="border-[#DDE3DE]  hover:text-white cursor-pointer border px-6 py-1.5 text-white font-bold rounded-lg"
          >
            Get Started
          </a>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

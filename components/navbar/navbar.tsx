"use client";

import { useEffect, useState } from "react";
import { IoFootstepsSharp } from "react-icons/io5";
import Logo from "../ui/Logo";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleMoblileMenuToggle = () => {
    setShowMobileMenu((prev) => !prev);
  };

  return (
    <>
      <nav
        className={` grid grid-flow-col p-6 lg:px-20 border-b border-border bg-[#F9FDFA] items-center justify-between py-3 fixed top-0 w-full ${
          isScrolled ? "backdrop-blur-sm" : ""
        }`}
      >
        <Logo />

        <div className=" grid grid-flow-col ">
          <div className="hidden md:grid grid-flow-col items-center  gap-10 text-lg">
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
              href="/auth/register"
              className="border-[#DDE3DE] bg-primary font-dm-sans text-[white] hover:bg-[#c9a84c] hover:text-white cursor-pointer border px-10  font-bold py-2 rounded-lg"
            >
              Get Started
            </a>
          </div>

          <GiHamburgerMenu
            onClick={handleMoblileMenuToggle}
            className="md:hidden text-lg  text-[#5C675D]"
          />
        </div>
      </nav>

      {/* Navbar mobile */}
      {showMobileMenu && (
        <nav className="fixed h-screen  bg-primary backdrop-blur-lg border-t border-t-primary z-50">
          <div className="grid grid-flow-row items-center w-full px-5 py-3">
            <Logo />

            <a
              href="/about"
              className="hover:underline text-white  mt-4 font-bold"
            >
              About
            </a>
            <a
              href="/contact"
              className="hover:underline text-white mt-4 font-bold "
            >
              Contact
            </a>
            <a
              href="/auth/register"
              className="text-white bg-primary cursor-pointer mt-5 border px-4 py-1.5 font-semibold rounded-lg"
            >
              Get Started
            </a>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;

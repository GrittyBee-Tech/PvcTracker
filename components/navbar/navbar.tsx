import React from "react";
import { AiOutlineBaidu } from "react-icons/ai";
import { GiVote } from "react-icons/gi";
import { IoFootstepsSharp } from "react-icons/io5";

const Navbar = () => {
  return (
    <nav className=" grid grid-flow-col lg:px-20 border-b  border-b-[#ffffff]  items-center justify-between p-6 shadow-2xl">
      <div className=" grid grid-flow-col   gap-2 text-2xl text-[#7ec992] font-bold">
        <h1 className="text-3xl">PVC WAKA</h1>
        <IoFootstepsSharp className=" text-4xl" />
      </div>

      <div className="grid grid-flow-col items-center  gap-10 text-lg">
        <a href="#about" className="hover:underline text-white font-bold  ">
          About
        </a>
        <a href="#contact" className="hover:underline text-white font-bold ">
          Contact
        </a>
        <button className="border-[#c9a84c] cursor-pointer border px-10 text-white font-bold py-3 rounded-lg">
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

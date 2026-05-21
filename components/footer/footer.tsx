import React from "react";
import { IoFootstepsSharp } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="grid md:grid-flow-col lg:px-20 items-center justify-between p-6 shadow-2xl">
      <div className=" grid grid-flow-col gap-2 text-2xl text-black  font-bold">
        <h1 className="text-2xl">PVC WAKA</h1>
        <IoFootstepsSharp className=" text-4xl" />
      </div>

      <div className="grid md:grid-flow-col items-center  gap-10 text-lg">
        <p className="text-black font-dm-sans text-sm">
          © 2026 PVC Waka All Right Reserved-{" "}
          <a
            className="text-black font-bold"
            href="https://www.abenolfoundation.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            abenolfoundation.org
          </a>{" "}
        </p>
        {/* <div className=" text-[#7ec992]  font-dm-sans">
          <p className="text-black  text-sm font-dm-sans">
            CRAFTED BY <span className="text-black">--FIIWE BARRY</span>
          </p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;

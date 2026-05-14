import { OBJECTIVE_SCHEMA } from "@/utils/constants/objective";
import React from "react";

const Objective = () => {
  return (
    <div className=" lg:px-20 py-20  px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OBJECTIVE_SCHEMA.map((item, index) => (
          <div
            key={index}
            className="bg-[#1a3321b3] shadow-2xl rounded-lg  p-6 mb-6"
          >
            <span className="text-4xl text-white mb-4 grid justify-center">
              <item.icon />
            </span>
            <h2 className="text-2xl text-[#c9a84c] text-center mt-3  w-11/12 mx-auto font-bold mb-4">
              {item.title}
            </h2>
            <p className="text-white  text-center h-50">{item.description}</p>

            <button className="bg-[#c9a84c] grid  justify-center w-60 hover:bg-[#a58a3a] mx-auto text-white font-bold py-2 px-4 rounded-lg mt-4">
              {item.btntext}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Objective;

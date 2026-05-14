"use client";

import { FAQ_SCHEMA } from "@/utils/constants/faq";
import { useState } from "react";
import React from "react";
import { BsFillNodePlusFill, BsFillNodeMinusFill } from "react-icons/bs";

const Faq = () => {
  const [showFaq, setShowFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setShowFaq((prevId) => (prevId === id ? null : id));
  };
  return (
    <section className=" pt-2 pb-12 px-4 sm:px-6 lg:px-20 py-10 lg:pt-3">
      <div className="grid justify-items-center ">
        <p className="text-2xl mx-auto md:text-4xl font-bold  bg-clip-text text-[#3fbcaa] mb-6">
          Frequently asked questions
        </p>
        <div className="grid w-full  gap-3 ">
          {FAQ_SCHEMA.map((schema) => {
            const { id, question, answer, slot1, slot2, slot3 } = schema;
            return (
              <div key={id} className=" grid  p-4">
                <div className="grid grid-flow-col justify-between">
                  <p className="text-md  md:text-xl  bg-clip-text  font-bold text-white mb-2">
                    {question}
                  </p>
                  <span onClick={() => toggleFaq(id)}>
                    {showFaq === id ? (
                      <BsFillNodePlusFill className="text-white" />
                    ) : (
                      <BsFillNodeMinusFill className="text-white" />
                    )}
                  </span>
                </div>
                {showFaq === id && (
                  <div>
                    <p className="text-white opacity-100 ">{answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;

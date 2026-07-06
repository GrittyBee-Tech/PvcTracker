"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FAQ_SCHEMA } from "@/utils/constants/faq";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const Faq = () => {
  const [showFaq, setShowFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setShowFaq((prevId) => (prevId === id ? null : id));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="pt-10 pb-12 px-4 sm:px-6 lg:px-20 py-20 lg:pt-3"
    >
      <div className="grid justify-items-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl lg:mt-20 mx-auto md:text-4xl font-bold font-space-grotesk bg-clip-text text-[#4B6F52] mb-6"
        >
          Frequently asked questions
        </motion.p>
        <div className="grid w-full mt-3 lg:px-60 gap-3">
          {FAQ_SCHEMA.map((schema, index) => {
            const { id, question, answer } = schema;
            return (
              <motion.div
                key={id}
                onClick={() => toggleFaq(id)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="grid mt-4 cursor-pointer border border-[#DDE3DE] rounded-2xl p-4 md:p-6 bg-white shadow-sm "
              >
                <div className="grid grid-flow-col justify-between">
                  <p className="text-md font-space-grotesk md:text-xl bg-clip-text font-bold text-[#0A140F] ">
                    {question}
                  </p>
                  <motion.span
                    animate={{ rotate: showFaq === id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showFaq === id ? (
                      <Minus className="text-[#0A140F]" />
                    ) : (
                      <Plus className="text-[#0A140F]" />
                    )}
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {showFaq === id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#0A140F] font-dm-sans opacity-100  mt-2 pb-1">
                        {answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default Faq;

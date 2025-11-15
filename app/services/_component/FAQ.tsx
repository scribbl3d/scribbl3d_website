"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is the net weight of your filament ?",
    answer: "The net weight of filament is 1 kg and Gross weight 1.44 kgs",
  },
  {
    question: "Do you customise products ?",
    answer:
      "Yes, we offer customization services for our products. Please contact our sales team for more information.",
  },
  {
    question: "Do you print in thermoplastics like PA, ABS & PC ?",
    answer:
      "Yes, we print in various thermoplastics including PA (Nylon), ABS, and PC (Polycarbonate).",
  },
  {
    question: "Is your filament's winding automated or manual ?",
    answer:
      "Our filament winding process is fully automated to ensure consistent quality and tension.",
  },
  {
    question: "Can you provide for bulk orders ?",
    answer:
      "Yes, we can accommodate bulk orders. Please contact our sales team for more information.",
  },
  {
    question: "What is the diameter of the filament ?",
    answer:
      "Our standard filament diameter is 1.75mm, but we also offer 2.85mm upon request.",
  },
];

export default function Component() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    setOpenIndexes((prevIndexes) => {
      if (prevIndexes.includes(index)) {
        return prevIndexes.filter((i) => i !== index);
      } else {
        if (prevIndexes.length >= 3) {
          return [...prevIndexes.slice(1), index];
        } else {
          return [...prevIndexes, index];
        }
      }
    });
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(
            circle 400px at center left,
            rgba(34, 197, 94, 0.3),
            rgba(34, 197, 94, 0.1) 60%,
            transparent 80%
          )`,
        }}
      />

      <div className="text-white py-8 md:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
            FAQs
          </h2>
          <div className="h-[500px] md:h-[600px] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-700 pb-4">
                <button
                  className="flex justify-between items-center w-full text-left focus:outline-none group p-4 rounded-lg hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={openIndexes.includes(index)}
                >
                  <span className="text-base md:text-xl font-semibold pr-8">
                    {faq.question}
                  </span>
                  <span className="text-gray-400 transition-transform duration-300 group-hover:text-white">
                    {openIndexes.includes(index) ? (
                      <Minus className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Plus className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndexes.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden px-4"
                    >
                      <p className="text-gray-400 pt-2 text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Plus } from "lucide-react";

const successStoriesData = [
  {
    name: "How do I sign up for Place Mentor?",
    message:
      "Click on Sign Up, use Google or email, verify OTP, and start your preparation journey instantly.",
  },
  {
    name: "How can I change my profile name?",
    message:
      "Go to profile settings and update your name from the edit section.",
  },
  {
    name: "Is my profile information private?",
    message:
      "Yes, your data is secure and controlled by your privacy settings.",
  },
  {
    name: "Can I share my profile with recruiters?",
    message:
      "Yes, you can generate a shareable profile link from your dashboard.",
  },
  {
    name: "What is POTD in Place Mentor?",
    message:
      "POTD (Problem of the Day) helps you practice coding daily and maintain consistency with streaks.",
  },
  {
    name: "Does Place Mentor provide interview preparation?",
    message:
      "Yes, we provide company-wise interview questions, mock tests, and AI-based preparation tools.",
  },
  {
    name: "Can I track my progress?",
    message:
      "Yes, your dashboard shows progress, streaks, performance analytics, and improvement areas.",
  },
  {
    name: "Is there any premium plan available?",
    message:
      "Yes, premium plans unlock advanced features like mentorship, AI mock interviews, and detailed analytics.",
  },
];

const SuccessStories = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-14 md:py-20 px-4 bg-gradient-to-b from-white via-slate-50 to-indigo-50 dark:from-[#020617] dark:via-[#0b1120] dark:to-[#111827] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* TOP TAG */}
        <div className="flex justify-center mb-4">
          <span className="px-4 py-2 rounded-full text-sm font-medium border border-blue-200 text-blue-700 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
            Need Help?
          </span>
        </div>

        {/* HEADING */}
        <h2 className="text-3xl md:text-5xl font-bold text-center text-slate-900 dark:text-white">
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Questions
          </span>
        </h2>

        <p className="text-center text-slate-600 dark:text-slate-400 mt-4 mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Find quick answers about Place Mentor, account setup, progress
          tracking, premium plans, and preparation tools.
        </p>

        {/* FAQ BOX */}
        <div className="space-y-4">
          {successStoriesData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* QUESTION */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-5"
                >
                  <span className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </span>

                  <div
                    className={`min-w-[38px] h-[38px] rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-transform duration-300 ${
                      isOpen ? "rotate-45 scale-105" : ""
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                </button>

                {/* ANSWER */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 text-sm md:text-base leading-7 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TEXT */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-10">
          Still have questions? Contact our support team anytime.
        </p>
      </div>
    </section>
  );
};

export default SuccessStories;

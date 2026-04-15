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
    <div className="w-full flex justify-center py-12 md:py-16 px-4">
      <div className="w-full max-w-3xl">

        {/* HEADING */}
        <h2 className="text-2xl md:text-4xl font-semibold text-center mb-10 md:mb-12 
        text-gray-900 dark:text-white">
          FREQUENTLY ASKED QUESTIONS
        </h2>

        {/* FAQ LIST */}
        <div>
          {successStoriesData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border-b border-gray-400 dark:border-gray-600 py-4 md:py-5"
              >
                {/* QUESTION */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center text-left gap-4"
                >
                  <span className="text-base md:text-xl font-medium 
                  text-gray-800 dark:text-gray-200">
                    {item.name}
                  </span>

                  <Plus
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>

                {/* ANSWER */}
                {isOpen && (
                  <p className="mt-3 md:mt-4 text-sm md:text-base 
                  text-gray-600 dark:text-gray-400 leading-relaxed pr-2 md:pr-6">
                    {item.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SuccessStories;

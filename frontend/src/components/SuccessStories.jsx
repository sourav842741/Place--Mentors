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
    message: "Go to profile settings and update your name from the edit section.",
  },
  {
    name: "Is my profile information private?",
    message: "Yes, your data is secure and controlled by your privacy settings.",
  },
  {
    name: "Can I share my profile with recruiters?",
    message: "Yes, you can generate a shareable profile link from your dashboard.",
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
    <section className="w-full py-12 md:py-16 px-4 bg-bg text-text transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* TOP TAG */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-soft text-primary">
            Need Help?
          </span>
        </div>

        {/* HEADING */}
        <h2 className="text-2xl sm:text-4xl font-bold text-center text-text tracking-tight">
          Frequently Asked Questions
        </h2>

        <p className="text-center text-text-muted mt-2 mb-10 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
          Find quick answers about Place Mentor, account setup, progress tracking, premium plans,
          and preparation tools.
        </p>

        {/* FAQ BOX */}
        <div className="space-y-3">
          {successStoriesData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-border bg-surface shadow-subtle hover:border-primary/40 transition-colors overflow-hidden"
              >
                {/* QUESTION */}
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer hover:bg-surface-2/60 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-text">
                    {item.name}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-primary text-on-primary rotate-45"
                        : "bg-surface-2 text-text-muted border border-border hover:text-text"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </button>

                {/* ANSWER */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 pt-1 text-xs sm:text-sm leading-relaxed text-text-muted border-t border-border">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM TEXT */}
        <p className="text-center text-xs text-text-muted mt-8">
          Still have questions? Reach out to our community support anytime.
        </p>
      </div>
    </section>
  );
};

export default SuccessStories;

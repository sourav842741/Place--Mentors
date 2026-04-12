import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Step3Report({ result }) {
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = result;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;


  const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 5;

  // underline
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Final Score: ${finalScore}/10`,
    pageWidth / 2,
    currentY + 12,
    { align: "center" }
  );

  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

  doc.setFontSize(12);

  doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
  doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

  currentY += 45;

  // ================= ADVICE =================
  let advice = "";

  if (finalScore >= 8) {
    advice =
      "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
  } else if (finalScore >= 5) {
    advice =
      "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
  } else {
    advice =
      "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  doc.text(splitAdvice, margin + 10, currentY + 20);

  currentY += 50;

  // ================= QUESTION TABLE =================
  autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [["#", "Question", "Score", "Feedback"]],
  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,
    q.question,
    `${q.score}/10`,
    q.feedback,
  ]),
  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },
  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },
  columnStyles: {
    0: { cellWidth: 10, halign: "center" }, // index
    1: { cellWidth: 55 }, // question
    2: { cellWidth: 20, halign: "center" }, // score
    3: { cellWidth: "auto" }, // feedback
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});


  doc.save("AI_Interview_Report.pdf");
};

  return (
    <div className='min-h-screen 
bg-gradient-to-br from-gray-50 to-green-50 
dark:from-gray-950 dark:to-gray-900 
px-4 sm:px-6 lg:px-10 py-8 transition-colors duration-300'>

  {/* HEADER */}
  <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>

    <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
      
      <button
        onClick={() => navigate("/history")}
        className='mt-1 p-3 rounded-full 
        bg-white dark:bg-gray-800 
        shadow hover:shadow-md 
        border border-gray-200 dark:border-white/10 transition'>
        <FaArrowLeft className='text-gray-600 dark:text-gray-300' />
      </button>

      <div>
        <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
          Interview Analytics Dashboard
        </h1>

        <p className='text-gray-500 dark:text-gray-400 mt-2'>
          AI-powered performance insights
        </p>
      </div>
    </div>

    <button
      onClick={downloadPDF}
      className='bg-emerald-600 hover:bg-emerald-700 
      text-white px-6 py-3 rounded-xl shadow-md transition font-semibold'>
      Download PDF
    </button>
  </div>

  {/* GRID */}
  <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

    {/* LEFT */}
    <div className='space-y-6'>

      {/* SCORE */}
      <motion.div
        className="bg-white dark:bg-gray-900 
        rounded-3xl shadow-lg p-6 sm:p-8 text-center 
        border border-gray-200 dark:border-white/10 transition">

        <h3 className="text-gray-500 dark:text-gray-400 mb-6">
          Overall Performance
        </h3>

        <div className='relative w-20 h-20 mx-auto'>
          <CircularProgressbar
            value={percentage}
            text={`${score}/10`}
            styles={buildStyles({
              pathColor: "#10b981",
              textColor: "#ef4444",
              trailColor: "#e5e7eb",
            })}
          />
        </div>

        <p className="text-gray-400 dark:text-gray-500 mt-3 text-sm">
          Out of 10
        </p>

        <div className="mt-4">
          <p className="font-semibold text-gray-800 dark:text-white">
            {performanceText}
          </p>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {shortTagline}
          </p>
        </div>
      </motion.div>

      {/* SKILLS */}
      <motion.div
        className='bg-white dark:bg-gray-900 
        rounded-3xl shadow-lg p-6 sm:p-8 
        border border-gray-200 dark:border-white/10 transition'>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Skill Evaluation
        </h3>

        <div className='space-y-5'>
          {skills.map((s, i) => (
            <div key={i}>
              <div className='flex justify-between mb-2'>

                <span className='text-gray-700 dark:text-gray-300'>
                  {s.label}
                </span>

                <span className='font-semibold text-green-600'>
                  {s.value}
                </span>
              </div>

              <div className='bg-gray-200 dark:bg-gray-700 h-2 rounded-full'>
                <div
                  className='bg-green-500 h-full rounded-full'
                  style={{ width: `${s.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* RIGHT */}
    <div className='lg:col-span-2 space-y-6'>

      {/* CHART */}
      <motion.div
        className='bg-white dark:bg-gray-900 
        rounded-3xl shadow-lg p-5 sm:p-8 
        border border-gray-200 dark:border-white/10 transition'>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Performance Trend
        </h3>

        <div className='h-64 sm:h-72'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={questionScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis domain={[0, 10]} stroke="#9CA3AF" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#22c55e"
                fill="#bbf7d0"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* QUESTIONS */}
      <motion.div
        className='bg-white dark:bg-gray-900 
        rounded-3xl shadow-lg p-5 sm:p-8 
        border border-gray-200 dark:border-white/10 transition'>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Question Breakdown
        </h3>

        <div className='space-y-6'>
          {questionWiseScore.map((q, i) => (
            <div
              key={i}
              className='bg-gray-50 dark:bg-gray-800 
              p-4 sm:p-6 rounded-2xl 
              border border-gray-200 dark:border-white/10 transition'>

              <div className='flex flex-col sm:flex-row justify-between gap-3 mb-4'>

                <div>
                  <p className="text-xs text-gray-400">
                    Question {i + 1}
                  </p>

                  <p className="font-semibold text-gray-800 dark:text-white">
                    {q.question || "Question not available"}
                  </p>
                </div>

                <div className='bg-green-100 dark:bg-green-900/30 
                text-green-600 dark:text-green-400 
                px-3 py-1 rounded-full font-bold text-sm'>
                  {q.score ?? 0}/10
                </div>
              </div>

              <div className='bg-green-50 dark:bg-gray-800 
              border border-green-200 dark:border-white/10 
              p-4 rounded-lg'>

                <p className='text-xs text-green-600 dark:text-green-400 font-semibold mb-1'>
                  AI Feedback
                </p>

                <p className='text-sm text-gray-700 dark:text-gray-300'>
                  {q.feedback?.trim() || "No feedback available"}
                </p>
              </div>

            </div>
          ))}
        </div>
      </motion.div>

    </div>
  </div>
</div>
  )
}

export default Step3Report

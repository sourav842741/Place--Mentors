import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import api from "../services/api";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");


  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];


  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92;     // slightly slower than normal
      utterance.pitch = 1.05;    // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };


      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);



        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };


      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };


  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }

    }

    runIntro()


  }, [selectedVoice, isIntroPhase, currentIndex])



  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex])

  useEffect(() => {
  if (!isIntroPhase && currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit || 60);
  }
}, [currentIndex]);


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);


  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)

    try {
       const result = await api.post("/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      } , {withCredentials:true})

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
console.log(error)
setIsSubmitting(false)
    }
  }

  const handleNext =async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);

   
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await api.post("/api/interview/finish" , { interviewId} , {withCredentials:true})

      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }


   useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer()
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);







  return (
   <div className='min-h-screen 
bg-gradient-to-br from-emerald-50 via-white to-teal-100 
dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
flex items-center justify-center p-4 sm:p-6 transition-colors duration-300'>

  <div className='w-full max-w-350 min-h-[80vh] 
  bg-white dark:bg-gray-900 
  rounded-3xl shadow-2xl 
  border border-gray-200 dark:border-white/10 
  flex flex-col lg:flex-row overflow-hidden transition'>

    {/* VIDEO SECTION */}
    <div className='w-full lg:w-[35%] 
    bg-white dark:bg-gray-900 
    flex flex-col items-center p-6 space-y-6 
    border-r border-gray-200 dark:border-white/10 transition'>

      <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
        <video
          src={videoSource}
          key={videoSource}
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* SUBTITLE */}
      {subtitle && (
        <div className='w-full max-w-md 
        bg-gray-50 dark:bg-gray-800 
        border border-gray-200 dark:border-white/10 
        rounded-xl p-4 shadow-sm transition'>
          <p className='text-gray-700 dark:text-gray-300 text-sm sm:text-base font-medium text-center'>
            {subtitle}
          </p>
        </div>
      )}

      {/* TIMER */}
      <div className='w-full max-w-md 
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-white/10 
      rounded-2xl shadow-md p-6 space-y-5 transition'>

        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            Interview Status
          </span>

          {isAIPlaying && (
            <span className='text-sm font-semibold text-emerald-600'>
              AI Speaking
            </span>
          )}
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

        <div className='flex justify-center'>
          <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

        <div className='grid grid-cols-2 gap-6 text-center'>
          <div>
            <span className='text-2xl font-bold text-emerald-600'>
              {currentIndex + 1}
            </span>
            <span className='block text-xs text-gray-400 dark:text-gray-500'>
              Current Questions
            </span>
          </div>

          <div>
            <span className='text-2xl font-bold text-emerald-600'>
              {questions.length}
            </span>
            <span className='block text-xs text-gray-400 dark:text-gray-500'>
              Total Questions
            </span>
          </div>
        </div>

      </div>
    </div>

    {/* RIGHT SECTION */}
    <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative 
    bg-white dark:bg-gray-900 transition'>

      <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
        AI Smart Interview
      </h2>

      {!isIntroPhase && (
        <div className='relative mb-6 
        bg-gray-50 dark:bg-gray-800 
        p-4 sm:p-6 rounded-2xl 
        border border-gray-200 dark:border-white/10 shadow-sm transition'>

          <p className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 mb-2'>
            Question {currentIndex + 1} of {questions.length}
          </p>

          <div className='text-base sm:text-lg font-semibold text-gray-800 dark:text-white'>
            {currentQuestion?.question}
          </div>
        </div>
      )}

      <textarea
        placeholder="Type your answer here..."
        onChange={(e) => setAnswer(e.target.value)}
        value={answer}
        className="flex-1 
        bg-gray-100 dark:bg-gray-800 
        text-gray-800 dark:text-white 
        p-4 sm:p-6 rounded-2xl resize-none outline-none 
        border border-gray-200 dark:border-white/10 
        focus:ring-2 focus:ring-emerald-500 transition"
      />

      {!feedback ? (
        <div className='flex items-center gap-4 mt-6'>

          <motion.button
            onClick={toggleMic}
            whileTap={{ scale: 0.9 }}
            className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center 
            rounded-full bg-black dark:bg-white 
            text-white dark:text-black shadow-lg transition'
          >
            {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </motion.button>

          <motion.button
            onClick={submitAnswer}
            disabled={isSubmitting}
            whileTap={{ scale: 0.95 }}
            className='flex-1 
            bg-gradient-to-r from-emerald-600 to-teal-500 
            text-white py-3 sm:py-4 rounded-2xl shadow-lg 
            hover:opacity-90 transition font-semibold 
            disabled:bg-gray-500'
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </motion.button>

        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mt-6 
          bg-emerald-50 dark:bg-gray-800 
          border border-emerald-200 dark:border-white/10 
          p-5 rounded-2xl shadow-sm transition'
        >

          <p className='text-emerald-700 dark:text-emerald-400 font-medium mb-4'>
            {feedback}
          </p>

          <button
            onClick={handleNext}
            className='w-full 
            bg-gradient-to-r from-emerald-600 to-teal-500 
            text-white py-3 rounded-xl shadow-md 
            hover:opacity-90 transition flex items-center justify-center gap-1'
          >
            Next Question <BsArrowRight size={18} />
          </button>

        </motion.div>
      )}
    </div>
  </div>
</div>
  )
}

export default Step2Interview

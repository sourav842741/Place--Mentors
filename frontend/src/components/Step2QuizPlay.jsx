import React, { useState, useRef, useEffect } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowRight, Volume2, Sparkles } from "lucide-react";
import api from "../services/api";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* VOICE LOAD */
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("female")
        ) || voices[0];

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  /* SPEAK */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn) startMic();

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  /* INTRO + QUESTIONS */
  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today.`);
        await speakText("I'll ask you a few questions. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be challenging.");
        }

        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  /* TIMER */
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  /* SPEECH RECOGNITION */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    recognitionRef.current?.stop();
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  };

  /* SUBMIT */
  const submitAnswer = async () => {
    if (isSubmitting) return;

    stopMic();
    setIsSubmitting(true);

    try {
      const result = await api.post(
        "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        {
          withCredentials: true,
        }
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* NEXT */
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, next question.");
    setCurrentIndex(currentIndex + 1);
  };

  /* FINISH */
  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);

    try {
      const result = await api.post(
        "/api/interview/finish",
        { interviewId },
        {
          withCredentials: true,
        }
      );

      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isIntroPhase && currentQuestion && timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 sm:p-6 bg-bg text-text transition-colors duration-200">
      <div className="w-full max-w-6xl min-h-[75vh] bg-surface border border-border rounded-xl shadow-subtle flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN - AI Interviewer & Status */}
        <div className="w-full lg:w-[380px] bg-surface-2/40 border-b lg:border-b-0 lg:border-r border-border p-6 flex flex-col items-center space-y-5">
          <div className="w-full rounded-xl overflow-hidden border border-border shadow-sm bg-black aspect-video max-h-[240px] flex items-center justify-center">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="w-full bg-surface border border-border rounded-lg p-3 text-xs text-text-muted leading-relaxed text-center">
              {subtitle}
            </div>
          )}

          {/* Timer & Meta */}
          <div className="w-full bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted font-medium">Session Status</span>
              {isAIPlaying ? (
                <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  AI Speaking
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Turn
                </span>
              )}
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-border" />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-xl font-bold text-text">
                  {currentIndex + 1}
                </span>
                <span className="block text-[11px] text-text-subtle font-medium">
                  Current Question
                </span>
              </div>

              <div>
                <span className="text-xl font-bold text-text">
                  {questions.length}
                </span>
                <span className="block text-[11px] text-text-subtle font-medium">
                  Total Questions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Question & Response */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 bg-surface justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                AI Interview Assessment
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border">
                Question {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {!isIntroPhase && (
              <div className="bg-surface-2 border border-border p-5 rounded-xl">
                <p className="text-sm sm:text-base font-semibold text-text leading-snug">
                  {currentQuestion?.question}
                </p>
              </div>
            )}

            {/* Answer textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">Your Spoken or Typed Answer</label>
              <textarea
                placeholder="Speak clearly or type your response here..."
                onChange={(e) => setAnswer(e.target.value)}
                value={answer}
                rows={7}
                className="w-full bg-surface-2 border border-border rounded-xl p-4 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Action bar */}
          {!feedback ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                  isMicOn
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-2 text-text-subtle border-border hover:text-text"
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={submitAnswer}
                disabled={isSubmitting || !answer.trim()}
                className="flex-1 bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Evaluating with AI..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <div className="bg-surface-2 border border-border p-5 rounded-xl space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  AI Feedback
                </h4>
                <p className="text-xs text-text leading-relaxed">{feedback}</p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-soft flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;

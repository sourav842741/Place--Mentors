import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

import { useMaintenanceDashboard } from '../hooks/useMaintenanceQuestions';
import api from '../services/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import {
  ArrowLeft,
  Mic,
  Code,
  Brain,
  BookOpen,
  ScrollText,
  Quote,
  FileText,
  DollarSign,
  RefreshCw,
  Flame,
  Zap,
  Clock3,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
} from 'lucide-react';

import SplashScreen from '../components/SplashScreen';

const modules = [
  { id: 'hr', title: 'HR Rapid Fire', icon: Mic, type: 'hr' },
  { id: 'coding', title: 'Coding Quiz', icon: Code, type: 'coding' },
  { id: 'aptitude', title: 'Aptitude Quiz', icon: Brain, type: 'aptitude' },
  { id: 'vocab', title: 'Vocabulary', icon: BookOpen, type: 'vocab' },
  { id: 'myth', title: 'Myth vs Fact', icon: ScrollText, type: 'myth' },
  { id: 'quote', title: 'Motivation', icon: Quote, type: 'quote' },
  { id: 'resume', title: 'Resume Score', icon: FileText },
  { id: 'salary', title: 'Salary Calculator', icon: DollarSign },
];

export default function MaintenanceProductivityHub() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useMaintenanceDashboard();

  const [cards, setCards] = useState({});
  const [time, setTime] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem('maintenance-theme') || 'light');

  const [salary, setSalary] = useState('');
  const [monthly, setMonthly] = useState(0);

  const [resumeScore, setResumeScore] = useState({
    projects: false,
    skills: false,
    achievements: false,
    internships: false,
    github: false,
    keywords: false,
  });

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  const [streak, setStreak] = useState(0);

  // ================= LOAD DATA =================
  useEffect(() => {
    if (dashboardData) {
      setCards(dashboardData);
    }
  }, [dashboardData]);

  // ================= CLOCK =================
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ================= THEME =================
  useEffect(() => {
    localStorage.setItem('maintenance-theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // ================= DAILY STREAK =================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('maintenance-streak-data')) || {
      count: 0,
      lastDate: null,
    };

    setStreak(saved.count);
  }, []);

  const saveProgress = () => {
    const today = new Date().toDateString();

    const saved = JSON.parse(localStorage.getItem('maintenance-streak-data')) || {
      count: 0,
      lastDate: null,
    };

    if (saved.lastDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newCount = 1;

    if (saved.lastDate === yesterday.toDateString()) {
      newCount = saved.count + 1;
    }

    const data = {
      count: newCount,
      lastDate: today,
    };

    localStorage.setItem('maintenance-streak-data', JSON.stringify(data));

    setStreak(newCount);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2200);
  };

  // ================= SALARY =================
  const calculateSalary = (value) => {
    setSalary(value);

    const ctc = Number(value || 0);
    const gross = (ctc * 100000) / 12;
    const inHand = Math.round(gross * 0.78);

    setMonthly(inHand);
  };

  // ================= RESUME SCORE =================
  const score = Object.values(resumeScore).filter(Boolean).length * (100 / 6);

  // ================= OPTIONS =================
  const handleOptionClick = (type, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [type]: option,
    }));

    setShowAnswers((prev) => ({
      ...prev,
      [type]: true,
    }));
  };

  // ================= NEXT ONLY CURRENT =================
  const nextQuestion = async (type) => {
    try {
      const res = await api.get(`/api/maintenance/random/${type}`);

      const data = await res.json();

      setCards((prev) => ({
        ...prev,
        [type]: data.data,
      }));

      setSelectedAnswers((prev) => ({
        ...prev,
        [type]: null,
      }));

      setShowAnswers((prev) => ({
        ...prev,
        [type]: false,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white transition-all duration-300">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={180}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              variant="outline"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </>
              )}
            </Button>
          </div>

          <div className="text-center lg:text-right">
            <div className="flex items-center justify-center lg:justify-end gap-2 font-bold text-xl">
              <Clock3 className="w-5 h-5 text-emerald-500" />
              {time.toLocaleTimeString('en-IN')}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              🇮🇳 India Time • We are upgrading systems.
            </p>
          </div>
        </div>

        {/* HERO */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl mb-5">
            <Zap className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Productivity Hub
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Learn while servers are improving 🚀
          </p>
        </div>

        {/* STREAK */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-5">
            <div>
              <p className="text-sm text-slate-500">Daily Learning Streak</p>

              <h2 className="text-4xl font-black text-orange-500 flex items-center gap-2">
                {streak}
                <Flame className="w-8 h-8" />
              </h2>
            </div>

            <div className="w-full lg:w-96">
              <Progress value={Math.min(streak * 10, 100)} />
            </div>

            <Button
              onClick={saveProgress}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              Save Progress
            </Button>
          </CardContent>
        </Card>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((item, index) => {
            const Icon = item.icon;

            const question = cards?.[item.type];

            const selected = selectedAnswers[item.type];

            const reveal = showAnswers[item.type];

            return (
              <motion.div
                key={item.id}
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
              >
                <Card className="h-full border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:scale-[1.02] transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <CardTitle>{item.title}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {question ? (
                      <>
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                          <p className="font-semibold">{question.question}</p>
                        </div>

                        {question.options?.length > 0 &&
                        item.id !== 'myth' &&
                        item.id !== 'quote' ? (
                          <div className="space-y-2">
                            {question.options.map((op, i) => {
                              const isCorrect = op === question.answer;

                              const isSelected = selected === op;

                              return (
                                <button
                                  key={i}
                                  onClick={() => handleOptionClick(item.type, op)}
                                  className={`w-full px-4 py-3 rounded-xl text-left border transition  ${
                                    reveal && isCorrect
                                      ? 'border-emerald-500 bg-emerald-500/10'
                                      : reveal && isSelected && !isCorrect
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {String.fromCharCode(65 + i)}. {op}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/10">
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {question.answer}
                            </p>

                            {question.explanation && (
                              <p className="text-sm mt-2 text-slate-500">{question.explanation}</p>
                            )}
                          </div>
                        )}

                        {reveal &&
                          question.options?.length > 0 &&
                          item.id !== 'myth' &&
                          item.id !== 'quote' && (
                            <div className="rounded-xl p-3 border">
                              {selected === question.answer ? (
                                <p className="text-emerald-500 flex items-center gap-2 font-semibold">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Correct
                                </p>
                              ) : (
                                <p className="text-red-500 flex items-center gap-2 font-semibold">
                                  <XCircle className="w-4 h-4" />
                                  Wrong: {question.answer}
                                </p>
                              )}
                            </div>
                          )}
                      </>
                    ) : item.id === 'salary' ? (
                      <>
                        <Input
                          placeholder="Enter CTC in LPA"
                          value={salary}
                          onChange={(e) => calculateSalary(e.target.value)}
                        />

                        <div className="rounded-xl p-4 bg-emerald-500/10 text-center">
                          <p className="text-sm text-slate-500">Monthly In-Hand</p>

                          <h2 className="text-3xl font-black text-emerald-500">
                            ₹{monthly.toLocaleString()}
                          </h2>
                        </div>
                      </>
                    ) : item.id === 'resume' ? (
                      <>
                        <div className="space-y-2">
                          {Object.keys(resumeScore).map((key) => (
                            <label key={key} className="flex gap-2 text-sm capitalize">
                              <input
                                type="checkbox"
                                checked={resumeScore[key]}
                                onChange={() =>
                                  setResumeScore((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                              />
                              {key}
                            </label>
                          ))}
                        </div>

                        <Progress value={score} />

                        <p className="font-semibold">Resume Score: {Math.round(score)}%</p>
                      </>
                    ) : null}

                    {item.type && (
                      <Button
                        variant="outline"
                        onClick={() => nextQuestion(item.type)}
                        className="w-full "
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Next Question
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

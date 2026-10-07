import React from "react";
import Navbar from "../components/Navbar";
import useFruitbox from "../hooks/useFruitbox";
import LevelCard from "../components/Fruitbox/LevelCard";
import MonacoCodeEditor from "../components/Fruitbox/MonacoCodeEditor";
import GameBoard from "../components/Fruitbox/GameBoard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const FruitboxFlex = () => {
  const {
    levels,
    progress,
    currentLevel,
    currentLevelId,
    userCSS,
    setUserCSS,
    progressPercent,
    isLoading,
    isWon,
    validateSolution,
    completeLevel,
    resetProgress,
    setCurrentLevelId,
  } = useFruitbox();

  // Run and validate solution
  const handleRunSolution = async (cssCode) => {
    const isCorrect = validateSolution(cssCode);

    if (!isCorrect) {
      toast.error("Not quite right yet. Check the hint for guidance!");
      return;
    }

    if (!progress?.completedLevels?.includes(currentLevelId)) {
      await completeLevel(currentLevelId, currentLevel.xpReward);
    } else {
      toast.success("Level already completed! 🎉");
    }
  };

  // Level Navigation
  const goPrevLevel = () => {
    if (currentLevelId > 1) {
      setCurrentLevelId((prev) => prev - 1);
    }
  };

  const goNextLevel = () => {
    if (currentLevelId < levels.length) {
      setCurrentLevelId((prev) => prev + 1);
    } else {
      toast.success("🎉 Mastered all 15 Flexbox levels! Congratulations!");
    }
  };

  const handleSelectLevel = (lvlNum) => {
    if (lvlNum >= 1 && lvlNum <= levels.length) {
      setCurrentLevelId(lvlNum);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 lg:pl-64 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading Fruitbox Flex...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 lg:pl-64 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Fruitbox Flex
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Master CSS Flexbox through interactive visual fruit puzzles
              </p>
            </div>

            {/* Quick Stats: Level, XP, Reset */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Level {currentLevelId} of {levels.length}</span>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>{progress?.totalXP || 0} XP</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetProgress}
                className="h-8 px-2.5 rounded-xl border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold cursor-pointer"
                title="Reset all level progress"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* 2-Column Side-by-Side Playground */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Mission Card + CSS Editor + Quick Presets + Cheat Sheet */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-5">
              <LevelCard
                key={`level-card-${currentLevelId}`}
                level={currentLevel}
                progressPercent={progressPercent}
                currentLevelId={currentLevelId}
                totalLevels={levels.length}
                onPrevLevel={goPrevLevel}
                onNextLevel={goNextLevel}
                onSelectLevel={handleSelectLevel}
                completedLevels={progress?.completedLevels || []}
              />

              <MonacoCodeEditor
                key={`editor-${currentLevelId}`}
                starterCode={currentLevel.starterCode}
                userCSS={userCSS}
                setUserCSS={setUserCSS}
                level={currentLevel}
                validateSolution={validateSolution}
                isWon={isWon}
                onRun={handleRunSolution}
                onNextLevel={goNextLevel}
                isLastLevel={currentLevelId === levels.length}
              />
            </div>

            {/* Right Column: Visual Game Board Arena (Sticky on desktop) */}
            <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-24 space-y-4">
              <GameBoard
                key={`board-${currentLevelId}`}
                level={currentLevel}
                userCSS={userCSS}
                isWon={isWon}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FruitboxFlex;

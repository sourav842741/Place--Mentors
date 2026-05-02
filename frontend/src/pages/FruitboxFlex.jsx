import React from "react";
import Navbar from "../components/Navbar";
import useFruitbox from "../hooks/useFruitbox";
import LevelCard from "../components/Fruitbox/LevelCard";
import MonacoCodeEditor from "../components/Fruitbox/MonacoCodeEditor";
import GameBoard from "../components/Fruitbox/GameBoard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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

  //  Run solution
  const handleRunSolution = async (cssCode) => {
    const isCorrect = validateSolution(cssCode);

    if (!isCorrect) {
      toast.error("Wrong answer. Try again!");
      return;
    }

    if (!progress?.completedLevels?.includes(currentLevelId)) {
      await completeLevel(currentLevelId, currentLevel.xpReward);
    } else {
      toast.success("Already completed ");
    }
  };

  //  Previous Level
  const goPrevLevel = () => {
    if (currentLevelId > 1) {
      setCurrentLevelId((prev) => prev - 1);
    }
  };

  //  Next Level
  const goNextLevel = () => {
    if (currentLevelId < levels.length) {
      setCurrentLevelId((prev) => prev + 1);
    } else {
      toast.success("🎉 All Levels Completed!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 lg:pl-64 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center p-10 bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Loading Fruitbox...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 lg:pl-64 bg-gradient-to-br from-slate-50/30 via-blue-50/20 to-indigo-100/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
                Fruitbox Flex
              </h1>

              <p className="text-lg mt-2 text-slate-700 dark:text-slate-300">
                Master CSS Flexbox through interactive fruit puzzles
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 shadow-xl backdrop-blur border border-slate-200/50 dark:border-slate-700/50 flex-wrap">
              <div className="font-bold text-lg">
                {currentLevelId}/{levels.length}
              </div>

              <div className="w-28 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="font-semibold text-sm">{progress?.totalXP || 0} XP</div>

              <Button variant="destructive" size="sm" onClick={resetProgress} className="h-10 px-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Game Board */}
            <div className="order-1 xl:order-2">
              <GameBoard
                key={currentLevelId}
                level={currentLevel}
                userCSS={userCSS}
                isWon={isWon}
                className="w-full min-h-[430px] rounded-3xl shadow-2xl"
              />
            </div>

            {/* Level Card */}
            <div className="order-2 xl:order-1 space-y-6">
              <LevelCard
                key={currentLevelId}
                level={currentLevel}
                progressPercent={progressPercent}
                currentLevelId={currentLevelId}
                onPrevLevel={goPrevLevel}
                onNextLevel={goNextLevel}
                completedLevels={progress?.completedLevels || []}
                showHint={() => toast(currentLevel.hint)}
              />
            </div>
          </div>

          {/* Editor */}
          <div className="mt-8">
            <MonacoCodeEditor
              key={currentLevelId}
              starterCode={currentLevel.starterCode}
              userCSS={userCSS}
              setUserCSS={setUserCSS}
              level={currentLevel}
              validateSolution={validateSolution}
              isWon={isWon}
              onRun={handleRunSolution}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FruitboxFlex;

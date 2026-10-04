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
      <div className="min-h-screen pt-20 lg:pl-64 bg-bg flex items-center justify-center">
        <div className="text-center p-8 bg-surface rounded-xl border border-border shadow-subtle">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-text-muted">
            Loading Fruitbox...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen pt-20 lg:pl-64 bg-bg text-text transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-text">
                Fruitbox Flex
              </h1>

              <p className="text-xs sm:text-sm mt-1 text-text-muted">
                Master CSS Flexbox through interactive visual puzzles
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 bg-surface rounded-xl p-3 shadow-subtle border border-border flex-wrap">
              <div className="font-bold text-sm text-text">
                Level {currentLevelId}/{levels.length}
              </div>

              <div className="w-24 sm:w-28 h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="font-semibold text-xs text-accent">{progress?.totalXP || 0} XP</div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetProgress}
                className="h-8 px-2.5 rounded-lg border-danger/30 text-danger hover:bg-danger-soft text-xs font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
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

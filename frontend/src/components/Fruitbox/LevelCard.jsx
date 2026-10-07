import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Trophy, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

const LevelCard = ({
  level,
  progressPercent,
  currentLevelId,
  totalLevels = 15,
  onPrevLevel,
  onNextLevel,
  onSelectLevel,
  completedLevels = [],
}) => {
  const [showLevelList, setShowLevelList] = useState(false);
  const isCompleted = completedLevels.includes(level?.id);

  return (
    <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 transition-all">
      {/* Top Header: Level Indicator & XP Reward */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-500/25">
            L{level?.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {level?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  isCompleted
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                }`}
              >
                {isCompleted ? "Completed ✓" : "Active Challenge"}
              </span>
              <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                +{level?.xpReward} XP
              </span>
            </div>
          </div>
        </div>

        {/* Level Quick-Picker Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowLevelList((prev) => !prev)}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
          title="Jump to any level"
        >
          <ListOrdered className="w-4 h-4" />
          <span className="hidden sm:inline">All Levels</span>
        </button>
      </div>

      {/* Quick Level Selector Grid (Toggleable) */}
      {showLevelList && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Select Level (1 - {totalLevels})</span>
            <span>{completedLevels.length} Solved</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
            {Array.from({ length: totalLevels }, (_, i) => i + 1).map((lvlNum) => {
              const isCurr = lvlNum === currentLevelId;
              const isDone = completedLevels.includes(lvlNum);

              return (
                <button
                  key={lvlNum}
                  type="button"
                  onClick={() => {
                    if (onSelectLevel) onSelectLevel(lvlNum);
                    setShowLevelList(false);
                  }}
                  className={`py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5 ${
                    isCurr
                      ? "bg-emerald-500 text-white shadow-sm scale-105"
                      : isDone
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  <span>{lvlNum}</span>
                  {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Challenge Goal Instruction Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
        <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Mission Goal
        </h4>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {level?.instruction}
        </p>
      </div>

      {/* Progress Bar & Level Navigation */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Overall Progress</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            {completedLevels.length} of {totalLevels} Levels Completed
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            onClick={onPrevLevel}
            disabled={currentLevelId === 1}
            variant="outline"
            className="flex-1 h-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={onNextLevel}
            disabled={currentLevelId === totalLevels}
            variant="outline"
            className="flex-1 h-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelCard;

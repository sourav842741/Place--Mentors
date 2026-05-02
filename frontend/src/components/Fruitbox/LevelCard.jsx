import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

const LevelCard = ({
  level,
  progressPercent,
  currentLevelId,
  onPrevLevel,
  onNextLevel,
  showHint,
  completedLevels = [],
}) => {
  //  Only current solved level unlock next button
  const isCompleted = completedLevels.includes(level.id);

  return (
    <div className="p-6 lg:p-8 bg-white/70 dark:bg-slate-900/70 rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/60 font-bold text-2xl text-white">
            L{level.id}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {level.title}
            </h2>

            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300/50"
                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-300/50"
                }`}
              >
                {isCompleted ? "✅ Complete" : "🎯 Active"}
              </div>

              <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                +{level.xpReward} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl border border-slate-200/30 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progress</span>

          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {completedLevels.length}/15
          </span>
        </div>

        <div className="w-full bg-slate-200/50 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Challenge */}
      <div className="p-6 bg-gradient-to-b from-white/0 to-slate-50/50 dark:from-slate-900/20 dark:to-slate-800/20 rounded-2xl border border-slate-200/20 dark:border-slate-700/40 mb-8 backdrop-blur-sm">
        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">📋 Challenge</h4>

        <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
          {level.instruction}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <Button
          onClick={onPrevLevel}
          disabled={currentLevelId === 1}
          variant="outline"
          className="flex-1 h-14 font-semibold"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>

        <Button
          onClick={onNextLevel}
          disabled={!isCompleted}
          className={`flex-1 h-14 font-bold ${
            isCompleted
              ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              : "bg-slate-400 text-white opacity-50 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-5 h-5 mr-2" />
          Next Level
        </Button>
      </div>

      {/* Hint */}
      {!isCompleted && (
        <Button
          onClick={showHint}
          className="w-full h-14 mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
        >
          <Lightbulb className="w-5 h-5 mr-2" />
          Get Hint
        </Button>
      )}
    </div>
  );
};

export default LevelCard;

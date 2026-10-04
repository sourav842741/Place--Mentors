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
    <div className="p-5 sm:p-6 bg-surface rounded-xl border border-border shadow-subtle space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-primary-soft text-primary rounded-xl flex items-center justify-center font-bold text-lg border border-primary/20">
            L{level.id}
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-0.5">
              {level.title}
            </h2>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? "bg-success-soft text-success border border-success/20"
                    : "bg-primary-soft text-primary border border-primary/20"
                }`}
              >
                {isCompleted ? "Completed" : "Active Challenge"}
              </span>

              <span className="px-2.5 py-0.5 bg-accent-soft text-accent rounded-full text-xs font-semibold border border-accent/20">
                +{level.xpReward} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-3.5 bg-surface-2 rounded-xl border border-border space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-text-muted">Progress</span>
          <span className="font-mono text-text">
            {completedLevels.length}/15 Levels
          </span>
        </div>

        <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Challenge */}
      <div className="p-4 bg-surface-2 rounded-xl border border-border">
        <h4 className="font-bold text-xs uppercase tracking-wider text-text-subtle mb-1.5">
          Challenge Goal
        </h4>
        <p className="text-xs sm:text-sm text-text leading-relaxed">
          {level.instruction}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2.5 pt-1">
        <Button
          onClick={onPrevLevel}
          disabled={currentLevelId === 1}
          variant="outline"
          className="flex-1 h-10 border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium rounded-lg cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <Button
          onClick={onNextLevel}
          disabled={!isCompleted}
          className={`flex-1 h-10 rounded-lg text-xs font-semibold shadow-soft cursor-pointer transition ${
            isCompleted
              ? "bg-primary hover:bg-primary-hover text-on-primary"
              : "bg-surface-2 text-text-subtle border border-border opacity-60 cursor-not-allowed"
          }`}
        >
          Next Level
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Hint */}
      {!isCompleted && (
        <Button
          onClick={showHint}
          variant="outline"
          className="w-full h-9 border-accent/40 bg-accent-soft text-accent hover:bg-accent/20 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 mr-1.5" />
          View Level Hint
        </Button>
      )}
    </div>
  );
};

export default LevelCard;

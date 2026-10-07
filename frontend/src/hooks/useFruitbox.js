import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { fruitboxLevels } from "../data/fruitboxLevels";
import { toast } from "sonner";

const useFruitbox = () => {
  const [levels] = useState(fruitboxLevels);
  const [progress, setProgress] = useState(null);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [userCSS, setUserCSS] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLevel = levels.find((l) => l.id === currentLevelId) || levels[0];

  const progressPercent = ((progress?.completedLevels?.length || 0) / 15) * 100;

  const normalizeCSS = (css) =>
    (css || "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ";")
      .replace(/\s*:\s*/g, ":")
      .toLowerCase();

  const validateSolution = useCallback(
    (inputCSS) => {
      if (!inputCSS || !inputCSS.trim()) return false;
      const normInput = normalizeCSS(inputCSS);

      return currentLevel.acceptedAnswers.some((ans) => {
        const normAns = normalizeCSS(ans);
        if (normInput.includes(normAns)) return true;

        // Check if user omitted the trailing semicolon
        const withoutSemi = normAns.replace(/;$/, "");
        if (normInput.includes(withoutSemi)) return true;

        // If answer has multiple declarations, check if all parts exist in input
        const parts = normAns.split(";").map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          return parts.every((part) => normInput.includes(part));
        }

        return false;
      });
    },
    [currentLevel]
  );

  //  FIXED PLACE
  useEffect(() => {
    setIsWon(false);
    setUserCSS(currentLevel?.starterCode || "");
  }, [currentLevelId, currentLevel]);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await api.get("/api/fruitbox/progress", {
        withCredentials: true,
      });

      setProgress(
        res.data.data || {
          currentLevel: 1,
          completedLevels: [],
          totalXP: 0,
        }
      );

      setCurrentLevelId(res.data.data?.currentLevel || 1);
    } catch (err) {
      setProgress({
        currentLevel: 1,
        completedLevels: [],
        totalXP: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeLevel = useCallback(async (levelId, earnedXP) => {
    try {
      setIsUpdating(true);

      const res = await api.post(
        "/api/fruitbox/progress",
        { level: levelId, earnedXP },
        { withCredentials: true }
      );

      setProgress(res.data.data);
      setIsWon(true);

      toast.success(`Level ${levelId} completed! +${earnedXP} XP 🎉`);
    } catch (err) {
      toast.error("Failed to save progress");
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const resetProgress = useCallback(async () => {
    try {
      await api.delete("/api/fruitbox/progress", {
        withCredentials: true,
      });

      setProgress({
        currentLevel: 1,
        completedLevels: [],
        totalXP: 0,
      });

      setCurrentLevelId(1);
      toast.success("Progress reset!");
    } catch {
      toast.error("Reset failed");
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    levels,
    progress,
    currentLevel,
    currentLevelId,
    userCSS,
    setUserCSS,
    isLoading,
    isUpdating,
    isWon,
    progressPercent,
    validateSolution,
    completeLevel,
    resetProgress,
    setCurrentLevelId,
  };
};

export default useFruitbox;

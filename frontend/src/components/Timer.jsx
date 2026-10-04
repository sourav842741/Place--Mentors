import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTheme } from "../hooks/useTheme";

function Timer({ timeLeft, totalTime = 60 }) {
  const { isDark } = useTheme();
  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;

  // Dynamic urgency color scheme
  const isCritical = timeLeft <= 10;
  const isWarning = timeLeft <= 20;

  const pathColor = isCritical
    ? "#F04438"
    : isWarning
    ? "#F79009"
    : isDark
    ? "#34D399"
    : "#059669";

  const textColor = isCritical
    ? "#F04438"
    : isDark
    ? "#F2F4F7"
    : "#101828";

  const trailColor = isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "26px",
          pathColor,
          textColor,
          trailColor,
          pathTransition: "stroke-dashoffset 0.5s ease 0s",
        })}
      />
    </div>
  );
}

export default Timer;

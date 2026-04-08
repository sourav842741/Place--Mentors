export const addXP = (user, amount, source = "general") => {
  if (!user.xp) user.xp = 0;
  if (!user.level) user.level = 1;

  user.xp += amount;

  let xpNeeded = 100;
  let level = 1;
  let remainingXP = user.xp;

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded += 100;
  }

  user.level = level;
  user.currentLevelXP = remainingXP;
  user.nextLevelXP = xpNeeded;

  console.log(`✅ ${source} XP: +${amount} (Total: ${user.xp}, Level: ${level})`);
};

// 🔥 POTD specific (already handled in controller, but available)
export const calculatePotdXP = (correctAnswers, questions) => {
  let xp = 0;
  questions.forEach((q, i) => {
    if (correctAnswers[i]) {
      xp += q.difficulty === "easy" ? 5 : q.difficulty === "medium" ? 10 : 20;
    }
  });
  return xp;
};

export const addXP = (user, amount) => {
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
};
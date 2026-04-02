export const addXP = (user, amount) => {
  user.xp += amount;

  let xpNeeded = 100; // starting XP
  let level = 1;
  let remainingXP = user.xp;

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded += 100; // 🔥 har level me +100 increase
  }

  user.level = level;
};
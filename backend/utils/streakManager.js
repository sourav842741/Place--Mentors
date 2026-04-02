import { addXP } from "./xpManager.js";

export const handleLoginStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastLogin = null;

  if (user.lastLoginDate) {
    lastLogin = new Date(user.lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0);
  }

  if (!lastLogin) {
    user.streakCount = 1;
    addXP(user, 10);
  } else {
    const diffDays = (today - lastLogin) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      user.streakCount += 1;
      addXP(user, 10); //  XP from streak
    } else if (diffDays > 1) {
      user.streakCount = 1;
    }
  }

  if (user.streakCount > user.longestStreak) {
    user.longestStreak = user.streakCount;
  }

  user.lastLoginDate = today;
};
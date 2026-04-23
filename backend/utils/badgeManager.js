export const checkAndAssignBadges = (user) => {
  const newBadges = [];

  const badgeConditions = [
    // 🔥 STREAK BADGES (Flame Progression)
    { name: "3 Day Streak 🔥", icon: "🥉🔥", type: "streak", condition: user.streakCount >= 3 },
    { name: "7 Day Streak 🔥", icon: "🥈⚡", type: "streak", condition: user.streakCount >= 7 },
    { name: "15 Day Streak 🏆", icon: "🥇💎", type: "streak", condition: user.streakCount >= 15 },
    { name: "30 Day Streak 👑", icon: "🔥👑🔥", type: "streak", condition: user.streakCount >= 30 },

    // 💪 XP BADGES (Power Progression)
    { name: "XP Beginner 💪", icon: "🌱", type: "xp", condition: user.xp >= 100 },
    { name: "XP Learner 💪", icon: "📈💪", type: "xp", condition: user.xp >= 300 },
    { name: "XP Master 💪", icon: "🔱🔥", type: "xp", condition: user.xp >= 1000 },
    { name: "XP Legend 👑", icon: "🌌💠", type: "xp", condition: user.xp >= 5000 },

    // ⏱️ TIME BADGES (Clock to Hard Work)
    { name: "Getting Started ⏱️", icon: "⏳", type: "time", condition: user.totalTimeSpent >= 30 },
    { name: "Focused User ⏱️", icon: "🎯", type: "time", condition: user.totalTimeSpent >= 100 },
    { name: "Dedicated User ⏱️", icon: "🔋✨", type: "time", condition: user.totalTimeSpent >= 300 },
    { name: "Hard Worker 🧠", icon: "🛠️🧠", type: "time", condition: user.totalTimeSpent >= 1000 },
    { name: "Grinder 🔥", icon: "⚙️🔥", type: "time", condition: user.totalTimeSpent >= 3000 },

    // 🚀 LEVEL BADGES (Space Progression)
    { name: "Level 2 🚀", icon: "🚀", type: "level", condition: user.level >= 2 },
    { name: "Level 5 🚀", icon: "🛸✨", type: "level", condition: user.level >= 5 },
    { name: "Level 10 🏆", icon: "🛰️🏆", type: "level", condition: user.level >= 10 },
    { name: "Level 20 👑", icon: "🌌👑", type: "level", condition: user.level >= 20 },

    // 💎 COMBO BADGES (Special/Rarest)
    { name: "Consistent Learner 💎", icon: "💠✨", type: "combo", condition: user.streakCount >= 7 && user.xp >= 500 },
    { name: "Ultimate Grinder 🔥", icon: "🌋⚔️", type: "combo", condition: user.totalTimeSpent >= 500 && user.xp >= 1000 },
    { name: "Legendary Player 👑", icon: "🎇💠🎇", type: "combo", condition: user.level >= 10 && user.xp >= 3000 },
  ];

  // Logic to ensure user.badges is an array
  if (!user.badges) user.badges = [];

  badgeConditions.forEach((badge) => {
    const alreadyHas = user.badges.some(
      (b) => b.name === badge.name
    );

    if (badge.condition && !alreadyHas) {
      const newBadge = {
        name: badge.name,
        icon: badge.icon,
        type: badge.type,
        earnedAt: new Date(),
      };

      user.badges.push(newBadge);
      newBadges.push(newBadge);
    }
  });

  return newBadges;
};
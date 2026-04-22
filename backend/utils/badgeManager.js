export const checkAndAssignBadges = (user) => {
  const newBadges = [];

  const badgeConditions = [
    /* 🔥 STREAK BADGES */
    {
      name: "Bronze Consistency Award",
      icon: "🥉🔥",
      type: "streak",
      condition: user.streakCount >= 3,
    },
    {
      name: "Silver Discipline Award",
      icon: "🥈⚡",
      type: "streak",
      condition: user.streakCount >= 7,
    },
    {
      name: "Gold Commitment Award",
      icon: "🥇💎",
      type: "streak",
      condition: user.streakCount >= 15,
    },
    {
      name: "Royal Streak Champion",
      icon: "👑🔥",
      type: "streak",
      condition: user.streakCount >= 30,
    },

    /* 💪 XP BADGES */
    {
      name: "Learning Starter Award",
      icon: "🌱",
      type: "xp",
      condition: user.xp >= 100,
    },
    {
      name: "Growth Achiever Award",
      icon: "📈💪",
      type: "xp",
      condition: user.xp >= 300,
    },
    {
      name: "Mastery Excellence Award",
      icon: "🔱🔥",
      type: "xp",
      condition: user.xp >= 1000,
    },
    {
      name: "Legendary Knowledge Award",
      icon: "🌌💠",
      type: "xp",
      condition: user.xp >= 5000,
    },

    /* ⏱️ TIME BADGES */
    {
      name: "Focused Beginner Award",
      icon: "⏳",
      type: "time",
      condition: user.totalTimeSpent >= 30,
    },
    {
      name: "Productivity Performer",
      icon: "🎯",
      type: "time",
      condition: user.totalTimeSpent >= 100,
    },
    {
      name: "Dedication Excellence Award",
      icon: "🔋✨",
      type: "time",
      condition: user.totalTimeSpent >= 300,
    },
    {
      name: "Hard Work Champion",
      icon: "🛠️🧠",
      type: "time",
      condition: user.totalTimeSpent >= 1000,
    },
    {
      name: "Elite Grinder Award",
      icon: "⚙️🔥",
      type: "time",
      condition: user.totalTimeSpent >= 3000,
    },

    /* 🚀 LEVEL BADGES */
    {
      name: "Rising Talent Award",
      icon: "🚀",
      type: "level",
      condition: user.level >= 2,
    },
    {
      name: "Advanced Performer Award",
      icon: "🛸✨",
      type: "level",
      condition: user.level >= 5,
    },
    {
      name: "Elite Excellence Award",
      icon: "🛰️🏆",
      type: "level",
      condition: user.level >= 10,
    },
    {
      name: "Supreme Leader Award",
      icon: "🌌👑",
      type: "level",
      condition: user.level >= 20,
    },

    /* 💎 SPECIAL COMBO BADGES */
    {
      name: "Consistent Learner Honor",
      icon: "💠✨",
      type: "combo",
      condition:
        user.streakCount >= 7 &&
        user.xp >= 500,
    },
    {
      name: "Ultimate Grinder Honor",
      icon: "🌋⚔️",
      type: "combo",
      condition:
        user.totalTimeSpent >= 500 &&
        user.xp >= 1000,
    },
    {
      name: "Legendary Achiever Crown",
      icon: "🎇💠🎇",
      type: "combo",
      condition:
        user.level >= 10 &&
        user.xp >= 3000,
    },
  ];

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
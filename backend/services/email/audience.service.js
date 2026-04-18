import User from '../../models/user.model.js';
import EmailLog from '../../models/EmailLog.model.js';

export const getEmailAudience = async (segment) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const todayStr = new Date().toISOString().split('T')[0];

  const match = {
    email: { $ne: null, $regex: '^[^@]+@[^@]+\\.[^@]+$', $options: 'i' }
  };

  switch (segment) {
    case 'daily_practice_reminder':
      Object.assign(match, {
        $or: [
          { lastLoginDate: { $lt: oneDayAgo } },
          { potdCompleted: false }
        ]
      });
      break;

    case 'streak_warning':
      Object.assign(match, {
        streakCount: { $gt: 0 },
        lastLoginDate: { $lt: oneDayAgo },
        lastPotdDate: { $ne: todayStr }
      });
      break;

    case 'last_chance_reminder':
      Object.assign(match, {
        lastLoginDate: { $lt: oneDayAgo },
        lastPotdDate: { $ne: todayStr }
      });
      break;

    case 'comeback_7d':
      Object.assign(match, {
        lastLoginDate: { $lt: sevenDaysAgo },
        createdAt: { $lt: thirtyDaysAgo } // not too new
      });
      break;

    case 'monthly_achievements':
      Object.assign(match, { streakCount: { $gte: 7 } });
      break;

    case 'all_users':
      // all valid emails
      break;

    case 'premium_users':
      Object.assign(match, { credits: { $gte: 500 } });
      break;

    default:
      return [];
  }

  // Anti-spam: exclude recent recipients of same type
  const recentLogs = await EmailLog.find({
    type: segment === 'daily_practice_reminder' ? { $in: ['daily_reminder', 'streak_warning'] } : segment,
    createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) },
    status: 'sent'
  }).select('email');

  const recentEmails = recentLogs.map(log => log.email);
  
  if (recentEmails.length) {
    Object.assign(match, { email: { $nin: recentEmails } });
  }

  const users = await User.find(match)
    .select('email fullName streakCount credits lastLoginDate createdAt')
    .lean();

  return users.filter(u => u.email && u.fullName);
};

export const getStatsAudience = async () => {
  const totalUsers = await User.countDocuments({ email: { $ne: null } });
  const validEmailUsers = await User.countDocuments({
    email: { $regex: '^[^@]+@[^@]+\\.[^@]+$', $options: 'i' }
  });

  return { totalUsers, validEmailUsers };
};

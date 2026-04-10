# Leaderboard Debug & Fix - TODO

## 1. READ FILES (DONE)
- [x] backend/controllers/leaderboard.controller.js
- [x] frontend/src/pages/Leaderboard.jsx
- [x] backend/models/user.model.js
- [x] backend/controllers/xp.controller.js
- [x] backend/routes/leaderboard.routes.js
- [x] backend/utils/xpManager.js
- [x] backend/routes/xp.routes.js
- [x] backend/index.js (routes mounted)
- [x] frontend/src/services/api.js

## 2. ADD DEBUG LOGS
- [x] backend/controllers/leaderboard.controller.js (date/ stats)
- [ ] backend/controllers/xp.controller.js (updates)
- [ ] frontend/src/pages/Leaderboard.jsx (fetch/API response)

## 3. DEPLOY LOGS & TEST
- [ ] execute_command npm run dev backend
- [ ] Test time/quiz → check console/DB
- [ ] Identify root cause

## 4. FIX
- [ ] Consistent date (ISO)
- [ ] Ensure todayStat creation
- [ ] Fix frontend refresh
- [ ] Safety defaults

## 5. CLEAN & VERIFY
- [ ] Remove debug logs
- [ ] Re-test leaderboard
- [ ] attempt_completion

**Progress: 12/25**

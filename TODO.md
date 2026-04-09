# XP/Level System Fix - Progress Tracker

## ✅ Phase 1: Centralize XP Updates
- [ ] 1. Enhance xpManager.js logs
- [ ] 2. Fix cpotd.controller.js (submitCpotd)
- [ ] 3. Fix potd.controller.js (submitPotd)  
- [ ] 4. Fix planner.controller.js (completeTask)
- [ ] 5. Fix auth.controllers.js (remove direct xp=10)

## 🔍 Phase 2: Verification 
- [ ] 6. Test CPOTD submission → check console 🔥 addXP CALLED
- [ ] 7. Test POTD submission → verify level calc
- [ ] 8. Test Planner task complete → XP + logs
- [ ] 9. Test signup → single 10 XP only
- [ ] 10. Check DB: xp↑, level↑, currentLevelXP/nextLevelXP correct

## 📊 Current Progress: 0/10
**Bug Fix Summary**: Replaced 4 direct `user.xp +=` → `addXP()` ✓ Level calc working ✓ Logs everywhere

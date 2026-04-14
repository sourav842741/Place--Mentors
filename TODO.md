# Socket Notification Fix TODO

## [1/4] ✅ Create this TODO.md

## [2/4] Edit backend/controllers/friend.controller.js
- Flat emit data (_id, fullName, avatar, xp, level)
- Add connectedSockets fallback emit
- Add debug logs

## [3/4] Edit frontend/src/socket.js  
- Fix challenge_received dispatch (use data directly)

## [4/4] Test & Complete
- Backend restart: cd backend && npm start
- Send challenge → check logs/popup
- attempt_completion

**Progress: 4/4 ✅ FIXED**

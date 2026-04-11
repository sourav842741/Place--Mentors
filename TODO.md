# POTD 24h Cooldown Implementation TODO

## Backend Changes
- [✅] 1. Update backend/models/user.model.js: Add lastPotdAt and lastCodingPotdAt Date fields
- [✅] 2. Update backend/controllers/potd.controller.js: Add getPotdStatus and completePotd functions
- [✅] 3. Update backend/controllers/cpotd.controller.js: Add getCpotdStatus and completeCpotd functions
- [✅] 4. Update backend/routes/potd.routes.js: Add GET /status and POST /complete routes
- [✅] 5. Update backend/routes/cpotd.routes.js: Add GET /status and POST /complete routes

## Frontend Changes
- [✅] 6. Create frontend/src/hooks/useCountdown.js: Reusable countdown hook
- [✅] 7. Update frontend/src/services/api.js: Add potdStatus, potdComplete, cpotdStatus, cpotdComplete functions
- [✅] 8. Update frontend/src/components/PotdCard.jsx: Add cooldown logic, timer UI, API integration
- [✅] 9. Update frontend/src/components/CpotdCard.jsx: Add cooldown logic, timer UI, API integration
- [ ] 10. Update frontend/src/pages/Dashboard.jsx: Refetch user or handle status in cards

## Testing & Final
- [ ] 11. Test backend endpoints
- [ ] 12. Test frontend timer/live updates
- [ ] 13. Mark complete ✅

**Current Step: 10/13**


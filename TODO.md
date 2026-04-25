# AI Support Layer Implementation TODO

## Backend Tasks
- [ ] 1. Update `backend/models/Ticket.model.js` — add `aiEscalated`, `aiChatSummary`
- [ ] 2. Update `backend/models/AnalyticsEvent.model.js` — add AI support event types
- [ ] 3. Update `backend/controllers/ticket.controller.js` — export `generateTicketId`
- [ ] 4. Create `backend/controllers/support.controller.js` — AI chat + escalation logic
- [ ] 5. Create `backend/routes/support.routes.js` — `/api/support/ai-chat`, `/api/support/escalate-ticket`
- [ ] 6. Update `backend/index.js` — register `/api/support` router

## Frontend Tasks
- [ ] 7. Create `frontend/src/services/supportApi.js` — AI chat & escalation API
- [ ] 8. Update `frontend/src/redux/ticketSlice.js` — add `escalateToTicket` thunk
- [ ] 9. Create `frontend/src/components/support/AISupportChat.jsx` — AI chat UI
- [ ] 10. Create `frontend/src/components/support/EscalateTicketModal.jsx` — pre-filled ticket modal
- [ ] 11. Update `frontend/src/pages/SupportPage.jsx` — tabbed layout
- [ ] 12. Update `frontend/src/pages/admin/AdminTickets.jsx` — AI Escalated badge


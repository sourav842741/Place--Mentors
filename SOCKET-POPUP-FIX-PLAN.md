# Real-Time Popup Fix Plan

## 🔍 DIAGNOSIS
**Backend:** ✓ Emits correctly to `friend.socketId`
**Frontend:** ✓ Socket join in useAuth.getCurrentUser()
**Problem:** No GLOBAL popup listener - only page-specific listeners (FriendsSection, socket.js have Redux updates, no UI popup)

## 🔧 FIX PLAN

### 1. Global Popup Listeners in App.jsx [CRITICAL]
```
useEffect(() => {
  socket.on("friend_request_received", showPopup)
  socket.on("challenge_received", showPopup)
  return () => socket.off()
}, [])
```

### 2. Add Popup Component
```
Create NotificationPopup.jsx → toast + navigate('/profile')
```

### 3. Backend Debug Logs
```
friend.controller.js → console.log(`Emit to socket ${friend.socketId}`)
index.js → console.log(`User ${userId} socketId: ${socket.id}`)
```

### 4. Frontend Emit Confirm
```
useAuth → socket.emit("join", userData._id) ✓
App.jsx → console.log("Socket listeners registered")
```

## 📁 Dependent Files
```
CRITICAL:
├── frontend/src/App.jsx (global listeners + popup)
├── frontend/src/components/NotificationPopup.jsx (NEW)
├── backend/controllers/friend.controller.js (debug logs)
└── backend/index.js (socket join logs)

**Next:** Create NOTIFICATION-TODO.md → App.jsx

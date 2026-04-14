# FRIEND REQUEST PERSISTENCE FIX PLAN

## Information Gathered
**Backend ✅ COMPLETE:**
```
user.model.js → friendRequests: {sent:[], received:[]}
friend.controller.js → sendFriendRequest populates BOTH arrays
getFriends API → returns {friends, friendRequests: {sent:[], received:[]}}
useFriends hook → useQuery(['friends']) + invalidateQueries ✅
```

**Frontend BUG:**
```
Profile.jsx → uses local user.friendRequests (stale)
FriendsSection.jsx → uses Redux user state (local, not query)
UsersPage.jsx → uses discoverUsers + invalidateQueries ✅
```

**Root Issue:** Profile/FriendsSection ignore useFriends query → local state resets

## Plan
### 1. Profile.jsx → useFriends Query [CRITICAL]
```
BEFORE: user.friendRequests.sent (local stale)
AFTER: const {data} = useFriends(); data.friendRequests.sent
```

### 2. FriendsSection.jsx → Pass Query Data
```
Pass friendsData from Profile
isPending = friendsData.friendRequests.sent.some(id === user._id)
```

### 3. Add refetchOnMount
```
useFriends → refetchOnMount: true, refetchOnWindowFocus: true
```

### 4. Backend Minor
```
user.model.js → add lastFriendRequestTime: Date (cooldown)
getFriends → populate with full user data
```

## Dependent Files
```
CRITICAL:
├── frontend/src/pages/Profile.jsx
├── frontend/src/components/FriendsSection.jsx  
├── frontend/src/hooks/useFriends.js
├── backend/models/user.model.js (cooldown field)
└── backend/controllers/friend.controller.js (populate getFriends)

PHASE 1 → Create FRIENDS-TODO.md → Profile.jsx

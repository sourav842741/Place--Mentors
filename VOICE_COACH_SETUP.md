# 🎙️ PlaceMentor AI Voice Coach - Setup Guide

## Backend Environment Variables

Add to `backend/.env`:

```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token  
TWILIO_PHONE_NUMBER=+1234567890

VIDEOSDK_API_KEY=your_videosdk_key
VIDEOSDK_SECRET_KEY=your_videosdk_secret
VIDEOSDK_AGENT_ID=your_agent_id

BASE_URL=http://localhost:5000
```

**Get credentials:**
1. **Twilio**: [twilio.com/console](https://www.twilio.com/console/phone-numbers) → Get Account SID/Auth Token/Phone number
2. **VideoSDK**: [videosdk.live](https://www.videosdk.live/) → Create account → API keys + Agent ID

## Installation

```bash
# Backend deps
cd backend
npm install twilio @videosdk.live/node-sdk

# Frontend (no new deps needed)
cd ../frontend
npm install
```

## Run

```bash
# Backend (add to package.json scripts)
npm run dev

# Frontend
npm run dev
```

## Test Flow

1. Login → Dashboard
2. Sidebar → **🎙️ AI Voice Coach** 
3. Select mode → Enter phone → **Start Call**
4. Answer phone call from Twilio
5. AI VideoSDK agent starts conversation
6. After call → View history/reports

## Features Live:
✅ HR Interview Practice  
✅ Spoken English  
✅ Motivation Coach  
✅ Resume Screening  
✅ Call History + Reports  
✅ Responsive mobile/desktop  
✅ Dark/Light theme  
✅ Navbar integration  

**Restart both servers after env vars!**

🚀 Ready for production deployment!

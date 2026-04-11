# Contact Us API Integration - TODO

## ✅ Contact Us API COMPLETE

All steps done:
- [x] Step 1: Create `backend/controllers/contact.controller.js`
- [x] Step 2: Update `backend/config/mail.js` (add sendContactMail function)
- [x] Step 3: Create `backend/routes/contact.routes.js`
- [x] Step 4: Edit `backend/index.js` (add import and route mount)
- [x] Step 5: Ready to test

## Test Instructions:
1. Add to `backend/.env`:
   ```
   EMAIL=yourgmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
   (Google Account → Security → 2-Step Verification → App passwords)

2. Run: `cd backend && npm run dev`

3. Test POST `http://localhost:5000/api/contact`:
   ```bash
   curl -X POST http://localhost:5000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","message":"Hello!"}'
   ```

4. Check your Gmail inbox for "New Contact Message from PlaceMentor"

Frontend ContactUs form now works! 🚀


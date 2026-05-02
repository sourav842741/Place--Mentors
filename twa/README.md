# Place Mentor TWA Build Guide

## Quick Start
1. Run: `generate-keystore.bat` → Copy SHA256
2. Update `frontend/public/.well-known/assetlinks.json`
3. Deploy assetlinks to https://placementor.online/.well-known/assetlinks.json  
4. Run: `twa/build-twa.bat` → Get `app-release.aab`
5. Upload to [Play Console](https://play.google.com/console)

## Play Store Requirements ✅
- **Privacy Policy**: `PRIVACY_POLICY.md` (host at https://placementor.online/privacy-policy)
- **Asset Links**: `/.well-known/assetlinks.json` verified
- **Lighthouse PWA**: 90+ score expected

## Verify Setup
```bash
curl https://placementor.online/.well-known/assetlinks.json
npx lighthouse https://placementor.online --only-categories=pwa
```

Ready for production!

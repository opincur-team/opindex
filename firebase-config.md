# Firebase Configuration Setup

This document explains how to set up Firebase for push notifications in the Opindex Wallet mobile app.

## Prerequisites

1. A Firebase project created at https://console.firebase.google.com/
2. Firebase Cloud Messaging (FCM) enabled for your project

## Required Configuration Files

### For Android

You need to download the `google-services.json` file from your Firebase project:

1. Go to Firebase Console → Project Settings → General tab
2. In the "Your apps" section, select your Android app
3. Download the `google-services.json` file
4. Place it in `android/app/google-services.json`

### For iOS

You need to download the `GoogleService-Info.plist` file from your Firebase project:

1. Go to Firebase Console → Project Settings → General tab
2. In the "Your apps" section, select your iOS app
3. Download the `GoogleService-Info.plist` file
4. Place it in `ios/opindexwallet/GoogleService-Info.plist`

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Add Android App

1. Click "Add app" and select Android
2. Package name: `com.opindex.wallet`
3. App nickname: "Opindex Wallet Android"
4. Download `google-services.json`

### 3. Add iOS App

1. Click "Add app" and select iOS
2. Bundle ID: `com.opindex.wallet`
3. App nickname: "Opindex Wallet iOS"
4. Download `GoogleService-Info.plist`

### 4. Enable Cloud Messaging

1. Go to Project Settings → Cloud Messaging tab
2. Note down the Server Key (for backend API)

## iOS Additional Setup

### APNs Configuration

1. In Firebase Console → Project Settings → Cloud Messaging
2. Upload your APNs authentication key or certificate
3. For development: Upload development certificate
4. For production: Upload production certificate

### Xcode Configuration

1. Open the iOS project in Xcode
2. Add the `GoogleService-Info.plist` to the project
3. Make sure it's added to the target
4. Enable Push Notifications capability in Xcode

## Android Additional Setup

### Notification Icons

Create notification icons for Android:

1. Small icon (24x24 dp): `android/app/src/main/res/drawable-*/notification_icon.png`
2. The icon should be white with transparent background
3. Use Android Asset Studio for best results

### Notification Channels

The app automatically creates notification channels:
- `transactions` - High priority for transaction notifications
- `price-alerts` - Default priority for price alerts
- `system` - Default priority for system notifications  
- `marketing` - Low priority for marketing notifications

## Testing

### Test Notifications

Use the Firebase Console to send test notifications:

1. Go to Cloud Messaging in Firebase Console
2. Click "Send your first message"
3. Enter notification details
4. Select your app
5. Send the test notification

### Test with App

Use the notification service methods:

```typescript
import { useNotificationContext } from '@/src/providers/NotificationProvider';

const { sendTestNotification } = useNotificationContext();

// Send a test notification
await sendTestNotification();
```

## Security Notes

- Never commit `google-services.json` or `GoogleService-Info.plist` to version control
- Add these files to `.gitignore`
- Use different Firebase projects for development and production
- Restrict API keys to specific bundle IDs/package names

## Environment Variables

For backend integration, you'll need:

```env
FIREBASE_SERVER_KEY=your_server_key_here
FIREBASE_PROJECT_ID=your_project_id_here
```

## Troubleshooting

### Common Issues

1. **No FCM token received**: Check if Firebase is properly configured
2. **Notifications not appearing**: Verify notification permissions are granted
3. **iOS notifications not working**: Check APNs configuration and certificates
4. **Android notifications not showing**: Verify notification channels are created

### Debug Information

The app logs notification-related information to console:
- FCM token registration
- Notification reception
- Permission status
- Error messages

Check the device logs for detailed error information.

## Production Deployment

### iOS App Store

1. Use production APNs certificates
2. Test with TestFlight builds
3. Verify push notifications work in production environment

### Google Play Store

1. Use production Firebase project
2. Test with internal testing builds
3. Verify notification delivery in production

## API Integration

The backend needs to integrate with Firebase Admin SDK to send notifications:

```javascript
// Example backend integration
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Send notification
await admin.messaging().send({
  token: userFCMToken,
  notification: {
    title: 'Transaction Complete',
    body: 'Your swap was successful',
  },
  data: {
    type: 'transaction',
    transactionId: 'abc123',
  },
});
```

## Monitoring

Monitor notification delivery:
- Firebase Console → Cloud Messaging → Reports
- Track delivery rates and open rates
- Monitor for errors and failed deliveries
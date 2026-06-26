# Google Sign-In Setup for Flutter App

## Problem
The app is throwing an error: `appClientId != null` when trying to sign in with Google. This is because Google Sign-In requires authentication credentials.

## Solution

### Option 1: Using Google Cloud Console (Recommended for Development)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable Google+ API**:
   - Search for "Google+ API" in the search bar
   - Click on it and press "Enable"
4. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs (if needed for your backend)
   - Copy the **Client ID** (should look like: `123456789.apps.googleusercontent.com`)

5. **Update the Flutter App**:
   - Open `lib/features/user_management/presentation/pages/login_screen.dart`
   - Replace `YOUR_SERVER_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
   - Do the same in `register_screen.dart`

### Option 2: Using Firebase (Recommended for Production)

1. **Create a Firebase project**: https://console.firebase.google.com/
2. **Add Android app to Firebase project**:
   - Register Android app with package name: `com.example.consomateur_app`
   - Download `google-services.json`
   - Place it in: `android/app/google-services.json`
3. **Update Android build files**:
   - Add Firebase plugin to `android/app/build.gradle.kts`
4. **Firebase will automatically handle Google Sign-In configuration**

## For Android Only Setup

If you just want to test on Android without web support:

1. Get your Android App signing certificate SHA-1 from Android Studio:
   - Open Android Studio
   - Open your project's Android folder
   - Go to Gradle tool → Tasks → android → signingReport
   - Copy the SHA1 value

2. In Google Cloud Console:
   - Create OAuth 2.0 Credential for Android
   - Add your package name: `com.example.consomateur_app`
   - Add your SHA-1 certificate fingerprint
   - Get the Web Client ID and use it as `serverClientId`

## Testing

After configuration:
1. Run `flutter pub get` to refresh dependencies
2. Run `flutter run` to test the app
3. Try the Google Sign-In button on Login/Register screen

## Troubleshooting

- **Still getting clientId error**: Make sure you're using the Web Client ID (not Android Client ID)
- **Signing in fails with invalid token**: Backend might not be running; check `API_BASE_URL` in `.env`
- **App crashes on Google button click**: Check that the `serverClientId` is correct and your app is properly configured in Google Cloud Console

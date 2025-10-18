# Google OAuth Setup Guide

## Prerequisites
Before you can use Google authentication, you need to set up a Google Cloud project and configure OAuth credentials.

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google People API)

## Step 2: Configure OAuth Consent Screen
1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: Your application name
   - User support email: Your email
   - Developer contact email: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

## Step 3: Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Set the authorized redirect URIs:
   - For development: `http://localhost:4000/api/users/auth/google/callback`
   - For production: `https://yourdomain.com/api/users/auth/google/callback`
5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables
Add these variables to your backend `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL=http://localhost:3000
```

For production, update `FRONTEND_URL` to your actual frontend domain.

## Step 5: Test the Integration
1. Start your backend server: `npm run dev`
2. Start your frontend server: `npm run dev`
3. Go to the login page and click "Continue with Google"
4. Complete the OAuth flow

## Important Notes
- Make sure your backend server is running on the port specified in the redirect URI
- The Google OAuth callback URL must match exactly what you configured in Google Cloud Console
- For production deployment, update the redirect URIs in Google Cloud Console to use your production domain
- Users who sign up with Google will not have a password and must use Google to sign in

## Troubleshooting
- **"redirect_uri_mismatch" error**: Check that the callback URL in Google Cloud Console matches your backend URL
- **"invalid_client" error**: Verify your Client ID and Client Secret are correct
- **CORS errors**: Ensure your frontend domain is added to CORS configuration in the backend
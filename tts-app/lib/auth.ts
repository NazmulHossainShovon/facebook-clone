import { GoogleAuth, OAuth2Client } from 'google-auth-library';

export async function getGoogleAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // 1. Direct environment variables (Most convenient for cloud deployment / Vercel)
  if (clientId && clientSecret && refreshToken) {
    const oAuth2Client = new OAuth2Client(clientId, clientSecret);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { token } = await oAuth2Client.getAccessToken();
    if (token) return token;
  }

  // 2. Parsed JSON credentials from single environment variable
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  if (credentialsJson) {
    try {
      const parsed = JSON.parse(credentialsJson);
      if (parsed.client_id && parsed.client_secret && parsed.refresh_token) {
        const oAuth2Client = new OAuth2Client(parsed.client_id, parsed.client_secret);
        oAuth2Client.setCredentials({ refresh_token: parsed.refresh_token });
        const { token } = await oAuth2Client.getAccessToken();
        if (token) return token;
      } else {
        const auth = new GoogleAuth({
          credentials: parsed,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        if (token.token) return token.token;
      }
    } catch (e) {
      console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', e);
    }
  }

  // 3. Fallback to Google Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS file path or gcloud)
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error('Could not obtain Google Cloud OAuth access token. Ensure credentials are set.');
  }

  return token.token;
}

const fs = require('fs');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const tokenConfigs = [
  ['GMAIL_REFRESH_TOKEN', 'GOOGLE_GMAIL_ACCESS_TOKEN', 'Gmail'],
  ['SHEETS_REFRESH_TOKEN', 'GOOGLE_SHEETS_ACCESS_TOKEN', 'Google Sheets'],
  ['CALENDAR_REFRESH_TOKEN', 'GOOGLE_CALENDAR_ACCESS_TOKEN', 'Google Calendar'],
];

async function main() {
  const missing = [
    ...(!clientId ? ['GOOGLE_CLIENT_ID'] : []),
    ...(!clientSecret ? ['GOOGLE_CLIENT_SECRET'] : []),
    ...tokenConfigs.filter(([refreshName]) => !process.env[refreshName]).map(([name]) => name),
  ];
  if (missing.length) {
    throw new Error(`Missing required GitHub Actions secrets: ${missing.join(', ')}`);
  }

  const envLines = [];
  for (const [refreshName, accessName, label] of tokenConfigs) {
    const refreshToken = process.env[refreshName];
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(
        `${label} token refresh failed (HTTP ${response.status}); check its refresh token and Google OAuth client secrets.`,
      );
    }

    const token = await response.json();
    if (typeof token.access_token !== 'string' || !token.access_token) {
      throw new Error(`${label} token refresh response did not include an access token.`);
    }
    if (/[\r\n]/.test(token.access_token)) {
      throw new Error(`${label} access token contains invalid newline characters.`);
    }

    envLines.push(`${accessName}=${token.access_token}`);
  }

  fs.appendFileSync('.env', `${envLines.join('\n')}\n`, { mode: 0o600 });
  fs.chmodSync('.env', 0o600);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

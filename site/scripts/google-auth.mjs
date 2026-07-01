// One-time helper: authorize your Google account and print a refresh token for
// the booking feature. Run it once, paste the token into NEXT_PUBLIC-less env.
//
//   1. Create OAuth credentials (see docs) and put these in site/.env.local:
//        GOOGLE_CLIENT_ID=...
//        GOOGLE_CLIENT_SECRET=...
//   2. Add this redirect URI to the OAuth client in Google Cloud:
//        http://localhost:5555/oauth2callback
//   3. Run:  node scripts/google-auth.mjs
//   4. Open the printed URL, approve, then copy GOOGLE_REFRESH_TOKEN into
//      .env.local (and later into Vercel).
import http from "node:http";
import { config } from "dotenv";
import { OAuth2Client } from "google-auth-library";

config({ path: ".env.local" });

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
const REDIRECT = "http://localhost:5555/oauth2callback";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT);
const authUrl = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // force a refresh_token every time
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth2callback")) {
    res.writeHead(404).end();
    return;
  }
  const code = new URL(req.url, REDIRECT).searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("Missing code");
    return;
  }
  try {
    const { tokens } = await client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html" }).end(
      "<h2>Done — you can close this tab and return to the terminal.</h2>"
    );
    console.log("\n=======================================================");
    if (tokens.refresh_token) {
      console.log("Add this to .env.local (and Vercel env):\n");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } else {
      console.log("No refresh_token returned. Revoke access at");
      console.log("https://myaccount.google.com/permissions and run again.");
    }
    console.log("=======================================================\n");
  } catch (err) {
    console.error("Token exchange failed:", err);
    res.writeHead(500).end("Token exchange failed — check the terminal.");
  } finally {
    server.close();
  }
});

server.listen(5555, () => {
  console.log("\nOpen this URL in your browser to authorize:\n");
  console.log(authUrl + "\n");
  console.log("Waiting for the redirect on http://localhost:5555 …");
});

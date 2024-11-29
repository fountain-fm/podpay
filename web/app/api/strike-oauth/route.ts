// Modules
import axios from "axios";

// Modules
import * as crypto from "crypto";
import randomstring from "randomstring";
import base64url from "base64url";

// Constants
const STRIKE_OAUTH_ENDPOINT = "https://auth.strike.me";
const STRIKE_OAUTH_CLIENT_ID = process.env.STRIKE_OAUTH_CLIENT_ID;
const STRIKE_OAUTH_REDIRECT = process.env.STRIKE_OAUTH_REDIRECT;
const STRIKE_OAUTH_SCOPES = [
  "openid",
  "profile",
  "partner.payment-quote.lightning.create",
  "partner.payment-quote.execute",
];

// =================================================================================
/** `GET api/strike-oauth` - creates an oauth authorization url for strike */
export async function GET() {
  console.log("GET api/strike-oauth => ");

  // check env variables
  if (!STRIKE_OAUTH_CLIENT_ID) throw Error("MISSING_STRIKE_OAUTH_CLIENT_ID");
  if (!STRIKE_OAUTH_REDIRECT) throw Error("MISSING_STRIKE_OAUTH_REDIRECT");

  // generate pkce codes
  const oauth_env = process.env.NODE_ENV === "production" ? "PROD" : "DEV";
  console.log("oauth_env: ", oauth_env);
  const oauth_state = `PAYAPODCAST${oauth_env}---${randomstring.generate(128)}`;
  const oauth_verifier = randomstring.generate(128);
  const base64Digest = crypto
    .createHash("sha256")
    .update(oauth_verifier)
    .digest("base64");
  const code_challenge = base64url.fromBase64(base64Digest);

  // build auth url
  let oauth_url = `${STRIKE_OAUTH_ENDPOINT}/connect/authorize`;
  oauth_url += `?client_id=${STRIKE_OAUTH_CLIENT_ID}`;
  oauth_url += "&response_type=code";
  oauth_url += `&scope=${encodeURIComponent(STRIKE_OAUTH_SCOPES.join(" "))}`;
  oauth_url += `&state=${oauth_state}`;
  oauth_url += `&code_challenge=${encodeURIComponent(code_challenge)}`;
  oauth_url += "&code_challenge_method=S256";
  oauth_url += `&redirect_uri=${encodeURIComponent(STRIKE_OAUTH_REDIRECT)}`;

  // done
  return Response.json({ oauth_url, oauth_state, oauth_verifier });
}

// =================================================================================
/** `POST api/strike-oauth` - gets the strike access tokens using the authorisation code completing the oauth flow */
export async function POST(request: Request) {
  const data = await request.json();
  console.log("POST api/strike-oauth => ", data);
  const { oauth_code, oauth_verifier } = data;

  // check env variables
  if (!STRIKE_OAUTH_CLIENT_ID) throw Error("MISSING_STRIKE_OAUTH_CLIENT_ID");
  if (!STRIKE_OAUTH_REDIRECT) throw Error("MISSING_STRIKE_OAUTH_REDIRECT");

  // get strike access tokens
  const response = await axios({
    method: "POST",
    url: `${STRIKE_OAUTH_ENDPOINT}/connect/token`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: new URLSearchParams({
      client_id: STRIKE_OAUTH_CLIENT_ID,
      grant_type: "authorization_code",
      redirect_uri: STRIKE_OAUTH_REDIRECT,
      code: oauth_code,
      code_verifier: oauth_verifier,
    }),
  });
  const { access_token } = response.data;

  // done
  return Response.json({ access_token });
}

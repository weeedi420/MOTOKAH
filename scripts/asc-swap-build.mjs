// Swap the iOS version in App Review to the newest VALID build and resubmit.
// Dry run by default (read-only). --apply cancels the current review submission,
// attaches the newest build, and submits a fresh review submission.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const API = "https://api.appstoreconnect.apple.com/v1";
const APP_ID = "6814840993", KEY_ID = "9GQSUWV935", ISSUER_ID = "bc8e67e1-9146-489f-8e26-54c56226ff1f";
const privateKey = fs.readFileSync(path.join(process.cwd(), "secrets", `AuthKey_${KEY_ID}.p8`), "utf8");
const apply = process.argv.includes("--apply");
const b64 = (v) => Buffer.from(v).toString("base64url");
function token() {
  const now = Math.floor(Date.now() / 1000);
  const u = `${b64(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }))}.${b64(JSON.stringify({ iss: ISSUER_ID, iat: now, exp: now + 900, aud: "appstoreconnect-v1" }))}`;
  const s = crypto.createSign("SHA256"); s.update(u); s.end();
  return `${u}.${b64(s.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }))}`;
}
export async function req(ep, method = "GET", body) {
  const r = await fetch(`${API}${ep}`, { method, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const raw = await r.text(); const j = raw ? JSON.parse(raw) : null;
  if (!r.ok) throw new Error(`${method} ${ep}: ${r.status} ${JSON.stringify(j?.errors ?? j)}`);
  return j;
}
const versions = await req(`/apps/${APP_ID}/appStoreVersions?limit=10&include=build`);
for (const v of versions.data) {
  const bid = v.relationships?.build?.data?.id;
  const b = versions.included?.find((x) => x.id === bid);
  console.log(`version ${v.attributes.versionString} [${v.id}] state=${v.attributes.appStoreState} build=${b?.attributes?.version ?? "none"}`);
}
const subs = await req(`/apps/${APP_ID}/reviewSubmissions?limit=10`);
for (const s of subs.data) console.log(`submission ${s.id} state=${s.attributes.state} submitted=${s.attributes.submittedDate}`);
const builds = await req(`/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=6`);
for (const b of builds.data) console.log(`build ${b.attributes.version} [${b.id}] ${b.attributes.processingState} encryptionSet=${b.attributes.usesNonExemptEncryption} expired=${b.attributes.expired}`);

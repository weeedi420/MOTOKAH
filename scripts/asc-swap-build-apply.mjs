// Cancel the waiting review submission, attach build 35 to version 1.0, resubmit.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const API = "https://api.appstoreconnect.apple.com/v1";
const APP_ID = "6814840993", KEY_ID = "9GQSUWV935", ISSUER_ID = "bc8e67e1-9146-489f-8e26-54c56226ff1f";
const VERSION_ID = "afbfa4be-3762-461c-ad43-4d77766b2313", SUB_ID = "b970dfcb-49f2-4b64-b70c-1093109947ab", BUILD_ID = "74d61a0e-2c1f-4830-8484-c123effd0420";
const privateKey = fs.readFileSync(path.join(process.cwd(), "secrets", `AuthKey_${KEY_ID}.p8`), "utf8");
const b64 = (v) => Buffer.from(v).toString("base64url");
function token() { const now = Math.floor(Date.now() / 1000); const u = `${b64(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }))}.${b64(JSON.stringify({ iss: ISSUER_ID, iat: now, exp: now + 900, aud: "appstoreconnect-v1" }))}`; const s = crypto.createSign("SHA256"); s.update(u); s.end(); return `${u}.${b64(s.sign({ key: privateKey, dsaEncoding: "ieee-p1363" }))}`; }
async function req(ep, method = "GET", body) { const r = await fetch(`${API}${ep}`, { method, headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); const raw = await r.text(); const j = raw ? JSON.parse(raw) : null; if (!r.ok) throw new Error(`${method} ${ep}: ${r.status} ${JSON.stringify(j?.errors ?? j)}`); return j; }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const sub = await req(`/reviewSubmissions/${SUB_ID}`);
if (sub.data.attributes.state === "WAITING_FOR_REVIEW") {
  await req(`/reviewSubmissions/${SUB_ID}`, "PATCH", { data: { type: "reviewSubmissions", id: SUB_ID, attributes: { canceled: true } } });
  console.log("cancel requested");
}
for (let i = 0; i < 40; i++) {
  const v = await req(`/appStoreVersions/${VERSION_ID}`);
  const s = await req(`/reviewSubmissions/${SUB_ID}`);
  console.log(`  version=${v.data.attributes.appStoreState} submission=${s.data.attributes.state}`);
  if (!["WAITING_FOR_REVIEW", "IN_REVIEW"].includes(v.data.attributes.appStoreState) && s.data.attributes.state !== "CANCELING") break;
  await sleep(15000);
}
await req(`/appStoreVersions/${VERSION_ID}/relationships/build`, "PATCH", { data: { type: "builds", id: BUILD_ID } });
const attached = await req(`/appStoreVersions/${VERSION_ID}/build`);
if (attached.data?.id !== BUILD_ID) throw new Error("build 35 did not attach");
console.log("build 35 attached:", attached.data.attributes.version);

const created = await req(`/reviewSubmissions`, "POST", { data: { type: "reviewSubmissions", attributes: { platform: "IOS" }, relationships: { app: { data: { type: "apps", id: APP_ID } } } } });
const newId = created.data.id;
await req(`/reviewSubmissionItems`, "POST", { data: { type: "reviewSubmissionItems", relationships: { reviewSubmission: { data: { type: "reviewSubmissions", id: newId } }, appStoreVersion: { data: { type: "appStoreVersions", id: VERSION_ID } } } } });
await req(`/reviewSubmissions/${newId}`, "PATCH", { data: { type: "reviewSubmissions", id: newId, attributes: { submitted: true } } });
const fin = await req(`/reviewSubmissions/${newId}`);
const v = await req(`/appStoreVersions/${VERSION_ID}`);
console.log(`new submission ${newId} state=${fin.data.attributes.state}; version state=${v.data.attributes.appStoreState}`);

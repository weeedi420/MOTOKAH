const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const showroomDir = path.join(root, "src", "data", "showrooms");
const blockedShowrooms = new Set(["servemarinekenya", "ukajapantz", "twenderide", "toyota.tanzania"]);

const brands = [
  "toyota", "nissan", "subaru", "mazda", "honda", "mitsubishi", "bmw", "mercedes", "mercedes-benz",
  "benz", "audi", "land rover", "range rover", "lexus", "suzuki", "hyundai", "kia", "isuzu",
  "ford", "volkswagen", "vw", "jeep", "jaguar", "porsche", "yamaha", "bajaj", "tvs", "ktm",
  "piaggio", "vespa", "ducati", "royal enfield", "volvo", "peugeot", "renault", "fiat"
];

function cleanText(value) {
  return String(value || "")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[*#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasUsablePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 9) return false;
  if (/^(?:254|255)?700000000$/.test(digits)) return false;
  return true;
}

function parsePrice(caption) {
  const lines = String(caption || "").split(/\n+/).map(cleanText).filter(Boolean);
  for (const line of lines) {
    const match =
      line.match(/(?:asking\s+(?:only|price|for)?|ask(?:ing)?\s+price|price|bei)\s*[:/;-]?\s*(?:(?:TZS|TSh|KES|KSh|KSH|UGX|USh|RWF|RF|ETB|USD)\s*)?([\d,.]+(?:\s+\d)?\s*(?:M|m|MLN|mln|Mil(?:ion|lion)|million|milion)?)/i) ||
      line.match(/(?:TZS|TSh|KES|KSh|KSH|UGX|USh|RWF|RF|ETB|USD)\s*([\d,.]+(?:\s+\d)?\s*(?:M|m|MLN|mln|Mil(?:ion|lion)|million|milion)?)/i) ||
      line.match(/([\d,.]+(?:\s+\d)?\s*(?:M|m|MLN|mln|Mil(?:ion|lion)|million|milion)?)\s*(?:TZS|TSh|KES|KSh|KSH|UGX|USh|RWF|RF|ETB|USD)/i) ||
      line.match(/([\d,.]+(?:\s+\d)?)\s*(?:m|mln|million|milion)\b/i);
    if (match && /\d/.test(match[1])) return match[1];
  }
  return "";
}

function parseIdentity(caption) {
  const lines = String(caption || "").split(/\n+/).map(cleanText).filter(Boolean);
  const text = lines.join(" ");
  const year = Number((text.match(/\b(19[89]\d|20[012]\d)\b/) || [])[1] || 0);
  for (const rawBrand of brands) {
    const brand = rawBrand.toLowerCase();
    const brandPattern = new RegExp(`(^|\\b)${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\b|$)`, "i");
    const line = lines.find((candidate) => brandPattern.test(candidate));
    if (!line) continue;
    const match = line.match(brandPattern);
    const start = (match?.index || 0) + (match?.[1]?.length || 0);
    const tail = line.slice(start + rawBrand.length)
      .replace(/\b(19|20)\d{2}\b/g, "")
      .replace(/\b(?:asking\s+)?(?:price|bei)\b.*$/i, "")
      .replace(/\b(?:TZS|TSh|KES|KSh|KSH|UGX|USh|RWF|RF|ETB|USD)\s*[\d,.]+.*$/i, "")
      .replace(/\b(?:contact|call|whatsapp|dm|inbox)\b.*$/i, "")
      .replace(/[|,;].*$/, "")
      .trim();
    return {
      make: rawBrand.replace(/\b\w/g, (c) => c.toUpperCase()),
      model: tail,
      year,
      title: cleanText(`${year || ""} ${rawBrand} ${tail}`).replace(/\b\w/g, (c) => c.toUpperCase()).trim(),
    };
  }
  return { make: "", model: "", year, title: cleanText(lines[0] || "") };
}

function rejectionReasons({ dealer, post, identity, price }) {
  const title = identity.title || "";
  const reasons = [];
  if (blockedShowrooms.has(dealer.username)) reasons.push("blocked dealer");
  if (!hasUsablePhone(dealer.phone)) reasons.push("missing dealer phone");
  if (post.is_video) reasons.push("video post");
  if (!price) reasons.push("missing parsed price");
  if (!identity.make || !identity.model || !identity.year) reasons.push("weak vehicle identity");
  if (identity.year && (identity.year < 1990 || identity.year > new Date().getFullYear() + 1)) reasons.push("invalid year");
  if (title.length < 10 || title.length > 90) reasons.push("bad title length");
  if (/\b(ask|asking|price|bei|whatsapp|contact|call|dm|inbox|official|follow|subscribe|sold|reserved)\b/i.test(title)) reasons.push("junk title words");
  if (!Array.isArray(post.images) || post.images.filter(Boolean).length < 2) reasons.push("not enough images");
  if (cleanText(post.caption).length < 40) reasons.push("thin description");
  return reasons;
}

const accepted = [];
const rejected = [];
const needsPhone = new Map();
const callForQuote = new Map();

for (const file of fs.readdirSync(showroomDir).filter((name) => name.endsWith(".json"))) {
  const username = path.basename(file, ".json");
  const dealer = JSON.parse(fs.readFileSync(path.join(showroomDir, file), "utf8"));
  dealer.username = dealer.username || username;

  for (const post of dealer.posts || []) {
    const identity = parseIdentity(post.caption);
    const price = parsePrice(post.caption);
    const reasons = rejectionReasons({ dealer, post, identity, price });
    const row = {
      dealer: dealer.full_name || username,
      username,
      shortcode: post.shortcode,
      title: identity.title,
      price,
      url: post.url,
      reasons,
    };

    if (reasons.length === 0) {
      accepted.push(row);
    } else {
      rejected.push(row);
      const onlyPhoneMissing = reasons.every((reason) => reason === "missing dealer phone");
      if (onlyPhoneMissing) {
        if (!needsPhone.has(username)) needsPhone.set(username, { dealer: row.dealer, username, count: 0, examples: [] });
        const entry = needsPhone.get(username);
        entry.count += 1;
        if (entry.examples.length < 3) entry.examples.push(row.title);
      }
      const quoteReasons = new Set(["missing parsed price"]);
      const canQuote = reasons.every((reason) => quoteReasons.has(reason) || reason === "missing dealer phone");
      if (canQuote && identity.make && identity.model && identity.year && post.images?.length >= 2) {
        if (!callForQuote.has(username)) callForQuote.set(username, { dealer: row.dealer, username, count: 0, examples: [] });
        const entry = callForQuote.get(username);
        entry.count += 1;
        if (entry.examples.length < 3) entry.examples.push(row.title);
      }
    }
  }
}

const topRejectReasons = rejected.reduce((acc, row) => {
  for (const reason of row.reasons) acc[reason] = (acc[reason] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  totals: {
    acceptedListings: accepted.length,
    rejectedPosts: rejected.length,
    dealersAccepted: new Set(accepted.map((row) => row.username)).size,
    dealersNeedPhone: needsPhone.size,
    dealersNeedQuoteCalls: callForQuote.size,
  },
  acceptedDealers: Object.values(accepted.reduce((acc, row) => {
    acc[row.username] ||= { dealer: row.dealer, username: row.username, count: 0, examples: [] };
    acc[row.username].count += 1;
    if (acc[row.username].examples.length < 5) acc[row.username].examples.push(row.title);
    return acc;
  }, {})).sort((a, b) => b.count - a.count),
  needsPhone: Array.from(needsPhone.values()).sort((a, b) => b.count - a.count),
  callForQuote: Array.from(callForQuote.values()).sort((a, b) => b.count - a.count),
  topRejectReasons,
  sampleRejected: rejected.slice(0, 50),
}, null, 2));

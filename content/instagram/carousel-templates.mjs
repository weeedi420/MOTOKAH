/**
 * Carousel slide templates — 1080×1350 (4:5), critical content in center 1080×1080 safe zone.
 * Each function returns an array of HTML strings (one per slide).
 */

const BASE = `
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,Arial,sans-serif}
.frame{width:1080px;height:1350px;position:relative;overflow:hidden;color:#fff}
.safe{position:absolute;left:0;right:0;top:135px;height:1080px;display:flex;flex-direction:column}
`;

const BG_BLUE  = 'background:linear-gradient(145deg,#0077ee 0%,#0055bb 55%,#003d8f 100%)';
const BG_DARK  = 'background:linear-gradient(145deg,#030A16 0%,#0a1628 60%,#091222 100%)';
const BG_NAVY  = 'background:#0a1628';
const ORANGE   = '#f5a623';
const BLUE     = '#0066cc';

const logo = `<div style="font-size:42px;font-weight:900;letter-spacing:-1px;line-height:1">Motokah<span style="display:inline-block;width:10px;height:10px;background:${ORANGE};border-radius:50%;margin-left:3px;vertical-align:6px"></span></div>`;

const topbar = (tag, bg='rgba(255,255,255,.15)', color='#fff') =>
  `<div style="display:flex;align-items:center;justify-content:space-between;padding:0 60px;height:90px;flex-shrink:0">
    ${logo}
    <div style="background:${bg};border:1px solid rgba(255,255,255,.2);color:${color};font-size:18px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:8px 22px;border-radius:999px">${tag}</div>
  </div>`;

const bottom = (left='@motokahafrica', right='motokah.com') =>
  `<div style="display:flex;align-items:center;justify-content:space-between;padding:0 60px;height:90px;flex-shrink:0;border-top:2px solid rgba(255,255,255,.15);margin-top:auto">
    <div style="font-size:28px;font-weight:800">${left}</div>
    <div style="font-size:21px;color:rgba(255,255,255,.5)">${right}</div>
  </div>`;

const slideNum = (n, total) =>
  `<div style="position:absolute;top:148px;right:60px;font-size:18px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:2px;z-index:10">${n} / ${total}</div>`;

// ── fake UI components ────────────────────────────────────────

function fakeBrowser(content) {
  return `<div style="background:#1a2744;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,30,.7);margin:0 60px">
    <div style="background:#0d1b35;padding:14px 20px;display:flex;align-items:center;gap:10px">
      <div style="display:flex;gap:6px">
        <div style="width:12px;height:12px;border-radius:50%;background:#ff5f57"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#febc2e"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:#28c840"></div>
      </div>
      <div style="flex:1;background:#0a1628;border-radius:6px;padding:6px 16px;font-size:14px;color:rgba(255,255,255,.4)">motokah.com</div>
    </div>
    <div style="padding:24px 28px">${content}</div>
  </div>`;
}

function fakePhone(content) {
  return `<div style="background:#0d1b35;border-radius:32px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,30,.7);width:320px;margin:0 auto;border:2px solid rgba(255,255,255,.1)">
    <div style="background:#0a1628;padding:10px 20px;display:flex;justify-content:center">
      <div style="width:80px;height:5px;background:rgba(255,255,255,.2);border-radius:99px"></div>
    </div>
    <div style="padding:16px">${content}</div>
    <div style="background:#0a1628;padding:10px 20px;display:flex;justify-content:center">
      <div style="width:40px;height:5px;background:rgba(255,255,255,.2);border-radius:99px"></div>
    </div>
  </div>`;
}

function searchBar(value='Toyota, Nairobi') {
  return `<div style="background:#0a1628;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.3)"></div>
    <div style="font-size:16px;color:rgba(255,255,255,.6)">${value}</div>
    <div style="margin-left:auto;background:${BLUE};border-radius:6px;padding:6px 14px;font-size:13px;font-weight:700">Search</div>
  </div>`;
}

function filterChip(label, active=false) {
  return `<div style="display:inline-flex;align-items:center;background:${active?BLUE:'rgba(255,255,255,.08)'};border:1px solid ${active?BLUE:'rgba(255,255,255,.15)'};border-radius:999px;padding:8px 16px;font-size:14px;font-weight:600;margin:4px">${label}</div>`;
}

function carCard(title, price, city, year) {
  return `<div style="background:rgba(255,255,255,.07);border-radius:10px;overflow:hidden;margin-bottom:10px">
    <div style="height:80px;background:linear-gradient(135deg,#1a3a6e,#0d2040);display:flex;align-items:center;justify-content:center">
      <div style="width:60px;height:30px;background:rgba(255,255,255,.1);border-radius:4px"></div>
    </div>
    <div style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:700;color:#fff">${title}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5)">${city} · ${year}</div>
      </div>
      <div style="font-size:13px;font-weight:900;color:${BLUE}">${price}</div>
    </div>
  </div>`;
}

function chatBubble(text, sender=true) {
  return `<div style="display:flex;justify-content:${sender?'flex-end':'flex-start'};margin-bottom:8px">
    <div style="max-width:80%;background:${sender?BLUE:'rgba(255,255,255,.1)'};border-radius:${sender?'14px 14px 4px 14px':'14px 14px 14px 4px'};padding:10px 14px;font-size:13px;line-height:1.4;color:#fff">${text}</div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
//  CAROUSEL 1: Grand Reveal — "The Future of Car Buying"
// ─────────────────────────────────────────────────────────────
export function carousel1() {
  const TOTAL = 4;
  return [

    // Slide 1 — Cover
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:700px;height:700px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,102,204,.4) 0%,transparent 70%);
      top:50%;left:50%;transform:translate(-50%,-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(1,TOTAL)}
      <div class="safe" style="align-items:center;justify-content:space-between;padding:0 60px">
        ${topbar('GRAND REVEAL')}
        <div style="text-align:center;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px">
          <div style="font-size:22px;font-weight:700;letter-spacing:6px;color:rgba(255,255,255,.5);text-transform:uppercase">Introducing</div>
          <div style="font-size:110px;font-weight:900;letter-spacing:-4px;line-height:.95;text-align:center">The Future<br>of Car<br>Buying</div>
          <div style="font-size:26px;color:rgba(255,255,255,.65);letter-spacing:2px">IN AFRICA</div>
          <div style="width:60px;height:4px;background:${ORANGE};border-radius:4px"></div>
          <div style="font-size:24px;color:rgba(255,255,255,.5)">Swipe to see how &rarr;</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 2 — The Problem
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    </style></head><body><div class="frame">
      ${slideNum(2,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('THE PROBLEM')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:36px">
          <div style="font-size:56px;font-weight:900;line-height:1.05;color:#fff">Buying a car<br>in East Africa<br>used to mean...</div>
          <div style="display:flex;flex-direction:column;gap:16px">
            ${['Unverified sellers with fake photos','Prices that change after you travel far','No way to compare across cities','Zero buyer protection or recourse'].map(t=>
              `<div style="display:flex;align-items:center;gap:18px;background:rgba(255,80,80,.1);border:1px solid rgba(255,80,80,.25);border-radius:12px;padding:18px 22px">
                <div style="width:8px;height:8px;border-radius:50%;background:#ff5050;flex-shrink:0"></div>
                <div style="font-size:26px;color:rgba(255,255,255,.85)">${t}</div>
              </div>`).join('')}
          </div>
        </div>
        ${bottom('We built the fix.','Swipe &rarr;')}
      </div>
    </div></body></html>`,

    // Slide 3 — The Solution (UI mockup)
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_NAVY}}
    </style></head><body><div class="frame">
      ${slideNum(3,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('THE SOLUTION')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div style="font-size:58px;font-weight:900;line-height:1.05">Introducing<br><span style="color:${ORANGE}">Motokah.</span></div>
          <div style="font-size:27px;color:rgba(255,255,255,.7);line-height:1.5">Verified listings. Real prices.<br>Buyers and sellers across East Africa — one platform.</div>
          ${fakeBrowser(`
            ${searchBar('Toyota Land Cruiser, Nairobi')}
            <div style="display:flex;flex-wrap:wrap;gap:0;margin-bottom:12px">
              ${filterChip('Kenya',true)}${filterChip('Under KES 2M')}${filterChip('2015+')}${filterChip('SUV',true)}
            </div>
            ${carCard('Toyota Prado 2017','KES 4.2M','Nairobi','2017')}
            ${carCard('Land Cruiser V8','KES 8.5M','Mombasa','2016')}
          `)}
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 4 — CTA
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:500px;height:500px;border-radius:50%;
      background:radial-gradient(circle,rgba(245,166,35,.15) 0%,transparent 70%);
      bottom:200px;left:50%;transform:translateX(-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(4,TOTAL)}
      <div class="safe" style="align-items:center;justify-content:space-between;padding:0 60px">
        ${topbar('MOTOKAH')}
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center">
          <div style="font-size:90px;font-weight:900;line-height:1;letter-spacing:-3px">Your Next<br>Ride Awaits</div>
          <div style="font-size:28px;color:rgba(255,255,255,.65);line-height:1.5">Kenya · Tanzania · Uganda<br>Rwanda · Ethiopia</div>
          <div style="background:${BLUE};border-radius:16px;padding:22px 60px;font-size:30px;font-weight:800;letter-spacing:1px">
            motokah.com
          </div>
          <div style="font-size:24px;color:rgba(255,255,255,.5)">Link in bio</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,
  ];
}

// ─────────────────────────────────────────────────────────────
//  CAROUSEL 2: Feature Showcase
// ─────────────────────────────────────────────────────────────
export function carousel2() {
  const TOTAL = 5;
  return [

    // Slide 1 — Cover
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,102,204,.35) 0%,transparent 70%);
      top:300px;left:50%;transform:translateX(-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(1,TOTAL)}
      <div class="safe" style="padding:0 60px;justify-content:space-between">
        ${topbar('FEATURES')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div style="font-size:24px;font-weight:700;letter-spacing:5px;color:rgba(255,255,255,.5);text-transform:uppercase">Inside the Platform</div>
          <div style="font-size:88px;font-weight:900;line-height:1;letter-spacing:-3px">Africa's<br>Smartest<br>Car Market</div>
          <div style="font-size:26px;color:rgba(255,255,255,.6);line-height:1.5">3 features that change<br>how East Africa buys cars.</div>
          <div style="font-size:23px;color:rgba(255,255,255,.4)">Swipe to explore &rarr;</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 2 — Smart Filtering
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_NAVY}}
    </style></head><body><div class="frame">
      ${slideNum(2,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('FEATURE 01')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;margin-bottom:12px">Smart Filtering</div>
            <div style="font-size:62px;font-weight:900;line-height:1.05">Find exactly<br>what you want.</div>
          </div>
          ${fakeBrowser(`
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Filter by</div>
            <div style="display:flex;flex-wrap:wrap">
              ${filterChip('Country',true)}${filterChip('Budget',true)}${filterChip('Make')}${filterChip('Year')}${filterChip('Body Type')}${filterChip('Fuel')}${filterChip('Transmission')}${filterChip('Condition',true)}
            </div>
            <div style="margin-top:14px;background:rgba(255,255,255,.08);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:14px;color:rgba(255,255,255,.7)">Results</div>
              <div style="font-size:20px;font-weight:900;color:${BLUE}">1,247 cars</div>
            </div>
          `)}
          <div style="font-size:25px;color:rgba(255,255,255,.65);line-height:1.5">Filter by country, budget, make, year, fuel type — no noise, just your car.</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 3 — Transparent Pricing
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    </style></head><body><div class="frame">
      ${slideNum(3,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('FEATURE 02')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;margin-bottom:12px">Transparent Pricing</div>
            <div style="font-size:62px;font-weight:900;line-height:1.05">No hidden<br>surprises.</div>
          </div>
          <div style="background:#0d1b35;border-radius:16px;padding:24px 28px;display:flex;flex-direction:column;gap:12px;margin:0 0">
            <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Toyota Land Cruiser 200 · 2018</div>
            ${[['Asking Price','KES 8,500,000','#fff'],['Import Duty (est.)','KES 1,200,000','rgba(255,255,255,.6)'],['Registration','KES 45,000','rgba(255,255,255,.6)'],['Total Cost','KES 9,745,000',ORANGE]].map(([l,v,c])=>
              `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)">
                <div style="font-size:18px;color:rgba(255,255,255,.65)">${l}</div>
                <div style="font-size:20px;font-weight:800;color:${c}">${v}</div>
              </div>`).join('')}
          </div>
          <div style="font-size:25px;color:rgba(255,255,255,.65);line-height:1.5">See asking price, estimated import duty and total landed cost — before you contact the seller.</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 4 — Instant Chat
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_NAVY}}
    </style></head><body><div class="frame">
      ${slideNum(4,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('FEATURE 03')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;margin-bottom:12px">Instant Seller Chat</div>
            <div style="font-size:62px;font-weight:900;line-height:1.05">Talk directly.<br>No brokers.</div>
          </div>
          ${fakePhone(`
            <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4);text-align:center;margin-bottom:12px;letter-spacing:1px">Toyota Prado 2017 — KES 4.2M</div>
            ${chatBubble('Is this still available?',true)}
            ${chatBubble('Yes, come view anytime in Westlands.',false)}
            ${chatBubble('Can you do 4M? Cash today.',true)}
            ${chatBubble('I can do 4.1M, final price.',false)}
            <div style="background:rgba(255,255,255,.07);border-radius:10px;padding:10px 14px;display:flex;gap:10px;margin-top:6px">
              <div style="flex:1;font-size:13px;color:rgba(255,255,255,.35)">Type a message...</div>
              <div style="background:${BLUE};border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700">Send</div>
            </div>
          `)}
          <div style="font-size:25px;color:rgba(255,255,255,.65);line-height:1.5">Message sellers directly. Negotiate. Agree a price. No middlemen.</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 5 — CTA
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,102,204,.3) 0%,transparent 70%);
      top:50%;left:50%;transform:translate(-50%,-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(5,TOTAL)}
      <div class="safe" style="padding:0 60px;justify-content:space-between">
        ${topbar('MOTOKAH')}
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;text-align:center">
          <div style="font-size:78px;font-weight:900;line-height:1;letter-spacing:-2px">Which feature<br>excited you<br>most?</div>
          <div style="display:flex;flex-direction:column;gap:12px;width:100%">
            ${[['01','Smart Filtering'],['02','Transparent Pricing'],['03','Instant Seller Chat']].map(([n,t])=>
              `<div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:18px 24px">
                <div style="font-size:18px;font-weight:700;color:${ORANGE}">${n}</div>
                <div style="font-size:24px;font-weight:600">${t}</div>
              </div>`).join('')}
          </div>
          <div style="font-size:22px;color:rgba(255,255,255,.5)">Drop your answer in the comments</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,
  ];
}

// ─────────────────────────────────────────────────────────────
//  CAROUSEL 3: Desktop vs Mobile
// ─────────────────────────────────────────────────────────────
export function carousel3() {
  const TOTAL = 5;
  return [

    // Slide 1 — Cover
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:700px;height:700px;border-radius:50%;
      background:radial-gradient(circle,rgba(0,102,204,.3) 0%,transparent 70%);
      top:50%;left:50%;transform:translate(-50%,-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(1,TOTAL)}
      <div class="safe" style="padding:0 60px;justify-content:space-between">
        ${topbar('UX')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px">
          <div style="font-size:22px;font-weight:700;letter-spacing:5px;color:rgba(255,255,255,.5);text-transform:uppercase">The Experience</div>
          <div style="font-size:86px;font-weight:900;line-height:1;letter-spacing:-3px">Desktop<br>to Pocket.<br>Seamless.</div>
          <div style="font-size:26px;color:rgba(255,255,255,.6);line-height:1.5">Same power, optimised for your screen — wherever you are in East Africa.</div>
          <div style="font-size:22px;color:rgba(255,255,255,.4)">Swipe to compare &rarr;</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 2 — Desktop UX
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_NAVY}}
    </style></head><body><div class="frame">
      ${slideNum(2,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('DESKTOP')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px">
          <div style="font-size:52px;font-weight:900;line-height:1.05">Full power<br>on the web.</div>
          ${fakeBrowser(`
            <div style="display:grid;grid-template-columns:200px 1fr;gap:16px">
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">Filters</div>
                ${['Country','Budget','Make','Year','Body Type','Fuel'].map(f=>`<div style="background:rgba(255,255,255,.07);border-radius:6px;padding:8px 10px;font-size:12px;color:rgba(255,255,255,.6)">${f}</div>`).join('')}
              </div>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${carCard('Toyota Prado TX','KES 4.2M','Nairobi','2017')}
                ${carCard('Subaru Forester','KES 1.1M','Nairobi','2011')}
                ${carCard('Land Cruiser V8','KES 8.5M','Mombasa','2016')}
              </div>
            </div>
          `)}
          <div style="font-size:25px;color:rgba(255,255,255,.65);line-height:1.5">Side-by-side filters and results. Compare cars fast. No clutter.</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 3 — Mobile UX
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    </style></head><body><div class="frame">
      ${slideNum(3,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('MOBILE')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:24px">
          <div style="font-size:52px;font-weight:900;line-height:1.05">Optimised<br>for your phone.</div>
          <div style="display:flex;justify-content:center">
            ${fakePhone(`
              ${searchBar('Search cars...')}
              ${carCard('Toyota Fielder','TZS 22M','Dar es Salaam','2014')}
              ${carCard('Nissan X-Trail','TZS 28M','Arusha','2013')}
              ${carCard('Honda CRV','TZS 35M','Zanzibar','2015')}
              <div style="background:${BLUE};border-radius:10px;padding:12px;text-align:center;font-size:14px;font-weight:700;margin-top:6px">Load More</div>
            `)}
          </div>
          <div style="font-size:25px;color:rgba(255,255,255,.65);line-height:1.5">Designed for mobile-first East Africa. Fast, clean, touch-friendly.</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 4 — Low Data
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_NAVY}}
    </style></head><body><div class="frame">
      ${slideNum(4,TOTAL)}
      <div class="safe" style="padding:0 60px">
        ${topbar('PERFORMANCE')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:36px">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:4px;color:${ORANGE};text-transform:uppercase;margin-bottom:16px">Built for East Africa</div>
            <div style="font-size:72px;font-weight:900;line-height:1">Speed and<br>low data.<br>By design.</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            ${[
              ['Fast load on 3G and 4G networks','All networks'],
              ['Compressed images — save your data','Less data'],
              ['Works on older Android devices','All devices'],
              ['Swahili, English — your language','Your language'],
            ].map(([t,tag])=>
              `<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.07);border-radius:12px;padding:16px 22px">
                <div style="font-size:24px;color:rgba(255,255,255,.85)">${t}</div>
                <div style="background:rgba(0,102,204,.3);border:1px solid ${BLUE};border-radius:999px;padding:5px 14px;font-size:14px;font-weight:700;color:${BLUE};white-space:nowrap;margin-left:12px">${tag}</div>
              </div>`).join('')}
          </div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,

    // Slide 5 — CTA
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
    .frame{${BG_DARK}}
    .glow{position:absolute;width:500px;height:500px;border-radius:50%;
      background:radial-gradient(circle,rgba(245,166,35,.12) 0%,transparent 70%);
      bottom:200px;left:50%;transform:translateX(-50%)}
    </style></head><body><div class="frame">
      <div class="glow"></div>
      ${slideNum(5,TOTAL)}
      <div class="safe" style="padding:0 60px;justify-content:space-between">
        ${topbar('MOTOKAH')}
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;text-align:center">
          <div style="font-size:88px;font-weight:900;line-height:1;letter-spacing:-3px">Try It<br>Right Now</div>
          <div style="font-size:28px;color:rgba(255,255,255,.6);line-height:1.5">Browse cars across East Africa<br>on any device, any network.</div>
          <div style="background:${BLUE};border-radius:16px;padding:22px 60px;font-size:30px;font-weight:800">motokah.com</div>
          <div style="font-size:24px;color:rgba(255,255,255,.45)">Link in bio</div>
        </div>
        ${bottom()}
      </div>
    </div></body></html>`,
  ];
}

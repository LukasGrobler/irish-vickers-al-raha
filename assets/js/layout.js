/* Shared layout for The Irish Vicker's sites. Runs at the very top of <body> so the
   header, age check and the harp intro exist before the page paints (no flash). The footer
   is mounted by app.js once the page content has loaded. Content comes from data.js. */
(function () {
  /* ---------------- the harp, drawn as a vector so it stays sharp at any size ---------------- */
  function r1(n) { return Math.round(n * 10) / 10; }
  var STRINGS = "";
  for (var si = 0; si < 8; si++) {
    var yb = 210 - si * 18.5, xb = 206 - 0.4667 * (yb - 42), xt = xb + 6, yt = 62 - 0.264 * (xt - 84) + 3;
    STRINGS += '<path class="h-string" pathLength="1" data-x1="' + r1(xt) + '" data-y1="' + r1(yt) + '" data-x2="' + r1(xb) + '" data-y2="' + r1(yb) + '" d="M' + r1(xt) + " " + r1(yt) + " Q" + r1((xt + xb) / 2) + " " + r1((yt + yb) / 2) + " " + r1(xb) + " " + r1(yb) + '"/>';
  }
  var HEART = "M0 0C-2-3-9-6-9-11C-9-15-4-17 0-13C4-17 9-15 9-11C9-6 2-3 0 0Z";
  var SHAM = '<g class="h-sham" transform="translate(112 84) scale(.82)"><g class="h-sham__in">' +
    [0, 120, 240].map(function (a) { return '<path d="' + HEART + '" transform="rotate(' + a + ')"/>'; }).join("") +
    '<path class="h-sham__stem" d="M0 0Q3 7 8 11"/></g></g>';
  var FRAME = "M46 38C110 50 170 46 228 24C190 48 140 58 84 62C86 116 102 172 124 222L112 227C82 172 60 110 46 38Z";
  function harp(cls, id) {
    var g = "hg-" + id;
    return '<svg class="harp ' + (cls || "") + '" viewBox="30 14 210 238" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6c48a"/><stop offset=".55" stop-color="#e39a55"/><stop offset="1" stop-color="#c9773a"/></linearGradient></defs>' +
      '<g class="h-strings">' + STRINGS + "</g>" +
      '<path class="h-board" pathLength="1" d="M207 41L123 221"/>' +
      '<path class="h-board h-board--thin" pathLength="1" d="M216 37L132 217"/>' +
      '<path class="h-frame" pathLength="1" d="' + FRAME + '" fill="url(#' + g + ')"/>' +
      '<path class="h-inlay" pathLength="1" d="M57 52C68 112 88 170 117 219"/>' +
      '<g class="h-base"><rect x="96" y="226" width="46" height="7" rx="2"/><rect x="88" y="236" width="62" height="9" rx="2"/></g>' +
      SHAM + "</svg>";
  }
  window.TIV_HARP = harp;

  var D = window.ABK_DATA, V = D.venue, KEY = D.key;
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file.indexOf(".html") === -1) file = "index.html";
  var isHome = file === "index.html";
  if (isHome) { document.documentElement.classList.add("pre-hero"); setTimeout(function () { document.documentElement.classList.remove("pre-hero"); }, 2500); }
  document.documentElement.classList.add("t-" + D.theme);

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function ss(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) {
    var m = typeof t === "number" ? t : toMin(t);
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + ap;
  }
  /* "Mon – Fri 12PM – 4AM, Sat – Sun 9AM – 4AM": groups days that share the same hours */
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], WEEK = [1, 2, 3, 4, 5, 6, 0];
  function hoursSummary(map, sep) {
    var groups = [];
    WEEK.forEach(function (d) {
      var h = map[d], key = h ? h[0] + "-" + h[1] : "x", g = groups[groups.length - 1];
      if (g && g.key === key) g.days.push(d); else groups.push({ key: key, days: [d], h: h });
    });
    return groups.filter(function (g) { return g.h; }).map(function (g) {
      var a = DAY3[g.days[0]], z = DAY3[g.days[g.days.length - 1]];
      return (g.days.length === 7 ? "Daily" : g.days.length > 1 ? a + " – " + z : a) + " " + fmt(g.h[0]) + " – " + fmt(g.h[1]);
    }).join(sep || ", ");
  }

  var I = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    group: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 4.8"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l2-6h14l2 6v5H3z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h7l1 2h6v8h-7l-1-2H5"/></svg>',
    kid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5.5" r="2.5"/><path d="M12 8v7M8 11l4-2 4 2M9.5 21l2.5-6 2.5 6"/></svg>',
    cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21h16v-8H4z"/><path d="M4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 4 0"/><path d="M8 13v-3M12 13v-3M16 13v-3M8 7v-.5M12 7v-.5M16 7v-.5"/></svg>',
    tap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3h4v5h-4z"/><path d="M6 8h12v3H6z"/><path d="M12 11v4M10 15h4l-1 3h-2z"/></svg>',
    lift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M7.5 10l1.5-2 1.5 2M13.5 14l1.5 2 1.5-2"/></svg>',
    bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="14" r="6.5"/><circle cx="7.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="10.5" cy="11" r=".9" fill="currentColor"/><circle cx="9.5" cy="14" r=".9" fill="currentColor"/><path d="M18 3c-1.2 0-2 1-2 2.3 0 1.1.6 1.6.6 2.6 0 1.5-1.3 2.5-1.3 5 0 3.3 1.3 6.6 2.7 7.6 1.4-1 2.7-4.3 2.7-7.6 0-2.5-1.3-3.5-1.3-5 0-1 .6-1.5.6-2.6C20 4 19.2 3 18 3z"/></svg>',
    golf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 20V3l8 3.5L8 10"/><ellipse cx="9" cy="20.5" rx="6" ry="1.5"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
    wine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10l-.5 5a4.5 4.5 0 0 1-9 0z"/><path d="M12 12.5V20M8 21h8M7.3 7h9.4"/></svg>',
    pool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 10.3v3.4"/></svg>',
    hop: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c-1.6-2.4-5.6-2.2-5.6.6 0 2.4 3.3 3 5.6-.6zm0 0c2.4-1.6 2.2-5.6-.6-5.6-2.4 0-3 3.3.6 5.6zm0 0c1.6 2.4 5.6 2.2 5.6-.6 0-2.4-3.3-3-5.6.6z"/><path d="M12 12c.5 3 1.8 5.4 4 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  var nav = D.nav, more = D.more, NAME = V.name;
  function cur(h) { return h === file ? ' aria-current="page"' : ""; }

  var waLink = V.whatsapp ? "https://wa.me/" + V.whatsapp + "?text=" + encodeURIComponent(V.greet + " ") : "https://wa.me/?text=" + encodeURIComponent(V.greet + " ");
  var callBtn = V.phone ? '<a class="btn btn--ghost" href="tel:' + V.phone + '">' + I.phone + " Call</a>" : '<a class="btn btn--ghost" href="find-us.html">' + I.pin + " Find us</a>";
  var wordmark = '<span class="brand__txt"><span class="brand__the">The Irish</span><span class="brand__name">Vicker\'s</span></span>';

  var header =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="hdr" id="hdr"><div class="wrap hdr__in">' +
    '<a class="brand" href="index.html" aria-label="' + esc(V.full) + ', home"><span class="brand__mark">' + harp("brand__harp", "hdr") + "</span>" + wordmark + '<span class="brand__sub">' + V.headerSub + "</span></a>" +
    '<nav class="nav" aria-label="Main">' +
    nav.map(function (n) { return '<a class="nav__a' + (n[2] ? " nav__a--opt" : "") + '" href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") +
    '<div class="nav__more"><button type="button" aria-expanded="false" aria-controls="moredrop">More ' + I.chev + '</button><div class="nav__drop" id="moredrop">' +
    more.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] ? ' class="opt"' : "") + cur(n[0]) + ">" + n[1] + "</a>"; }).join("") +
    "</div></div></nav>" +
    '<div class="hdr__cta"><span class="pill" data-open-pill><span class="pill__dot"></span><span data-open-text>' + hoursSummary(V.hours, " · ").split(" · ")[0] + '</span></span><a class="btn btn--sm" href="book.html">Book a table</a>' +
    '<button class="hdr__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><span></span></button></div>' +
    "</div></header>" +
    '<div class="mnav" id="mnav" role="dialog" aria-modal="true" aria-label="Menu"><div class="mnav__top"><a class="brand" href="index.html"><span class="brand__mark">' + harp("brand__harp", "mnav") + "</span>" + wordmark + '</a><button class="mnav__close" type="button" aria-label="Close menu">&times;</button></div>' +
    '<ul class="mnav__list">' +
    [["index.html", "Home"]].concat(nav, more.filter(function (m) { return !m[2]; })).map(function (n, i) {
      return '<li' + (i > 5 ? ' class="mnav__minor"' : "") + '><a href="' + n[0] + '"' + cur(n[0]) + ">" + n[1] + "</a></li>";
    }).join("") +
    "</ul>" +
    '<div class="mnav__foot"><a class="btn" href="book.html">Book a table</a><div class="btn-row" style="display:grid;grid-template-columns:1fr 1fr"><a class="btn btn--wa" href="' + waLink + '" target="_blank" rel="noopener">' + I.wa + " WhatsApp</a>" + callBtn + "</div></div></div>";

  /* 21+ check, remembered on this device */
  var skip = /[?&]skip\b/.test(location.search); /* preview mode for screenshots */
  var fresh = /[?&]fresh\b/.test(location.search); /* demo mode: show the age check and the intro again */
  if (fresh) { try { localStorage.removeItem("tiv_age_ok"); sessionStorage.removeItem(KEY + "_intro"); } catch (e) {} }
  var needGate = !skip && !/[?&]nogate\b/.test(location.search) && ls("tiv_age_ok") !== "1"; /* nogate: previews of the intro */
  var gate = needGate ?
    '<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-q"><div class="gate__card">' +
    harp("gate__harp", "gate") +
    '<p class="gate__irish">Fáilte</p>' +
    '<h2 class="gate__q" id="gate-q">Are you 21 or over?</h2>' +
    '<p class="gate__fine">This website features alcohol. In line with UAE law, you need to be 21 or over to drink.' + (D.gateExtra ? " " + D.gateExtra : "") + '</p>' +
    '<div class="btn-row" style="justify-content:center"><button class="btn" type="button" data-gate-yes>Yes, I\'m 21+</button><button class="btn btn--ghost" type="button" data-gate-no>Not yet</button></div>' +
    '<p class="gate__no" aria-live="polite"></p></div></div>' : "";

  /* the harp intro: homepage, once per visit (add ?intro to the address to see it again) */
  var forceIntro = /[?&]intro\b/.test(location.search);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var needIntro = isHome && !reduce && !skip && (forceIntro || ss(KEY + "_intro") !== "1");
  var intro = "";
  if (needIntro) {
    var letters = function (s) { return s.split("").map(function (c) { return '<span class="ch">' + (c === " " ? "&nbsp;" : esc(c)) + "</span>"; }).join(""); };
    intro =
      '<div class="intro intro--harp" id="intro" aria-hidden="true">' +
      '<div class="intro__dust"></div>' +
      '<div class="intro__stage">' +
      '<div class="intro__harpwrap">' + harp("intro__harp", "intro") + '<div class="intro__notes"></div></div>' +
      '<p class="intro__word"><span class="intro__the">' + letters("The Irish") + '</span><span class="intro__name">' + letters("Vicker's") + "</span></p>" +
      '<p class="intro__irish">' + esc(D.introIrish || "Céad míle fáilte") + "</p>" +
      '<p class="intro__en">' + esc(D.introEnglish || "A hundred thousand welcomes") + '<span class="intro__dot" aria-hidden="true"></span>' + esc(V.branch) + "</p>" +
      "</div>" +
      '<button class="intro__skip" type="button">Skip intro</button></div>';
  }

  if (needGate || needIntro) document.documentElement.classList.add("is-locked");
  if (needIntro) document.documentElement.classList.add("has-intro");

  var me = document.currentScript;
  me.insertAdjacentHTML("afterend", header + gate + intro);

  if (needGate) {
    var g = document.getElementById("gate");
    g.querySelector("[data-gate-yes]").addEventListener("click", function () {
      ls("tiv_age_ok", "1");
      g.classList.add("is-leaving");
      /* start the intro straight away, so it's already playing as the question fades */
      window.__abkEntered = true;
      window.dispatchEvent(new Event("abk:enter"));
      setTimeout(function () { g.remove(); }, 560);
    });
    g.querySelector("[data-gate-no]").addEventListener("click", function () {
      g.querySelector(".gate__no").textContent = D.gateNo;
    });
    setTimeout(function () { var y = g.querySelector("[data-gate-yes]"); if (y) y.focus(); }, 50);
  }

  /* footer + mobile action bar, mounted by app.js */
  function mountFooter() {
    if (document.querySelector(".ftr")) return;
    var year = new Date().getFullYear();
    var html =
      '<footer class="ftr"><div class="knot-rule" aria-hidden="true"></div><div class="wrap"><div class="ftr__grid">' +
      '<div class="ftr__brand"><a class="brand brand--foot" href="index.html"><span class="brand__mark">' + harp("brand__harp", "ftr") + "</span>" + wordmark + "</a><p>" + D.footerBlurb + "</p></div>" +
      '<div><h3>Visit</h3><address>' + V.address.join("<br>") + '</address><p class="small" style="margin-top:10px">' + hoursSummary(V.hours, "<br>") + "<br>" + V.footerNote + "</p></div>" +
      '<div><h3>Talk to us</h3><ul>' + (V.phone ? '<li><a href="tel:' + V.phone + '">' + V.phoneDisplay + "</a></li>" : "") + '<li><a href="' + waLink + '" target="_blank" rel="noopener">WhatsApp us</a></li>' + (V.instagram ? '<li><a href="' + V.instagram + '" target="_blank" rel="noopener">Instagram ' + V.handle + "</a></li>" : "") + '<li><a href="book.html">Book a table</a></li></ul></div>' +
      '<div class="ftr__explore"><h3>Explore</h3><ul>' + D.explore.map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul></div>" +
      "</div>" +
      '<p class="ftr__family">' + D.siblings + "</p>" +
      '<div class="ftr__base"><span>&copy; ' + year + " " + esc(V.full) + ". Please drink responsibly. Over-21s only.</span>" +
      (isHome ? '<a href="index.html?intro">' + D.replayLabel + "</a>" : "") +
      '<span class="ftr__credit">Website by Lukas Grobler</span></div>' +
      "</div></footer>" +
      '<nav class="actbar" aria-label="Quick actions">' + (V.phone ? '<a href="tel:' + V.phone + '">' + I.phone + " Call</a>" : '<a href="find-us.html">' + I.pin + " Find us</a>") + '<a href="' + waLink + '" target="_blank" rel="noopener">' + I.wa + ' WhatsApp</a><a class="actbar__book" href="book.html">Book a table</a></nav>' +
      '<div class="toast" role="status" aria-live="polite"></div>';
    document.body.insertAdjacentHTML("beforeend", html);
  }

  window.ABK_LAYOUT = { icons: I, mountFooter: mountFooter, isHome: isHome, file: file, needGate: needGate, needIntro: needIntro, ss: ss, ls: ls, waLink: waLink, hoursSummary: hoursSummary, harp: harp, name: NAME };
})();

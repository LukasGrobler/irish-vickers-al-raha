/* The Irish Vicker's: site behaviour, shared by every branch.
   Everything time-based runs on UAE time (UTC+4) and treats the small hours (till D.dayCut,
   5AM here, because the bars pour till 4AM) as part of the previous night.
   data.js decides the content; D.theme "vickers" gives the chalkboard, the framed photo wall
   and the harp intro. */
(function () {
  "use strict";
  var D = window.ABK_DATA, V = D.venue, L = window.ABK_LAYOUT, I = L.icons, THEME = D.theme, KEY = D.key;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); gsap.ticker.lagSmoothing(0); }

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAYS3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var WEEK = [1, 2, 3, 4, 5, 6, 0];
  var DAYCUT = D.dayCut || 180, HOST = D.host || "Adam", HHN = V.hhName || "Happy hour";

  L.mountFooter();

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(t) {
    var m = typeof t === "number" ? t : toMin(t);
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (mm ? ":" + pad(mm) : "") + ap;
  }
  function fmt24(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function span(s) { var a = toMin(s.start), b = toMin(s.end); if (b <= a) b += 1440; return [a, b]; }
  function dubai() {
    var d = new Date(Date.now() + 4 * 36e5 + (window.__tivShift || 0));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay(), mins: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
  function addDays(y, m, d, n) { var x = new Date(Date.UTC(y, m, d) + n * 864e5); return { y: x.getUTCFullYear(), m: x.getUTCMonth(), d: x.getUTCDate(), dow: x.getUTCDay() }; }
  function biz() {
    var t = dubai(), o = { dow: t.dow, mins: t.mins, late: t.mins < DAYCUT };
    if (t.mins < DAYCUT) { var p = addDays(t.y, t.m, t.d, -1); o.bdow = p.dow; o.bmins = t.mins + 1440; o.by = p.y; o.bm = p.m; o.bd = p.d; }
    else { o.bdow = t.dow; o.bmins = t.mins; o.by = t.y; o.bm = t.m; o.bd = t.d; }
    return o;
  }
  function today() { var b = biz(); return { y: b.by, m: b.bm, d: b.bd, dow: b.bdow }; }
  function iso(o) { return o.y + "-" + pad(o.m + 1) + "-" + pad(o.d); }
  function fromIso(s) { var p = s.split("-"); return addDays(+p[0], +p[1] - 1, +p[2], 0); }
  function longDate(o) { return DAYS[o.dow] + " " + o.d + " " + MONTHS[o.m]; }
  function shortDate(o) { return DAYS3[o.dow] + " " + o.d + " " + MON3[o.m]; }
  function nextOn(dow, endMin) {
    var b = biz(), add = (dow - b.bdow + 7) % 7;
    if (add === 0 && endMin != null && b.bmins >= endMin) add = 7;
    var o = addDays(b.by, b.bm, b.bd, add); o.add = add; return o;
  }
  /* opening hours differ by day here, so every check asks for that day's span */
  function openSpan(dow) { var h = V.hours[dow], a = toMin(h[0]), z = toMin(h[1]); if (z <= a) z += 1440; return [a, z]; }
  /* happy hour is optional, and can run past midnight (11PM – 3AM) */
  function hhSpan(dow) { var h = V.happyHour && V.happyHour[dow]; if (!h) return null; var a = toMin(h[0]), z = toMin(h[1]); if (z <= a) z += 1440; return [a, z]; }
  function nextHH(b) {
    for (var k = 1; k <= 7; k++) { var sp = hhSpan((b.bdow + k) % 7); if (sp) return { k: k, dow: (b.bdow + k) % 7, a: sp[0] }; }
    return null;
  }
  function isOpen(b) { var s = openSpan(b.bdow); return b.bmins >= s[0] && b.bmins < s[1]; }
  function dur(m) { var h = Math.floor(m / 60), mm = m % 60; return (h ? h + "h " : "") + mm + "m"; }
  function img(name) { return "assets/img/photos/" + name + ".jpg"; }
  function waTo(text) { return "https://wa.me/" + (V.whatsapp || "") + "?text=" + encodeURIComponent(text); }
  function waShare(text) { return "https://wa.me/?text=" + encodeURIComponent(text); }
  function stars() { var s = ""; for (var i = 0; i < 5; i++) s += I.star; return '<span class="stars" aria-label="5 out of 5 stars">' + s + "</span>"; }
  function toast(msg) {
    var t = $(".toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }
  function allEntities() { return D.events.concat(D.offers, D.specials); }
  function find(slug) { return allEntities().filter(function (e) { return e.slug === slug; })[0]; }
  function eventSpan(e) {
    if (!e.slots) return null;
    var a = 1e9, b = 0;
    e.slots.forEach(function (s) { var x = span(s); a = Math.min(a, x[0]); b = Math.max(b, x[1]); });
    return [a, b];
  }
  function timeRange(e) { var x = eventSpan(e); return x ? fmt(x[0]) + " – " + fmt(x[1]) : ""; }
  function specialState(s) {
    var t = iso(today());
    if (t > s.to) return "past";
    return t >= s.from ? "on" : "soon";
  }
  function sampleTag(e) {
    if (e && e.sample) return '<span class="tbc" title="An example night until the team confirms the real schedule">Example, to confirm</span>';
    if (e && e.check) return '<span class="tbc tbc--check" title="A real offer from a published listing; prices and times to be confirmed with the team">Details to confirm</span>';
    return "";
  }

  /* ---------------- live status ---------------- */
  function liveStatus() {
    var b = biz(), os = openSpan(b.bdow), open = b.bmins >= os[0] && b.bmins < os[1];
    var hsp = hhSpan(b.bdow), hs = hsp || [0, 0];
    var s = { open: open, b: b, h0: hs[0], h1: hs[1], o0: os[0], o1: os[1], hasHH: !!V.happyHour };
    var nextOpen = openSpan((b.bdow + 1) % 7)[0];
    /* after midnight "tomorrow" reads wrong, so the day word is dropped */
    var tomorrow = b.late ? "" : " tomorrow";
    if (open) s.openText = "Open now, till " + fmt(os[1]);
    else if (b.bmins < os[0]) s.openText = "Opens today at " + fmt(os[0]);
    else s.openText = "Closed now, opens" + tomorrow + " at " + fmt(nextOpen);
    if (!V.happyHour) s.hhText = "";
    else if (hsp && open && b.bmins >= hs[0] && b.bmins < hs[1]) { s.hh = true; s.hhText = HHN + " on, ends in " + dur(hs[1] - b.bmins); }
    else if (hsp && b.bmins < hs[0]) s.hhText = HHN + " from " + fmt(hs[0]) + (hs[0] >= 17 * 60 ? " tonight" : " today");
    else { var nx = nextHH(b); s.hhText = nx ? HHN + "'s back" + (nx.k === 1 ? tomorrow : " " + DAYS[nx.dow]) + " at " + fmt(nx.a) : ""; }
    return s;
  }
  function paintLive() {
    var s = liveStatus();
    $$("[data-open-pill]").forEach(function (p) { p.classList.toggle("is-open", s.open); var t = $("[data-open-text]", p); if (t) t.textContent = s.openText; });
    $$("[data-hh-pill]").forEach(function (p) { p.hidden = !s.hhText; p.classList.toggle("is-hh", !!s.hh); var t = $("[data-hh-text]", p); if (t) t.textContent = s.hhText; });
    $$("[data-board-next]").forEach(paintNext);
    $$("[data-board-clock]").forEach(function (c) { c.textContent = fmt24(dubai().mins); });
    $$("[data-livecard]").forEach(renderLiveCard);
    $$("[data-afterwork]").forEach(paintAfterwork);
    $$("[data-nextrace]").forEach(paintNextRace);
    paintBoardStates();
    paintTakeover();
  }

  /* ---------------- next-up countdown + live tonight ---------------- */
  function parseRange(t) {
    var re = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi, m, out = [];
    while ((m = re.exec(t)) && out.length < 2) out.push((+m[1] % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + (+m[2] || 0));
    if (out.length === 2 && out[1] <= out[0]) out[1] += 1440;
    return out;
  }
  function paintNext(el) {
    var b = biz(), items = slotsFor(b.bdow), os = openSpan(b.bdow), html = "";
    if (b.bmins < os[0]) {
      var first = items[0];
      html = '<span class="board__next-row">' + (first ? "First up today: " + esc(first.s.label) + " at " + fmt(first.a) : "Doors open at " + fmt(os[0])) + "</span>";
    } else {
      var on = items.filter(function (it) { return b.bmins >= it.a && b.bmins < it.b; }).pop();
      var next = items.filter(function (it) { return it.a > b.bmins; })[0];
      if (on) html += '<span class="board__next-row is-on"><i aria-hidden="true"></i>On now: ' + esc(on.s.label) + ", till " + fmt(on.b) + "</span>";
      if (next) html += '<span class="board__next-row">Next up in <b>' + dur(next.a - b.bmins) + "</b>: " + esc(next.s.label) + "</span>";
      if (!on && !next) {
        var tm = slotsFor((b.bdow + 1) % 7)[0];
        html = '<span class="board__next-row">' + (tm ? "Tomorrow: " + esc(tm.s.label) + " from " + fmt(tm.a) : "Happy hour tomorrow") + "</span>";
      }
    }
    el.innerHTML = html;
  }
  function renderLiveCard(el) {
    var b = biz(), rows = [];
    D.events.forEach(function (e) {
      if (e.days.indexOf(b.bdow) === -1 || !e.lineup) return;
      e.lineup.forEach(function (l) { var r = parseRange(l.time); rows.push({ a: D.artists[l.who], time: l.time, from: r[0], to: r[1] }); });
    });
    rows.sort(function (x, y) { return x.from - y.from; });
    rows = rows.filter(function (r) { return b.bmins < r.to; });
    if (!rows.length) { el.hidden = true; return; }
    el.hidden = false;
    var live = rows.some(function (r) { return b.bmins >= r.from && b.bmins < r.to; });
    var music = rows.some(function (r) { return /music|dj|band|acoustic/i.test(r.a.role); });
    el.innerHTML = '<a class="livecard' + (live ? " is-live" : "") + '" href="' + (D.liveLink || "whats-on.html") + '">' +
      '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<span class="livecard__txt"><b>' + (live ? "Live now" : music ? "Live tonight" : "Tonight") + "</b>" +
      rows.map(function (r) { return esc(r.a.name) + " <span>" + esc(r.time) + "</span>"; }).join(", then ") + "</span></a>";
  }

  /* ---------------- today's board: a flip board (Reem) or a clubhouse scoreboard (Forsan) ---------------- */
  function slotsFor(dow) {
    var out = [];
    D.events.forEach(function (e) {
      if (e.days.indexOf(dow) > -1 && e.slots) e.slots.forEach(function (s) { var x = span(s); out.push({ e: e, s: s, a: x[0], b: x[1] }); });
    });
    return out.sort(function (x, y) { return x.a - y.a || x.b - y.b; });
  }
  /* happy hour first, then the day's slots, each with a live state */
  function boardRows() {
    var st = liveStatus(), b = st.b, rows = [];
    if (st.h1 > st.h0) rows.push({ a: st.h0, b: st.h1, label: HHN, flap: HHN.toUpperCase(), sub: V.hhNote || "till " + fmt(st.h1), href: V.hhLink || "happy-hour.html" });
    slotsFor(b.bdow).forEach(function (it) {
      rows.push({ a: it.a, b: it.b, label: it.s.label, flap: it.s.flap || it.s.label.toUpperCase(), sub: it.s.price || fmt(it.a) + " – " + fmt(it.b), href: it.e.slug + ".html" });
    });
    rows.sort(function (x, y) { return x.a - y.a || x.b - y.b; });
    var nextSet = false;
    rows.forEach(function (r) {
      if (st.open && b.bmins >= r.b) r.state = "done";
      else if (b.bmins >= r.a && b.bmins < r.b) r.state = "on";
      else if (!nextSet && b.bmins < r.a) { r.state = "next"; nextSet = true; }
      else r.state = "later";
    });
    return { rows: rows, st: st };
  }
  var STATE_WORD = { on: "On now", next: "Next", later: "Later", done: "Done" };
  function renderBoard(el) { if (THEME === "reem") renderFlipBoard(el); else if (THEME === "vickers") renderChalkBoard(el); else renderScoreBoard(el); }
  function paintBoardStates() {
    var data = boardRows();
    $$("[data-board-row]").forEach(function (li) {
      var r = data.rows[+li.getAttribute("data-board-row")]; if (!r) return;
      li.className = li.className.replace(/\bis-(on|next|later|done)\b/g, "").trim() + " is-" + r.state;
      var w = $("[data-state]", li); if (w) w.textContent = STATE_WORD[r.state];
    });
  }

  /* Reem: an airport-style split-flap board. Each letter is its own flap; they spin and settle on load. */
  var FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  function cells(text, n) {
    var t = String(text).toUpperCase();
    if (n) t = (t + new Array(n + 1).join(" ")).slice(0, n);
    return t.split("").map(function (c) { return '<span class="fc' + (c === " " ? " fc--sp" : "") + '" data-c="' + (c === " " ? "" : esc(c)) + '"><i>' + (c === " " ? "" : esc(c)) + "</i></span>"; }).join("");
  }
  function renderFlipBoard(el) {
    var data = boardRows(), st = data.st, b = st.b, day = today();
    var title = b.bmins < 17 * 60 ? "Today on Reem" : "Tonight on Reem";
    var width = 12;
    var rows = data.rows.map(function (r, i) {
      return '<li class="fb__row is-' + r.state + '" data-board-row="' + i + '">' +
        '<span class="fb__time" aria-hidden="true">' + cells(fmt24(r.a), 5) + "</span>" +
        '<a class="fb__name" href="' + r.href + '"><span class="sr-only">' + fmt(r.a) + ": " + esc(r.label) + ", " + esc(r.sub) + '</span><span class="fb__cells" aria-hidden="true">' + cells(r.flap.slice(0, width), width) + '</span><small aria-hidden="true">' + esc(r.sub) + "</small></a>" +
        '<span class="fb__state" data-state>' + STATE_WORD[r.state] + "</span></li>";
    }).join("");
    el.innerHTML =
      '<div class="fb__frame">' +
      '<div class="fb__head"><p class="fb__title">' + title + '</p><p class="fb__meta"><span>' + shortDate(day) + '</span><span class="fb__clock" data-board-clock>' + fmt24(dubai().mins) + "</span></p></div>" +
      '<div class="fb__cols" aria-hidden="true"><span>Time</span><span>What\'s on</span><span>Status</span></div>' +
      '<ul class="fb__list' + (data.rows.length > 5 ? " is-busy" : "") + '">' + rows + "</ul>" +
      '<p class="board__next" data-board-next aria-live="polite"></p>' +
      '<div class="fb__foot"><span>' + (st.open ? "Open till " + fmt(st.o1) : "Doors open at " + fmt(st.o0)) + '</span><a class="fb__book" href="book.html?date=' + iso(day) + '">Book for ' + (b.bmins < 17 * 60 ? "today" : "tonight") + "</a></div></div>";
    if (!reduce && !/[?&](skip|shot)/.test(location.search)) flipIn(el); /* screenshots skip the spin */
  }
  function flipIn(root) {
    var list = $$(".fc:not(.fc--sp)", root), t = 0;
    list.forEach(function (c) {
      var row = c.closest("li"), ri = row ? +row.getAttribute("data-board-row") : 0;
      var col = Array.prototype.indexOf.call(c.parentNode.children, c);
      c._stop = 6 + ri * 3 + col * 0.7 + Math.random() * 4;
    });
    var timer = setInterval(function () {
      t++;
      var busy = false;
      list.forEach(function (c) {
        var i = c.firstChild;
        if (t < c._stop) { busy = true; i.textContent = FLAP_CHARS.charAt(Math.floor(Math.random() * FLAP_CHARS.length)); c.classList.remove("is-flip"); void c.offsetWidth; c.classList.add("is-flip"); }
        else if (!c._done) { c._done = true; i.textContent = c.getAttribute("data-c"); c.classList.remove("is-flip"); void c.offsetWidth; c.classList.add("is-flip"); }
      });
      if (!busy) clearInterval(timer);
    }, 55);
  }

  /* Forsan: a painted clubhouse scoreboard. Tin plates carry the times; the name is sign-painted. */
  function plates(m) {
    var h = Math.floor((m % 1440) / 60), mm = m % 60, ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
    return '<span class="tp">' + h12 + (mm ? ":" + pad(mm) : "") + '</span><span class="tp tp--s">' + ap + "</span>";
  }
  function renderScoreBoard(el) {
    var data = boardRows(), st = data.st, b = st.b, day = today();
    var rows = data.rows.map(function (r, i) {
      return '<li class="sb__row is-' + r.state + '" data-board-row="' + i + '">' +
        '<span class="sb__plates" aria-hidden="true">' + plates(r.a) + "</span>" +
        '<span class="sb__what"><a href="' + r.href + '"><span class="sr-only">' + fmt(r.a) + ": </span>" + esc(r.label) + "</a><small>" + esc(r.sub) + "</small></span>" +
        '<span class="sb__flag" data-state>' + STATE_WORD[r.state] + "</span></li>";
    }).join("");
    el.innerHTML =
      '<div class="sb__frame"><div class="sb__inner">' +
      '<div class="sb__head"><p class="sb__title">' + (b.bmins < 17 * 60 ? "Today" : "Tonight") + ' at the clubhouse</p><p class="sb__date"><span class="tp tp--s">' + DAYS3[day.dow] + '</span><span class="tp">' + day.d + '</span><span class="tp tp--s">' + MON3[day.m] + "</span></p></div>" +
      '<ul class="sb__list' + (data.rows.length > 5 ? " is-busy" : "") + '">' + rows + "</ul>" +
      '<p class="board__next" data-board-next aria-live="polite"></p>' +
      '<div class="sb__foot"><span>' + (st.open ? "Open till " + fmt(st.o1) : "Doors open at " + fmt(st.o0)) + '</span><a class="sb__book" href="book.html?date=' + iso(day) + '">Book for ' + (b.bmins < 17 * 60 ? "today" : "tonight") + "</a></div>" +
      "</div></div>";
  }

  /* Vickers: the pub chalkboard. Written up in chalk, line by line, once the page is in view. */
  function renderChalkBoard(el) {
    var data = boardRows(), st = data.st, b = st.b, day = today();
    var word = b.bmins < 17 * 60 ? "Today" : "Tonight";
    var rows = data.rows.map(function (r, i) {
      return '<li class="cb__row is-' + r.state + '" data-board-row="' + i + '" style="--i:' + i + '">' +
        '<span class="cb__time">' + fmt(r.a) + "</span>" +
        '<a class="cb__name" href="' + r.href + '"><span class="cb__label">' + esc(r.label) + "</span><small>" + esc(r.sub) + "</small></a>" +
        '<span class="cb__state" data-state>' + STATE_WORD[r.state] + "</span></li>";
    }).join("");
    el.innerHTML =
      '<div class="cb"><div class="cb__slate">' +
      '<div class="cb__head"><p class="cb__title">' + word + " at the Vickers</p>" +
      '<p class="cb__date">' + shortDate(day) + ' <span class="cb__clock" data-board-clock>' + fmt24(dubai().mins) + "</span></p></div>" +
      '<span class="cb__rule" aria-hidden="true"></span>' +
      (rows ? '<ul class="cb__list' + (data.rows.length > 4 ? " is-busy" : "") + '">' + rows + "</ul>" : '<p class="cb__empty">Nothing on the board tonight. Just good pints and better company.</p>') +
      '<p class="board__next" data-board-next aria-live="polite"></p>' +
      '<div class="cb__foot"><span>' + (st.open ? "Open till " + fmt(st.o1) : "Doors open at " + fmt(st.o0)) + '</span><a class="cb__book" href="book.html?date=' + iso(day) + '">Book for ' + word.toLowerCase() + "</a></div>" +
      '</div><span class="cb__tray" aria-hidden="true"><i></i><i></i></span></div>';
    var cb = $(".cb", el);
    if (reduce || /[?&](skip|shot)/.test(location.search)) { cb.classList.add("is-written"); return; }
    /* write it up once the intro has cleared */
    (function go() {
      if (document.documentElement.classList.contains("is-locked")) return setTimeout(go, 150);
      cb.classList.add("is-writing");
    })();
  }

  /* ---------------- the perfect pint: a two-part pour, sped up ---------------- */
  function renderPint(el) {
    el.innerHTML =
      '<div class="pint">' +
      '<svg class="pint__glass" viewBox="0 0 120 230" aria-hidden="true"><defs><clipPath id="pintClip"><path d="M24 14H96L89 200Q88 212 78 212H42Q32 212 31 200Z"/></clipPath>' +
      '<linearGradient id="pintSurge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6cfa8"/><stop offset=".6" stop-color="#a77a4f"/><stop offset="1" stop-color="#5a3a24"/></linearGradient></defs>' +
      '<g clip-path="url(#pintClip)"><rect class="pint__beer" x="0" y="212" width="120" height="0" fill="#160d08"/><rect class="pint__surge" x="0" y="212" width="120" height="0" fill="url(#pintSurge)"/><rect class="pint__head" x="0" y="212" width="120" height="0" fill="#f3e6c8"/></g>' +
      '<path class="pint__outline" d="M24 14H96L89 200Q88 212 78 212H42Q32 212 31 200Z"/>' +
      '<g class="pint__badge" transform="translate(46 112) scale(.13)">' + L.harp("", "pint").replace(/^<svg[^>]*>|<\/svg>$/g, "") + "</g></svg>" +
      '<div class="pint__copy"><p class="pint__timer"><b data-pint-t>0.0</b><span>seconds</span></p>' +
      '<ol class="pint__steps"><li data-step="0">Tilt the glass to 45 degrees</li><li data-step="1">Pour till it\'s three-quarters full</li><li data-step="2">Let it settle. No touching.</li><li data-step="3">Top it off, with a dome above the rim</li></ol>' +
      '<button class="btn btn--line btn--sm" type="button" data-pint-go>Pour another</button></div></div>';
    if (!hasGsap) return;
    var beer = $(".pint__beer", el), surge = $(".pint__surge", el), head = $(".pint__head", el), tEl = $("[data-pint-t]", el), steps = $$(".pint__steps li", el);
    var tl = null;
    function step(i) { steps.forEach(function (s, k) { s.classList.toggle("is-on", k === i); s.classList.toggle("is-done", k < i); }); }
    function pour() {
      if (tl) tl.kill();
      var clock = { s: 0 };
      gsap.set([beer, surge, head], { attr: { y: 212, height: 0 } });
      tl = gsap.timeline();
      tl.add(function () { step(0); }, 0)
        .to(clock, { s: 119.5, duration: 7.6, ease: "none", onUpdate: function () { tEl.textContent = clock.s.toFixed(1); } }, 0)
        .add(function () { step(1); }, 0.5)
        .to(surge, { attr: { y: 62, height: 150 }, duration: 1.8, ease: "power1.in" }, 0.5)
        .add(function () { step(2); }, 2.4)
        .to(beer, { attr: { y: 74, height: 138 }, duration: 2.6, ease: "power2.inOut" }, 2.4)
        .to(surge, { attr: { y: 62, height: 12 }, duration: 2.6, ease: "power2.inOut" }, 2.4)
        .to(head, { attr: { y: 62, height: 12 }, duration: 2.6, ease: "power2.inOut" }, 2.4)
        .add(function () { step(3); }, 5.3)
        .to(beer, { attr: { y: 26, height: 186 }, duration: 1.6, ease: "power2.out" }, 5.3)
        .to(surge, { attr: { y: 22, height: 6 }, duration: 1.6, ease: "power2.out" }, 5.3)
        .to(head, { attr: { y: 6, height: 22 }, duration: 1.6, ease: "power2.out" }, 5.3)
        .add(function () { step(4); el.classList.add("is-poured"); }, 7.6);
    }
    $("[data-pint-go]", el).addEventListener("click", function () { el.classList.remove("is-poured"); pour(); });
    if (reduce || /[?&](skip|shot)/.test(location.search)) { pour(); tl.progress(1); step(4); el.classList.add("is-poured"); return; }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); pour(); } }, { threshold: 0.45 });
      io.observe(el);
    } else pour();
  }

  /* ---------------- marquee ---------------- */
  function renderMarquee(el) {
    var items = D.marquee || [];
    var one = items.map(function (t) { return '<span class="marquee__item">' + I.hop + esc(t) + "</span>"; }).join("");
    el.innerHTML = '<div class="marquee__track" aria-hidden="true">' + one + one + "</div><p class=\"sr-only\">" + items.join(", ") + "</p>";
  }

  /* ---------------- Reem: a garland of string lights across the top of a hero ---------------- */
  function renderLights(el) {
    var W = 1440, strands = [[-20, 8, 1460, 0, 46, 16], [-20, 26, 1460, 16, 74, 13]], g = "";
    var defs = '<defs><radialGradient id="gGlow"><stop offset="0" stop-color="#ffe1a8" stop-opacity=".9"/><stop offset=".3" stop-color="#ffc46b" stop-opacity=".35"/><stop offset="1" stop-color="#ffc46b" stop-opacity="0"/></radialGradient></defs>';
    strands.forEach(function (s, si) {
      var mid = (s[1] + s[3]) / 2, c = 2 * s[4] - mid; /* control point so the curve dips to s[4] in the middle */
      g += '<path class="garland__wire" d="M' + s[0] + " " + s[1] + " Q" + (W / 2) + " " + c + " " + s[2] + " " + s[3] + '"/>';
      for (var i = 1; i < s[5]; i++) {
        var t = i / s[5], x = (1 - t) * (1 - t) * s[0] + 2 * (1 - t) * t * (W / 2) + t * t * s[2], y = (1 - t) * (1 - t) * s[1] + 2 * (1 - t) * t * c + t * t * s[3];
        var cls = "garland__bulb" + ((i + si) % 5 === 2 ? " garland__bulb--twinkle" : "") + ((i * 7 + si) % 11 === 3 ? " garland__bulb--dim" : "");
        g += '<g class="' + cls + '" transform="translate(' + x.toFixed(1) + " " + (y + 4).toFixed(1) + ')"><circle class="garland__glow" r="26"/><rect x="-2" y="-5" width="4" height="5" fill="#2c3c50"/><ellipse class="garland__glass" rx="4.2" ry="5.6" cy="3"/></g>';
      }
    });
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' 100" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">' + defs + g + "</svg>";
  }

  /* ---------------- the week carousel ---------------- */
  function nightData(dow) {
    var o = D.weekOverrides && D.weekOverrides[dow];
    if (o) return { dow: dow, title: o.title, sub: o.sub, img: o.img, link: o.link, book: "book.html?date=" + iso(nextOn(dow, 26 * 60)), lines: o.lines, sample: o.sample };
    var e = D.events.filter(function (x) { return x.days[0] === dow && x.week; })[0];
    if (!e) return null;
    return { dow: dow, title: e.week.title, sub: e.with, img: e.img, link: e.slug + ".html", book: "book.html?event=" + e.slug, lines: e.week.lines, sample: e.sample, check: e.check };
  }
  function renderWeek(sec) {
    var track = $(".week__track", sec), pin = $(".week__pin", sec);
    var tdow = biz().bdow;
    track.innerHTML = WEEK.map(function (dow) {
      var n = nightData(dow);
      if (!n) return "";
      return '<article class="night' + (dow === tdow ? " is-today" : "") + '" data-dow="' + dow + '">' +
        (dow === tdow ? '<span class="stamp">' + (THEME === "forsan" ? "Today" : "Tonight") + "</span>" : "") +
        '<div class="night__img">' + (n.img ? '<img src="' + img(n.img) + '" alt="" loading="lazy">' : '<span class="night__type">' + esc(n.title) + "</span>") + "</div>" +
        '<div class="night__body"><h3 class="night__day">' + DAYS[dow] + "</h3>" +
        '<p class="night__name">' + esc(n.title) + '<span class="night__with">' + esc(n.sub || "") + "</span></p>" +
        '<ul class="night__facts">' + n.lines.map(function (l) { return "<li><b>" + esc(l[0]) + "</b>" + esc(l[1]) + "</li>"; }).join("") + "</ul>" +
        ((n.sample || n.check) ? '<p class="night__tbc">' + sampleTag(n) + "</p>" : "") +
        '<div class="night__cta"><a class="btn btn--sm" href="' + n.book + '">Book ' + DAYS[dow] + '</a><a class="btn btn--sm btn--ghost" href="' + n.link + '">See the night</a></div></div></article>';
    }).join("");
    /* a carousel with a left and a right arrow: the page itself always scrolls normally */
    var chev = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (d < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") + '"/></svg>'; };
    var stage = document.createElement("div");
    stage.className = "week__stage";
    pin.parentNode.insertBefore(stage, pin);
    stage.appendChild(pin);
    stage.insertAdjacentHTML("beforeend", '<button class="week__side week__side--prev" type="button" data-dir="-1" aria-label="Previous day">' + chev(-1) + '</button><button class="week__side week__side--next" type="button" data-dir="1" aria-label="Next day">' + chev(1) + "</button>");

    var cards = $$(".night", track), arrows = $$("[data-dir]", sec), active = 0;
    cards.forEach(function (c, k) { if (+c.getAttribute("data-dow") === tdow) active = k; });
    function goTo(i, instant) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      var c = cards[i];
      pin.scrollTo({ left: c.offsetLeft - (pin.clientWidth - c.offsetWidth) / 2, behavior: instant || reduce ? "auto" : "smooth" });
      active = i;
    }
    function sync() {
      var mid = pin.scrollLeft + pin.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, k) { var dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = k; } });
      active = best;
      var atStart = pin.scrollLeft <= 2, atEnd = pin.scrollLeft >= pin.scrollWidth - pin.clientWidth - 2;
      arrows.forEach(function (a) { a.disabled = +a.getAttribute("data-dir") < 0 ? atStart : atEnd; });
    }
    pin.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    sec.addEventListener("click", function (ev) {
      var a = ev.target.closest("[data-dir]");
      if (a) goTo(active + +a.getAttribute("data-dir"));
    });
    var startAt = active;
    requestAnimationFrame(function () { goTo(startAt, true); sync(); });
  }

  /* ---------------- shared cards ---------------- */
  function typePoster(name, cls) { return '<span class="' + (cls || "evcard__type") + '">' + esc(name) + "</span>"; }
  function evCard(e, opts) {
    opts = opts || {};
    var time = opts.time || timeRange(e) || e.facts && e.facts[0][1] || "";
    return '<a class="evcard" href="' + e.slug + '.html" data-cats="' + (e.cats || []).join(" ") + '">' +
      '<span class="evcard__img">' + (e.img ? '<img src="' + img(e.img) + '" alt="" loading="lazy">' : typePoster(e.name)) + "</span>" +
      '<span class="evcard__body"><span class="evcard__time">' + esc(time) + '</span><span class="evcard__name">' + esc(e.name) + '</span><span class="evcard__note">' + esc(e.short) + "</span>" + sampleTag(e) + "</span></a>";
  }
  function specialCard(s) {
    var stt = specialState(s);
    if (stt === "past") return "";
    return '<a class="special" href="' + s.slug + '.html">' +
      '<span class="special__img">' + (s.img ? '<img src="' + img(s.img) + '" alt="" loading="lazy">' : typePoster(s.short_name || s.name, "special__type")) + "</span>" +
      '<span class="special__txt"><span class="special__badge' + (stt === "soon" ? " special__badge--soon" : "") + '">' + (stt === "on" ? "On now" : "Coming up") + (stt === "soon" && s.countdown ? ", " + daysTo(s.from) : "") + '</span><span class="special__name">' + esc(s.name) + '</span><span class="kicker">' + esc(s.when) + '</span><span class="small">' + esc(s.short) + "</span>" + sampleTag(s) + "</span>" +
      '<span class="btn btn--sm btn--line">See the details</span></a>';
  }

  function daysTo(isoDate) {
    var p = isoDate.split("-"), t0 = today(), n = Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(t0.y, t0.m, t0.d)) / 864e5);
    return n === 1 ? "tomorrow" : n + " days to go";
  }

  /* ---------------- what's on ---------------- */
  function renderWhatsOn(root) {
    var filters = D.filters, b = biz();
    var html = '<div class="filters" role="group" aria-label="Filter events">' + filters.map(function (f, i) {
      return '<button class="chip" type="button" data-f="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + "</button>";
    }).join("") + "</div>";
    html += '<div class="days">';
    if (D.offers.length) html += '<div class="dayrow" id="every-day"><div class="dayrow__head"><h3 class="dayrow__day">Every day</h3><span class="dayrow__date">' + esc(L.hoursSummary(V.hours)) + '</span></div><div class="dayrow__items">' +
      D.offers.map(function (o) { return evCard(o, { time: o.dayLabel }); }).join("") + "</div></div>";
    for (var i = 0; i < 7; i++) {
      var dt = addDays(b.by, b.bm, b.bd, i), dow = dt.dow;
      var evs = D.events.filter(function (e) { return e.days.indexOf(dow) > -1; });
      evs.sort(function (x, y) { return eventSpan(x)[0] - eventSpan(y)[0]; });
      html += '<div class="dayrow' + (i === 0 ? " is-today" : "") + '" id="day-' + dow + '"><div class="dayrow__head"><h3 class="dayrow__day">' + DAYS[dow] + '</h3><span class="dayrow__date">' + dt.d + " " + MONTHS[dt.m] + "</span>" +
        (i === 0 ? '<span class="dayrow__tag">' + (b.bmins < 17 * 60 ? "Today" : "Tonight") + "</span>" : "") +
        '</div><div class="dayrow__items">' + evs.map(function (e) { return evCard(e); }).join("") + "</div></div>";
    }
    html += "</div>";
    root.innerHTML = html;
    var chips = $$(".chip", root);
    root.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      $$(".evcard", root).forEach(function (card) { card.hidden = f !== "all" && card.getAttribute("data-cats").split(" ").indexOf(f) === -1; });
      $$(".dayrow", root).forEach(function (row) { row.hidden = !$$(".evcard", row).some(function (c2) { return !c2.hidden; }); });
    });
  }
  function renderSpecials(el) {
    var html = D.specials.map(specialCard).join("");
    el.innerHTML = html || '<p class="empty">No specials on right now. Check back soon, or follow ' + V.handle + " on Instagram.</p>";
  }

  /* ---------------- event pages ---------------- */
  function priceTiles(p) {
    return '<span class="price"><span>' + (p.labels ? p.labels[0] : "Regular") + "</span><b>" + p.house + '</b></span><span class="price price--hot"><span>' + (p.labels ? p.labels[1] : "Premium") + "</span><b>" + p.premium + "</b></span>";
  }
  function icsStamp(dateObj, min) {
    var dt = new Date(Date.UTC(dateObj.y, dateObj.m, dateObj.d, 0, 0) + (min - 240) * 60000);
    return dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + "T" + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + "00Z";
  }
  function icsEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function calendarFor(e) {
    var title = e.name + " at " + V.full, details = e.short + (V.phoneDisplay ? " Book: " + V.phoneDisplay + " (WhatsApp)." : ""), start, end, allDay = false, dateObj;
    if (e.slots) {
      var x = eventSpan(e); dateObj = nextOn(e.days[0], x[1]);
      start = icsStamp(dateObj, x[0]); end = icsStamp(dateObj, x[1]);
    } else if (e.from) {
      allDay = true;
      var f = fromIso(e.from), t2 = fromIso(e.to), endPlus = addDays(t2.y, t2.m, t2.d, 1), td = today();
      if (iso(td) > e.from && iso(td) <= e.to) f = td;
      start = iso(f).replace(/-/g, ""); end = iso(endPlus).replace(/-/g, "");
    } else return null;
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//" + V.full + "//Website//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + e.slug + "-" + start + "@" + KEY,
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
      (allDay ? "DTSTART;VALUE=DATE:" : "DTSTART:") + start,
      (allDay ? "DTEND;VALUE=DATE:" : "DTEND:") + end,
      "SUMMARY:" + icsEsc(title), "LOCATION:" + icsEsc(V.addressLine), "DESCRIPTION:" + icsEsc(details),
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var g = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) + "&dates=" + start + "/" + end + "&details=" + encodeURIComponent(details) + "&location=" + encodeURIComponent(V.addressLine);
    return { ics: ics, google: g, file: e.slug + ".ics" };
  }
  function goodToKnow() {
    return '<ul class="icon-list">' + D.goodToKnow.map(function (g) { return "<li>" + I[g[0]] + "<div><h3>" + g[1] + "</h3><p>" + g[2] + "</p></div></li>"; }).join("") + "</ul>";
  }
  function renderEvent(root) {
    var slug = root.getAttribute("data-event"), e = find(slug);
    if (!e) { root.innerHTML = '<section class="phero"><div class="wrap"><h1 class="d-xl phero__title">Not found</h1><p class="lede">This night isn\'t on the board any more. <a class="link" href="whats-on.html">See what\'s on</a></p></div></section>'; return; }
    var isEvent = !!e.slots, isSpecial = !!e.from, stt = isSpecial ? specialState(e) : null;
    var next = isEvent ? nextOn(e.days[0], eventSpan(e)[1]) : null;
    var bookHref = "book.html?event=" + e.slug;
    var bookLabel = isEvent ? (next.add === 0 ? "Book for " + (eventSpan(e)[0] >= 17 * 60 ? "tonight" : "today") : "Book for " + shortDate(next)) : "Book a table";
    var cal = calendarFor(e);
    var shareText = e.name + " at " + V.full + ". " + (e.dayLabel ? e.dayLabel + ", " : (e.when ? e.when + ". " : "")) + (isEvent ? timeRange(e) + ". " : "") + e.short + " " + V.whereShort + ". Instagram " + V.handle;
    var when = e.dayLabel || e.when || "";
    if (isSpecial) when = (stt === "on" ? "On now, " : stt === "past" ? "Finished, " : "Coming up, ") + e.when;

    var poster = e.img
      ? '<div class="frame frame--tilt ev-poster"><img src="' + img(e.img) + '" alt="' + esc(e.name) + " at " + esc(V.full) + '"></div>'
      : '<div class="frame frame--tilt ev-poster ev-poster--type"><div><p class="ev-poster__name">' + esc(e.name) + '</p><p class="ev-poster__sub">' + esc(when) + "</p></div></div>";

    var html =
      '<section class="ev-hero"><div class="wrap ev-hero__in"><div class="ev-hero__copy">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="whats-on.html">What\'s on</a> / ' + esc(e.name) + "</nav>" +
      '<p class="ev-when">' + esc(when) + "</p>" +
      '<h1 class="d-xl ev-title">' + esc(e.name) + "</h1>" +
      '<p class="ev-with">' + esc(e.with) + "</p>" +
      (e.sample ? '<p class="ev-tbc">' + sampleTag(e) + "</p>" : "") +
      '<p class="lede">' + esc(e.intro) + "</p>" +
      (e.facts ? '<div class="ev-facts">' + e.facts.map(function (f) { return '<div class="ev-fact"><span>' + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>"; }).join("") + "</div>" : "") +
      '<div class="btn-row" style="margin-top:6px"><a class="btn" href="' + bookHref + '">' + bookLabel + "</a>" +
      (cal ? '<div class="cal-menu"><button class="btn btn--ghost" type="button" aria-expanded="false">' + I.cal + ' Add to calendar</button><div class="cal-menu__drop"><button type="button" data-ics>Apple or Outlook calendar</button><a href="' + cal.google + '" target="_blank" rel="noopener">Google Calendar</a></div></div>' : "") +
      '<a class="btn btn--ghost" href="' + waShare(shareText) + '" target="_blank" rel="noopener">' + I.share + " Send to a friend</a></div>" +
      "</div>" + poster + "</div></section>";

    /* the deal */
    var deal = "";
    if (e.deal) deal += '<div class="deal"><div><p class="deal__name">' + esc(e.deal.title) + '</p><p class="deal__time">' + esc(e.deal.note || "") + '</p></div><div class="deal__prices"><span class="price price--hot"><span>AED</span><b>' + e.deal.price + "</b></span></div></div>";
    if (e.deals) e.deals.forEach(function (d) { deal += '<div class="deal"><div><p class="deal__name">' + esc(d[0]) + '</p>' + (d[2] ? '<p class="deal__time">' + esc(d[2]) + "</p>" : "") + '</div><div class="deal__prices"><span class="price price--hot"><span>' + (typeof d[1] === "number" ? "AED" : "&nbsp;") + "</span><b>" + esc(d[1]) + "</b></span></div></div>"; });
    if (e.packages) e.packages.forEach(function (p) { deal += '<div class="deal"><div><p class="deal__name">' + esc(p.name) + '</p><p class="deal__time">' + esc(p.time) + '</p></div><div class="deal__prices">' + priceTiles(p) + "</div></div>"; });
    if (e.vouchers) e.vouchers.forEach(function (v) { deal += '<div class="deal"><div><p class="deal__name">' + esc(v[0]) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>AED</span><b>' + esc(v[1]) + "</b></span></div></div>"; });
    if (!deal && e.facts) e.facts.forEach(function (f) { deal += '<div class="deal"><div><p class="deal__name">' + esc(f[0]) + '</p></div><div class="deal__prices"><span class="price price--hot"><span>&nbsp;</span><b>' + esc(f[1]) + "</b></span></div></div>"; });
    html += '<section class="sec sec--tight"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">The deal</h2>' +
      (e.packages ? '<p class="lede">' + esc(D.packageNote) + "</p>" : "") +
      (e.fine ? '<p class="small">' + esc(e.fine) + "</p>" : "") +
      '</div><div class="deals">' + deal + "</div></div></section>";

    /* who's on */
    if (e.lineup) {
      html += '<section class="sec sec--tight"><div class="wrap wrap--narrow"><div class="sec-head"><h2 class="d-l">Who\'s on</h2></div><ul class="lineup">' +
        e.lineup.map(function (l) { var a = D.artists[l.who]; return '<li><span class="lineup__who">' + esc(a.name) + '<span class="lineup__role">' + esc(a.role) + '</span></span><span class="lineup__time">' + esc(l.time) + "</span></li>"; }).join("") +
        "</ul></div></section>";
    }
    if (e.hallOfFame) html += '<section class="sec sec--tight"><div class="wrap wrap--narrow" data-hof></div></section>';

    html += '<section class="sec sec--tight sec--alt"><div class="wrap split"><div><div class="sec-head"><h2 class="d-l">Good to know</h2></div>' + goodToKnow() + "</div>" +
      '<div class="frame frame--tall" style="max-width:420px;justify-self:center"><img src="' + img(e.img2 || D.defaultPhoto) + '" alt="Inside ' + esc(V.full) + '" loading="lazy"></div>' +
      "</div></section>";

    var others = D.events.filter(function (x) { return x.slug !== e.slug; }).slice(0);
    var startIdx = isEvent ? WEEK.indexOf(e.days[0]) : 0;
    others.sort(function (a, b) { return ((WEEK.indexOf(a.days[0]) - startIdx + 7) % 7) - ((WEEK.indexOf(b.days[0]) - startIdx + 7) % 7); });
    html += '<section class="sec"><div class="wrap"><div class="sec-head sec-head--row"><h2 class="d-l">More this week</h2><a class="link" href="whats-on.html">Full week</a></div><div class="grid grid--3">' +
      others.slice(0, 3).map(function (o) { return evCard(o); }).join("") + "</div></div></section>";
    html += '<section class="sec sec--flush"><div class="wrap"><div class="band"><div><h2 class="d-l">Save your seat</h2><p>' + (isEvent ? "Tables go fast on " + DAYS[e.days[0]] + "s. Send us a WhatsApp and the team will confirm." : "Send us a WhatsApp and the team will confirm your table.") + '</p></div><div class="btn-row"><a class="btn" href="' + bookHref + '">' + bookLabel + "</a>" + (V.phone ? '<a class="btn btn--ghost" href="tel:' + V.phone + '">Call ' + V.phoneDisplay + "</a>" : '<a class="btn btn--ghost" href="find-us.html">How to find us</a>') + "</div></div></div></section>";
    root.innerHTML = html;

    var cm = $(".cal-menu", root);
    if (cm) {
      var cb = $("button", cm);
      cb.addEventListener("click", function () { var o = cm.classList.toggle("is-open"); cb.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", function (ev) { if (!cm.contains(ev.target)) { cm.classList.remove("is-open"); cb.setAttribute("aria-expanded", "false"); } });
      $("[data-ics]", cm).addEventListener("click", function () {
        var blob = new Blob([cal.ics], { type: "text/calendar" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = cal.file; document.body.appendChild(a); a.click(); a.remove();
        cm.classList.remove("is-open"); toast("Calendar file saved. Open it to add the night.");
      });
    }

    /* structured data so Google can show the event */
    var ld = { "@context": "https://schema.org", "@type": "Event", name: e.name + " at " + V.full, description: e.intro,
      eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "BarOrPub", name: V.full, telephone: V.phone || undefined, address: { "@type": "PostalAddress", streetAddress: V.address[0], addressLocality: V.locality, addressCountry: "AE" } },
      organizer: { "@type": "Organization", name: V.full } };
    if (e.img) ld.image = img(e.img);
    if (isEvent) { var x = eventSpan(e); ld.startDate = iso(next) + "T" + pad(Math.floor(x[0] / 60) % 24) + ":" + pad(x[0] % 60) + "+04:00"; }
    else if (isSpecial) { ld.startDate = e.from; ld.endDate = e.to; }
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }

  /* ---------------- honours board ---------------- */
  function renderHof(el) {
    var h = D.hof;
    el.innerHTML = '<div class="honours"><p class="sample-note" style="margin-bottom:16px">' + esc(h.note) + "</p>" +
      '<h2 class="honours__title gold">' + esc(h.title) + '</h2><p class="honours__sub">' + esc(h.sub) + "</p>" +
      '<ol class="honours__list">' + D.hallOfFame.map(function (r) { return '<li><span class="honours__date">' + esc(r[0]) + '</span><span class="honours__team gold">' + esc(r[1]) + "</span></li>"; }).join("") + "</ol>" +
      (h.photo ? '<figure class="polaroid honours__photo" style="--r:2deg"><img src="' + img(h.photo) + '" alt="' + esc(h.photoAlt || "") + '" loading="lazy"><figcaption>' + esc(h.caption || "") + "</figcaption></figure>" : "") + "</div>";
  }

  /* ---------------- artists ---------------- */
  function artistSlots() {
    var map = {};
    WEEK.forEach(function (dow) {
      D.events.forEach(function (e) {
        if (e.days[0] !== dow || !e.lineup) return;
        e.lineup.forEach(function (l) { (map[l.who] = map[l.who] || []).push({ dow: dow, time: l.time, e: e }); });
      });
    });
    return map;
  }
  function renderArtists(el) {
    var map = artistSlots();
    el.innerHTML = Object.keys(D.artists).map(function (k) {
      var a = D.artists[k], sl = map[k] || [];
      return '<article class="artist"><span class="artist__initials" aria-hidden="true">' + esc(a.initials) + '</span><span class="artist__role">' + esc(a.role) + '</span><h3 class="artist__name">' + esc(a.name) + '</h3><ul class="artist__slots">' +
        sl.map(function (s) { return '<li><a href="' + s.e.slug + '.html"><span>' + DAYS[s.dow] + ", " + esc(s.e.name) + "</span><span>" + esc(s.time) + "</span></a></li>"; }).join("") + "</ul></article>";
    }).join("");
  }

  /* ---------------- reviews ---------------- */
  function quote(r, big) {
    return '<figure class="quote' + (big ? " quote--big" : "") + '" style="margin:0">' + stars() + '<blockquote class="quote__text">' + esc(r.text) + '</blockquote><figcaption class="quote__who"><span class="quote__name">' + esc(r.name) + '</span><span class="quote__src">' + esc(r.meta) + "</span></figcaption></figure>";
  }
  function renderReviews(el) {
    var f = D.reviews.filter(function (r) { return r.featured; })[0], rest = D.reviews.filter(function (r) { return !r.featured; });
    el.innerHTML = quote(f, true) + '<div class="reviews-cols" style="margin-top:28px">' + rest.map(function (r) { return quote(r); }).join("") + "</div>";
  }
  function renderReviewsMini(el) {
    var f = D.reviews.filter(function (r) { return r.featured; })[0];
    var two = D.reviews.filter(function (r) { return !r.featured; }).slice(0, 2);
    el.innerHTML = quote(f, true) + '<div class="grid grid--2" style="margin-top:22px">' + two.map(function (r) { return quote(r); }).join("") + "</div>";
  }

  /* ---------------- gallery, wall, lightbox ---------------- */
  var lb, lbItems = [], lbIdx = 0;
  function openLb(items, i) {
    lbItems = items; lbIdx = i;
    if (!lb) {
      document.body.insertAdjacentHTML("beforeend", '<div class="lightbox" role="dialog" aria-modal="true" aria-label="Photo"><button class="lightbox__prev" type="button" aria-label="Previous photo">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lightbox__next" type="button" aria-label="Next photo">&#8250;</button><button class="lightbox__close" type="button" aria-label="Close">&times;</button></div>');
      lb = $(".lightbox");
      $(".lightbox__prev", lb).addEventListener("click", function () { showLb(lbIdx - 1); });
      $(".lightbox__next", lb).addEventListener("click", function () { showLb(lbIdx + 1); });
      $(".lightbox__close", lb).addEventListener("click", closeLb);
      lb.addEventListener("click", function (ev) { if (ev.target === lb) closeLb(); });
      document.addEventListener("keydown", function (ev) {
        if (!lb.classList.contains("is-open")) return;
        if (ev.key === "Escape") closeLb(); if (ev.key === "ArrowLeft") showLb(lbIdx - 1); if (ev.key === "ArrowRight") showLb(lbIdx + 1);
      });
    }
    showLb(i); lb.classList.add("is-open"); $(".lightbox__close", lb).focus();
  }
  function showLb(i) { lbIdx = (i + lbItems.length) % lbItems.length; var it = lbItems[lbIdx]; $("img", lb).src = img(it.img); $("img", lb).alt = it.cap; $("figcaption", lb).textContent = it.cap; }
  function closeLb() { lb.classList.remove("is-open"); }
  function renderGallery(el) {
    el.innerHTML = D.gallery.map(function (g, i) { return '<button type="button" data-i="' + i + '"><img src="' + img(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"><span class="gallery__cap">' + esc(g.cap) + "</span></button>"; }).join("");
    el.addEventListener("click", function (ev) { var b = ev.target.closest("button"); if (b) openLb(D.gallery, +b.getAttribute("data-i")); });
  }
  /* Reem: photos pegged to a wire under the string lights. Forsan: framed on the clubhouse wall with brass plates. */
  function renderWall(el) {
    var n = +(el.getAttribute("data-wall") || 8), rot = [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 2];
    var picks = D.gallery.filter(function (g) { return !g.noWall; }).slice(0, n);
    var item = THEME === "reem"
      ? function (g, i) { return '<button type="button" class="snapshot" style="--r:' + rot[i % rot.length] + 'deg" data-i="' + i + '"><span class="snapshot__peg" aria-hidden="true"></span><img src="' + img(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"><span class="snapshot__cap">' + esc(g.cap) + "</span></button>"; }
      : function (g, i) { return '<button type="button" class="framed" data-i="' + i + '"><span class="framed__pic"><img src="' + img(g.img) + '" alt="' + esc(g.cap) + '" loading="lazy"></span><span class="framed__plate">' + esc(g.cap) + "</span></button>"; };
    var rows = THEME === "reem" ? [picks.slice(0, Math.ceil(picks.length / 2)), picks.slice(Math.ceil(picks.length / 2))] : [picks];
    var k = 0;
    el.innerHTML = rows.map(function (row) { return '<div class="wall__row">' + row.map(function (g) { return item(g, k++); }).join("") + "</div>"; }).join("") +
      '<p class="wall__cta">' + D.wallCta.replace("{handle}", '<a href="' + V.instagram + '" target="_blank" rel="noopener">' + V.handle + "</a>") + "</p>";
    el.addEventListener("click", function (ev) { var b = ev.target.closest("[data-i]"); if (b) openLb(picks, +b.getAttribute("data-i")); });
  }

  /* ---------------- crew ---------------- */
  function renderCrew(el) {
    el.innerHTML = D.crew.map(function (c) { return '<article class="crew"><span class="crew__badge" aria-hidden="true">' + esc(c.initials) + '</span><h3 class="crew__name">' + esc(c.name) + '</h3><span class="crew__role">' + esc(c.role) + "</span><p>" + esc(c.line) + "</p></article>"; }).join("");
  }

  /* ---------------- booking ---------------- */
  function renderBook(form) {
    var q = new URLSearchParams(location.search);
    var name = $("#bk-name", form), date = $("#bk-date", form), time = $("#bk-time", form), guests = $("#bk-guests", form), seat = $("#bk-seat", form), notes = $("#bk-notes", form);
    var choices = $("[data-choices]", form), preview = $("[data-wa-preview]"), msg = $("[data-book-msg]", form);
    var visit = $("[data-visit]", form), visitNote = $("[data-visit-note]", form);
    var chosen = null, extra = "", been = "";
    var t0 = today();
    date.min = iso(t0); date.value = iso(t0);
    seat.innerHTML = D.seats.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("");
    function fillTimes() {
      var d = fromIso(date.value || iso(t0)), os = openSpan(d.dow), keep = +time.value, times = [];
      for (var m = Math.ceil(os[0] / 30) * 30; m <= os[1] - 60; m += 30) times.push(m);
      time.innerHTML = times.map(function (m2) { return '<option value="' + m2 + '">' + fmt(m2) + "</option>"; }).join("");
      var want = keep && times.indexOf(keep) > -1 ? keep : (times.indexOf(19 * 60) > -1 ? 19 * 60 : times[0]);
      time.value = String(want);
    }
    fillTimes();

    function drawChoices() {
      var d = fromIso(date.value || iso(t0));
      var evs = D.events.filter(function (e) { return e.days.indexOf(d.dow) > -1; });
      var html = '<button class="chip" type="button" data-slug="" aria-pressed="' + (!chosen) + '">Just a table</button>' +
        evs.map(function (e) { return '<button class="chip" type="button" data-slug="' + e.slug + '" aria-pressed="' + (chosen === e.slug) + '">' + esc(e.name) + " at " + fmt(eventSpan(e)[0]) + "</button>"; }).join("");
      choices.innerHTML = html;
      if (chosen && !evs.some(function (e) { return e.slug === chosen; })) { chosen = null; drawChoices(); }
    }
    function message() {
      var d = fromIso(date.value || iso(t0)), e = chosen ? find(chosen) : null;
      var lines = [V.greet + " I'd like to book a table.", "",
        "Name: " + (name.value.trim() || "…"),
        "Date: " + longDate(d),
        "Time: " + fmt(+time.value),
        "Guests: " + guests.value];
      if (been) lines.push("Visit: " + been);
      if (e) lines.push("For: " + e.name);
      if (extra) lines.push(extra);
      if (seat.value !== D.seats[0]) lines.push("Seating: " + seat.value);
      if (notes.value.trim()) lines.push("Notes: " + notes.value.trim());
      lines.push("", "Sent from the " + V.full.replace(/^The /, "") + " website");
      return lines.join("\n");
    }
    function update() { preview.textContent = message(); }

    var ev0 = q.get("event") && find(q.get("event"));
    if (ev0) {
      if (ev0.slots) {
        var nx = nextOn(ev0.days[0], eventSpan(ev0)[1]); date.value = iso(nx); chosen = ev0.slug; fillTimes();
        var st = eventSpan(ev0)[0]; time.value = String(Math.round(st / 30) * 30);
        if (!time.value) fillTimes();
      } else extra = "Interested in: " + ev0.name;
    }
    if (q.get("date")) { var qd = q.get("date"); if (/^\d{4}-\d{2}-\d{2}$/.test(qd) && qd >= iso(t0)) { date.value = qd; fillTimes(); } }
    if (q.get("pkg")) extra = "Package: " + q.get("pkg");
    if (q.get("seat")) {
      var want = q.get("seat").toLowerCase();
      var hit = D.seats.filter(function (s) { return s.toLowerCase().indexOf(want) > -1; })[0];
      if (hit) seat.value = hit;
    }
    if (q.get("guests")) guests.value = Math.max(1, Math.min(60, +q.get("guests") || 2));
    if (q.get("time") && /^\d+$/.test(q.get("time"))) { var tq = String(Math.round(+q.get("time") / 30) * 30); if ($('option[value="' + tq + '"]', time)) time.value = tq; }
    if (q.get("note")) notes.value = q.get("note");

    drawChoices(); update();
    choices.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      chosen = c.getAttribute("data-slug") || null;
      if (chosen) { var e = find(chosen), st2 = String(Math.round(eventSpan(e)[0] / 30) * 30); if ($('option[value="' + st2 + '"]', time)) time.value = st2; }
      drawChoices(); update();
    });
    date.addEventListener("change", function () { fillTimes(); drawChoices(); update(); });
    /* first time or been before: optional; tap the chosen one again to clear it */
    if (visit) visit.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      been = been === c.getAttribute("data-v") ? "" : c.getAttribute("data-v");
      $$(".chip", visit).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === been)); });
      if (visitNote) visitNote.hidden = been !== "First time here";
      update();
    });
    [name, time, seat, notes].forEach(function (x) { x.addEventListener("input", update); x.addEventListener("change", update); });
    $$("[data-step]", form).forEach(function (b) {
      b.addEventListener("click", function () { var v = Math.min(60, Math.max(1, (+guests.value || 1) + +b.getAttribute("data-step"))); guests.value = v; update(); });
    });
    guests.addEventListener("input", update);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!name.value.trim()) { msg.textContent = "Add your name so the team knows who's coming."; name.focus(); return; }
      if (!date.value || date.value < iso(t0)) { msg.textContent = "Pick today or a date in the future."; date.focus(); return; }
      msg.textContent = "Opening WhatsApp with your booking. Hit send and the team will confirm.";
      window.open(waTo(message()), "_blank", "noopener");
    });
  }

  function renderMatchday(form) {
    var t0 = today(), dt = $("#md-date", form);
    dt.min = iso(t0); dt.value = iso(t0);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var match = $("#md-match", form).value.trim() || "the big game", n = $("#md-guests", form).value || "2";
      var text = V.greet + " I'd like a table to watch " + match + " on " + longDate(fromIso(dt.value)) + " for " + n + " people. Somewhere with a good view of the screens, please.";
      window.open(waTo(text), "_blank", "noopener");
    });
  }

  function renderGameForm(form) {
    var t0 = today(), dt = $("#gm-date", form), tm = $("#gm-time", form), n = $("#gm-players", form), chips = $("[data-games]", form), out = $("[data-game-msg]", form);
    var pick = new URLSearchParams(location.search).get("game") || D.games[0].key;
    chips.innerHTML = D.games.map(function (g) { return '<button class="chip" type="button" data-v="' + g.key + '" aria-pressed="' + (g.key === pick) + '">' + (I[g.icon] || "") + esc(g.name) + "</button>"; }).join("");
    dt.min = iso(t0); dt.value = iso(t0);
    function times() {
      var d = fromIso(dt.value || iso(t0)), os = openSpan(d.dow), keep = tm.value, list = [];
      for (var m = Math.ceil(os[0] / 30) * 30; m <= os[1] - 60; m += 30) list.push(m);
      tm.innerHTML = list.map(function (m2) { return '<option value="' + m2 + '">' + fmt(m2) + "</option>"; }).join("");
      tm.value = keep && list.indexOf(+keep) > -1 ? keep : String(list.indexOf(20 * 60) > -1 ? 20 * 60 : list[0]);
    }
    times();
    dt.addEventListener("change", times);
    chips.addEventListener("click", function (ev) {
      var c = ev.target.closest(".chip"); if (!c) return;
      pick = c.getAttribute("data-v");
      $$(".chip", chips).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
    });
    $$("[data-gstep]", form).forEach(function (b) { b.addEventListener("click", function () { n.value = Math.min(40, Math.max(1, (+n.value || 1) + +b.getAttribute("data-gstep"))); }); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var g = D.games.filter(function (x) { return x.key === pick; })[0];
      var text = V.greet + " I'd like to book " + g.say + " on " + longDate(fromIso(dt.value)) + " at " + fmt(+tm.value) + " for " + n.value + (+n.value === 1 ? " player" : " players") + ".\n\nSent from the " + V.full.replace(/^The /, "") + " website";
      out.textContent = "Opening WhatsApp. Hit send and the team will confirm your " + g.unit + ".";
      window.open(waTo(text), "_blank", "noopener");
    });
  }

  /* ---------------- menus (PDFs arrive after launch) ---------------- */
  function menuModal() {
    var copy = D.menuCopy;
    $$("[data-menu-open]").forEach(function (b) {
      b.addEventListener("click", function (ev) {
        var k = b.getAttribute("data-menu-open"), url = D.menus[k];
        if (url) { if (b.tagName !== "A") window.open(url, "_blank", "noopener"); return; }
        ev.preventDefault();
        var m = $(".modal");
        if (!m) {
          document.body.insertAdjacentHTML("beforeend", '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-t"><div class="modal__card"><button class="modal__close" type="button" aria-label="Close">&times;</button><h2 class="modal__title" id="modal-t"></h2><p class="lede" data-modal-p></p><div class="btn-row"><a class="btn btn--wa" target="_blank" rel="noopener" data-modal-wa>' + I.wa + ' Ask on WhatsApp</a></div><p class="small" style="margin:0">Demo: the real menu opens here once the venue sends it.</p></div></div>');
          m = $(".modal");
          $(".modal__close", m).addEventListener("click", function () { m.classList.remove("is-open"); });
          m.addEventListener("click", function (e2) { if (e2.target === m) m.classList.remove("is-open"); });
          document.addEventListener("keydown", function (e2) { if (e2.key === "Escape") m.classList.remove("is-open"); });
        }
        $("#modal-t", m).textContent = copy[k][0];
        $("[data-modal-p]", m).textContent = copy[k][1];
        $("[data-modal-wa]", m).href = waTo(V.greet + " Could you send me the " + copy[k][0].toLowerCase() + "?");
        m.classList.add("is-open"); $(".modal__close", m).focus();
      });
    });
    Object.keys(D.menus).forEach(function (k) {
      if (!D.menus[k]) return;
      $$('[data-menu-open="' + k + '"]').forEach(function (a) { a.href = D.menus[k]; a.target = "_blank"; });
    });
  }

  /* ---------------- find us ---------------- */
  function renderHours(el) {
    var td = today().dow;
    el.innerHTML = "<tbody>" + WEEK.map(function (d) {
      var h = V.hours[d];
      var hs2 = hhSpan(d);
      return '<tr' + (d === td ? ' class="is-today"' : "") + '><th scope="row">' + DAYS[d] + (d === td ? " (today)" : "") + "</th><td>" + fmt(h[0]) + " – " + fmt(h[1]) + "</td><td>" + (hs2 ? HHN + " " + fmt(hs2[0]) + " – " + fmt(hs2[1]) : (V.hoursNote && V.hoursNote[d]) || "") + "</td></tr>";
    }).join("") + "</tbody>";
  }
  /* our own map, drawn from street data in map.js, with the route to the door; it works offline and tapping opens Google Maps */
  var mapAnim = !reduce && "IntersectionObserver" in window && !/[?&]shot=/.test(location.search);
  function mapHtml() {
    var M = window.ABK_MAP;
    if (!M && V.mapEmbed) return '<div class="map map--embed"><span class="map__ph">' + I.pin + ' Loading the map</span><iframe src="' + V.mapEmbed + '" title="Map: ' + esc(V.full) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><a class="map__cta" href="' + V.maps + '" target="_blank" rel="noopener">' + I.pin + " Open in Google Maps</a></div>";
    if (!M) return '<a class="map map--plain" href="' + V.maps + '" target="_blank" rel="noopener"><span class="map__cta">' + I.pin + " Open in Google Maps</span></a>";
    var v = M.view;
    function at(p) { return "left:" + ((p[0] - v[0]) / v[2] * 100).toFixed(2) + "%;top:" + ((p[1] - v[1]) / v[3] * 100).toFixed(2) + "%"; }
    return '<a class="map map--drawn' + (mapAnim ? " is-pre" : "") + '" href="' + V.maps + '" target="_blank" rel="noopener" aria-label="' + esc(M.aria) + ' Opens Google Maps.">' +
      '<svg class="map__svg" viewBox="' + v.join(" ") + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + M.svg + "</svg>" +
      M.labels.map(function (l) {
        if (l.type === "road") return '<span class="map__road" style="' + at(l.at) + ";--a:" + l.angle + 'deg">' + esc(l.text) + "</span>";
        if (l.type === "note") return '<span class="map__note" style="' + at(l.at) + '"><b>' + esc(l.text) + "</b>" + esc(l.sub || "") + "</span>";
        return '<span class="map__' + l.type + '" style="' + at(l.at) + '">' + esc(l.text) + "</span>";
      }).join("") +
      '<span class="map__flag" style="' + at(M.venue) + '"><span class="map__badge"><img src="assets/img/logo.png" alt=""></span><span class="map__name"><b>' + esc(V.name) + "</b>" + esc(M.venueSub) + "</span></span>" +
      '<span class="map__cta">' + I.pin + " Open in Google Maps</span>" +
      '<span class="map__credit">© OpenStreetMap</span></a>';
  }
  function renderMap(el) { el.outerHTML = mapHtml(); }
  /* the route draws itself the first time the map scrolls into view */
  function mapIn() {
    $$(".map--drawn.is-pre").forEach(function (m) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        m.classList.remove("is-pre"); io.disconnect();
      }, { threshold: 0.35 });
      io.observe(m);
    });
  }
  function renderFindUs(el) {
    var st = liveStatus();
    el.innerHTML = '<div class="wrap split findus">' + mapHtml() +
      '<div><div class="sec-head"><h2 class="d-l">Where to find us</h2><p class="lede">' + V.findLede + "</p></div>" +
      '<ul class="icon-list">' +
      "<li>" + I.pin + "<div><h3>" + esc(V.address[0]) + "</h3><p>" + esc(V.address.slice(1).join(", ")) + "</p></div></li>" +
      "<li>" + I.car + "<div><h3>" + esc(V.parkingTitle) + "</h3><p>" + V.parkingText + "</p></div></li>" +
      "<li>" + I.clock + "<div><h3>" + (st.open ? "Open now, till " + fmt(st.o1) : esc(L.hoursSummary(V.hours))) + "</h3><p>" + esc(V.hhLine || V.openNote || "") + "</p></div></li>" +
      "</ul>" +
      '<div class="btn-row" style="margin-top:26px"><a class="btn" href="' + V.maps + '" target="_blank" rel="noopener">Get directions</a><a class="btn btn--ghost" href="find-us.html">First time? Read the guide</a></div></div></div>';
  }
  function renderRating(el) {
    if (V.google.hide) { el.innerHTML = '<span class="rating">What guests say on Google</span>'; return; }
    el.innerHTML = '<span class="rating">' + stars() + "<b>" + V.google.rating + "</b> on Google from " + V.google.count + " reviews</span>";
  }
  /* the dishes guests talk about; prices only where the venue has confirmed them */
  function renderDishes(el) {
    el.innerHTML = '<ul class="dishes">' + D.dishes.map(function (d) {
      return '<li><span class="dishes__row"><span class="dishes__name">' + esc(d[0]) + "</span>" + (d[2] ? '<span class="dishes__dots" aria-hidden="true"></span><span class="dishes__price">' + (typeof d[2] === "number" ? "AED " + d[2] : esc(d[2])) + "</span>" : "") + "</span>" + (d[1] ? '<span class="dishes__desc">' + esc(d[1]) + "</span>" : "") + "</li>";
    }).join("") + "</ul>";
  }

  /* ---------------- Reem: after-work countdown ---------------- */
  /* "an hour", "1h 30m", "45 minutes": friendlier than 1h 0m */
  function nice(m) {
    if (m < 60) return m + (m === 1 ? " minute" : " minutes");
    if (m % 60 === 0) return m === 60 ? "an hour" : m / 60 + " hours";
    return Math.floor(m / 60) + "h " + (m % 60) + "m";
  }
  function paintAfterwork(el) {
    var b = biz(), st = liveStatus(), dow = b.bdow, weekend = dow === 6 || dow === 0, A2 = D.afterwork;
    var off = A2.office || 18 * 60, big, cap, line, sub = A2.fromLine;
    if (st.hh) {
      var left = st.h1 - b.bmins;
      big = Math.floor(left / 60) + ":" + pad(left % 60);
      cap = "of happy hour left";
      if (weekend) line = "No office today? Happy hour runs till " + fmt(st.h1) + ".";
      else if (b.bmins < off - 30) line = "Out of the office at " + fmt(off) + "? That still leaves " + nice(st.h1 - off) + " of happy hour.";
      else line = "Happy hour ends at " + fmt(st.h1) + ". Leave now and you'll make it.";
    } else if (b.bmins < st.h0) {
      big = fmt(st.h0); cap = "happy hour starts";
      line = "Happy hour runs " + fmt(st.h0) + " – " + fmt(st.h1) + " today.";
    } else {
      var nx = hhSpan((dow + 1) % 7) || [12 * 60];
      big = fmt(nx[0]); cap = "happy hour's back" + (b.late ? "" : " tomorrow");
      line = "Happy hour's done for today. The kitchen and the garden are open till " + fmt(st.o1) + ".";
      sub = "";
    }
    el.innerHTML = '<div class="wrap afterwork__in"><div class="afterwork__clock"><p class="afterwork__big">' + big + '</p><p class="afterwork__cap">' + cap + '</p></div><div class="afterwork__txt"><p class="afterwork__line">' + esc(line) + "</p>" + (sub ? '<p class="afterwork__sub">' + esc(sub) + "</p>" : "") + '</div><a class="btn btn--dark" href="book.html?date=' + iso(today()) + "&time=" + Math.max(st.o0, off) + '">Hold me a table</a></div>';
  }

  /* ---------------- Reem: on tap ---------------- */
  function glass(color, head) {
    return '<svg class="tapcard__glass" viewBox="0 0 40 64" aria-hidden="true"><path d="M5 6h30l-3 52a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="' + color + '"/><path d="M5 6h30l-.6 9H5.6z" fill="' + (head || "#f6efe1") + '"/><path d="M5 6h30l-3 52a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.6"/><path d="M11 18l1.6 34" stroke="rgba(255,255,255,.35)" stroke-width="2.4" stroke-linecap="round"/></svg>';
  }
  function renderTaps(el) {
    var n = +(el.getAttribute("data-taps") || 99);
    el.innerHTML = '<ul class="taps">' + D.taps.slice(0, n).map(function (t) {
      return '<li class="tapcard">' + glass(t.color, t.head) + '<span class="tapcard__name">' + esc(t.name) + '</span><span class="tapcard__style">' + esc(t.style) + '</span><span class="tapcard__from">' + esc(t.from) + "</span></li>";
    }).join("") + "</ul>";
  }

  /* ---------------- F1: the next race and the rest of the season ---------------- */
  function raceTime(r) { var p = r.date.split("-"), t = toMin(r.time); return Date.UTC(+p[0], +p[1] - 1, +p[2]) + (t - 240) * 60000; }
  function upcomingRaces() { var now = Date.now(); return D.races.filter(function (r) { return raceTime(r) + 2 * 36e5 > now; }); }
  function raceDate(r) { var o = fromIso(r.date); return shortDate(o); }
  function paintNextRace(el) {
    var list = upcomingRaces(), r = list[0];
    if (!r) { el.innerHTML = '<p class="race__none">That\'s the season done. Testing starts again in the new year.</p>'; return; }
    var ms = raceTime(r) - Date.now(), live = ms <= 0, d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    el.innerHTML = '<div class="race' + (r.home ? " race--home" : "") + '"><p class="race__kicker">' + (live ? "Racing now" : "Next race on the screens") + (r.home ? ", and it's on our doorstep" : "") + '</p>' +
      '<p class="race__name">' + esc(r.name) + '</p><p class="race__when">' + raceDate(r) + ", lights out " + fmt(r.time) + " UAE time" + (r.note ? ". " + esc(r.note) : "") + "</p>" +
      (live ? "" : '<p class="race__count" aria-label="' + d + " days " + h + " hours " + m + ' minutes to go"><span><b>' + d + "</b>days</span><span><b>" + h + "</b>hours</span><span><b>" + m + "</b>mins</span></p>") +
      '<div class="btn-row"><a class="btn" href="book.html?date=' + r.date + "&time=" + Math.max(0, toMin(r.time) - 60) + "&note=" + encodeURIComponent("For the " + r.name) + '">Book a table for the race</a></div></div>';
  }
  function renderRaces(el) {
    var list = upcomingRaces();
    el.innerHTML = list.length ? '<ol class="races">' + list.map(function (r) {
      return '<li class="races__row' + (r.home ? " is-home" : "") + '"><span class="races__date">' + raceDate(r) + '</span><span class="races__name">' + esc(r.name) + "<small>" + esc(r.place) + '</small></span><span class="races__time">' + fmt(r.time) + "</span></li>";
    }).join("") + '</ol><p class="small" style="margin-top:12px">Lights-out times in UAE time. Times can shift, so check before you come.</p>' : '<p class="empty">No races left this season.</p>';
  }

  /* ---------------- Forsan: make a day of it ---------------- */
  function renderPlanner(root) {
    var acts = D.activities, t0 = today();
    var state = { act: acts[0].key, date: iso(t0), start: 16 * 60, guests: 4 };
    var starts = []; for (var m = 9 * 60; m <= 21 * 60; m += 30) starts.push(m);
    root.innerHTML =
      '<div class="planner"><div class="planner__controls">' +
      '<fieldset class="field"><legend>What are you doing first?</legend><div class="choices" data-acts>' + acts.map(function (a, i) { return '<button class="chip act" type="button" data-v="' + a.key + '" aria-pressed="' + (i === 0) + '">' + (I[a.icon] || "") + esc(a.name) + "</button>"; }).join("") + "</div></fieldset>" +
      '<div class="form__row"><div class="field"><label for="pl-date">Which day?</label><input id="pl-date" type="date" min="' + iso(t0) + '" value="' + iso(t0) + '"></div>' +
      '<div class="field"><label for="pl-start">Activity starts at</label><select id="pl-start">' + starts.map(function (m2) { return '<option value="' + m2 + '"' + (m2 === state.start ? " selected" : "") + ">" + fmt(m2) + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="field"><label for="pl-guests">How many of you?</label><div class="stepper"><button type="button" data-pstep="-1" aria-label="One fewer">&minus;</button><input id="pl-guests" type="number" min="1" max="120" value="4" inputmode="numeric"><button type="button" data-pstep="1" aria-label="One more">+</button></div></div>' +
      '</div><div class="planner__out" data-plan aria-live="polite"></div></div>';
    function draw() {
      var a = acts.filter(function (x) { return x.key === state.act; })[0];
      var d = fromIso(state.date), os = openSpan(d.dow);
      var table = Math.ceil((state.start + a.mins + 15) / 15) * 15, early = table < os[0];
      if (early) table = os[0];
      var late = table > os[1] - 60;
      var msg = V.greet + " We're doing " + a.say + " at Al Forsan on " + longDate(d) + " (starting " + fmt(state.start) + "). Could we have a table for " + state.guests + " at about " + fmt(table) + "?\n\nSent from the Make a day of it planner";
      $("[data-plan]", root).innerHTML =
        '<p class="planner__kicker">Your day</p>' +
        '<ol class="planner__steps"><li><b>' + fmt(state.start) + "</b>" + esc(a.name) + "<span>" + esc(a.note) + '</span></li><li><b>' + fmt(table) + "</b>Table at Adam's Beer Kitchen<span>" + (early ? "We open at " + fmt(os[0]) + " that day, so that's the first table." : late ? "That's close to closing time, so check with the team." : "Allowing " + nice(a.mins) + " for " + esc(a.short) + ", plus time to change and walk over.") + "</span></li></ol>" +
        '<p class="planner__who">' + state.guests + (state.guests === 1 ? " guest" : " guests") + ", " + longDate(d) + (state.guests >= 10 ? '. Big group? <a href="groups.html">See team days</a>' : "") + "</p>" +
        '<div class="btn-row"><a class="btn btn--wa" href="' + waTo(msg) + '" target="_blank" rel="noopener">' + I.wa + ' Hold our table</a><a class="btn btn--ghost" href="' + D.resortUrl + '" target="_blank" rel="noopener">Book ' + esc(a.short) + " with Al Forsan</a></div>";
    }
    root.addEventListener("click", function (ev) {
      var c = ev.target.closest("[data-acts] .chip");
      if (c) { state.act = c.getAttribute("data-v"); $$("[data-acts] .chip", root).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); }); draw(); }
      var s = ev.target.closest("[data-pstep]");
      if (s) { state.guests = Math.max(1, Math.min(120, state.guests + +s.getAttribute("data-pstep"))); $("#pl-guests", root).value = state.guests; draw(); }
    });
    $("#pl-date", root).addEventListener("change", function (ev) { if (ev.target.value >= iso(t0)) state.date = ev.target.value; draw(); });
    $("#pl-start", root).addEventListener("change", function (ev) { state.start = +ev.target.value; draw(); });
    $("#pl-guests", root).addEventListener("input", function (ev) { state.guests = Math.max(1, Math.min(120, +ev.target.value || 1)); draw(); });
    var pre = new URLSearchParams(location.search).get("activity");
    if (pre && acts.some(function (a) { return a.key === pre; })) { state.act = pre; $$("[data-acts] .chip", root).forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-v") === pre)); }); }
    draw();
  }

  /* ---------------- Forsan: group and party enquiries (both end up in WhatsApp) ---------------- */
  function enquiryForm(form, build) {
    var t0 = today(), dt = $('input[type="date"]', form), out = $("[data-enq-msg]", form);
    if (dt) { dt.min = iso(t0); dt.value = iso(addDays(t0.y, t0.m, t0.d, 7)); }
    $$("[data-chips]", form).forEach(function (g) {
      g.addEventListener("click", function (ev) {
        var c = ev.target.closest(".chip"); if (!c) return;
        $$(".chip", g).forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
      });
    });
    $$("[data-step]", form).forEach(function (b) {
      b.addEventListener("click", function () { var inp = $("#" + b.getAttribute("data-for"), form); inp.value = Math.min(+inp.max || 200, Math.max(+inp.min || 1, (+inp.value || 1) + +b.getAttribute("data-step"))); });
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nm = $('[name="name"]', form);
      if (nm && !nm.value.trim()) { out.textContent = "Add a name so the team knows who to reply to."; nm.focus(); return; }
      var pick = function (n) { var c = $('[data-chips="' + n + '"] [aria-pressed="true"]', form); return c ? c.textContent : ""; };
      out.textContent = "Opening WhatsApp with your enquiry. Hit send and the team will reply.";
      window.open(waTo(build(function (n) { var el = $('[name="' + n + '"]', form); return el ? el.value.trim() : ""; }, pick, dt ? longDate(fromIso(dt.value)) : "")), "_blank", "noopener");
    });
  }
  function renderGroupForm(form) {
    enquiryForm(form, function (v, pick, date) {
      var lines = [V.greet + " I'd like to ask about a group booking.", "", "Name: " + v("name")];
      if (v("company")) lines.push("Company: " + v("company"));
      lines.push("Date: " + date, "Group size: " + v("size"));
      if (v("activity") && v("activity") !== "None") lines.push("Before that: " + v("activity"));
      if (pick("style")) lines.push("Looking for: " + pick("style"));
      if (pick("budget")) lines.push("Budget per person: " + pick("budget"));
      if (v("notes")) lines.push("Notes: " + v("notes"));
      lines.push("", "Sent from the " + V.full.replace(/^The /, "") + " website");
      return lines.join("\n");
    });
  }
  function renderPartyForm(form) {
    enquiryForm(form, function (v, pick, date) {
      var lines = [V.greet + " I'd like to plan a kids' party.", "", "Parent: " + v("name"), "Date: " + date];
      if (v("child")) lines.push("Birthday: " + v("child"));
      lines.push("Kids: " + v("kids"), "Adults: " + v("adults"));
      if (pick("time")) lines.push("Time of day: " + pick("time"));
      if (v("film")) lines.push("Film on the big screen: " + v("film"));
      if (v("notes")) lines.push("Notes: " + v("notes"));
      lines.push("", "Sent from the " + V.full.replace(/^The /, "") + " website");
      return lines.join("\n");
    });
  }

  /* ---------------- header behaviour ---------------- */
  function headerUi() {
    var hdr = $("#hdr"), more = $(".nav__more"), mnav = $("#mnav"), burger = $(".hdr__burger");
    function onScroll() { hdr.classList.toggle("is-solid", window.scrollY > 20); }
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    if (more) {
      var mb = $("button", more);
      mb.addEventListener("click", function (e) { e.stopPropagation(); var o = more.classList.toggle("is-open"); mb.setAttribute("aria-expanded", String(o)); });
      document.addEventListener("click", function (e) { if (!more.contains(e.target)) { more.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); } });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { more.classList.remove("is-open"); mb.setAttribute("aria-expanded", "false"); } });
    }
    function setNav(o) {
      mnav.classList.toggle("is-open", o); burger.setAttribute("aria-expanded", String(o));
      document.documentElement.classList.toggle("is-locked", o);
      if (window.__lenis) (o ? window.__lenis.stop() : window.__lenis.start());
      if (o) $(".mnav__close", mnav).focus(); else burger.focus();
    }
    burger.addEventListener("click", function () { setNav(true); });
    $(".mnav__close", mnav).addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("is-open")) setNav(false); });
  }

  /* ---------------- smooth scroll (desktop mouse only) ---------------- */
  function smooth() {
    if (reduce || !window.Lenis || !hasGsap || /[?&]shot=/.test(location.search) || !matchMedia("(pointer: fine)").matches) return;
    var lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (document.documentElement.classList.contains("is-locked")) lenis.stop();
  }

  /* ---------------- the intro + hero entrance ---------------- */
  function unlock() {
    document.documentElement.classList.remove("is-locked");
    if (window.__lenis) window.__lenis.start();
    if (hasGsap) ScrollTrigger.refresh();
  }
  /* hero entrance: hidden while the intro plays, revealed as it clears. [selector, hidden state, reveal tween, position] */
  var HERO = [
    [".hero__title .ln > span", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.09, ease: "power4.out" }, 0],
    [".hero__kicker, .hero__hook, .hero__live, .hero__copy .btn-row, .hero__copy [data-livecard]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.35],
    [".board", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.3],
    [".hero__bg", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.8, ease: "power2.out" }, 0]
  ];
  function heroClear() { HERO.forEach(function (h) { gsap.set(h[0], { clearProps: "transform,opacity" }); }); }
  function heroIn() {
    if (!hasGsap || reduce || !$(".hero")) return null;
    HERO.forEach(function (h) { gsap.set(h[0], h[1]); });
    var shown = false;
    return {
      play: function () {
        if (shown) return; shown = true;
        var tl = gsap.timeline({ onComplete: heroClear });
        HERO.forEach(function (h) { tl.to(h[0], h[2], h[3]); });
        setTimeout(heroClear, 2600); /* safety net: the page is always visible */
        if (THEME === "forsan") dropPlates();
      }
    };
  }
  /* Forsan: the scoreboard's tin plates swing onto their hooks once the board is in */
  function dropPlates() {
    if (!hasGsap || reduce) return;
    var p = $$(".sb__plates .tp, .sb__date .tp");
    if (!p.length) return;
    gsap.fromTo(p, { rotationX: -95, transformOrigin: "50% 0%" }, { rotationX: 0, duration: 0.7, stagger: 0.05, ease: "back.out(2.2)", delay: 0.45, clearProps: "transform" });
  }
  /* Reem: the bulbs switch on one by one, the logo and slogan arrive, then the dark lifts away (about 2.6s) */
  function playLights(p, hero) {
    var bulbs = $$(".lights__bulb", p), glows = $$(".lights__glow", p), glassEls = $$(".lights__glass", p), logo = $(".intro__logo", p), slogan = $$(".intro__slogan span", p);
    gsap.set(glows, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
    gsap.set(logo, { opacity: 0, y: 14, scale: 0.92 });
    gsap.set(slogan, { opacity: 0, y: 12 });
    var order = bulbs.map(function (b, i) { return i; }).sort(function (a, b) {
      var ta = bulbs[a].getAttribute("transform"), tb = bulbs[b].getAttribute("transform");
      return parseFloat(ta.split("(")[1]) - parseFloat(tb.split("(")[1]);
    });
    var tl = gsap.timeline({ onComplete: function () { p.remove(); unlock(); } });
    order.forEach(function (idx, k) {
      var t = 0.12 + k * 0.055;
      tl.to(glassEls[idx], { attr: { fill: "#ffcf7d" }, duration: 0.08 }, t)
        .to(glows[idx], { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }, t);
      if (k === 5) tl.to(glows[idx], { opacity: 0.25, duration: 0.06, yoyo: true, repeat: 3 }, t + 0.36); /* one bulb flickers */
    });
    var lit = 0.12 + order.length * 0.055;
    tl.to(logo, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, lit - 0.2)
      .to(slogan, { opacity: 1, y: 0, duration: 0.32, stagger: 0.15, ease: "power2.out" }, lit + 0.05)
      .to(p, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, lit + 1.05)
      .to($(".intro__stage", p), { scale: 1.06, duration: 0.6, ease: "power2.in" }, lit + 1.05)
      .add(function () { if (hero) hero.play(); }, lit + 1.1);
    return tl;
  }
  /* Forsan: six tin plates roll like a fruit machine and land on the name, then the board drops away (about 2.8s) */
  function playPlates(p, hero) {
    var reels = $$(".plate__reel", p), logo = $(".intro__logo", p), slogan = $$(".intro__slogan span", p), board = $(".plates", p);
    gsap.set(logo, { opacity: 0, y: -12 });
    gsap.set(slogan, { opacity: 0, y: 12 });
    gsap.set(board, { opacity: 0, y: 16 });
    var tl = gsap.timeline({ onComplete: function () { p.remove(); unlock(); } });
    tl.to(board, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);
    reels.forEach(function (r, i) {
      var n = r.children.length, h = r.children[0].getBoundingClientRect().height || 72;
      gsap.set(r, { y: 0 });
      tl.to(r, { y: -(n - 1) * h, duration: 0.75 + i * 0.12, ease: "power3.out" }, 0.15);
    });
    var landed = 0.15 + 0.75 + (reels.length - 1) * 0.12;
    tl.to(logo, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(2)" }, landed - 0.15)
      .to(slogan, { opacity: 1, y: 0, duration: 0.3, stagger: 0.14, ease: "power2.out" }, landed + 0.05)
      .to($(".intro__stage", p), { y: 60, opacity: 0, duration: 0.5, ease: "power2.in" }, landed + 1.05)
      .to(p, { opacity: 0, duration: 0.45, ease: "power1.inOut" }, landed + 1.25)
      .add(function () { if (hero) hero.play(); }, landed + 1.3);
    return tl;
  }
  /* Vickers: the harp draws itself in copper, the strings are plucked one by one (a note floats off
     each), the shamrock pops, the name and the Irish welcome arrive, then the harp flies up into
     the header while the page fades in underneath (about 4.6s) */
  function playHarp(p, hero) {
    var h = $(".intro__harp", p), frame = $(".h-frame", h), boards = $$(".h-board", h), inlay = $(".h-inlay", h), base = $$(".h-base rect", h);
    var strs = $$(".h-string", h), sham = $(".h-sham__in", h), notes = $(".intro__notes", p);
    var chars = $$(".intro__word .ch", p), irish = $(".intro__irish", p), en = $(".intro__en", p), dust = $(".intro__dust", p), skipB = $(".intro__skip", p);
    var mark = $(".hdr .brand__mark");
    gsap.set(frame, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
    gsap.set(boards.concat([inlay]), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(strs, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(base, { scaleX: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
    gsap.set(sham, { scale: 0, rotation: -60, transformOrigin: "0px 0px" });
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    gsap.set([irish, en], { opacity: 0, y: 14 });
    gsap.set(h, { scale: 0.92, transformOrigin: "50% 50%" });
    var tl = gsap.timeline({ onComplete: function () { p.remove(); if (mark) mark.style.visibility = ""; unlock(); } });
    tl.to(dust, { opacity: 1, duration: 1.2 }, 0)
      .to(h, { scale: 1, duration: 2.2, ease: "power2.out" }, 0)
      .to(frame, { strokeDashoffset: 0, duration: 1.05, ease: "power1.inOut" }, 0.02)
      .to(boards, { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" }, 0.35)
      .to(frame, { fillOpacity: 1, duration: 0.45, ease: "power1.out" }, 0.85)
      .to(inlay, { strokeDashoffset: 0, duration: 0.5, ease: "power1.out" }, 0.95)
      .to(base, { scaleX: 1, duration: 0.45, stagger: 0.08, ease: "back.out(2)" }, 0.95);
    /* the glissando: each string is drawn, then plucked */
    strs.forEach(function (s, i) {
      var t = 1.15 + i * 0.1;
      tl.to(s, { strokeDashoffset: 0, duration: 0.16, ease: "none" }, t)
        .add(function () { pluck(s, i); }, t + 0.12);
    });
    var lastPluck = 1.15 + strs.length * 0.1;
    tl.to(sham, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.6)" }, lastPluck)
      .to(chars, { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.035, ease: "power3.out" }, lastPluck + 0.1)
      .to(irish, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, lastPluck + 0.55)
      .to(en, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, lastPluck + 0.75);
    var out = lastPluck + 1.75;
    tl.to([chars, irish, en, skipB], { opacity: 0, y: -10, duration: 0.35, stagger: 0.004, ease: "power2.in" }, out)
      .to(dust, { opacity: 0, duration: 0.4 }, out);
    /* fly the harp up into its place in the header (measured from the unscaled wrapper) */
    var to = mark && mark.getBoundingClientRect(), from = $(".intro__harpwrap", p).getBoundingClientRect();
    if (to && to.width && from.height) {
      tl.to(h, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.height / from.height, duration: 0.8, ease: "power3.inOut" }, out + 0.25);
    } else tl.to(h, { opacity: 0, scale: 1.2, duration: 0.5 }, out + 0.25);
    tl.to(p, { backgroundColor: "rgba(8, 21, 15, 0)", duration: 0.7, ease: "power2.inOut" }, out + 0.35)
      .add(function () { if (hero) hero.play(); }, out + 0.4)
      .to({}, { duration: 0.01 }, out + 1.1);
    if (mark) mark.style.visibility = "hidden";
    return tl;
  }
  function pluck(s, i) {
    var x1 = +s.getAttribute("data-x1"), y1 = +s.getAttribute("data-y1"), x2 = +s.getAttribute("data-x2"), y2 = +s.getAttribute("data-y2");
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, o = { a: 7 - i * 0.4 };
    s.classList.add("is-plucked");
    gsap.to(o, { a: 0, duration: 1.1, ease: "elastic.out(1.4, 0.18)", onUpdate: function () { s.setAttribute("d", "M" + x1 + " " + y1 + " Q" + (mx + o.a) + " " + my + " " + x2 + " " + y2); },
      onComplete: function () { s.classList.remove("is-plucked"); } });
    var box = s.ownerSVGElement && s.ownerSVGElement.getBoundingClientRect(), wrap = s.ownerSVGElement && s.ownerSVGElement.parentNode.querySelector(".intro__notes");
    if (!box || !wrap) return;
    var vb = s.ownerSVGElement.viewBox.baseVal, k = box.width / vb.width;
    var n = document.createElement("span");
    n.className = "intro__note"; n.textContent = i % 3 === 1 ? "\u266B" : "\u266A";
    n.style.left = ((mx - vb.x) * k) + "px"; n.style.top = ((my - vb.y) * k) + "px";
    wrap.appendChild(n);
    gsap.fromTo(n, { opacity: 0, y: 0, x: 0, scale: 0.6 }, { opacity: 1, y: -46 - i * 4, x: 18 + i * 3, scale: 1, duration: 0.7, ease: "power2.out", onComplete: function () { gsap.to(n, { opacity: 0, y: "-=30", duration: 0.6, onComplete: function () { n.remove(); } }); } });
  }
  function playIntro() {
    var p = $("#intro");
    if (!p) { unlock(); return; }
    if (!hasGsap) { p.remove(); unlock(); return; }
    L.ss(KEY + "_intro", "1");
    var hero = heroIn();
    var tl = THEME === "reem" ? playLights(p, hero) : THEME === "vickers" ? playHarp(p, hero) : playPlates(p, hero);
    var at = /[?&]introAt=([\d.]+)/.exec(location.search); /* preview: freeze the intro at a moment */
    if (at) { tl.pause(); tl.seek(+at[1]); return; }
    function skip() { tl.progress(1); if (hero) hero.play(); }
    setTimeout(function () { if (document.body.contains(p)) skip(); }, THEME === "vickers" ? 7500 : 5000); /* safety net */
    $(".intro__skip", p).addEventListener("click", skip);
    p.addEventListener("click", function (e) { if (!e.target.closest(".intro__skip")) skip(); });
    document.addEventListener("keydown", function k(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { skip(); document.removeEventListener("keydown", k); } });
  }
  function start() {
    if ($("#intro")) playIntro();
    else { unlock(); if (THEME === "forsan" && $(".hero")) dropPlates(); }
  }

  /* ---------------- tonight takeover: the hero becomes today's main event ---------------- */
  function takeoverInfo() {
    var b = biz(), t = D.takeover && D.takeover[b.bdow];
    if (!t) return null;
    var e = find(t.slug), x = eventSpan(e);
    var a = t.start ? toMin(t.start) : x[0], z = t.end ? toMin(t.end) : x[1];
    if (z <= a) z += 1440;
    if (b.bmins >= z) return null;
    return { t: t, e: e, a: a, z: z, on: b.bmins >= a, b: b };
  }
  function renderTakeover() {
    var hero = $(".hero"), info = takeoverInfo();
    if (!hero || !info) return;
    var label = info.a >= 17 * 60 ? "Tonight" : "Today";
    var title = $(".hero__title"), hook = $(".hero__hook"), row = $(".hero__copy .btn-row");
    hero.classList.add("is-takeover");
    title.innerHTML = info.t.lines.map(function (l) { return '<span class="ln"><span>' + esc(l) + "</span></span>"; }).join("");
    title.insertAdjacentHTML("beforebegin", '<p class="hero__kicker">' + label + " at " + esc(V.full) + "</p>");
    hook.textContent = info.t.sub;
    row.innerHTML = '<a class="btn" href="book.html?event=' + info.e.slug + '">Book for ' + label.toLowerCase() + '</a><a class="btn btn--ghost" href="' + (info.t.link || info.e.slug + ".html") + '">See the night</a>';
    $(".hero__live").insertAdjacentHTML("afterbegin", '<span class="pill pill--count" data-takeover-pill><span class="pill__dot"></span><span data-takeover-text></span></span>');
    paintTakeover();
  }
  function paintTakeover() {
    var p = $("[data-takeover-pill]");
    if (!p) return;
    var info = takeoverInfo();
    if (!info) { p.hidden = true; return; }
    var left = info.a - info.b.bmins;
    $("[data-takeover-text]", p).textContent = info.on ? "On now, till " + fmt(info.z) : left <= 12 * 60 ? "Starts in " + dur(left) : "Starts at " + fmt(info.a);
    p.classList.toggle("is-on", info.on);
  }

  /* ---------------- Ask Adam: instant answers from the live schedule.
     Floats on every page, and the conversation follows visitors from page to page. ---------------- */
  var A = D.adam;
  var BT_MAIN = A.main, BT_MORE = A.more;
  var bt = null, bk = null;
  function btList(items) {
    return '<ul class="bt-list">' + items.map(function (it) { return "<li><b>" + it[0] + "</b><div>" + it[1] + (it[2] ? "<span>" + it[2] + "</span>" : "") + "</div></li>"; }).join("") + "</ul>";
  }
  function btBtns(btns) {
    return '<div class="bt-actions">' + btns.map(function (x) {
      var ext = /^(https?:|tel:)/.test(x[1]) || /\.pdf$/.test(x[1]);
      return '<a class="btn ' + (x[2] || "") + '" href="' + x[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + x[0] + "</a>";
    }).join("") + "</div>";
  }
  function slotRows(items) {
    return items.map(function (it) { return [fmt(it.a), '<a href="' + it.e.slug + '.html">' + esc(it.s.label) + "</a>", it.s.price ? esc(it.s.price) : fmt(it.a) + " – " + fmt(it.b)]; });
  }
  function aTonight() {
    var st = liveStatus(), b = st.b, word = b.bmins < 17 * 60 ? "today" : "tonight";
    var left = slotsFor(b.bdow).filter(function (it) { return b.bmins < it.b; });
    if (b.bmins >= st.o0 && !left.length) {
      var nd = (b.bdow + 1) % 7;
      return { html: "That's a wrap on " + word + "'s events" + (st.open ? ", but the bar's open till " + fmt(st.o1) : "") + ". Here's tomorrow, " + DAYS[nd] + ":" + btList(slotRows(slotsFor(nd).slice(0, 4))), chips: [["book", "Book a table"], ["hh", "Is it happy hour?"], ["more", "More questions"]] };
    }
    var hh = st.hh ? "<p>Happy hour is on right now, till " + fmt(st.h1) + ".</p>" : b.bmins < st.h0 ? "<p>Happy hour runs " + fmt(st.h0) + " – " + fmt(st.h1) + ".</p>" : "";
    return { html: "Here's " + word + ", " + DAYS[b.bdow] + ":" + btList(slotRows(left)) + hh + btBtns([["Book for " + word, "book.html?date=" + iso(today())]]), chips: [["book", "Book a table"], ["live", "Who's playing?"], ["find", "How do I find you?"], ["more", "More questions"]] };
  }
  function aHH() {
    var st = liveStatus(), b = st.b, html;
    if (!V.happyHour) return { html: A.hhNone || "There's no fixed happy hour here, but there's a deal most nights.", chips: [["deals", "Any deals today?"], ["tonight", "What's on tonight?"], ["book", "Book a table"]] };
    if (st.hh) html = "Yes! " + HHN + " is on right now and runs till <b>" + fmt(st.h1) + "</b>. That's " + dur(st.h1 - b.bmins) + " to go.";
    else if (st.h1 > st.h0 && b.bmins < st.h0) html = "Not yet. " + HHN + " starts at <b>" + fmt(st.h0) + "</b> and runs till " + fmt(st.h1) + ".";
    else html = "Not right now. " + esc(st.hhText.replace(HHN + "'s back", "It's back")) + ".";
    html += "<p>" + esc(A.hhLine) + "</p>";
    return { html: html, chips: [["tonight", "What's on tonight?"], ["deals", "Any deals today?"], ["book", "Book a table"]] };
  }
  function aHours() {
    var st = liveStatus();
    return { html: "We're open <b>" + esc(L.hoursSummary(V.hours)) + "</b>. " + (st.open ? "We're open right now, till " + fmt(st.o1) + "." : st.openText + ".") + " " + A.hoursExtra, chips: [["find", "How do I find you?"], ["tonight", "What's on tonight?"], ["book", "Book a table"]] };
  }
  function aLive() {
    var b = biz(), rows = [];
    WEEK.forEach(function (dow) {
      D.events.forEach(function (e) {
        if (e.days[0] !== dow || !e.lineup) return;
        e.lineup.forEach(function (l) { rows.push([DAYS3[dow], esc(D.artists[l.who].name), esc(l.time) + (dow === b.bdow ? ", tonight" : "")]); });
      });
    });
    return { html: A.liveIntro + btList(rows) + btBtns([["See the week", "whats-on.html", "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["book", "Book a table"]] };
  }
  function aFind() {
    return { html: A.find + btBtns([["Open in Google Maps", V.maps], ["First-time guide", "find-us.html", "btn--ghost"]]), chips: [["hours", "Opening hours"], ["book", "Book a table"]].concat(A.parking ? [["parking", "Where do I park?"]] : []) };
  }
  function aDeals() {
    var b = biz(), st = liveStatus(), rows = [];
    if (st.hasHH) rows.push([st.h1 > st.h0 ? "Today" : "Soon", '<a href="' + (V.hhLink || "happy-hour.html") + '">' + HHN + "</a>", st.hh ? "On now, till " + fmt(st.h1) : st.h1 > st.h0 ? "From " + fmt(st.h0) + ", till " + fmt(st.h1) : esc(st.hhText)]);
    var e = find(A.dealOfDay[b.bdow]);
    if (e) rows.push([DAYS3[b.bdow], '<a href="' + e.slug + '.html">' + esc(e.name) + "</a>", esc(e.short)]);
    D.offers.forEach(function (o) { if (o.slug !== "happy-hour") rows.push(["Any day", '<a href="' + o.slug + '.html">' + esc(o.name) + "</a>", esc(o.short)]); });
    D.specials.forEach(function (s) { if (specialState(s) === "on") rows.push(["On now", '<a href="' + s.slug + '.html">' + esc(s.name) + "</a>", esc(s.short)]); });
    return { html: "Today's best deals:" + btList(rows) + btBtns([["All offers", "offers.html", "btn--ghost"]]), chips: [["book", "Book a table"], ["weekend", "This weekend?"]] };
  }
  function aMenu() {
    var rows = D.dishes.slice(0, 5).map(function (d) { return [d[2] ? (typeof d[2] === "number" ? "AED " + d[2] : esc(d[2])) : "&#9733;", esc(d[0]), esc(d[1])]; });
    return { html: A.menuIntro + btList(rows) + btBtns([["Menu page", "menu.html"], ["Ask for the full menu", waTo(V.greet + " Could you send me the menu?"), "btn--ghost"]]), chips: [["deals", "Any deals today?"], ["book", "Book a table"]] };
  }
  function nextRaceLine() {
    var r = upcomingRaces()[0];
    return r ? "<p>Next F1 race on the screens: <b>" + esc(r.name) + "</b>, " + raceDate(r) + ", lights out " + fmt(r.time) + " UAE time.</p>" : "";
  }
  function aSport() {
    return { html: A.sport + nextRaceLine() + btBtns([[A.sportBtn[0], A.sportBtn[1]]]), chips: [["race", "Next F1 race?"], ["book", "Book a table"], ["deals", "Any deals today?"]] };
  }
  function aRace() {
    var list = upcomingRaces().slice(0, 4);
    if (!list.length) return { html: "That's the F1 season done. We'll have the new season on the screens from the first race.", chips: BT_MAIN };
    var rows = list.map(function (r) { return [raceDate(r).replace(/^\w+ /, ""), esc(r.name) + (r.home ? " (our home race)" : ""), "Lights out " + fmt(r.time) + " UAE time"]; });
    return { html: "Every race is on the big screens. Coming up:" + btList(rows) + btBtns([[A.sportBtn[0], A.sportBtn[1]], ["Book for the race", "book.html?date=" + list[0].date + "&note=" + encodeURIComponent("For the " + list[0].name), "btn--ghost"]]), chips: [["sport", "What about football?"], ["book", "Book a table"]] };
  }
  function aGroups() {
    return { html: A.groups, chips: [["book8", "Start a group booking"]].concat(A.groupsPage ? [["groupspage", "Team days and big groups"]] : []).concat([["human", "Talk to the team"]]) };
  }
  function aHuman(q) {
    return { html: "No problem. The team's on WhatsApp" + (V.phone ? ", or give us a ring." : ".") + btBtns([["WhatsApp us", waTo(V.greet + " " + (q || ""))]].concat(V.phone ? [["Call " + V.phoneDisplay, "tel:" + V.phone, "btn--ghost"]] : [])), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function aEvent(slug) {
    var e = find(slug);
    if (!e) return aTonight();
    var when = e.dayLabel || e.when || "";
    var html = "<b>" + esc(e.name) + "</b>, " + esc(when.charAt(0).toLowerCase() + when.slice(1)) + (e.slots ? ", " + timeRange(e) : "") + ". " + esc(e.short);
    if (e.packages) html += btList(e.packages.map(function (p) { return ["AED", esc(p.name), esc(p.time) + ": " + (p.labels ? p.labels[0] : "Regular") + " " + p.house + ", " + (p.labels ? p.labels[1] : "Premium") + " " + p.premium]; }));
    if (e.sample) html += "<p>Heads up: this one's still being confirmed with the team, so check before you come.</p>";
    if (e.slots) { var nx = nextOn(e.days[0], eventSpan(e)[1]); html += "<p>Next one: <b>" + (nx.add === 0 ? "today" : shortDate(nx)) + "</b>.</p>"; }
    return { html: html + btBtns([["Book it", "book.html?event=" + e.slug], ["See the night", e.slug + ".html", "btn--ghost"]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function aDay(dow) {
    var nx = nextOn(dow, 26 * 60);
    return { html: DAYS[dow] + " (" + (nx.add === 0 ? "today" : shortDate(nx)) + "):" + btList(slotRows(slotsFor(dow))) + btBtns([["Book " + DAYS[dow], "book.html?date=" + iso(nx)]]), chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }
  function bookStep(choice) {
    var b = biz(), t0 = today();
    if (!bk) bk = {};
    if (choice) Object.keys(choice).forEach(function (k) { if (choice[k] !== undefined && choice[k] !== null) bk[k] = choice[k]; });
    if (!bk.date) {
      var opts = [["bkdate", b.bmins < 17 * 60 ? "Today" : "Tonight", iso(t0)], ["bkdate", "Tomorrow", iso(addDays(t0.y, t0.m, t0.d, 1))]];
      [5, 6, 0].forEach(function (d) { var o = nextOn(d, 26 * 60); if (o.add > 1) opts.push(["bkdate", DAYS[d] + " " + o.d + " " + MON3[o.m], iso(o)]); });
      opts.push(["bkform", "Another date"]);
      return { html: "Lovely. When are you coming in?", chips: opts };
    }
    if (!bk.guests) return { html: "How many of you?", chips: [["bkguests", "2", 2], ["bkguests", "4", 4], ["bkguests", "6", 6], ["bkguests", "8 or more", 8]] };
    var d = fromIso(bk.date), os = openSpan(d.dow);
    var evs = D.events.filter(function (e) { return e.days.indexOf(d.dow) > -1; });
    if (bk.time === undefined) {
      var starts = [];
      evs.forEach(function (e) { var a = eventSpan(e)[0]; if (starts.indexOf(a) === -1 && a >= os[0]) starts.push(a); });
      [19 * 60, 20 * 60, 21 * 60].forEach(function (m) { if (starts.indexOf(m) === -1 && m >= os[0]) starts.push(m); });
      starts.sort(function (x, y) { return x - y; });
      return { html: "What time suits you?", chips: starts.slice(0, 5).map(function (m) { return ["bktime", fmt(m), m]; }).concat([["bktime", "Not sure yet", -1]]) };
    }
    if (bk.slug === undefined) {
      return { html: "Anything special on " + DAYS[d.dow] + "?", chips: evs.map(function (e) { return ["bkevent", e.name, e.slug]; }).concat([["bkevent", "Just a table", ""]]) };
    }
    var e = bk.slug ? find(bk.slug) : null, many = bk.plus ? "8 or more" : String(bk.guests);
    var time = bk.time >= 0 ? fmt(bk.time) : "";
    var msg = V.greet + " I'd like to book a table.\n\nDate: " + longDate(d) + (time ? "\nTime: " + time : "") + "\nGuests: " + many + (e ? "\nFor: " + e.name : "") + (bk.seat ? "\nSeating: " + bk.seat : "") + "\n\nSent from " + HOST + " on your website";
    var rows = [["Date", longDate(d)]];
    if (time) rows.push(["Time", time]);
    rows.push(["Guests", many], ["For", e ? esc(e.name) : "Just a table"]);
    if (bk.seat) rows.push(["Seat", esc(bk.seat)]);
    var html = "Here's your booking:" + btList(rows) +
      "<p>Tap below and it goes straight to the team on WhatsApp. They'll confirm your table.</p>" +
      btBtns([["Send on WhatsApp", waTo(msg)], ["Full booking form", "book.html?date=" + bk.date + (e ? "&event=" + e.slug : ""), "btn--ghost"]]);
    if (e) ctx.slug = e.slug;
    bk = null;
    return { html: html, chips: [["tonight", "What's on tonight?"], ["more", "More questions"]] };
  }

  /* ---------------- Adam's brain: fixes typos and text-speak, understands full sentences,
     answers two things at once and remembers what you were talking about ---------------- */
  var ctx = { slug: null };
  var ABBR = {
    u: "you", r: "are", ur: "your", ya: "you", pls: "please", plz: "please", thx: "thanks", ty: "thanks", tnx: "thanks", thnx: "thanks",
    tmrw: "tomorrow", tmr: "tomorrow", tmrrw: "tomorrow", tomoz: "tomorrow", "2moro": "tomorrow", "2morrow": "tomorrow", "2mrw": "tomorrow", tomo: "tomorrow",
    tonite: "tonight", "2nite": "tonight", "2night": "tonight", nite: "night", "2day": "today", tdy: "today", tday: "today",
    wknd: "weekend", wkend: "weekend", wat: "what", wot: "what", wht: "what", wen: "when", wer: "where", wher: "where", whr: "where",
    bday: "birthday", b4: "before", resv: "reservation", rez: "reservation", veggie: "vegetarian", veg: "vegetarian", hh: "happy hour",
    ppl: "people", pax: "people", hw: "how", abt: "about", rn: "now", xmas: "christmas", nye: "new year", info: "information",
    fri: "friday", sat: "saturday", sun: "sunday", mon: "monday", tue: "tuesday", tues: "tuesday", wed: "wednesday", thu: "thursday", thur: "thursday", thurs: "thursday",
    footy: "football", prem: "premier", epl: "premier", dhs: "aed", dh: "aed", bbq: "bbq", wifi: "wifi", "wi-fi": "wifi", f1: "formula", gp: "grand prix", kart: "karting", karts: "karting"
  };
  var VOCAB = ("happy hour quiz trivia ladies karaoke roast sunday monday tuesday wednesday thursday friday saturday " +
    "tonight today tomorrow weekend music live band singer singing artist guitar parking valet location address where directions " +
    "open opening close closing hours menu food drinks drink beer beers guinness cocktail cocktails wine whisky cider price prices cost deal deals offer offers discount " +
    "book booking reserve reservation table group party birthday private office celebration football soccer match premier league sports screens darts pool " +
    "terrace outdoor outside kids children family vegetarian vegan gluten halal dress smoking shisha pets dogs wifi payment delivery " +
    "burger pizza pasta salmon chicken salad dessert desserts sandwich nachos wings fries platter " +
    "wheelchair accessible access capacity hiring joke funny thanks hello weather christmas restaurant people guests tickets formula race racing grand prix " + A.vocab).split(" ");
  var STOP = ("the and for with you your are can could would should will does did have has had this that what when where which who whom whose how why " +
    "there here they them their then than from about into onto over under just also very much many some more most any anything something nothing " +
    "please thanks thank good great nice best fine okay hello help need want like love know tell show give make take come coming going gone get got " +
    "time week night day days hour hours open late early soon now near next last first second one two three four five six seven eight nine ten twelve " +
    "table people person guests friends with without other others again maybe sure yeah yes nope dine dining place places sit seat seats see look looking " +
    "today tonight tomorrow weekend book booking food drink drinks menu price prices cost deal deals offer offers live music where when what does doing done " +
    "booked event events night nights lunch dinner breakfast evening afternoon morning kitchen table tables staff friend going were we're cheers " +
    "salam salaam marhaba hiya heya howdy habibi yalla wallah inshallah mashallah shukran mate mates guys bro").split(" ");
  function dist(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }
  function normalize(q) {
    var raw = q.toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9'%:\/\-\s&]/g, " ").replace(/\s+/g, " ").trim();
    var words = raw.split(" "), out = [], fixes = [];
    words.forEach(function (w) {
      var base = w.replace(/'s$/, "").replace(/^'+|'+$/g, "");
      if (ABBR[base]) { out.push(ABBR[base]); return; }
      if (base === "our" && out[out.length - 1] === "happy") { out.push("hour"); fixes.push([w, "hour"]); return; }
      if (base.length < 4 || /\d/.test(base) || STOP.indexOf(base) > -1 || VOCAB.indexOf(base) > -1) { out.push(base); return; }
      var best = null, bd = 9;
      VOCAB.forEach(function (v) {
        if (Math.abs(v.length - base.length) > 2) return;
        var dd = dist(base, v);
        var ok = dd <= (base.length >= 6 ? 2 : 1) && (dd === 1 || v.charAt(0) === base.charAt(0));
        if (ok && (dd < bd || (dd === bd && v.charAt(0) === base.charAt(0)))) { bd = dd; best = v; }
      });
      if (best) {
        out.push(best);
        /* plurals and word endings ("tables", "closed") are fixed quietly; real typos get a note */
        if (base.indexOf(best) !== 0 && best.indexOf(base) !== 0) fixes.push([w, best]);
      } else out.push(base);
    });
    return { text: out.join(" "), fixes: fixes };
  }
  var EVENT_WORDS = A.eventWords.map(function (p) { return [new RegExp(p[0]), p[1]]; });
  function eventIn(s) { for (var i = 0; i < EVENT_WORDS.length; i++) if (EVENT_WORDS[i][0].test(s)) return EVENT_WORDS[i][1]; return null; }
  function dishesIn(s) {
    var hits = [];
    D.menuItems.forEach(function (m) {
      var words = m[3].split(" ");
      if (words.some(function (w) { return w.length > 3 && new RegExp("\\b" + w + "s?\\b").test(s); })) hits.push(m);
    });
    return hits;
  }
  function parseWhen(s) {
    var t0 = today();
    if (/\b(today|tonight)\b/.test(s)) return iso(t0);
    if (/\btomorrow\b/.test(s)) return iso(addDays(t0.y, t0.m, t0.d, 1));
    var mon = /\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/.exec(s);
    var num = /\b(\d{1,2})[\/.](\d{1,2})\b/.exec(s);
    var m = null, dd = null;
    if (mon) { dd = +mon[1]; m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(mon[2]); }
    else if (num) { dd = +num[1]; m = +num[2] - 1; }
    if (m !== null && m >= 0 && m < 12 && dd >= 1 && dd <= 31) {
      var y = t0.y, cand = addDays(y, m, dd, 0);
      if (iso(cand) < iso(t0)) cand = addDays(y + 1, m, dd, 0);
      return iso(cand);
    }
    for (var i = 0; i < 7; i++) if (new RegExp("\\b" + DAYS[i].toLowerCase() + "\\b").test(s)) return iso(nextOn(i, 26 * 60));
    return null;
  }
  function parseTime(s) {
    var tm = /\b(?:at|around|by|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/.exec(s) || /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/.exec(s);
    if (!tm) return undefined;
    var h = +tm[1], mm = +(tm[2] || 0), ap = tm[3];
    if (h > 23 || mm > 59) return undefined;
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    if (!ap && h >= 1 && h <= 11) h += 12;
    var mins = h * 60 + mm;
    var first = Math.min.apply(null, WEEK.map(function (d) { return toMin(V.hours[d][0]); }));
    if (mins >= DAYCUT && mins < first) return undefined; /* we're closed then */
    if (mins < DAYCUT) mins += 1440;
    return mins;
  }
  function parseGuests(s) {
    var g = /\b(?:table for|party of|group of|for|we are|we're|there will be|there are)\s+(\d{1,3})(?!\s*(?::|am\b|pm\b|o'?clock))\b/.exec(s) ||
      /\b(\d{1,3})\s*(?:people|guests|persons|of us|adults|pax|friends|colleagues|kids)\b/.exec(s);
    return g ? Math.max(1, Math.min(120, +g[1])) : undefined;
  }
  function aKids() { return { html: A.kids, chips: A.kidsChips || [["menu", "Show me the menu"], ["book", "Book a table"], ["human", "Talk to the team"]] }; }
  function aVeg() { return { html: A.veg, chips: [["menu", "Show me the menu"], ["human", "Ask the team"]] }; }
  function aAccess() { return { html: A.access, chips: [["find", "How do I find you?"], ["human", "Talk to the team"]] }; }
  function aTerrace() { return { html: A.terrace, chips: [["bkterrace", A.terraceBook], ["tonight", "What's on tonight?"]] }; }
  function aGames() { return { html: A.games, chips: [["sport", "Do you show football?"], ["book", "Book a table"]] }; }
  function aDrinks() { return { html: A.drinks, chips: [["hh", "Is it happy hour?"], ["deals", "Any deals today?"]] }; }
  function aAge() { return { html: "You need to be <b>21 or over</b> to drink in Abu Dhabi, and the team may ask for ID." + (A.ageExtra ? " " + A.ageExtra : ""), chips: BT_MAIN }; }
  function aWho() { return { html: "I'm " + HOST + ", your host at " + esc(V.full) + ". I know the schedule, the deals, the menu and how to find us. Anything I can't answer goes straight to the team on WhatsApp.", chips: BT_MAIN }; }
  function aJoke() { return { html: A.jokes[Math.floor(Math.random() * A.jokes.length)], chips: [["joke", "Another one"], ["tonight", "What's on tonight?"]] }; }
  function aWeekend() {
    var rows = [];
    [5, 6, 0].forEach(function (d) {
      var nx = nextOn(d, 26 * 60), t = D.takeover[d];
      if (t) rows.push([DAYS3[d] + " " + nx.d, '<a href="' + (t.link || t.slug + ".html") + '">' + esc(t.lines.join(" ")) + "</a>", esc(t.sub)]);
    });
    return { html: "This weekend at " + esc(V.full) + ":" + btList(rows), chips: [["deals", "Any deals today?"], ["book", "Book a table"]] };
  }
  function aDish(list) {
    var rows = list.slice(0, 5).map(function (m) { return [m[2] ? "AED " + m[2] : "&#9733;", esc(m[0]), esc(m[1])]; });
    return { html: A.dishIntro + btList(rows) + (list.some(function (m) { return !m[2]; }) ? "<p>" + esc(A.priceNote) + "</p>" : "") + btBtns([["Ask for the menu", waTo(V.greet + " Could you send me the menu?"), "btn--ghost"]]), chips: [["menu", "Show me the menu"], ["book", "Book a table"]] };
  }
  function aPrice() { return { html: A.prices + btList(A.priceRows), chips: [["deals", "Any deals today?"], ["menu", "Show me the menu"]] }; }
  function aHandoff(label, q) {
    return { html: "Good question about " + label + ". I'd rather not guess, so the team will answer that one on WhatsApp." + btBtns([["Ask the team", waTo(V.greet + " " + (q || ""))]]), chips: BT_MAIN };
  }
  function aFestive(q) {
    return { html: "Christmas and New Year plans are coming soon. Follow " + esc(V.handle) + " on Instagram, or ask the team to hold a table for your group." + btBtns([["Ask the team", waTo(V.greet + " " + (q || ""))]]), chips: [["groups", "Big group or party?"], ["tonight", "What's on tonight?"]] };
  }
  function aOffTopic() { return { html: "I'm better with food, drinks and what's on than that one, I'm afraid. Here's what I can help with:", chips: BT_MAIN }; }
  /* branch-only answers: the parking (Reem), after work (Reem), a day at the resort (Forsan) and kids' parties (Forsan) */
  function aParking() { return { html: A.parking + btBtns([["Parking on the map", "find-us.html"]]), chips: [["find", "How do I find you?"], ["book", "Book a table"]] }; }
  function aAfterwork() {
    var st = liveStatus(), b = st.b;
    var html = st.hh ? "Happy hour is on now and runs till <b>" + fmt(st.h1) + "</b>, so you've got " + dur(st.h1 - b.bmins) + ". " + A.afterwork : b.bmins < st.h0 ? "Happy hour starts at <b>" + fmt(st.h0) + "</b> and runs till " + fmt(st.h1) + ". " + A.afterwork : "Happy hour's done for today, but the kitchen's open till " + fmt(st.o1) + ". " + A.afterwork;
    return { html: html + btBtns([["After-work page", "after-work.html", "btn--ghost"]]), chips: [["book", "Book a table"], ["deals", "Any deals today?"]] };
  }
  function aActivity(key) {
    var a = D.activities ? D.activities.filter(function (x) { return x.key === key; })[0] : null;
    var html = a ? "After " + esc(a.short) + "? Allow about <b>" + dur(a.mins) + "</b> for it, then come straight over: " + A.activity : A.activity;
    return { html: html + btBtns([["Plan my day", "make-a-day.html" + (a ? "?activity=" + a.key : "")], ["Book the activity", D.resortUrl, "btn--ghost"]]), chips: [["groups", "Big group or team day?"], ["kids", "Bringing the kids?"], ["book", "Book a table"]] };
  }
  function aParty() { return { html: A.party + btBtns([["Plan a kids' party", "families.html#party"]]), chips: [["kids", "Bringing the kids?"], ["groups", "Adults' party?"], ["human", "Talk to the team"]] }; }
  var HANDOFF = [
    [/\b(dress code|dress|wear|outfit)\b/, "the dress code"], [/\b(pay|payment|card|cash|apple pay|visa|amex)\b/, "payment"], [/\bwifi\b/, "Wi-Fi"],
    [/\b(pets?|dogs?|cats?)\b/, "pets"], [/\b(shisha|smok\w*|vape|vaping)\b/, "smoking and shisha"], [/\b(halal|pork)\b/, "halal food"],
    [/\b(gluten|allerg\w*|nuts?|dairy)\b/, "allergies"], [/\b(delivery|deliver|talabat|deliveroo|careem|noon food)\b/, "delivery"],
    [/\b(jobs?|hiring|vacanc\w*|work for you|cv)\b/, "jobs"], [/\b(capacity|how many people fit|seats? how many)\b/, "capacity"]
  ];
  var ACT_RE = D.activities ? D.activities.map(function (a) { return [new RegExp(a.match), a.key]; }) : [];
  function detect(s) {
    var hits = [], add = function (k, a) { if (!hits.some(function (h) { return h[0] === k && h[1] === a; })) hits.push([k, a]); };
    var partyQ = /\b(kids?'? party|children'?s party|birthday party for|party for my (son|daughter|kid))\b/.test(s) || (/\bbirthday\b/.test(s) && /\b(kids?|children|son|daughter|turning \d+)\b/.test(s));
    if (A.party && partyQ) return [["party"]];
    if (/\b(book|booking|reserve|reservation|table for)\b/.test(s) || (/\btable\b/.test(s) && /\d/.test(s))) return [["bookparse"]];
    if (/\b(weather|news|politics|bitcoin|stocks?|crypto)\b/.test(s)) return [["offtopic"]];
    if (/\b(christmas|new year)\b/.test(s)) return [["festive"]];
    if (/\b(joke|funny|make me laugh)\b/.test(s)) add("joke");
    if (/\b(who are you|are you (a )?(bot|robot|human|real|ai)|your name)\b/.test(s)) add("who");
    if (/\bhappy hour\b/.test(s)) add("hh");
    var ev = eventIn(s), dishes = dishesIn(s), priceQ = /\b(how much|price|prices|cost|costs|aed|expensive|cheap)\b/.test(s);
    var vegQ = /\b(vegetarian|vegan|plant based|meat free)\b/.test(s);
    if (dishes.length && !vegQ && (priceQ || !ev)) add("dish", dishes);
    else if (ev) add("event", ev);
    if (/\bweekend\b/.test(s)) add("weekend");
    var dayIdx = -1;
    DAYS.forEach(function (d, i) { if (new RegExp("\\b" + d.toLowerCase() + "\\b").test(s)) dayIdx = i; });
    var liveQ = /\b(live|music|band|singer|artist|guitar|playing|performing|on stage|dj|acoustic)\b/.test(s) && !ev;
    var whatsOnQ = /\b(what is on|whats on|what's on|what on|going on|happening|on now|on tonight)\b/.test(s);
    var todayQ = /\b(tonight|today|right now)\b/.test(s);
    if (dayIdx > -1 && !ev) add("day", dayIdx);
    else if (/\btomorrow\b/.test(s) && !ev) add("day", (biz().bdow + 1) % 7);
    else if (whatsOnQ && !ev && !liveQ) add("tonight");
    if (liveQ) add("live");
    if (/\b(formula|grand prix|race|races|racing|qualifying|verstappen|hamilton|norris|leclerc|yas marina)\b/.test(s)) add("race");
    if (/\b(where|address|location|find you|directions|map|how do i get|get there)\b/.test(s)) add("find");
    if (/\b(parking|park|car park|valet)\b/.test(s)) { if (A.parking) add("parking"); else if (!hits.some(function (h) { return h[0] === "find"; })) add("find"); }
    if (/\b(football|soccer|match|premier|league|sports?|rugby|screens?|watch the game|champions)\b/.test(s)) add("sport");
    if (/\b(darts|dart|pool table|games)\b/.test(s)) add("games");
    if (A.gamesWords && new RegExp(A.gamesWords).test(s)) add("games");
    if (/\b(terrace|outdoor|outside|sit outside|garden|beer garden)\b/.test(s)) add("terrace");
    if (/\b(kids|children|child|family|families|baby|toddler|play area)\b/.test(s)) add("kids");
    if (A.afterwork && /\b(after work|afterwork|office|colleagues|work drinks|leave work|finish work)\b/.test(s)) add("afterwork");
    ACT_RE.forEach(function (r) { if (r[0].test(s)) add("activity", r[1]); });
    if (/\b(vegetarian|vegan|plant based|meat free)\b/.test(s)) add("veg");
    if (/\b(wheelchair|accessible|disabled|accessibility|stairs)\b/.test(s)) add("access");
    if (/\b(beer|beers|guinness|cocktails?|wine|whisky|whiskey|cider|on tap|draft|draught|drinks menu|taps?)\b/.test(s) && !ev) add("drinks");
    if (/\b(deals?|offers?|discount|promo|specials?)\b/.test(s)) add("deals");
    if (/\b(menu|food|eat|hungry|dish)\b/.test(s) && !dishes.length && !hits.some(function (h) { return h[0] === "veg"; })) add("menu");
    if (/\b(group|party|birthday|private|office party|celebrat\w*|leaving|team building|team day|corporate|company)\b/.test(s)) add("groups");
    if (/\b(open|opening|close|closing|hours|until when|how late)\b/.test(s)) add("hours");
    if (/\b(age|21|under 21|id|minimum age|old enough)\b/.test(s)) add("age");
    HANDOFF.forEach(function (h) { if (h[0].test(s)) add("handoff", h[1]); });
    if (priceQ && !hits.length) add("price");
    /* "tonight" on its own ("anything tonight?") means what's on; next to another topic it just narrows that topic */
    if (todayQ && !hits.length && !ev) add("tonight");
    if (!hits.length && /^\s*(hi|hey|hello|hiya|heya|salam|salaam|marhaba|yo|good (morning|afternoon|evening))\b/.test(s)) add("hello");
    if (!hits.length && /\b(thanks|thank you|cheers|perfect|great stuff|nice one|legend|amazing)\b/.test(s)) add("thanks");
    if (!hits.length && /\b(human|person|staff|call|phone|whatsapp|manager|someone)\b/.test(s)) add("human");
    return hits.slice(0, 2);
  }
  function followUp(s) {
    if (!ctx.slug) return null;
    if (/\b(book|reserve|book it|that one|lets go|let's go|count me in)\b/.test(s)) return ["bookparse"];
    if (/\b(how much|price|cost|when|what time|time|start|until|who|playing|host|tell me more|more)\b/.test(s)) return ["event", ctx.slug];
    return null;
  }
  function adamAnswer(q) {
    var n = normalize(q), s = " " + n.text + " ", list = [];
    var note = n.fixes.length ? '<p class="bt-fix">Reading “' + esc(n.fixes.map(function (f) { return f[0]; }).join(" ")) + "” as “" + esc(n.fixes.map(function (f) { return f[1]; }).join(" ")) + "”.</p>" : "";
    if (bk && bk.date && !bk.guests && /\d/.test(s)) list.push(bookStep({ guests: parseGuests(s) || Math.max(1, Math.min(120, +/\d{1,3}/.exec(s)[0])) }));
    else if (bk && bk.date && bk.guests && bk.time === undefined && parseTime(s) !== undefined) list.push(bookStep({ time: parseTime(s) }));
    else {
      var hits = detect(s), f = followUp(s);
      /* "how much?" or "what time?" right after talking about a night means that night */
      if (f && (!hits.length || (hits.length === 1 && ["price", "hours"].indexOf(hits[0][0]) > -1))) hits = [f];
      if (!hits.length) hits = [["unknown"]];
      hits.forEach(function (h) {
        if (h[0] === "bookparse") {
          bk = {};
          var slug = eventIn(s) || (/\b(book it|that one|book that)\b/.test(s) ? ctx.slug : null);
          var when = parseWhen(s), moved = "";
          var ev = slug ? find(slug) : null;
          if (ev && ev.days) {
            var evDate = nextOn(ev.days[0], eventSpan(ev)[1]);
            /* asked for a night when that event isn't on: book the next one and say so */
            if (when && fromIso(when).dow !== ev.days[0]) moved = "<p>" + esc(ev.name) + " is on " + DAYS[ev.days[0]] + "s, so I've picked " + shortDate(evDate) + ".</p>";
            if (!when || moved) when = iso(evDate);
          }
          var guests = parseGuests(s), time = parseTime(s);
          if (time === undefined && ev && ev.slots) time = eventSpan(ev)[0]; /* a set night starts at its own time */
          var seat = null;
          A.seatWords.forEach(function (w) { if (!seat && new RegExp(w[0]).test(s)) seat = w[1]; });
          var step = bookStep({ date: when, guests: guests, plus: guests >= 8 ? false : undefined, time: time, slug: slug || undefined, seat: seat || undefined });
          list.push(moved ? { html: moved + step.html, chips: step.chips } : step);
        } else list.push(btRoute(h[0], h[1], q));
      });
    }
    if (note && list[0]) list[0] = { html: note + list[0].html, chips: list[0].chips };
    return list;
  }
  function btGreeting() {
    var m = dubai().mins, hi = m >= 180 && m < 12 * 60 ? "Morning" : m >= 180 && m < 17 * 60 ? "Afternoon" : "Evening";
    return { html: hi + "! I'm " + HOST + ". " + A.greeting, chips: BT_MAIN };
  }
  function btRoute(k, arg, text) {
    switch (k) {
      case "tonight": return aTonight();
      case "hh": return aHH();
      case "hours": return aHours();
      case "live": return aLive();
      case "find": return aFind();
      case "parking": return aParking();
      case "deals": return aDeals();
      case "menu": return aMenu();
      case "sport": return aSport();
      case "race": return aRace();
      case "groups": return aGroups();
      case "groupspage": return { html: "Here's everything for team days and big groups." + btBtns([["Team days", "groups.html"]]), chips: [["book8", "Start a group booking"], ["human", "Talk to the team"]] };
      case "human": return aHuman(text);
      case "event": ctx.slug = arg; return aEvent(arg);
      case "day": return aDay(+arg);
      case "weekend": return aWeekend();
      case "dish": return aDish(arg);
      case "kids": return aKids();
      case "veg": return aVeg();
      case "access": return aAccess();
      case "terrace": return aTerrace();
      case "games": return aGames();
      case "drinks": return aDrinks();
      case "afterwork": return aAfterwork();
      case "activity": return aActivity(arg);
      case "planner": return aActivity(null);
      case "party": return aParty();
      case "age": return aAge();
      case "who": return aWho();
      case "joke": return aJoke();
      case "price": return aPrice();
      case "festive": return aFestive(text);
      case "offtopic": return aOffTopic();
      case "handoff": return aHandoff(arg, text);
      case "more": return { html: "Sure. What would you like to know?", chips: BT_MORE };
      case "book": bk = {}; return bookStep();
      case "book8": bk = { guests: 8, plus: true }; return bookStep();
      case "bkterrace": bk = { seat: A.terraceSeat }; return bookStep();
      case "bkdate": return bookStep({ date: arg });
      case "bkguests": return bookStep({ guests: +arg, plus: +arg >= 8 });
      case "bktime": return bookStep({ time: +arg });
      case "bkevent": return bookStep({ slug: arg });
      case "bkform": bk = null; return { html: "No problem. The full booking form has a calendar for any date." + btBtns([["Open the booking form", "book.html"]]), chips: BT_MAIN };
      case "hello": return btGreeting();
      case "thanks": return { html: "Cheers! Anything else I can help with?", chips: BT_MAIN };
      default: return { html: "Good question. That one's not on my board, but the team will know." + btBtns([["Ask the team on WhatsApp", waTo(V.greet + " " + (text || ""))]]), chips: BT_MAIN };
    }
  }
  function btSave() {
    try { sessionStorage.setItem(KEY + "_bt", JSON.stringify({ log: $(".bt__log", bt).innerHTML, chips: $(".bt__chips", bt).innerHTML, open: !bt.hidden, bk: bk, ctx: ctx })); } catch (e) { /* storage off: chat still works on this page */ }
  }
  function btSay(who, html) {
    var log = $(".bt__log", bt), m = document.createElement("div");
    m.className = "bt-msg bt-msg--" + who; m.innerHTML = html; log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function btChips(list) {
    $(".bt__chips", bt).innerHTML = list.map(function (c) {
      return '<button class="chip" type="button" data-k="' + c[0] + '" data-a="' + esc(c[2] === undefined ? "" : c[2]) + '">' + esc(c[1]) + "</button>";
    }).join("");
  }
  /* one answer or several (Adam answers two-part questions in two bubbles) */
  function btReply(ans) {
    var queue = Array.isArray(ans) ? ans.slice() : [ans], log = $(".bt__log", bt), last = null;
    btChips([]);
    (function next() {
      var a = queue.shift();
      if (!a) { btChips((last && last.chips) || BT_MAIN); btSave(); return; }
      var t = document.createElement("div");
      t.className = "bt-msg bt-msg--bot bt-typing"; t.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(function () { t.remove(); btSay("bot", a.html); last = a; next(); }, reduce ? 0 : 520);
    })();
  }
  function btOpen(open, quiet) {
    if (!bt) return;
    bt.hidden = !open;
    $(".bt-launch").classList.toggle("is-hidden", open);
    if (open) {
      var log = $(".bt__log", bt);
      if (!log.children.length) btReply(btGreeting());
      log.scrollTop = log.scrollHeight;
      if (!quiet && window.innerWidth > 760) setTimeout(function () { $(".bt__form input", bt).focus(); }, 60);
    } else if (!quiet) $(".bt-launch").focus();
    btSave();
  }
  function initAdam() {
    var chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>';
    var send = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 20l18-8L3 4l2.5 8z"/></svg>';
    document.body.insertAdjacentHTML("beforeend",
      '<button class="bt-launch" type="button" aria-haspopup="dialog" aria-controls="bt">' + chat + '<span class="bt-launch__txt">Ask ' + HOST + "</span></button>" +
      '<section class="bt" id="bt" role="dialog" aria-label="Ask ' + HOST + '" hidden>' +
      '<header class="bt__head"><span class="bt__avatar">' + L.harp("", "bt") + "</span><div><b>" + HOST + '</b><span><i class="dot" aria-hidden="true"></i>Your host at ' + esc(V.full) + '</span></div><button class="bt__close" type="button" aria-label="Close chat">&times;</button></header>' +
      '<div class="bt__log" role="log" aria-live="polite" data-lenis-prevent></div>' +
      '<div class="bt__chips" data-lenis-prevent></div>' +
      '<form class="bt__form" autocomplete="off"><input type="text" placeholder="' + esc(A.placeholder) + '" aria-label="Your question" maxlength="200"><button type="submit" aria-label="Send">' + send + "</button></form>" +
      '<p class="bt__note">Answers come straight from our live schedule. For anything else, the team is on WhatsApp.</p></section>');
    bt = $("#bt");
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(KEY + "_bt") || "null"); } catch (e) { saved = null; }
    if (saved && saved.log) {
      $(".bt__log", bt).innerHTML = saved.log.replace(/<div class="bt-msg bt-msg--bot bt-typing">[\s\S]*?<\/div>/g, "");
      if (saved.chips) $(".bt__chips", bt).innerHTML = saved.chips; else btChips(BT_MAIN);
      bk = saved.bk || null;
      if (saved.ctx) ctx = saved.ctx;
    }
    $(".bt-launch").addEventListener("click", function () { btOpen(true); });
    $(".bt__close", bt).addEventListener("click", function () { btOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && bt && !bt.hidden) btOpen(false); });
    $(".bt__chips", bt).addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      btSay("you", esc(c.textContent));
      btReply(btRoute(c.getAttribute("data-k"), c.getAttribute("data-a"), c.textContent));
    });
    $(".bt__log", bt).addEventListener("click", function (e) { if (e.target.closest("a")) btSave(); });
    $(".bt__form", bt).addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("input", this), q = inp.value.trim();
      if (!q) return;
      inp.value = "";
      btSay("you", esc(q));
      btReply(adamAnswer(q));
    });
    /* on laptops the chat stays open as visitors move between pages; on phones it waits, with the history kept */
    if (saved && saved.open && window.innerWidth > 760) btOpen(true, true);
    var demo = /[?&]chat(?:=([^&]+))?/.exec(location.search); /* preview: open the chat, optionally ask one question */
    if (demo) {
      btOpen(true, true);
      if (demo[1]) setTimeout(function () { var q = decodeURIComponent(demo[1]); btSay("you", esc(q)); btReply(adamAnswer(q)); }, 900);
    }
  }

  /* ---------------- boot ---------------- */
  function safe(fn, el) { try { fn(el); } catch (err) { if (window.console) console.error(err); } }
  headerUi();
  smooth();
  safe(renderTakeover);
  document.documentElement.classList.remove("pre-hero");
  [["[data-board]", renderBoard], ["[data-marquee]", renderMarquee], ["[data-lights]", renderLights], ["[data-whatson]", renderWhatsOn], ["[data-specials]", renderSpecials],
    ["[data-event]", renderEvent], ["[data-hof]", renderHof], ["[data-artists]", renderArtists], ["[data-reviews]", renderReviews],
    ["[data-reviews-mini]", renderReviewsMini], ["[data-gallery]", renderGallery], ["[data-wall]", renderWall], ["[data-crew]", renderCrew],
    ["[data-book]", renderBook], ["[data-matchday]", renderMatchday], ["[data-hours]", renderHours], ["[data-map]", renderMap],
    ["[data-findus]", renderFindUs], ["[data-rating]", renderRating], ["[data-dishes]", renderDishes], ["[data-taps]", renderTaps],
    ["[data-races]", renderRaces], ["[data-planner]", renderPlanner], ["[data-groupform]", renderGroupForm], ["[data-partyform]", renderPartyForm],
    ["[data-pint]", renderPint], ["[data-gameform]", renderGameForm],
    ["[data-harp]", function (el) { el.innerHTML = L.harp("", "d" + Math.random().toString(36).slice(2, 7)); }]
  ].forEach(function (r) { $$(r[0]).forEach(function (el) { safe(r[1], el); }); });
  /* the event page renders its own honours board after the first pass */
  $$("[data-hof]").forEach(function (el) { if (!el.children.length) safe(renderHof, el); });
  mapIn();
  paintLive(); setInterval(paintLive, 30000);
  initAdam();
  menuModal();
  $$("[data-week]").forEach(function (el) { safe(renderWeek, el); });
  if (location.hash && $(location.hash)) setTimeout(function () { var t = $(location.hash); if (t) t.scrollIntoView(); }, 60);

  if (L.needGate && !window.__abkEntered) window.addEventListener("abk:enter", start, { once: true });
  else start();

  var shot = /[?&]shot=(\d+)/.exec(location.search);
  if (shot) setTimeout(function () {
    /* preview mode: shift the page instead of scrolling (headless screenshots can't scroll) */
    var n = +shot[1];
    ["main", ".ftr"].forEach(function (s) { var el = $(s); if (el) el.style.transform = "translateY(-" + n + "px)"; });
    $("#hdr").classList.toggle("is-solid", n > 20);
    console.log("PAGEH " + document.documentElement.scrollHeight);
  }, 400);

  window.ABK = { biz: biz, liveStatus: liveStatus, nextOn: nextOn, fmt: fmt, adamAnswer: adamAnswer, normalize: normalize };
})();

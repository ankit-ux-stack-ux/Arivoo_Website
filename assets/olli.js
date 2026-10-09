/* Olli — arivoo's owl guide (Figma 4160:3384).
   Sits in the bottom corner and reacts to what the visitor does:
   scrolling → works on his laptop · idle → reads, then dozes · pointer close → looks curious ·
   now and then, or to meet the pointer → takes two steps left or right (always facing front) · leaving for another page → flies off, lands on the next one.
   Click → quick help menu. Visitors can tuck him away (remembered). Respects reduced motion. */
(function () {
  if (window.__olli) return; window.__olli = 1;
  var me = document.currentScript;
  var BASE = (me && me.src ? me.src : 'assets/olli.js').replace(/olli\.js(\?.*)?$/, 'olli/');
  var F = {idle:[145,165],head:[87,68],wave:[196,187],sleepy:[193,123],curious:[150,182],back:[130,171],read:[141,176],laptop:[177,180],think:[136,181],cheer:[177,174],point:[153,164],crouch:[139,172],takeoff:[199,193],apex:[217,188],land:[140,171],flap1:[259,174],flap2:[270,162],glide:[320,164],lift:[211,191],stepL0:[138,161],stepL1:[156,163],stepL2:[138,160],stepL3:[157,163],stepL4:[139,160],stepR0:[135,163],stepR1:[158,166],stepR2:[137,165],stepR3:[151,164],stepR4:[137,165]};
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var small = function () { return window.innerWidth < 700; };
  var S = function () { return small() ? 0.36 : 0.5; };
  var ls = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  var ss = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} } };

  // ---- which page are we on ----
  var path = decodeURIComponent(location.pathname);
  var PAGES = [
    { key: 'ums', file: 'Arivoo UMS.dc.html', name: 'UMS', long: 'University Management' },
    { key: 'sms', file: 'Arivoo SMS.dc.html', name: 'SMS', long: 'School Management' },
    { key: 'lms', file: 'Arivoo LMS.dc.html', name: 'LMS', long: 'Learning Management' },
    { key: 'tg', file: 'Arivoo TestGUARD.dc.html', name: 'TestGUARD', long: 'Remote proctoring' }
  ];
  var page = /About/.test(path) ? 'about' : /Solutions/.test(path) ? 'solutions' : /Book a Demo/.test(path) ? 'demo' : 'home';
  var product = null;
  PAGES.forEach(function (p) { if (path.indexOf(p.file) > -1) { page = p.key; product = p; } });
  var href = function (f) { return encodeURI(f); };
  var DEMO = 'Arivoo Book a Demo.dc.html';

  // ---- styles ----
  var css = '' +
    '.olli{position:fixed;right:22px;bottom:14px;z-index:70;width:120px;height:120px;pointer-events:none;font-family:"Hanken Grotesk",system-ui,sans-serif}' +
    ':root[dir=rtl] .olli{right:auto;left:22px}' +
    '.olli-move{position:absolute;inset:0;will-change:transform}' +
    '.olli-btn{position:absolute;left:50%;bottom:0;transform:translateX(-50%);display:block;padding:0;border:0;background:none;cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent}' +
    '.olli-btn:focus-visible{outline:2px solid #2877d7;outline-offset:4px;border-radius:12px}' +
    '.olli-img{display:block;height:auto;transform-origin:50% 100%;user-select:none;-webkit-user-drag:none;pointer-events:none}' +
    /* the art faces right; mirror it so Olli looks into the page (independent `scale` so it composes with the pose animations) */
    '.olli-img,.olli-peek img{scale:-1 1}:root[dir=rtl] .olli-img,:root[dir=rtl] .olli-peek img{scale:1 1}' +
    '.olli .olli-img.front{scale:1 1}' +
    '.olli-shadow{position:absolute;left:50%;bottom:-3px;width:62%;height:9px;margin-left:-31%;border-radius:50%;background:radial-gradient(closest-side,rgba(20,30,60,.22),rgba(20,30,60,0));transition:opacity .3s,transform .3s}' +
    '.olli-air .olli-shadow{opacity:0;transform:scale(.4)}' +
    '@keyframes olli-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.02,.985)}}' +
    '@keyframes olli-type{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}' +
    '@keyframes olli-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}}' +
    '.olli-breathe .olli-img{animation:olli-breathe 3.2s ease-in-out infinite}' +
    '.olli-type .olli-img{animation:olli-type .28s steps(2) infinite}' +
    '.olli-hop .olli-img{animation:olli-hop .5s ease-out}' +
    '.olli-z{position:absolute;right:16%;top:18%;font:700 13px/1 "Bricolage Grotesque",sans-serif;color:#2877d7;opacity:0;pointer-events:none}' +
    '@keyframes olli-z{0%{opacity:0;transform:translate(0,0) scale(.7)}20%{opacity:.9}100%{opacity:0;transform:translate(14px,-30px) scale(1.15)}}' +
    '.olli-sleep .olli-z{animation:olli-z 2.4s ease-out infinite}.olli-sleep .olli-z+.olli-z{animation-delay:1.2s}' +
    '.olli-x{position:absolute;right:2px;top:6px;width:22px;height:22px;border-radius:50%;border:0;background:#fff;color:#5b5f6b;box-shadow:0 2px 8px rgba(20,21,26,.16);font:600 14px/22px system-ui,sans-serif;text-align:center;cursor:pointer;pointer-events:auto;opacity:0;transform:scale(.8);transition:opacity .2s,transform .2s}' +
    '.olli:hover .olli-x,.olli-x:focus-visible{opacity:1;transform:none}' +
    '.olli-bub{position:absolute;right:0;bottom:calc(100% + 6px);width:272px;padding:16px;border-radius:16px;background:#fff;color:#14151a;box-shadow:0 18px 44px rgba(20,21,26,.16),0 0 0 1px rgba(20,21,26,.05);pointer-events:auto;opacity:0;transform:translateY(8px) scale(.97);transform-origin:85% 100%;transition:opacity .22s,transform .22s;visibility:hidden}' +
    ':root[dir=rtl] .olli-bub{right:auto;left:0;transform-origin:15% 100%}' +
    '.olli-bub:after{content:"";position:absolute;right:46px;bottom:-6px;width:12px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:3px 3px 4px rgba(20,21,26,.04)}' +
    ':root[dir=rtl] .olli-bub:after{right:auto;left:46px}' +
    '.olli-bub.on{opacity:1;transform:none;visibility:visible}' +
    '.olli-bub h4{margin:0;font:700 17px/1.25 "Bricolage Grotesque",sans-serif;letter-spacing:-.01em}' +
    '.olli-bub p{margin:4px 0 0;font-size:13.5px;line-height:1.45;color:#5b5f6b}' +
    '.olli-bub .olli-close{position:absolute;right:10px;top:10px;width:24px;height:24px;border:0;border-radius:50%;background:transparent;color:#9297a3;font:600 15px/24px system-ui;cursor:pointer}' +
    '.olli-bub .olli-close:hover{background:#f3f2ee;color:#14151a}' +
    '.olli-acts{display:flex;flex-direction:column;gap:6px;margin-top:12px}' +
    '.olli-acts a{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 12px;border-radius:10px;background:#f6f5f1;color:#14151a;font-size:14px;font-weight:600;text-decoration:none;transition:background .2s}' +
    '.olli-acts a:hover{background:#eceae4}' +
    '.olli-acts a.pri{background:#14151a;color:#fff}.olli-acts a.pri:hover{background:#2a2c33}' +
    '.olli-acts a span{font-weight:500;color:inherit;opacity:.55}' +
    '.olli-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
    '.olli-chips a{padding:6px 10px;border-radius:999px;background:#f1f7ff;color:#2877d7;font-size:12.5px;font-weight:600;text-decoration:none}' +
    '.olli-chips a:hover{background:#e3effe}' +
    '.olli-tip .olli-acts,.olli-tip .olli-chips{display:none}.olli-tip .olli-acts.keep{display:flex}' +
    '.olli-peek{position:fixed;right:22px;bottom:0;z-index:70;width:56px;height:40px;padding:0;border:0;background:none;cursor:pointer;overflow:hidden;transform:translateY(12px);transition:transform .25s}' +
    ':root[dir=rtl] .olli-peek{right:auto;left:22px}' +
    '.olli-peek:hover,.olli-peek:focus-visible{transform:none}' +
    '.olli-peek img{display:block;width:56px;height:auto}' +
    '.olli-gone{opacity:0;transition:opacity .35s}' +
    '@media (max-width:699px){.olli{right:10px;bottom:10px;width:84px;height:84px}.olli-bub{width:min(272px,calc(100vw - 20px))}}' +
    '@media print{.olli,.olli-peek{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // preload every pose so swaps never flash
  Object.keys(F).forEach(function (k) { var i = new Image(); i.src = BASE + k + '.webp'; });

  var STAND = 'stepL0', root, mv, btn, img, bub, peek, pose = STAND, state = 'off', x = 0, frameT = null, stT = null;
  var last = Date.now(), tipShown = {}, lastTip = 0, flying = false;

  function setPose(p) {
    pose = p; img.src = BASE + p + '.webp'; img.classList.toggle('front', /^step/.test(p)); // front-facing frames are never mirrored
    img.style.width = Math.round(F[p][0] * S()) + 'px';
  }
  function loop(frames, ms) {
    clearInterval(frameT); var i = 0; setPose(frames[0]);
    frameT = setInterval(function () { i = (i + 1) % frames.length; setPose(frames[i]); }, ms);
  }
  function stopLoop() { clearInterval(frameT); frameT = null; }
  function cls(c) { root.className = 'olli' + (c ? ' ' + c : ''); }
  function to(s, p, c, ms, next) {
    clearTimeout(stT); stopLoop(); state = s; if (p) setPose(p); cls(c || '');
    if (ms) stT = setTimeout(next || idle, ms);
  }
  function idle() { to('idle', STAND, 'olli-breathe'); }
  function busy() { return flying || state === 'walk' || state === 'arrive' || state === 'off'; }

  // ---- speech bubble ----
  function chip(p) { return '<a href="' + href(p.file) + '">' + p.name + '</a>'; }
  function menuHTML() {
    var intro = product ? 'Exploring ' + product.name + '? I can take you anywhere on arivoo.'
      : page === 'demo' ? 'Fill in the form and our team will reach out. Anything else?'
      : 'Your arivoo guide. Where shall we fly next?';
    var acts = '';
    if (page !== 'demo') acts += '<a class="pri" href="' + href(DEMO) + '">Book a demo' + (product ? ' of ' + product.name : '') + ' <span>→</span></a>';
    if (page !== 'solutions') acts += '<a href="' + href('Arivoo Solutions.dc.html') + '">Solutions by institution <span>→</span></a>';
    if (page !== 'about') acts += '<a href="' + href('Arivoo About.dc.html') + '">About us <span>→</span></a>';
    if (page !== 'home') acts += '<a href="index.html">Home <span>→</span></a>';
    var others = PAGES.filter(function (p) { return p !== product; });
    return '<button class="olli-close" aria-label="Close">×</button><h4>Hi, I\'m Olli!</h4><p>' + intro + '</p>' +
      '<div class="olli-acts">' + acts + '</div>' +
      '<p style="margin-top:12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9297a3">' + (product ? 'Other products' : 'Explore products') + '</p>' +
      '<div class="olli-chips">' + others.map(chip).join('') + '</div>';
  }
  function openMenu() {
    bub.className = 'olli-bub on'; bub.innerHTML = menuHTML(); bub.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    var cheer = function () { to('cheer', 'cheer', 'olli-hop', 900); };
    if (!busy()) { if (!reduce && x === 0) steps(-1, cheer); else cheer(); } // step towards the page as the menu opens
  }
  function closeBub() { if (x < 0) nextWalk = Math.min(nextWalk, Date.now() + 5000); bub.className = 'olli-bub'; bub.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); }
  function menuOpen() { return bub.className.indexOf('on') > -1 && bub.className.indexOf('olli-tip') < 0; }
  // a short tip that pops up once per page for a given trigger
  function tip(id, title, text, cta) {
    var key = 'olli_tip_' + page + '_' + id;
    if (tipShown[id] || ss.get(key) || menuOpen() || busy() || Date.now() - lastTip < 20000) return;
    tipShown[id] = 1; ss.set(key, '1'); lastTip = Date.now();
    bub.innerHTML = '<button class="olli-close" aria-label="Close">×</button><h4>' + title + '</h4><p>' + text + '</p>' +
      (cta ? '<div class="olli-acts keep"><a class="pri" href="' + href(cta[1]) + '">' + cta[0] + ' <span>→</span></a></div>' : '');
    bub.className = 'olli-bub olli-tip on'; bub.setAttribute('aria-hidden', 'false');
    var pt = function () { to('point', 'point', '', 1800); };
    if (state === 'idle') { if (!reduce && x === 0) steps(-1, pt); else pt(); }
    setTimeout(function () { if (bub.className.indexOf('olli-tip') > -1) closeBub(); }, 7000);
  }

  // ---- behaviour: watch what the visitor does ----
  var scrollT = null, lastY = window.scrollY, dirs = [], lastDir = 0;
  function active() {
    var was = state; last = Date.now();
    if (was === 'read' || was === 'sleep') to('wave', 'wave', 'olli-hop', 1100);
  }
  function onScroll() {
    var y = window.scrollY, dir = y > lastY ? 1 : y < lastY ? -1 : 0; lastY = y;
    last = Date.now();
    if (busy()) return;
    // flicking up and down quickly usually means they're hunting for something
    if (dir && dir !== lastDir) { dirs.push(Date.now()); lastDir = dir; dirs = dirs.filter(function (t) { return Date.now() - t < 6000; }); }
    if (dirs.length >= 5) { dirs = []; tip('hunt', 'Looking for something?', 'Tap me and I\'ll point you to the right page.'); }
    if (y + window.innerHeight > document.documentElement.scrollHeight - 500 && y > 600)
      tip('end', 'Liked what you saw?', 'See arivoo with your own data in a quick live walkthrough.', page === 'demo' ? null : ['Book a demo', DEMO]);
    if (state !== 'work' && state !== 'cheer' && state !== 'wave') to('work', 'laptop', 'olli-type');
    clearTimeout(scrollT);
    scrollT = setTimeout(function () { if (state === 'work') idle(); }, 1300);
  }
  function onMove(e) {
    last = Date.now();
    if (state === 'read' || state === 'sleep') { active(); return; }
    if (small() || (state !== 'idle' && state !== 'look')) return;
    var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var near = Math.hypot(e.clientX - cx, e.clientY - cy) < 190;
    if (near && state === 'idle') { if (!reduce && x === 0 && e.clientX < cx - 40) steps(-1, function () { to('look', 'curious', ''); }); else to('look', 'curious', ''); }
    else if (!near && state === 'look') { idle(); nextWalk = Math.min(nextWalk, Date.now() + 4000); }
  }
  // idle timeline + the odd glance / couple of steps
  var nextFidget = Date.now() + 8000, nextWalk = Date.now() + 22000;
  setInterval(function () {
    if (!root || busy()) return;
    var quiet = Date.now() - last;
    if (state === 'idle' && quiet > 18000 && !menuOpen()) { to('read', 'read', 'olli-breathe'); tip('idle', 'Take your time.', 'I\'ll be reading here. Tap me whenever you need a hand.'); }
    else if (state === 'read' && quiet > 45000) { to('sleep', 'sleepy', 'olli-sleep'); }
    if (state !== 'idle' || menuOpen()) return;
    if (Date.now() > nextFidget) { nextFidget = Date.now() + 7000 + Math.random() * 6000; to('fidget', Math.random() < 0.5 ? 'curious' : 'think', '', 1500); }
    else if (!reduce && Date.now() > nextWalk) { nextWalk = Date.now() + 20000 + Math.random() * 15000; steps(x < 0 ? 1 : -1); }
  }, 1000);

  // run a Web Animation and always call done once (also if the tab is hidden and frames are paused)
  function anim(frames, opts, done) {
    var called = false, end = function () { if (!called) { called = true; done && done(a); } };
    var a = mv.animate(frames, opts); a.onfinish = end; setTimeout(end, (opts.duration || 0) + 400); return a;
  }
  // two steps left (dir -1) or right (dir 1), facing front the whole time; home is x = 0, one stride = STEP
  var STEP = 36;
  function steps(dir, after) {
    var target = Math.max(-STEP, Math.min(0, x + dir * STEP));
    if (target === x) { after && after(); return; }
    var fr = dir < 0 ? ['stepL1', 'stepL2', 'stepL3', 'stepL4'] : ['stepR1', 'stepR2', 'stepR3', 'stepR4'];
    to('walk', null, ''); loop(fr, 170);
    anim([{ transform: 'translateX(' + x + 'px)' }, { transform: 'translateX(' + target + 'px)' }], { duration: 680, easing: 'linear', fill: 'forwards' },
      function (a) { x = target; mv.style.transform = 'translateX(' + x + 'px)'; a.cancel(); stopLoop(); if (state === 'walk') { idle(); after && after(); } });
  }


  // ---- leaving for another page: fly off, land on the next one ----
  function fly(go) {
    if (flying) return; flying = true; closeBub(); clearTimeout(stT); stopLoop(); state = 'fly'; cls('');
    ss.set('olli_arrive', String(Date.now()));
    var done = false, finish = function () { if (!done) { done = true; go(); } };
    setTimeout(finish, 1100); // never hold the visitor up
    setPose('crouch');
    setTimeout(function () {
      setPose('takeoff'); cls('olli-air');
      setTimeout(function () {
        loop(['flap1', 'lift', 'flap2', 'glide'], 90);
        var h = window.innerHeight;
        anim([{ transform: 'translate(' + x + 'px,0)' }, { transform: 'translate(' + (x - 70) + 'px,' + (-h * 0.45) + 'px) scale(.9)', offset: .55 }, { transform: 'translate(' + (x - 160) + 'px,' + (-h - 160) + 'px) scale(.75)' }],
          { duration: 650, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'forwards' }, finish);
      }, 110);
    }, 140);
  }
  function arrive() {
    state = 'arrive'; cls('olli-air'); loop(['glide', 'flap1', 'lift', 'flap2'], 100);
    var h = window.innerHeight;
    anim([{ transform: 'translate(-180px,' + (-h - 140) + 'px) scale(.8)' }, { transform: 'translate(-40px,' + (-h * 0.3) + 'px) scale(.95)', offset: .6 }, { transform: 'translate(0,0)' }],
      { duration: 900, easing: 'cubic-bezier(.2,.7,.3,1)' }, function () { stopLoop(); cls(''); setPose('land'); setTimeout(function () { to('wave', 'wave', '', 1000, function () { idle(); greet(); }); }, 260); });
  }

  function greet() {
    setTimeout(function () {
      if (product) tip('hello', 'Exploring ' + product.name + '?', 'I can show you around or set up a live demo of ' + product.long + '.', ['Book a demo', DEMO]);
      else if (page === 'home') tip('hello', 'Hi, I\'m Olli!', 'I\'ll keep you company while you look around. Tap me if you need anything.');
      else if (page === 'solutions') tip('hello', 'Not sure where to start?', 'Pick your institution type and I\'ll point out what fits.');
      else if (page === 'about') tip('hello', 'Nice to meet you!', 'This is the team behind arivoo. Tap me to explore our products.');
    }, 2500);
  }
  function linkFor(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return null;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (er) { return null; }
    if (u.origin !== location.origin || !/\.html?$|\/$/.test(u.pathname)) return null;
    if (u.pathname === location.pathname) return null; // same page / in-page anchor
    return u.href;
  }

  // ---- hide / show ----
  function hide() {
    ls.set('olli_hidden', '1'); closeBub(); clearTimeout(stT); stopLoop(); state = 'off';
    root.classList.add('olli-gone'); setTimeout(function () { root.style.display = 'none'; showPeek(); }, 350);
  }
  function showPeek() {
    if (!peek) {
      peek = document.createElement('button'); peek.className = 'olli-peek'; peek.setAttribute('aria-label', 'Show Olli, your arivoo guide');
      peek.innerHTML = '<img alt="" src="' + BASE + 'head.webp">'; document.body.appendChild(peek);
      peek.addEventListener('click', function () { ls.set('olli_hidden', null); peek.remove(); peek = null; root.style.display = ''; root.classList.remove('olli-gone'); x = 0; mv.style.transform = ''; reduce ? (idle(), openMenu()) : arrive(); });
    }
  }

  function mount() {
    root = document.createElement('div'); root.className = 'olli';
    root.innerHTML = '<div class="olli-move"><div class="olli-bub" role="dialog" aria-label="Olli help" aria-hidden="true"></div><button class="olli-btn" aria-label="Olli, your arivoo guide. Open help" aria-expanded="false"><span class="olli-shadow"></span><img class="olli-img" alt="" draggable="false"><span class="olli-z">z</span><span class="olli-z">z</span></button>' +
      '<button class="olli-x" aria-label="Hide Olli">×</button></div>';
    document.body.appendChild(root);
    mv = root.querySelector('.olli-move'); btn = root.querySelector('.olli-btn'); img = root.querySelector('.olli-img'); bub = root.querySelector('.olli-bub');
    setPose(STAND);
    btn.addEventListener('click', function () { menuOpen() ? closeBub() : openMenu(); });
    btn.addEventListener('mouseenter', function () { if (state === 'idle' || state === 'look') to('wave', 'wave', '', 1100); });
    root.querySelector('.olli-x').addEventListener('click', hide);
    bub.addEventListener('click', function (e) { if (e.target.closest('.olli-close')) closeBub(); });
    document.addEventListener('click', function (e) {
      if (menuOpen() && !root.contains(e.target)) closeBub();
      var u = linkFor(e); if (!u || reduce || !root || root.style.display === 'none') return;
      e.preventDefault(); fly(function () { location.href = u; });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bub.className.indexOf('on') > -1) { closeBub(); btn.focus(); } last = Date.now(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', active, { passive: true });
    window.addEventListener('resize', function () { setPose(pose); });
    // back/forward cache: make sure he isn't stuck mid-flight
    window.addEventListener('pageshow', function (e) { if (e.persisted) { flying = false; mv.getAnimations && mv.getAnimations().forEach(function (a) { a.cancel(); }); x = 0; mv.style.transform = ''; idle(); } });

    if (ls.get('olli_hidden')) { root.style.display = 'none'; showPeek(); return; }
    var t = +ss.get('olli_arrive') || 0; ss.set('olli_arrive', null);
    if (reduce) { idle(); greet(); }
    else if (Date.now() - t < 15000) arrive();
    else { mv.style.visibility = 'hidden'; setTimeout(function () { mv.style.visibility = ''; arrive(); }, 1200); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

/* Scrollytelling for "Not Even Nice Work If You Can Get It" (FAccT 2025) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = ms => (reduce ? 0 : ms);
  const W = 640, H = 560;
  // Oxford brand palette
  const C = { driver: '#00AAB4', uber: '#E6007E', standby: '#E2C044', enroute: '#789E9E', ink: '#FFFFFF', muted: '#4C6A8C', line: '#193658', bg: '#002147' };
  const svg = d3.select('#viz');
  const fmt = d3.format(',.0f');
  const money = v => '£' + v.toFixed(2);
  const rng = d3.randomLcg(42);
  const normal = d3.randomNormal.source(rng);

  const scenes = {};
  let current = null;
  const make = id => (lastMade = scenes[id] = { id, g: svg.append('g').attr('class', 'scene').attr('id', 's-' + id) });
  // Panel titles live in an HTML caption above the graphic (Title Case, no prefix)
  const small = new Set(['a','an','the','of','on','in','per','vs','from','to','and','or','at','by','for']);
  const up = w => w.replace(/^([(\[]?)(\p{L})/u, (m, p, c) => p + c.toUpperCase());
  const titleCase = t => { const ws = t.replace(/^\/\/\s*/, '').split(' '); return ws.map((w, i) => {
    const force = i === 0 || i === ws.length - 1 || /[:]$/.test(ws[i - 1] || '');
    if (!force && small.has(w.toLowerCase())) return w.toLowerCase();
    return w.split('-').map(up).join('-'); }).join(' '); };
  const cap = document.getElementById('vizTitle');
  let lastMade = null;
  const title = (g, t) => {
    const sc = lastMade;
    const o = { attr: () => o, text: v => { sc.title = titleCase(v); if (current === sc.id) cap.textContent = sc.title; return o; } };
    return o.text(t);
  };

  function countUp(sel, to, f, ms = 1400, from = 0) {
    sel.transition().duration(D(ms)).ease(d3.easeCubicOut)
      .tween('text', function () { const i = d3.interpolate(from, to); return t => (this.textContent = f(i(t))); });
  }


  /* ---------- Scene: information asymmetry (intro) ---------- */
  {
    const s = make('asym'), g = s.g;
    const ttl = title(g, 'Who sees what');
    const BEAM = '#B9D6F2', PURP = '#D1BDD5', MAUVE = '#776885';
    // marching-dash beam
    const beam = (pts, w = 9) => g.append('path').attr('d', d3.line()(pts)).attr('fill', 'none').attr('stroke', BEAM)
      .attr('stroke-width', w).attr('stroke-dasharray', '2 3').attr('opacity', 0).attr('class', 'beam');
    const person = (cx, label) => {
      const p = g.append('g');
      p.append('circle').attr('cx', cx).attr('cy', 262).attr('r', 24).attr('fill', '#fff');
      p.append('path').attr('d', `M${cx - 42},400 V352 Q${cx - 42},296 ${cx},296 Q${cx + 42},296 ${cx + 42},352 V400 Z`).attr('fill', '#fff');
      label.split(' ').forEach((w, i) => p.append('text').attr('x', cx).attr('y', 370 + i * 13).attr('text-anchor', 'middle').attr('class', 'num').style('fill', C.bg).style('font-size', '10px').style('letter-spacing', '0.06em').text(w));
      return p;
    };
    const screen = (x, w, label) => {
      const sc = g.append('g');
      sc.append('rect').attr('x', x).attr('y', 150).attr('width', w).attr('height', 220).attr('fill', '#0b2a52').attr('stroke', '#fff').attr('stroke-width', 2);
      sc.append('rect').attr('x', x + w / 2 - 6).attr('y', 370).attr('width', 12).attr('height', 22).attr('fill', '#fff');
      sc.append('rect').attr('x', x + w / 2 - 34).attr('y', 392).attr('width', 68).attr('height', 8).attr('fill', '#fff');
      sc.append('text').attr('x', x + w / 2).attr('y', 428).attr('text-anchor', 'middle').attr('class', 'lbl-s').style('font-size', '12px').style('letter-spacing', '0.1em').text(label);
      return sc;
    };
    const subj = person(58, 'DATA SUBJECT');
    const ctrl = person(582, 'DATA CONTROLLER');
    const scP = screen(124, 166, 'PERSONAL DATA');
    const scA = screen(322, 196, 'AGGREGATE DATA');
    // personal dot
    const me = g.append('g').attr('transform', 'translate(207,258)');
    me.append('circle').attr('r', 34).attr('fill', C.uber).attr('opacity', 0.85);
    me.append('circle').attr('cy', -8).attr('r', 9).attr('fill', '#fff');
    me.append('path').attr('d', 'M-15,18 Q-15,2 0,2 Q15,2 15,18 Z').attr('fill', '#fff');
    // aggregate plot
    const ax = d3.scaleLinear([0, 1], [342, 500]), ay = d3.scaleLinear([0, 1], [352, 170]);
    g.append('path').attr('d', `M${ax(0)},${ay(1)} V${ay(0)} H${ax(1)}`).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,.5)');
    const peers = [];
    [[0.78, 0.8, C.standby], [0.5, 0.52, C.driver], [0.22, 0.22, MAUVE]].forEach(([cx, cy, col]) => {
      for (let i = 0; i < 7; i++) peers.push({ x: Math.min(.96, Math.max(.04, cx + normal(0, 0.09)())), y: Math.min(.96, Math.max(.04, cy + normal(0, 0.08)())), col });
    });
    const trend = g.append('line').attr('x1', ax(0.05)).attr('y1', ay(0.05)).attr('x2', ax(0.05)).attr('y2', ay(0.05))
      .attr('stroke', C.uber).attr('stroke-width', 2).attr('stroke-dasharray', '4 4');
    const dots = g.append('g').selectAll('circle').data(peers).join('circle').attr('cx', d => ax(d.x)).attr('cy', d => ay(d.y)).attr('r', 0).attr('fill', d => d.col).attr('opacity', 0.9);
    const meSmall = g.append('circle').attr('r', 0).attr('fill', C.uber).attr('stroke', '#fff').attr('stroke-width', 2);
    const meTarget = [ax(0.3), ay(0.18)];
    const wedge = g.append('path').attr('fill', BEAM).attr('opacity', 0)
      .attr('d', `M241,232 L${meTarget[0]},${meTarget[1] - 6} L${meTarget[0]},${meTarget[1] + 6} L241,284 Z`);
    // beams
    const bSubj = beam([[96, 262], [150, 262]]);
    const bCtrl1 = beam([[540, 262], [500, 168]]);
    const bCtrl2 = beam([[540, 270], [470, 345]]);
    // shared view: copies of the controller's beams that slide over to the data subject
    const C1 = [[540, 262], [500, 168]], C2 = [[540, 270], [470, 345]];
    const S1 = [[96, 250], [342, 168]], S2 = [[96, 274], [342, 352]];
    const sh1 = beam(C1), sh2 = beam(C2);
    const slide = (path, from, to, dl) => path.attr('d', d3.line()(from)).attr('opacity', 0.75)
      .transition().delay(D(dl)).duration(D(1400)).ease(d3.easeCubicInOut)
      .attrTween('d', () => { const i = d3.interpolate(from, to); return t => d3.line()(i(t)); });
    const tag = g.append('text').attr('x', 320).attr('y', 480).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '15px').style('letter-spacing', '0.12em').attr('opacity', 0);
    let march = null;
    s.enter = mode => {
      if (march) march.stop();
      if (!reduce) { let o = 0; march = d3.timer(() => { o -= 0.4; g.selectAll('.beam').attr('stroke-dashoffset', o); }); }
      const on = (sel, v, dl = 0) => sel.transition().delay(D(dl)).duration(D(500)).attr('opacity', v);
      if (mode === 'subject') {
        ttl.text('// The data subject');
        on(bSubj, 0.75); on(bCtrl1, 0); on(bCtrl2, 0); on(sh1, 0); on(sh2, 0); on(wedge, 0);
        on(scA, 0.25); on(ctrl, 0.25); on(scP, 1); on(subj, 1); on(me, 1);
        dots.transition().duration(D(400)).attr('r', 0); trend.transition().duration(D(400)).attr('x2', ax(0.05)).attr('y2', ay(0.05));
        meSmall.transition().duration(D(400)).attr('r', 0);
        tag.attr('opacity', 0);
      } else if (mode === 'controller') {
        ttl.text('// The data controller');
        on(scA, 1); on(ctrl, 1); on(subj, 0.6); on(bSubj, 0.4); on(sh1, 0); on(sh2, 0);
        dots.transition().delay((d, i) => D(200 + i * 40)).duration(D(400)).attr('r', 9);
        trend.transition().delay(D(1100)).duration(D(800)).attr('x2', ax(0.95)).attr('y2', ay(0.95));
        meSmall.attr('cx', 207).attr('cy', 258).transition().delay(D(900)).duration(D(1000)).ease(d3.easeCubicInOut).attr('cx', meTarget[0]).attr('cy', meTarget[1]).attr('r', 8);
        on(wedge, 0.18, 1400); on(bCtrl1, 0.75, 400); on(bCtrl2, 0.75, 400);
        tag.text('INFORMATION ASYMMETRY').style('fill', C.uber).transition().delay(D(1800)).duration(D(400)).attr('opacity', 1);
      } else {
        ttl.text('// Mutual legibility');
        on(subj, 1); on(bSubj, 0.4); on(wedge, 0.18);
        slide(sh1, C1, S1, 300); slide(sh2, C2, S2, 300);
        dots.transition().duration(D(300)).attr('r', 9); trend.attr('x2', ax(0.95)).attr('y2', ay(0.95));
        meSmall.attr('cx', meTarget[0]).attr('cy', meTarget[1]).attr('r', 8);
        on(bCtrl1, 0.75); on(bCtrl2, 0.75); on(scA, 1); on(ctrl, 1);
        tag.text('SAME VIEW, BOTH SIDES').style('fill', C.driver).attr('opacity', 0).transition().delay(D(1700)).duration(D(400)).attr('opacity', 1);
      }
    };
    s.exit = () => { if (march) { march.stop(); march = null; } };
  }

  /* ---------- Scene: a driver's day ---------- */
  {
    const s = make('day'), g = s.g;
    title(g, 'A typical logged-in day');
    const hrs = [ { k: 'On a trip', v: 2.0, c: C.driver }, { k: 'En route', v: 0.5, c: C.enroute }, { k: 'Waiting', v: 2.2, c: C.standby } ];
    const total = d3.sum(hrs, d => d.v);
    const x = d3.scaleLinear([0, total], [40, 600]);
    let acc = 0; hrs.forEach(d => { d.x0 = acc; acc += d.v; d.x1 = acc; });
    const y = 250, h = 80;
    const segs = g.selectAll('.seg').data(hrs).join('g').attr('class', 'seg');
    segs.append('rect').attr('x', d => x(d.x0)).attr('y', y).attr('height', h).attr('width', 0).attr('fill', d => d.c);
    segs.append('text').attr('x', d => (x(d.x0) + x(d.x1)) / 2).attr('y', y + h + 28).attr('text-anchor', 'middle').attr('class', 'lbl').text(d => d.k);
    segs.append('text').attr('x', d => (x(d.x0) + x(d.x1)) / 2).attr('y', y + h / 2 + 6).attr('text-anchor', 'middle').attr('class', 'lbl num').style('fill', C.bg).text(d => d.v + 'h');
    const unpaid = g.append('g').attr('opacity', 0);
    unpaid.append('text').attr('x', (x(2.5) + x(total)) / 2).attr('y', y - 18).attr('text-anchor', 'middle').attr('class', 'lbl num').style('fill', C.uber).style('font-size', '22px').text('UNPAID');
    const hatch = svg.append('defs').append('pattern').attr('id', 'hatch').attr('width', 10).attr('height', 10).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)');
    hatch.append('rect').attr('width', 4).attr('height', 10).attr('fill', 'rgba(0,33,71,.55)');
    unpaid.append('rect').attr('x', x(2.5)).attr('y', y).attr('width', x(total) - x(2.5)).attr('height', h).attr('fill', 'url(#hatch)');
    const brace = (x0, x1, yy, txt, col) => {
      const b = g.append('g').attr('opacity', 0);
      b.append('path').attr('d', `M${x0},${yy + 14} V${yy} H${x1} V${yy + 14}`).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 3);
      b.append('text').attr('x', (x0 + x1) / 2).attr('y', yy - 12).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).style('fill', col).text(txt);
      return b;
    };
    const bUber = brace(x(0), x(2.5), 170, "Uber's \"working time\"", C.uber);
    const bCourt = brace(x(0), x(total), 120, "Tribunal's working time: all of it", C.driver);
    g.append('text').attr('x', 40).attr('y', 470).attr('class', 'lbl-s').text('Illustrative day; proportions based on the paper\'s 2023–24 daily averages.');
    let drawn = false;
    s.enter = mode => {
      if (!drawn) {
        drawn = true;
        segs.select('rect').transition('grow').delay((d, i) => D(i * 450)).duration(D(600)).attr('width', d => x(d.x1) - x(d.x0));
      }
      unpaid.transition().duration(D(500)).attr('opacity', mode === 'uber' ? 1 : 0);
      bUber.transition().duration(D(500)).attr('opacity', mode === 'uber' || mode === 'court' ? 1 : 0);
      bCourt.transition().duration(D(500)).attr('opacity', mode === 'court' ? 1 : 0);
      segs.filter(d => d.k === 'Waiting').select('rect').transition('dim').duration(D(500)).attr('opacity', mode === 'uber' ? 0.45 : 1);
    };
  }

  /* ---------- Scene: two wages ---------- */
  {
    const s = make('pay'), g = s.g;
    title(g, 'Average hourly pay, 2020–2024');
    const data = [ { k: "Uber's definition", v: 29.46, c: C.uber }, { k: "Tribunal's definition", v: 15.98, c: C.driver } ];
    const y = d3.scaleLinear([0, 34], [470, 120]);
    const bw = 170, xs = [110, 360];
    const bars = g.selectAll('.b').data(data).join('g');
    bars.append('rect').attr('x', (d, i) => xs[i]).attr('width', bw).attr('y', 470).attr('height', 0).attr('fill', d => d.c);
    const nums = bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 455).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '40px').text('£0');
    bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 500).attr('text-anchor', 'middle').attr('class', 'lbl').text(d => d.k);
    g.append('line').attr('x1', 80).attr('x2', 570).attr('y1', 470).attr('y2', 470).attr('stroke', C.ink);
    const gap = g.append('text').attr('x', 320).attr('y', 92).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).attr('opacity', 0).text('Counting waiting time nearly halves the wage');
    s.enter = () => {
      bars.select('rect').attr('y', 470).attr('height', 0).transition().delay((d, i) => D(i * 500)).duration(D(1200)).ease(d3.easeCubicOut).attr('y', d => y(d.v)).attr('height', d => 470 - y(d.v));
      nums.each(function (d, i) {
        d3.select(this).attr('y', 455).transition().delay(D(i * 500)).duration(D(1200)).ease(d3.easeCubicOut).attr('y', y(d.v) - 14)
          .tween('text', function () { const it = d3.interpolate(0, d.v); return t => (this.textContent = money(it(t))); });
      });
      gap.attr('opacity', 0).transition().delay(D(1800)).duration(D(500)).attr('opacity', 1);
    };
  }

  /* ---------- Scene: data flow ---------- */
  {
    const s = make('data'), g = s.g;
    title(g, 'Where the data came from');
    const nodes = [ { k: 'Uber', sub: 'holds the data', x: 100, c: C.ink }, { k: 'Worker Info', sub: 'Exchange', x: 320, c: C.standby }, { k: 'Oxford', sub: 'researchers', x: 540, c: C.driver } ];
    const ny = 300;
    nodes.forEach(n => {
      g.append('circle').attr('cx', n.x).attr('cy', ny).attr('r', 54).attr('fill', C.bg).attr('stroke', n.c).attr('stroke-width', 4);
      g.append('text').attr('x', n.x).attr('y', ny + 82).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).text(n.k);
      g.append('text').attr('x', n.x).attr('y', ny + 100).attr('text-anchor', 'middle').attr('class', 'lbl-s').text(n.sub);
    });
    g.append('text').attr('x', 210).attr('y', 230).attr('text-anchor', 'middle').attr('class', 'lbl-s').text('GDPR data requests');
    g.append('text').attr('x', 430).attr('y', 230).attr('text-anchor', 'middle').attr('class', 'lbl-s').text('anonymised, on-site');
    const dots = g.append('g');
    const trips = g.append('text').attr('x', 320).attr('y', 450).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '44px').text('0');
    g.append('text').attr('x', 320).attr('y', 480).attr('text-anchor', 'middle').attr('class', 'lbl').text('trips analysed · from 258 drivers · 2016–2024');
    s.enter = () => {
      dots.selectAll('*').remove();
      const pts = d3.range(258).map(i => ({ i, dy: normal(0, 22)(), d2: normal(0, 22)() }));
      dots.selectAll('circle').data(pts).join('circle').attr('r', 3.2).attr('fill', C.driver).attr('opacity', 0.8)
        .attr('cx', 100).attr('cy', d => ny + d.dy)
        .transition().delay(d => D(d.i * 8)).duration(D(900)).attr('cx', 320).attr('cy', d => ny + d.d2)
        .transition().duration(D(900)).attr('cx', d => 540 + normal(0, 14)()).attr('cy', d => ny + normal(0, 18)());
      countUp(trips, 1500000, v => fmt(v) + (v > 1499000 ? '+' : ''), 3200);
    };
  }


  /* ---------- Scene: integrating DSAR responses ---------- */
  {
    const s = make('dsar'), g = s.g;
    const ttl = title(g, 'One DSAR response');
    const names = ['Rider_Feedback_Given_By_Driver','Driver_and_Rider_Device_Data','Driver_Profile_Data','Eater_Saved_Locations','Driver_Trip_Status','Rider_Lifetime_Ratings_Received',
      'Driver_Online_Offline','Driver_Feedback_Received','Driver_App_Restrictions','Driver_Lifetime_Ratings_Received','Rider_Lifetime_Ratings_Given_To_Drivers','Rider_Profile_Data',
      'Communications_From_Users','Driver_Trusted_Contacts','Driver_Profile_Information','Rider_Detailed_Device_Data','Rider_Lifetime_Trips','Communications_To_Users',
      'Driver_Saved_Locations','Driver_Payments','Miscellaneous_Payments','Driver_Lifetime_Trips','Driver_Dispatches_Offered_and_Accepted','Driver_Detailed_Device_Data',
      'Payment_Methods','Driver_Performance_Badges','Driver_Star_Power_Requests','Driver_Cancellations_From_Riders','Driver_Lifetime_Ratings_Given_To_Clients','+ more files'];
    const KEY = new Set(['Driver_Payments','Miscellaneous_Payments','Driver_Lifetime_Trips','Driver_Dispatches_Offered_and_Accepted']);
    const cols = 6, tw = 90, th = 40, gx = 6, gy = 6, x0 = 33, y0 = 104;
    const tiles = names.map((n, i) => ({ n, i, key: KEY.has(n), x: x0 + (i % cols) * (tw + gx), y: y0 + Math.floor(i / cols) * (th + gy) }));
    // folder icon
    const fold = g.append('g').attr('transform', 'translate(560,30)');
    fold.append('path').attr('d', 'M0,8 H18 L24,14 H52 V44 H0 Z').attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2.5);
    fold.append('text').attr('x', 26).attr('y', 36).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '10px').text('.csv');
    const tg = g.append('g');
    const tile = tg.selectAll('g').data(tiles).join('g').attr('transform', 'translate(586,52)').attr('opacity', 0);
    tile.append('rect').attr('width', tw).attr('height', th).attr('fill', '#0b2a52').attr('stroke', 'rgba(255,255,255,.35)');
    tile.each(function (d) {
      const parts = d.n.replace(/_/g, '_​').split('​'); const lines = []; let cur = '';
      parts.forEach(pt => { if ((cur + pt).length > 15 && cur) { lines.push(cur); cur = pt; } else cur += pt; }); lines.push(cur);
      const t = d3.select(this).append('text').attr('x', tw / 2).attr('text-anchor', 'middle').style('font-family', "'IBM Plex Mono', monospace").style('font-size', '7.5px').style('fill', 'rgba(255,255,255,.8)');
      lines.slice(0, 3).forEach((l, k) => t.append('tspan').attr('x', tw / 2).attr('y', th / 2 + 3 + (k - (Math.min(lines.length, 3) - 1) / 2) * 9).text(l));
    });
    // pipeline
    const pipe = g.append('g').attr('opacity', 0);
    const node = (x, y, w, label, hot) => {
      const n = pipe.append('g').attr('transform', `translate(${x},${y})`);
      n.append('rect').attr('x', -w / 2).attr('y', -18).attr('width', w).attr('height', 36).attr('fill', hot ? C.driver : '#0b2a52').attr('stroke', hot ? C.driver : '#fff');
      n.append('text').attr('y', 4).attr('text-anchor', 'middle').style('font-family', "'IBM Plex Mono', monospace").style('font-size', '10.5px').style('fill', hot ? C.bg : '#fff').style('font-weight', hot ? 700 : 400).text(label);
      return n;
    };
    const tc = n => { const t = tiles.find(d => d.n === n); return [t.x + tw / 2, t.y + th]; };
    const N = { pay: [96, 418], wpay: [232, 418], wtrip: [372, 418], wdisp: [512, 418], cmp: [320, 506] };
    const links = [
      [tc('Driver_Payments'), N.pay], [tc('Miscellaneous_Payments'), N.pay], [N.pay, N.wpay],
      [tc('Driver_Lifetime_Trips'), N.wtrip], [tc('Driver_Dispatches_Offered_and_Accepted'), N.wdisp],
      [N.wpay, N.cmp], [N.wtrip, N.cmp], [N.wdisp, N.cmp]
    ];
    const linkPaths = pipe.selectAll('path').data(links).join('path').attr('fill', 'none').attr('stroke', C.driver).attr('stroke-width', 2)
      .attr('d', ([a, b]) => a[1] === b[1] ? `M${a[0] + 56},${a[1]} H${b[0] - 56}` : `M${a[0]},${a[1] + (a[1] > 400 ? 18 : 0)} C${a[0]},${(a[1] + b[1]) / 2} ${b[0]},${(a[1] + b[1]) / 2} ${b[0]},${b[1] - 18}`);
    node(...N.pay, 112, 'Payments'); node(...N.wpay, 112, 'Weekly payments'); node(...N.wtrip, 112, 'Weekly trips'); node(...N.wdisp, 128, 'Weekly dispatches');
    node(...N.cmp, 150, 'PAY COMPARISON', true);
    pipe.append('text').attr('x', 148).attr('y', 384).attr('class', 'lbl-s').style('font-size', '10px').text('normalise timestamps');
    pipe.append('text').attr('x', 420).attr('y', 470).attr('class', 'lbl-s').style('font-size', '10px').text('fuzzy-match on time');
    const count = g.append('text').attr('x', 33).attr('y', 404).attr('class', 'num').style('font-size', '15px').style('letter-spacing', '0.08em');
    s.enter = mode => {
      if (mode === 'files') {
        ttl.text('// One DSAR response');
        pipe.transition().duration(D(300)).attr('opacity', 0);
        tile.transition().delay(d => D(d.i * 35)).duration(D(600)).ease(d3.easeCubicOut)
          .attr('transform', d => `translate(${d.x},${d.y})`).attr('opacity', 1);
        tile.select('rect').transition().duration(D(300)).attr('stroke', 'rgba(255,255,255,.35)').attr('stroke-width', 1);
        count.attr('opacity', 0).text('~40–45 FILES · ~35 CSVs · PER DRIVER').style('fill', C.standby)
          .transition().delay(D(1200)).duration(D(400)).attr('opacity', 1);
      } else {
        ttl.text('// Rebuilding the picture');
        tile.attr('transform', d => `translate(${d.x},${d.y})`).transition().duration(D(600)).attr('opacity', d => (d.key ? 1 : 0.18));
        tile.select('rect').transition().duration(D(600)).attr('stroke', d => (d.key ? C.driver : 'rgba(255,255,255,.35)')).attr('stroke-width', d => (d.key ? 2.5 : 1));
        count.transition().duration(D(300)).attr('opacity', 0);
        pipe.transition().delay(D(400)).duration(D(400)).attr('opacity', 1);
        linkPaths.each(function (d, i) {
          const L = this.getTotalLength();
          d3.select(this).attr('stroke-dasharray', L).attr('stroke-dashoffset', L).transition().delay(D(500 + i * 180)).duration(D(600)).attr('stroke-dashoffset', 0);
        });
      }
    };
  }

  /* ---------- Scene: fare split ---------- */
  {
    const s = make('split'), g = s.g;
    const ttl = title(g, 'Where each £ of fare goes');
    const N = 24;
    const base = 470, maxH = 320;
    const xs = d3.scaleBand(d3.range(N), [50, 590]).padding(0.18);
    // illustrative: each trip gets a fare and a driver share. Uber's cut is drawn from a spread centred near the paper's 29% median.
    const trips = d3.range(N).map(i => {
      const fare = 0.35 + rng() * 0.65;
      return { i, fare, uberAfter: Math.min(0.55, Math.max(0.05, 0.29 + normal(0, 0.1)())) };
    });
    // for the "big fare" view: sort by fare, make Uber share grow with fare (pattern from paper Fig. 5)
    const sorted = trips.slice().sort((a, b) => a.fare - b.fare);
    sorted.forEach((d, r) => { d.rank = r; d.uberBig = 0.12 + 0.33 * (r / (N - 1)); });
    const grp = g.selectAll('.trip').data(trips).join('g').attr('class', 'trip');
    grp.append('rect').attr('class', 'drv').attr('fill', C.driver);
    grp.append('rect').attr('class', 'ub').attr('fill', C.uber);
    const legend = g.append('g').attr('transform', 'translate(50,90)');
    [[C.driver, 'Driver'], [C.uber, 'Uber']].forEach(([c, t], i) => {
      legend.append('rect').attr('x', i * 110).attr('width', 16).attr('height', 16).attr('fill', c);
      legend.append('text').attr('x', i * 110 + 22).attr('y', 13).attr('class', 'lbl').text(t);
    });
    const big = g.append('g');
    const bigD = big.append('rect').attr('fill', C.driver);
    const bigU = big.append('rect').attr('fill', C.uber);
    const bigT1 = big.append('text').attr('class', 'num').style('font-size', '48px').style('fill', C.bg).attr('text-anchor', 'middle');
    const bigT2 = big.append('text').attr('class', 'num').style('font-size', '36px').style('fill', '#fff').attr('text-anchor', 'middle');
    const cap = g.append('text').attr('x', 320).attr('y', 510).attr('text-anchor', 'middle').attr('class', 'lbl-s');
    let jitter = null;
    function drawTrips(key, heightByFare, dur) {
      grp.each(function (d) {
        const xPos = key === 'uberBig' ? xs(d.rank) : xs(d.i);
        const hh = (heightByFare ? d.fare : 1) * maxH;
        const u = d[key];
        const sel = d3.select(this);
        sel.select('.ub').transition().duration(D(dur)).attr('x', xPos).attr('width', xs.bandwidth()).attr('y', base - hh).attr('height', hh * u);
        sel.select('.drv').transition().duration(D(dur)).attr('x', xPos).attr('width', xs.bandwidth()).attr('y', base - hh + hh * u).attr('height', hh * (1 - u));
      });
    }
    s.enter = mode => {
      if (jitter) { jitter.stop(); jitter = null; }
      if (mode === 'before') {
        ttl.text('// Before 2023: a fixed split');
        grp.transition().duration(D(300)).attr('opacity', 0);
        const x0 = 170, w = 300, top = 130, hh = 340;
        big.transition().duration(D(400)).attr('opacity', 1);
        bigU.attr('x', x0).attr('width', w).attr('y', top).attr('height', 0).transition().duration(D(900)).attr('height', hh * 0.25);
        bigD.attr('x', x0).attr('width', w).attr('y', top + hh).attr('height', 0).transition().duration(D(900)).attr('y', top + hh * 0.25).attr('height', hh * 0.75);
        bigT2.attr('x', x0 + w / 2).attr('y', top + hh * 0.125 + 12).text('25%');
        bigT1.attr('x', x0 + w / 2).attr('y', top + hh * 0.62 + 16).text('75%');
        cap.text('Every trip, every time.');
      } else {
        big.transition().duration(D(400)).attr('opacity', 0);
        grp.transition().duration(D(400)).attr('opacity', 1);
        if (mode === 'after') {
          ttl.text('// After: a different split on every trip');
          drawTrips('uberAfter', false, 900);
          cap.text('Illustrative trips. Median Uber cut: 29%.');
          if (!reduce) {
            jitter = d3.interval(() => {
              trips.forEach(d => (d.uberAfter = Math.min(0.55, Math.max(0.05, 0.29 + normal(0, 0.1)()))));
              drawTrips('uberAfter', false, 700);
            }, 1400);
          }
        } else {
          ttl.text('// Sorted by fare: bigger trips, bigger cut');
          drawTrips('uberBig', true, 1100);
          cap.text('Illustrative trips sorted by fare (cheapest left). Pattern from the paper.');
        }
      }
    };
    s.exit = () => { if (jitter) { jitter.stop(); jitter = null; } };
  }

  /* ---------- Scene: Uber surplus ---------- */
  {
    const s = make('surplus'), g = s.g;
    title(g, "Uber's take per hour on trip");
    const data = [ { k: 'Before', sub: '2020 – early 2022', v: 8.47 }, { k: 'After', sub: 'Mar 2023 – Oct 2024', v: 11.70 } ];
    const y = d3.scaleLinear([0, 13], [460, 130]);
    const xs = [150, 370], bw = 130;
    const bars = g.selectAll('.b').data(data).join('g');
    bars.append('rect').attr('x', (d, i) => xs[i]).attr('width', bw).attr('fill', C.uber).attr('opacity', (d, i) => (i ? 1 : 0.55));
    const nums = bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '34px');
    bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 490).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).text(d => d.k);
    bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 510).attr('text-anchor', 'middle').attr('class', 'lbl-s').text(d => d.sub);
    g.append('line').attr('x1', 110).attr('x2', 540).attr('y1', 460).attr('y2', 460).attr('stroke', C.ink);
    const badge = g.append('g').attr('transform', 'translate(560,104)').attr('opacity', 0);
    badge.append('rect').attr('x', -54).attr('y', -26).attr('width', 108).attr('height', 52).attr('fill', C.uber);
    badge.append('text').attr('y', 10).attr('text-anchor', 'middle').attr('class', 'num').style('fill', '#fff').style('font-size', '28px').style('font-size', '26px').text('+38%');
    s.enter = () => {
      bars.select('rect').attr('y', 460).attr('height', 0).transition().delay((d, i) => D(i * 500)).duration(D(1100)).ease(d3.easeCubicOut).attr('y', d => y(d.v)).attr('height', d => 460 - y(d.v));
      nums.each(function (d, i) {
        d3.select(this).attr('y', 450).transition().delay(D(i * 500)).duration(D(1100)).attr('y', y(d.v) - 14)
          .tween('text', function () { const it = d3.interpolate(0, d.v); return t => (this.textContent = money(it(t))); });
      });
      badge.attr('opacity', 0).attr('transform', 'translate(560,104)')
        .transition().delay(D(1500)).duration(D(300)).attr('opacity', 1);
    };
  }

  /* ---------- Scene: waiting ---------- */
  {
    const s = make('wait'), g = s.g;
    title(g, 'Hours per day (approximate)');
    const years = [2020, 2021, 2022, 2023, 2024];
    const trip = [2.0, 2.0, 2.0, 2.0, 2.0];
    const stand = [1.4, 1.45, 1.6, 2.2, 2.6];
    const x = d3.scalePoint(years, [90, 560]);
    const y = d3.scaleLinear([0, 3.2], [460, 120]);
    g.append('g').attr('transform', 'translate(0,460)').call(d3.axisBottom(x).tickFormat(d3.format('d'))).selectAll('text').style('font-size', '13px');
    g.append('g').attr('transform', 'translate(90,0)').call(d3.axisLeft(y).ticks(4).tickFormat(d => d + 'h')).selectAll('text').style('font-size', '13px');
    const line = d3.line().x((d, i) => x(years[i])).y(d => y(d)).curve(d3.curveMonotoneX);
    const pT = g.append('path').datum(trip).attr('d', line).attr('fill', 'none').attr('stroke', C.driver).attr('stroke-width', 5).attr('stroke-linecap', 'butt');
    const pS = g.append('path').datum(stand).attr('d', line).attr('fill', 'none').attr('stroke', C.standby).attr('stroke-width', 5).attr('stroke-linecap', 'butt');
    g.append('text').attr('x', 566).attr('y', y(2) + 22).attr('class', 'lbl').style('fill', C.driver).style('font-weight', 700).attr('text-anchor', 'end').text('On a trip');
    const lS = g.append('text').attr('x', 566).attr('y', y(2.6) - 14).attr('class', 'lbl').style('fill', C.ink).style('font-weight', 700).attr('text-anchor', 'end').text('Waiting (unpaid)');
    function draw(p, delay) {
      const L = p.node().getTotalLength();
      p.attr('stroke-dasharray', L).attr('stroke-dashoffset', L).transition().delay(D(delay)).duration(D(1600)).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);
    }
    s.enter = () => {
      draw(pT, 0); draw(pS, 500);
      lS.attr('opacity', 0).transition().delay(D(1900)).duration(D(400)).attr('opacity', 1);
    };
  }

  /* ---------- Scene: real pay slope ---------- */
  {
    const s = make('real'), g = s.g;
    title(g, 'Hourly pay, adjusted for inflation');
    const data = [ { k: "Tribunal definition", a: 22.20, b: 19.06, c: C.driver }, { k: "Uber's definition", a: 37.01, b: 35.91, c: C.uber } ];
    const x0 = 170, x1 = 470;
    const y = d3.scaleLinear([15, 40], [470, 120]);
    g.append('text').attr('x', x0).attr('y', 505).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).text('Year before');
    g.append('text').attr('x', x1).attr('y', 505).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).text('Year after');
    g.append('text').attr('x', 320).attr('y', 530).attr('text-anchor', 'middle').attr('class', 'lbl-s').text('dynamic pricing');
    [x0, x1].forEach(xx => g.append('line').attr('x1', xx).attr('x2', xx).attr('y1', 110).attr('y2', 480).attr('stroke', C.line));
    const rows = g.selectAll('.r').data(data).join('g');
    rows.append('line').attr('stroke', d => d.c).attr('stroke-width', d => (d.c === C.driver ? 6 : 3)).attr('opacity', d => (d.c === C.driver ? 1 : 0.5)).attr('stroke-linecap', 'butt');
    rows.append('circle').attr('class', 'a').attr('r', 9).attr('cx', x0).attr('cy', d => y(d.a)).attr('fill', d => d.c);
    rows.append('circle').attr('class', 'b').attr('r', 9).attr('cx', x0).attr('fill', d => d.c);
    rows.append('text').attr('x', x0 - 18).attr('y', d => y(d.a) + 6).attr('text-anchor', 'end').attr('class', 'num').style('font-size', '20px').text(d => money(d.a));
    const bt = rows.append('text').attr('x', x1 + 18).attr('text-anchor', 'start').attr('class', 'num').style('font-size', '20px');
    rows.append('text').attr('x', 320).attr('y', d => y((d.a + d.b) / 2) - 16).attr('text-anchor', 'middle').attr('class', 'lbl-s').text(d => d.k);
    s.enter = () => {
      rows.select('line').attr('x1', x0).attr('y1', d => y(d.a)).attr('x2', x0).attr('y2', d => y(d.a))
        .transition().delay(D(300)).duration(D(1300)).ease(d3.easeCubicInOut).attr('x2', x1).attr('y2', d => y(d.b));
      rows.select('circle.b').attr('cx', x0).attr('cy', d => y(d.a)).transition().delay(D(300)).duration(D(1300)).ease(d3.easeCubicInOut).attr('cx', x1).attr('cy', d => y(d.b));
      bt.attr('y', d => y(d.b) + 6).attr('opacity', 0).text(d => money(d.b)).transition().delay(D(1500)).duration(D(400)).attr('opacity', 1);
    };
  }

  /* ---------- Scene: waffle of 114 drivers ---------- */
  {
    const s = make('waffle'), g = s.g;
    const ttl = title(g, '114 drivers, a year either side');
    const N = 114, cols = 12, cell = 30;
    const ox = (W - cols * cell) / 2 + cell / 2, oy = 130;
    const order = d3.shuffle(d3.range(N), rng);
    const dots = g.selectAll('rect.cell').data(d3.range(N)).join('rect').attr('class', 'cell').attr('width', 20).attr('height', 20).attr('transform', 'translate(-10,-10)').attr('fill', C.muted);
    const lWorse = g.append('text').attr('class', 'num').style('fill', C.uber).style('font-size', '22px').attr('opacity', 0).text('93 worse off');
    const lBetter = g.append('text').attr('class', 'num').style('fill', C.driver).style('font-size', '22px').attr('opacity', 0).text('21 better off');
    const pos = (k, c = cols, x0 = ox, y0 = oy) => [x0 + (k % c) * cell, y0 + Math.floor(k / c) * cell];
    s.enter = mode => {
      if (mode === 'all') {
        ttl.text('// 114 drivers, a year either side');
        dots.transition().delay(d => D(order[d] * 10)).duration(D(500)).attr('fill', C.muted)
          .attr('x', d => pos(order[d])[0]).attr('y', d => pos(order[d])[1]);
        lWorse.attr('opacity', 0); lBetter.attr('opacity', 0);
      } else {
        ttl.text('// Who gained, who lost');
        // worse-off block on the left (10 cols), better-off on the right (3 cols)
        dots.transition().delay(d => D(d * 8)).duration(D(800)).ease(d3.easeCubicInOut)
          .attr('fill', d => (d < 93 ? C.uber : C.driver))
          .attr('x', d => (d < 93 ? pos(d, 10, 60)[0] : pos(d - 93, 3, 430)[0]))
          .attr('y', d => (d < 93 ? pos(d, 10, 60, 150)[1] : pos(d - 93, 3, 430, 150)[1]));
        lWorse.attr('x', 50).attr('y', 125).transition().delay(D(1000)).duration(D(400)).attr('opacity', 1);
        lBetter.attr('x', 420).attr('y', 125).transition().delay(D(1100)).duration(D(400)).attr('opacity', 1);
      }
    };
  }

  /* ---------- Scene: predictability ---------- */
  {
    const s = make('predict'), g = s.g;
    const ttl = title(g, 'Predicted vs actual pay'); ttl.attr('y', 50);
    const x = d3.scaleLinear([0, 1], [100, 560]);
    const y = d3.scaleLinear([0, 1], [470, 110]);
    g.append('rect').attr('x', 100).attr('y', 110).attr('width', 460).attr('height', 360).attr('fill', 'none').attr('stroke', C.line);
    g.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(1)).attr('y2', y(1)).attr('stroke', C.ink).attr('stroke-dasharray', '6 6').attr('opacity', 0.4);
    g.append('text').attr('x', 330).attr('y', 500).attr('text-anchor', 'middle').attr('class', 'lbl-s').text('actual pay →');
    g.append('text').attr('transform', 'translate(80,290) rotate(-90)').attr('text-anchor', 'middle').attr('class', 'lbl-s').text('predicted pay →');
    const pts = d3.range(90).map(() => { const a = 0.08 + rng() * 0.84; return { a, good: Math.min(0.98, Math.max(0.02, a + normal(0, 0.05)())), bad: rng() }; });
    const dots = g.selectAll('circle').data(pts).join('circle').attr('r', 6).attr('cx', d => x(d.a)).attr('cy', d => y(d.good)).attr('fill', C.driver).attr('opacity', 0.75);
    const score = g.append('text').attr('x', 100).attr('y', 98).attr('class', 'num').style('font-size', '22px');
    const warn = g.append('text').attr('x', 560).attr('y', 98).attr('text-anchor', 'end').attr('class', 'lbl').style('font-weight', 700).style('fill', C.uber).attr('opacity', 0).text('model breaks');
    s.enter = mode => {
      if (mode === 'before') {
        ttl.text('// Predicting 2022 from earlier years');
        dots.transition().duration(D(900)).attr('cy', d => y(d.good)).attr('fill', C.driver);
        score.text('R² ≈ 0.4–0.9').style('fill', C.driver);
        warn.attr('opacity', 0);
      } else {
        ttl.text('// Predicting 2023 from 2022');
        dots.transition().delay(() => D(rng() * 400)).duration(D(1100)).ease(d3.easeCubicInOut).attr('cy', d => y(d.bad)).attr('fill', C.uber);
        score.text('R² = −54').style('fill', C.uber);
        warn.transition().delay(D(700)).duration(D(300)).attr('opacity', 1);
      }
    };
  }

  /* ---------- Scroll wiring ---------- */
  function show(id, mode) {
    if (current && current !== id) {
      scenes[current].g.classed('on', false);
      scenes[current].exit && scenes[current].exit();
    }
    scenes[id].g.classed('on', true);
    current = id;
    scenes[id].enter && scenes[id].enter(mode);
    cap.textContent = scenes[id].title || '';
  }

  const steps = d3.selectAll('.step');
  const scroller = scrollama();
  scroller.setup({ step: '.step', offset: window.innerWidth < 820 ? 0.85 : 0.6 })
    .onStepEnter(({ element }) => {
      steps.classed('is-active', function () { return this === element; });
      show(element.dataset.scene, element.dataset.mode);
    });
  window.addEventListener('resize', () => scroller.resize());
  show('asym', 'subject');
})();

/* Scrollytelling for "Not Even Nice Work If You Can Get It" (FAccT 2025) */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = ms => (reduce ? 0 : ms);
  const W = 640, H = 560;
  const C = { driver: '#14866d', uber: '#e2522f', standby: '#f0b429', enroute: '#7fb7a8', ink: '#1d1b18', muted: '#6b645a', line: '#d9d1c4' };
  const svg = d3.select('#viz');
  const fmt = d3.format(',.0f');
  const money = v => '£' + v.toFixed(2);
  const rng = d3.randomLcg(42);
  const normal = d3.randomNormal.source(rng);

  const scenes = {};
  const make = id => (scenes[id] = { g: svg.append('g').attr('class', 'scene').attr('id', 's-' + id) });
  const title = (g, t) => g.append('text').attr('x', 40).attr('y', 56).attr('class', 'lbl num').style('font-size', '24px').text(t);

  function countUp(sel, to, f, ms = 1400, from = 0) {
    sel.transition().duration(D(ms)).ease(d3.easeCubicOut)
      .tween('text', function () { const i = d3.interpolate(from, to); return t => (this.textContent = f(i(t))); });
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
    segs.append('rect').attr('x', d => x(d.x0)).attr('y', y).attr('height', h).attr('width', 0).attr('rx', 6).attr('fill', d => d.c);
    segs.append('text').attr('x', d => (x(d.x0) + x(d.x1)) / 2).attr('y', y + h + 28).attr('text-anchor', 'middle').attr('class', 'lbl').text(d => d.k);
    segs.append('text').attr('x', d => (x(d.x0) + x(d.x1)) / 2).attr('y', y + h / 2 + 6).attr('text-anchor', 'middle').attr('class', 'lbl num').style('fill', '#fff').text(d => d.v + 'h');
    const unpaid = g.append('g').attr('opacity', 0);
    unpaid.append('text').attr('x', (x(2.5) + x(total)) / 2).attr('y', y - 18).attr('text-anchor', 'middle').attr('class', 'lbl num').style('fill', C.uber).style('font-size', '22px').text('UNPAID');
    const hatch = svg.append('defs').append('pattern').attr('id', 'hatch').attr('width', 10).attr('height', 10).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)');
    hatch.append('rect').attr('width', 4).attr('height', 10).attr('fill', 'rgba(255,255,255,.55)');
    unpaid.append('rect').attr('x', x(2.5)).attr('y', y).attr('width', x(total) - x(2.5)).attr('height', h).attr('rx', 6).attr('fill', 'url(#hatch)');
    const brace = (x0, x1, yy, txt, col) => {
      const b = g.append('g').attr('opacity', 0);
      b.append('path').attr('d', `M${x0},${yy + 14} V${yy} H${x1} V${yy + 14}`).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 3);
      b.append('text').attr('x', (x0 + x1) / 2).attr('y', yy - 12).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).style('fill', col).text(txt);
      return b;
    };
    const bUber = brace(x(0), x(2.5), 170, "Uber's \"working time\"", C.uber);
    const bCourt = brace(x(0), x(total), 120, "Tribunal's working time: all of it", C.driver);
    // little car that drives along the bar
    const car = g.append('g').attr('transform', `translate(${x(0)},${y - 34})`);
    car.append('path').attr('d', 'M2 18 L6 9 Q8 6 13 6 L30 6 Q34 6 37 9 L42 15 L46 16 Q48 17 48 19 L48 21 L0 21 L0 19Z').attr('fill', C.ink);
    car.append('circle').attr('cx', 11).attr('cy', 21).attr('r', 4).attr('fill', C.ink);
    car.append('circle').attr('cx', 37).attr('cy', 21).attr('r', 4).attr('fill', C.ink);
    g.append('text').attr('x', 40).attr('y', 470).attr('class', 'lbl-s').text('Illustrative day; proportions based on the paper\'s 2023–24 daily averages.');
    let drawn = false;
    s.enter = mode => {
      if (!drawn) {
        drawn = true;
        segs.select('rect').transition('grow').delay((d, i) => D(i * 450)).duration(D(600)).attr('width', d => x(d.x1) - x(d.x0));
        if (!reduce) (function loop() { car.attr('transform', `translate(${x(0)},${y - 34})`).transition().duration(5000).ease(d3.easeLinear).attr('transform', `translate(${x(total) - 48},${y - 34})`).on('end', loop); })();
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
    bars.append('rect').attr('x', (d, i) => xs[i]).attr('width', bw).attr('y', 470).attr('height', 0).attr('rx', 10).attr('fill', d => d.c);
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
      g.append('circle').attr('cx', n.x).attr('cy', ny).attr('r', 54).attr('fill', '#fff').attr('stroke', n.c).attr('stroke-width', 4);
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
    grp.append('rect').attr('class', 'drv').attr('fill', C.driver).attr('rx', 3);
    grp.append('rect').attr('class', 'ub').attr('fill', C.uber).attr('rx', 3);
    const legend = g.append('g').attr('transform', 'translate(50,90)');
    [[C.driver, 'Driver'], [C.uber, 'Uber']].forEach(([c, t], i) => {
      legend.append('rect').attr('x', i * 110).attr('width', 16).attr('height', 16).attr('rx', 3).attr('fill', c);
      legend.append('text').attr('x', i * 110 + 22).attr('y', 13).attr('class', 'lbl').text(t);
    });
    const big = g.append('g');
    const bigD = big.append('rect').attr('fill', C.driver).attr('rx', 10);
    const bigU = big.append('rect').attr('fill', C.uber).attr('rx', 10);
    const bigT1 = big.append('text').attr('class', 'num').style('font-size', '48px').style('fill', '#fff').attr('text-anchor', 'middle');
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
        ttl.text('Before 2023: a fixed split');
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
          ttl.text('After: a different split on every trip');
          drawTrips('uberAfter', false, 900);
          cap.text('Illustrative trips. Median Uber cut: 29%.');
          if (!reduce) {
            jitter = d3.interval(() => {
              trips.forEach(d => (d.uberAfter = Math.min(0.55, Math.max(0.05, 0.29 + normal(0, 0.1)()))));
              drawTrips('uberAfter', false, 700);
            }, 1400);
          }
        } else {
          ttl.text('Sorted by fare: bigger trips, bigger cut');
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
    bars.append('rect').attr('x', (d, i) => xs[i]).attr('width', bw).attr('rx', 10).attr('fill', C.uber).attr('opacity', (d, i) => (i ? 1 : 0.55));
    const nums = bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('text-anchor', 'middle').attr('class', 'num').style('font-size', '34px');
    bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 490).attr('text-anchor', 'middle').attr('class', 'lbl').style('font-weight', 700).text(d => d.k);
    bars.append('text').attr('x', (d, i) => xs[i] + bw / 2).attr('y', 510).attr('text-anchor', 'middle').attr('class', 'lbl-s').text(d => d.sub);
    g.append('line').attr('x1', 110).attr('x2', 540).attr('y1', 460).attr('y2', 460).attr('stroke', C.ink);
    const badge = g.append('g').attr('transform', 'translate(540,150)').attr('opacity', 0);
    badge.append('circle').attr('r', 46).attr('fill', C.ink);
    badge.append('text').attr('y', 10).attr('text-anchor', 'middle').attr('class', 'num').style('fill', '#fff').style('font-size', '28px').text('+38%');
    s.enter = () => {
      bars.select('rect').attr('y', 460).attr('height', 0).transition().delay((d, i) => D(i * 500)).duration(D(1100)).ease(d3.easeBackOut.overshoot(1.2)).attr('y', d => y(d.v)).attr('height', d => 460 - y(d.v));
      nums.each(function (d, i) {
        d3.select(this).attr('y', 450).transition().delay(D(i * 500)).duration(D(1100)).attr('y', y(d.v) - 14)
          .tween('text', function () { const it = d3.interpolate(0, d.v); return t => (this.textContent = money(it(t))); });
      });
      badge.attr('opacity', 0).attr('transform', 'translate(540,150) scale(0.2)')
        .transition().delay(D(1500)).duration(D(600)).ease(d3.easeBackOut.overshoot(2)).attr('opacity', 1).attr('transform', 'translate(540,150) scale(1)');
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
    const pT = g.append('path').datum(trip).attr('d', line).attr('fill', 'none').attr('stroke', C.driver).attr('stroke-width', 5).attr('stroke-linecap', 'round');
    const pS = g.append('path').datum(stand).attr('d', line).attr('fill', 'none').attr('stroke', C.standby).attr('stroke-width', 5).attr('stroke-linecap', 'round');
    g.append('text').attr('x', 566).attr('y', y(2) + 22).attr('class', 'lbl').style('fill', C.driver).style('font-weight', 700).attr('text-anchor', 'end').text('On a trip');
    const lS = g.append('text').attr('x', 566).attr('y', y(2.6) - 14).attr('class', 'lbl').style('fill', '#b07d00').style('font-weight', 700).attr('text-anchor', 'end').text('Waiting (unpaid)');
    // hourglass
    const hg = g.append('g').attr('transform', 'translate(200,150)');
    hg.append('path').attr('d', 'M-18,-26 H18 L2,0 L18,26 H-18 L-2,0Z').attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 3);
    const sand = hg.append('path').attr('d', 'M-12,22 H12 L0,8Z').attr('fill', C.standby);
    function draw(p, delay) {
      const L = p.node().getTotalLength();
      p.attr('stroke-dasharray', L).attr('stroke-dashoffset', L).transition().delay(D(delay)).duration(D(1600)).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0);
    }
    s.enter = () => {
      draw(pT, 0); draw(pS, 500);
      lS.attr('opacity', 0).transition().delay(D(1900)).duration(D(400)).attr('opacity', 1);
      if (!reduce) hg.transition().duration(900).attr('transform', 'translate(200,150) rotate(180)').transition().duration(900).attr('transform', 'translate(200,150) rotate(360)');
      sand.attr('opacity', 0.3).transition().duration(D(1800)).attr('opacity', 1);
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
    rows.append('line').attr('stroke', d => d.c).attr('stroke-width', d => (d.c === C.driver ? 6 : 3)).attr('opacity', d => (d.c === C.driver ? 1 : 0.5)).attr('stroke-linecap', 'round');
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
    const dots = g.selectAll('circle').data(d3.range(N)).join('circle').attr('r', 11).attr('fill', C.muted);
    const lWorse = g.append('text').attr('class', 'num').style('fill', C.uber).style('font-size', '30px').attr('opacity', 0).text('93 worse off');
    const lBetter = g.append('text').attr('class', 'num').style('fill', C.driver).style('font-size', '30px').attr('opacity', 0).text('21 better off');
    const pos = (k, c = cols, x0 = ox, y0 = oy) => [x0 + (k % c) * cell, y0 + Math.floor(k / c) * cell];
    s.enter = mode => {
      if (mode === 'all') {
        ttl.text('114 drivers, a year either side');
        dots.transition().delay(d => D(order[d] * 10)).duration(D(500)).attr('fill', C.muted)
          .attr('cx', d => pos(order[d])[0]).attr('cy', d => pos(order[d])[1]);
        lWorse.attr('opacity', 0); lBetter.attr('opacity', 0);
      } else {
        ttl.text('Who gained, who lost');
        // worse-off block on the left (10 cols), better-off on the right (3 cols)
        dots.transition().delay(d => D(d * 8)).duration(D(800)).ease(d3.easeCubicInOut)
          .attr('fill', d => (d < 93 ? C.uber : C.driver))
          .attr('cx', d => (d < 93 ? pos(d, 10, 60)[0] : pos(d - 93, 3, 460)[0]))
          .attr('cy', d => (d < 93 ? pos(d, 10, 60, 150)[1] : pos(d - 93, 3, 460, 150)[1]));
        lWorse.attr('x', 60).attr('y', 125).transition().delay(D(1000)).duration(D(400)).attr('opacity', 1);
        lBetter.attr('x', 448).attr('y', 125).transition().delay(D(1100)).duration(D(400)).attr('opacity', 1);
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
        ttl.text('Predicting 2022 from earlier years');
        dots.transition().duration(D(900)).attr('cy', d => y(d.good)).attr('fill', C.driver);
        score.text('R² ≈ 0.4–0.9').style('fill', C.driver);
        warn.attr('opacity', 0);
      } else {
        ttl.text('Predicting 2023 from 2022');
        dots.transition().delay(() => D(rng() * 400)).duration(D(1100)).ease(d3.easeElasticOut.amplitude(1).period(0.5)).attr('cy', d => y(d.bad)).attr('fill', C.uber);
        score.text('R² = −54').style('fill', C.uber);
        warn.transition().delay(D(700)).duration(D(300)).attr('opacity', 1);
      }
    };
  }

  /* ---------- Scroll wiring ---------- */
  let current = null;
  function show(id, mode) {
    if (current && current !== id) {
      scenes[current].g.classed('on', false);
      scenes[current].exit && scenes[current].exit();
    }
    scenes[id].g.classed('on', true);
    current = id;
    scenes[id].enter && scenes[id].enter(mode);
  }

  const steps = d3.selectAll('.step');
  const scroller = scrollama();
  scroller.setup({ step: '.step', offset: window.innerWidth < 820 ? 0.85 : 0.6 })
    .onStepEnter(({ element }) => {
      steps.classed('is-active', function () { return this === element; });
      show(element.dataset.scene, element.dataset.mode);
    });
  window.addEventListener('resize', () => scroller.resize());
  show('day', 'all');
})();

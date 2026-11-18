/* iGate-NB em 3D (three.js r128) para o configurador serial.
   Placa, gabinete e bateria vêm do modelo da página "Zerar contadores e publicar" (guia-instalacao/reset-igatenb.html);
   aqui a tampa fica aberta ao lado e um conversor FTDI liga TX/RX/GND no J3 com os fios cruzados.
   J3 (três pinos em pé, perto do reed SW3) = serial da foto do manual: TX na borda (z 21,04), RX no meio, GND para dentro.
   API: Board3D.create(container, {onSw2Click, lidLogo}) -> {setHot(bool), press()} ou null sem WebGL. */
(function () {
  function create(host, opts) {
    var T = window.THREE;
    if (!T) return null;
    opts = opts || {};
    var canvas = document.createElement('canvas'), renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return null; }
    if (!renderer.getContext()) return null;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    canvas.className = 'b3d';
    host.appendChild(canvas);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(35, 1, 1, 1500);
    scene.add(new T.HemisphereLight(0xffffff, 0x3a443e, 0.5));
    var d1 = new T.DirectionalLight(0xffffff, 0.6); d1.position.set(30, 70, 45); scene.add(d1);
    var d2 = new T.DirectionalLight(0xffffff, 0.2); d2.position.set(-50, 35, -30); scene.add(d2);

    var board = new T.Group(); scene.add(board);
    function mat(color, o) { o = o || {}; o.color = color; if (o.roughness === undefined) o.roughness = 0.6; return new T.MeshStandardMaterial(o); }
    var M = {
      pcb: mat(0x143a29, { roughness: 0.5 }), ring: mat(0x3f9a63, { roughness: 0.5 }),
      gold: mat(0xd2a93c, { metalness: 0.5, roughness: 0.35 }), silver: mat(0xc9cdc9, { metalness: 0.45, roughness: 0.35 }),
      black: mat(0x161817, { roughness: 0.55 }), white: mat(0xf1f1ec), tan: mat(0xa98058), dark: mat(0x3a3d3c),
      red: mat(0xc62f2a), wireBlack: mat(0x1b1b1b), blue: mat(0x4a7fc2), ftdi: mat(0x1d4f8a, { roughness: 0.5 }),
      glass: mat(0xcfe6dc, { transparent: true, opacity: 0.45, roughness: 0.1 })
    };
    M.pin = mat(0xb9bcc0, { metalness: 0.6, roughness: 0.3 });
    function box(w, h, d, m, x, z, y0, parent) { var g = new T.Mesh(new T.BoxGeometry(w, h, d), m); g.position.set(x, (y0 || 0) + h / 2, z); (parent || board).add(g); return g; }
    function cyl(r, h, m, x, z, y0, seg) { var g = new T.Mesh(new T.CylinderGeometry(r, r, h, seg || 28), m); g.position.set(x, (y0 || 0) + h / 2, z); board.add(g); return g; }

    /* ---------- placa (59,5 × 51 mm) ---------- */
    var W = 59.5, D = 51, TH = 1.6, holes = [[-24.2, -19.3], [25.3, 17.3]], i, j;
    var sh = new T.Shape();
    sh.moveTo(-W / 2, -D / 2); sh.lineTo(W / 2, -D / 2); sh.lineTo(W / 2, D / 2); sh.lineTo(-W / 2, D / 2); sh.closePath();
    holes.forEach(function (h) { var p = new T.Path(); p.absarc(h[0], -h[1], 2, 0, Math.PI * 2, true); sh.holes.push(p); });
    var pg = new T.ExtrudeGeometry(sh, { depth: TH, bevelEnabled: false, curveSegments: 24 }); pg.rotateX(-Math.PI / 2);
    var pcb = new T.Mesh(pg, M.pcb); pcb.position.y = -TH; board.add(pcb);
    holes.forEach(function (h) { var r = new T.Mesh(new T.RingGeometry(2, 3.8, 40), M.ring); r.rotation.x = -Math.PI / 2; r.position.set(h[0], 0.02, h[1]); board.add(r); });
    [[-27.7, -24], [3, -18.5], [-24.7, 12.2]].forEach(function (p) { var c = new T.Mesh(new T.CircleGeometry(1.1, 24), M.gold); c.rotation.x = -Math.PI / 2; c.position.set(p[0], 0.02, p[1]); board.add(c); });

    function silk(text, x, z, h, rot) {
      var cv = document.createElement('canvas'), cx = cv.getContext('2d'), px = 64;
      cx.font = '600 ' + px + 'px monospace'; var w = Math.ceil(cx.measureText(text).width) + 8;
      cv.width = w; cv.height = px + 12; cx = cv.getContext('2d');
      cx.font = '600 ' + px + 'px monospace'; cx.fillStyle = '#e9efe9'; cx.textBaseline = 'middle'; cx.fillText(text, 4, cv.height / 2);
      var tx = new T.CanvasTexture(cv); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
      var g = new T.PlaneGeometry(h * cv.width / cv.height, h); g.rotateX(-Math.PI / 2);
      var m = new T.Mesh(g, new T.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }));
      m.position.set(x, 0.04, z); m.rotation.y = rot || 0; board.add(m);
    }
    silk('GND', -23.5, -24, 1.4); silk('J1', -19.3, -24, 1.3); silk('J2', -28, -13.8, 1.2); silk('J3', -28.3, 24.2, 1.2);
    silk('SW1', 20.5, 9.6, 1.5); silk('SW2', 21.5, 23.6, 1.5); silk('SW3', -20, 22, 1.3); silk('PT1', -21.5, 11.2, 1.2);
    silk('iGateNB Rev 2.0', 27.6, 4, 1.6, Math.PI / 2);

    /* J1 e cabo da bateria */
    box(7, 5, 5, M.white, -14.9, -21.6);
    function bwire(x, m, o) {
      var c = new T.CatmullRomCurve3([new T.Vector3(x, 3, -21.6), new T.Vector3(x, 8, -24.5), new T.Vector3(x + 7, 11, -27.5 + o), new T.Vector3(20, 11.5, -27 + o),
        new T.Vector3(34 + o, 11, -12), new T.Vector3(35 + o, 10, 10), new T.Vector3(34 + o, 9.5, 30), new T.Vector3(31, 8.5 + o, 41), new T.Vector3(27.2, 8 + o, 44)]);
      board.add(new T.Mesh(new T.TubeGeometry(c, 160, 0.65, 10), m));
    }
    bwire(-15.9, M.wireBlack, 1.4); bwire(-13.9, M.red, 0);

    /* J2 2×8, barra 1×5 e J3 (serial) */
    box(21, 3.2, 5, M.black, -18.7, -11.4);
    for (i = 0; i < 8; i++) for (j = 0; j < 2; j++) box(0.7, 0.2, 0.7, M.gold, -27.6 + i * 2.54, -12.7 + j * 2.54, 3.2);
    box(2.5, 2.5, 13.2, M.black, -0.5, 16.7);
    for (i = 0; i < 5; i++) box(0.64, 8.5, 0.64, M.pin, -0.5, 11.62 + i * 2.54, 0);
    box(2.5, 2.5, 8, M.black, -28.2, 18.5);
    for (i = 0; i < 3; i++) box(0.64, 8.5, 0.64, M.pin, -28.2, 15.96 + i * 2.54, 0);
    var hdr = [{ x: -28.2, z: 21.04 }, { x: -28.2, z: 18.5 }, { x: -28.2, z: 15.96 }];   // TX, RX, GND

    /* SMDs, microcontrolador, SIM */
    [-5, -1.5, 2.5, 5.5, 8.3].forEach(function (z, r) { for (var k = 0; k < 8; k++) box(1.7, 0.55, 0.9, r === 1 ? M.tan : M.black, -27 + k * 3.43, z); });
    box(3.2, 1.6, 2, M.tan, 0.1, -11); box(3.6, 2, 2.8, M.tan, -19.7, 16);
    box(4.2, 2.6, 4.2, M.dark, 7, -22); box(2.4, 1, 2.4, M.dark, 6.3, -12.8);
    [[-9, -21.5], [-9, -19.2], [-6.3, -21.5]].forEach(function (p) { box(0.9, 0.5, 1.3, M.blue, p[0], p[1]); });
    [[3.8, 14], [6.3, 14], [8.6, 13.8], [3.8, 22.6], [8.6, 21.8]].forEach(function (p) { box(0.9, 0.55, 1.7, M.black, p[0], p[1]); });
    box(7.8, 1.2, 7.8, M.black, -10.1, 15.5);
    for (i = 0; i < 8; i++) { box(0.9, 0.4, 0.35, M.silver, -14.5, 12.7 + i * 0.8); box(0.9, 0.4, 0.35, M.silver, -5.7, 12.7 + i * 0.8); }
    box(16.3, 1.8, 16, M.silver, 20.4, -17.5); box(11, 0.1, 3, M.dark, 18.5, -14, 1.8);

    /* módulo Telit com etiqueta */
    (function () {
      var cv = document.createElement('canvas'); cv.width = 720; cv.height = 580; var cx = cv.getContext('2d');
      cx.fillStyle = '#d6dad6'; cx.fillRect(0, 0, 720, 580);
      cx.translate(360, 290); cx.rotate(Math.PI / 2); cx.fillStyle = '#1c1f1e'; cx.textAlign = 'center';
      cx.font = '700 76px sans-serif'; cx.fillText('Telit', 0, -235);
      cx.font = '600 34px monospace'; cx.fillText('NE310L2-WW', 0, -170);
      cx.font = '500 26px monospace'; cx.fillText('Model: NE310L2-WW', 0, -90); cx.fillText('Assembled in China', 0, -50);
      cx.fillRect(-60, 10, 120, 120); cx.fillStyle = '#d6dad6';
      for (var a = 0; a < 10; a++) for (var b = 0; b < 10; b++) if ((a * 7 + b * 13 + a * b) % 3 === 0) cx.fillRect(-55 + a * 11, 15 + b * 11, 10, 10);
      cx.fillStyle = '#1c1f1e'; cx.font = '700 54px sans-serif'; cx.fillText('CE', 0, 215);
      var tx = new T.CanvasTexture(cv); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
      var top = new T.MeshStandardMaterial({ map: tx, metalness: 0.25, roughness: 0.45 });
      var m = new T.Mesh(new T.BoxGeometry(18, 2.4, 14.5), [M.silver, M.silver, top, M.silver, M.silver, M.silver]);
      m.position.set(13.5, 1.2, -0.3); board.add(m);
    })();

    /* antena: mola + fio */
    var coil = new T.Vector3(30.6, 0, -6.5), pts = [new T.Vector3(25.6, 0.1, -6.3), new T.Vector3(27.4, 0.9, -6.4)];
    for (i = 0; i <= 60; i++) { var an = i / 60 * Math.PI * 10; pts.push(new T.Vector3(coil.x - Math.cos(an) * 2.2, 1 + i / 60 * 6, coil.z + Math.sin(an) * 2.2)); }
    [[24, 7.2, -8.5], [11.8, 6.2, -11.8], [7.3, 6, -19], [-3.7, 5.6, -22.5], [-8.2, 5, -9], [-8.7, 4.6, -1], [-6.7, 4.5, 1.2], [-1.7, 4.6, 1.5], [5.3, 5, 0], [11.3, 5.2, -2], [17.3, 4.6, 4], [30.3, 3, 11]]
      .forEach(function (p) { pts.push(new T.Vector3(p[0], p[1], p[2])); });
    board.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.4), 520, 0.34, 8), M.gold));

    /* reed SW3 */
    var reed = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 15, 16), M.glass); reed.rotation.z = Math.PI / 2; reed.position.set(-19, 1.2, 23.8); board.add(reed);
    var lead = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 19, 8), M.silver); lead.rotation.z = Math.PI / 2; lead.position.set(-19, 1.2, 23.8); board.add(lead);
    box(0.9, 0.6, 1.7, mat(0xe9ece6), 3.8, 18.6); box(0.9, 0.6, 1.7, mat(0xe9ece6), 6.3, 18.6);

    /* botões SW1 e SW2 */
    var btn = {};
    function tact(id, x, z) {
      box(6, 3.2, 6, M.silver, x, z); box(4.6, 0.15, 4.6, M.dark, x, z, 3.2);
      var capM = new T.MeshStandardMaterial({ color: 0x141615, roughness: 0.5, emissive: 0x1c7a55, emissiveIntensity: 0 });
      var cap = cyl(1.75, 1.7, capM, x, z, 3.3);
      var hit = new T.Mesh(new T.BoxGeometry(9, 8, 9), new T.MeshBasicMaterial({ visible: false })); hit.position.set(x, 3, z); board.add(hit);
      var ring = new T.Mesh(new T.RingGeometry(4.6, 5.6, 48), new T.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.08, z); board.add(ring);
      btn[id] = { cap: cap, capM: capM, baseY: cap.position.y, ring: ring, hit: hit, anchor: new T.Vector3(x + 11, 3, z + 3) };
    }
    tact('sw1', 14.3, 12.2); tact('sw2', 14.3, 20.7);

    /* ---------- gabinete (base preta brilhante, vedação vermelha, bateria, tampa aberta ao lado) ---------- */
    function oct(w, d, c) { var q = new T.Shape(), x = w / 2, z = d / 2; q.moveTo(-x + c, -z); q.lineTo(x - c, -z); q.lineTo(x, -z + c); q.lineTo(x, z - c); q.lineTo(x - c, z); q.lineTo(-x + c, z); q.lineTo(-x, z - c); q.lineTo(-x, -z + c); q.closePath(); return q; }
    function slab(shape, h, m, y, parent, x) { var g = new T.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); var o = new T.Mesh(g, m); o.position.set(x || 0, y, 0); parent.add(o); return o; }
    function slabB(shape, h, m, y, parent, x, bev) { bev = bev || 1; var g = new T.ExtrudeGeometry(shape, { depth: h - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 4 }); g.rotateX(-Math.PI / 2); var o = new T.Mesh(g, m); o.position.set(x || 0, y + bev, 0); parent.add(o); return o; }
    function ringShape(w, d, c, t) { var q = oct(w, d, c); q.holes.push(oct(w - 2 * t, d - 2 * t, Math.max(1, c - t * 0.6))); return q; }
    var gloss = (function () {
      var cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; var cx = cv.getContext('2d');
      var gr = cx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3a3d40'); gr.addColorStop(0.5, '#101112'); gr.addColorStop(1, '#020202');
      cx.fillStyle = gr; cx.fillRect(0, 0, 512, 256);
      cx.fillStyle = '#ffffff'; cx.fillRect(30, 8, 150, 60); cx.fillRect(290, 6, 170, 50); cx.fillRect(196, 40, 70, 10); cx.fillStyle = '#aeb4b9'; cx.fillRect(0, 96, 512, 5); cx.fillRect(470, 60, 30, 40);
      var eq = new T.CanvasTexture(cv); eq.mapping = T.EquirectangularReflectionMapping; eq.encoding = T.sRGBEncoding;
      var pm = new T.PMREMGenerator(renderer), rt = pm.fromEquirectangular(eq); pm.dispose(); eq.dispose();
      return function (c, r) { return new T.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, envMap: rt.texture, envMapIntensity: 2.1 }); };
    })();
    M.caseBase = gloss(0x050506, 0.16); M.caseLid = gloss(0x050506, 0.1); M.casePanel = gloss(0x070708, 0.1);
    M.gasket = mat(0xa3151b, { roughness: 0.6 }); M.gland = gloss(0x040404, 0.22);
    var CW = 96, CD = 114, CC = 16, RIM = 23, caseG = new T.Group(); caseG.position.z = 14; scene.add(caseG);
    slabB(oct(CW - 4, CD - 4, CC - 1), 3.5, M.caseBase, -8, caseG, 0, 1.4);
    slabB(ringShape(CW, CD, CC, 3), RIM + 2, M.caseBase, -5.5, caseG, 0, 1);
    slabB(ringShape(CW + 3, CD + 3, CC + 0.6, 4.5), 4.2, M.caseBase, RIM - 4.2, caseG, 0, 1);
    slab(ringShape(CW + 3.6, CD + 3.6, CC + 0.6, 9.2), 1, M.gasket, RIM, caseG);
    [-22, 0, 22].forEach(function (z) { [-1, 1].forEach(function (k) { var rib = new T.Mesh(new T.BoxGeometry(1.6, RIM - 3, 3.2), M.caseBase); rib.position.set(k * (CW / 2 + 0.5), (RIM - 7) / 2, z); caseG.add(rib); }); });
    (function () {
      var cv = document.createElement('canvas'); cv.width = cv.height = 256; var cx = cv.getContext('2d');
      var g = cx.createRadialGradient(128, 128, 40, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.fillRect(0, 0, 256, 256);
      var pl = new T.PlaneGeometry(200, 225); pl.rotateX(-Math.PI / 2);
      var s2 = new T.Mesh(pl, new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false })); s2.position.set(0, -8.1, 0); caseG.add(s2);
    })();
    [[0, -(CD / 2 - 4)], [0, CD / 2 - 4], [-(CW / 2 - 4), 0], [CW / 2 - 4, 0]].forEach(function (q) { var sc = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 0.8, 16), M.silver); sc.position.set(q[0], RIM + 1.3, q[1]); caseG.add(sc); });
    [[-24, 1], [24, 1], [-24, -1], [24, -1]].forEach(function (t) {
      var tab = new T.Mesh(new T.BoxGeometry(12, 3, 14), M.caseBase); tab.position.set(t[0], -6.5, t[1] * (CD / 2 + 5)); caseG.add(tab);
      var tip = new T.Mesh(new T.CylinderGeometry(6, 6, 3, 24), M.caseBase); tip.position.set(t[0], -6.5, t[1] * (CD / 2 + 12)); caseG.add(tip);
      var slot = new T.Mesh(new T.BoxGeometry(2, 3.2, 8), M.gland); slot.position.set(t[0], -6.4, t[1] * (CD / 2 + 9)); caseG.add(slot);
    });
    var div = new T.Mesh(new T.BoxGeometry(CW - 6, 16, 2), M.caseBase); div.position.set(0, 3, 14.5); caseG.add(div);
    holes.forEach(function (h) { cyl(3.4, 3.4, M.caseBase, h[0], h[1], -5); cyl(2.7, 0.9, M.gland, h[0], h[1], 0, 20); });
    (function () {
      var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; var cx = cv.getContext('2d');
      cx.fillStyle = '#1f55d6'; cx.fillRect(0, 0, 1024, 512);
      cx.translate(205, 256); cx.rotate(Math.PI / 2);
      cx.fillStyle = '#f4f5f6'; cx.fillRect(-176, -150, 352, 300);
      cx.fillStyle = '#15171a'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      ['Bateria de Lítio', '3,6 V — 8.200 mAh', 'Não recarregável'].forEach(function (t, k) { cx.font = (k === 1 ? '700 38px' : '700 32px') + ' sans-serif'; cx.fillText(t, 0, -72 + k * 72); });
      var tx = new T.CanvasTexture(cv); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
      var side = new T.MeshStandardMaterial({ map: tx, roughness: 0.35 }), end = mat(0x1f55d6, { roughness: 0.35 });
      var b = new T.Mesh(new T.CylinderGeometry(13, 13, 50, 40), [side, end, end]); b.rotation.z = Math.PI / 2; b.position.set(2, 8, 30); caseG.add(b);
    })();
    /* cabo do endpoint no J2: 8 pares (16 vias), canal 1 amarelo ... canal 8 laranja, cor sólida + cor com branco */
    (function () {
      var PAIRS = [0xF4E94B, 0x1f3fbf, 0xFF2A12, 0xA47A45, 0x19C219, 0xBDBDBD, 0x8E1F95, 0xFF9500];
      function striped(c) {
        var cv = document.createElement('canvas'); cv.width = 64; cv.height = 8; var cx = cv.getContext('2d');
        cx.fillStyle = '#f4f4f0'; cx.fillRect(0, 0, 64, 8);
        cx.fillStyle = '#' + ('00000' + c.toString(16)).slice(-6); cx.fillRect(0, 0, 22, 8); cx.fillRect(32, 0, 22, 8);
        var tx = new T.CanvasTexture(cv); tx.encoding = T.sRGBEncoding; tx.wrapS = T.RepeatWrapping; tx.repeat.set(9, 1);
        return new T.MeshStandardMaterial({ map: tx, roughness: 0.5 });
      }
      PAIRS.forEach(function (c, k) {
        [0, 1].forEach(function (row) {
          var x = -27.6 + k * 2.54, z = -12.7 + row * 2.54, o = row - 0.5;
          var cu = new T.CatmullRomCurve3([new T.Vector3(x, 3.3, z), new T.Vector3(x + 0.3, 8, z - 1.8), new T.Vector3(-18.7 + (k - 3.5) * 0.75 + o * 0.38, 12, -19), new T.Vector3(-18.7 + (k - 3.5) * 0.42 + o * 0.21, 14, -24)]);
          board.add(new T.Mesh(new T.TubeGeometry(cu, 28, 0.42, 8), row === 0 ? mat(c, { roughness: 0.5 }) : striped(c)));
        });
      });
    })();
    var cb = new T.CatmullRomCurve3([new T.Vector3(-18.7, 13.5, -22.5), new T.Vector3(-18.5, 21, -28), new T.Vector3(-18, 31, -42), new T.Vector3(-17, 40, -66)]);
    board.add(new T.Mesh(new T.TubeGeometry(cb, 40, 3.3, 16), M.gland));
    /* tampa aberta, apoiada do lado direito do gabinete */
    var lid = new T.Group(); caseG.add(lid);
    var LX = CW / 2;
    slabB(ringShape(CW + 3, CD + 3, CC + 0.6, 4.5), 3.4, M.caseLid, 0, lid, LX, 1);
    slab(ringShape(CW, CD, CC, 3), 10, M.caseLid, 2, lid, LX);
    slabB(oct(CW, CD, CC), 4, M.caseLid, 10, lid, LX, 1.8);
    slabB(oct(CW - 10, CD - 10, CC - 2.5), 2.6, M.casePanel, 13, lid, LX, 1.2);
    [[0, -(CD / 2 - 3.2)], [0, CD / 2 - 3.2], [-(CW / 2 - 3.2), 0], [CW / 2 - 3.2, 0]].forEach(function (q) { var sc = new T.Mesh(new T.CylinderGeometry(1.7, 1.7, 0.7, 18), M.silver); sc.position.set(LX + q[0], 13.75, q[1]); lid.add(sc); });
    [-6, 5].forEach(function (z) { var g = new T.Mesh(new T.BoxGeometry(CW - 12, 0.3, 0.9), M.gland); g.position.set(LX, 15.65, z); lid.add(g); });
    if (opts.lidLogo) {
      var img = new Image();
      img.onload = function () {
        var tx = new T.Texture(img); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4; tx.needsUpdate = true;
        var g = new T.PlaneGeometry(34, 34 * img.naturalHeight / img.naturalWidth); g.rotateX(-Math.PI / 2);
        var lg = new T.Mesh(g, new T.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false })); lg.position.set(LX, 15.66, 25); lid.add(lg);
      };
      img.src = opts.lidLogo;
    }
    /* virada de cabeça para baixo ao lado do gabinete, mostrando o interior (mesma pose final da página do reset) */
    lid.rotation.z = Math.PI; lid.position.set(CW / 2 + 12 + CW, 8.5, 0);

    /* ---------- conversor FTDI na mesa, à esquerda e na frente ---------- */
    var F = new T.Group(); F.position.set(-84, -6.4, 34); F.rotation.y = 0.25; scene.add(F);
    var fc = document.createElement('canvas'); fc.width = 512; fc.height = 256; var fx = fc.getContext('2d');
    fx.fillStyle = '#1d4f8a'; fx.fillRect(0, 0, 512, 256);
    fx.fillStyle = '#e8f0f5'; fx.font = '600 30px Arial, sans-serif'; fx.fillText('USB-SERIAL', 120, 70); fx.font = '22px Arial, sans-serif'; fx.fillText('FTDI · 3,3 V', 120, 104);
    var labels = ['GND', 'CTS', 'VCC', 'TX', 'RX', 'DTR'];
    fx.font = '600 20px monospace'; fx.textAlign = 'right';
    labels.forEach(function (l, k) { fx.fillStyle = (l === 'TX' || l === 'RX' || l === 'GND') ? '#ffffff' : '#9fb5cc'; fx.fillText(l, 452, 28 + k * 40.5); });
    var ftex = new T.CanvasTexture(fc); ftex.encoding = T.sRGBEncoding; ftex.anisotropy = 8;
    var fb = new T.Mesh(new T.BoxGeometry(36, 1.6, 16), [M.ftdi, M.ftdi, new T.MeshStandardMaterial({ map: ftex, roughness: 0.5 }), M.ftdi, M.ftdi, M.ftdi]); fb.position.y = -0.8; F.add(fb);
    box(9, 3.2, 7.6, M.silver, -18.5, 0, 0, F); box(7, 1.1, 7, M.black, -4, 2, 0, F);
    var fpin = []; for (j = 0; j < 6; j++) { var pz = -6.35 + j * 2.54; box(0.64, 7, 0.64, M.gold, 15.5, pz, 0, F); fpin.push(pz); }
    box(2.6, 2.5, 15.6, M.black, 15.5, 0, 0, F);
    F.updateMatrixWorld(true);
    function ftdiPin(name) { return new T.Vector3(15.5, 0, fpin[labels.indexOf(name)]).applyMatrix4(F.matrixWorld); }

    /* ---------- jumpers: TX→RX, RX→TX, GND→GND ---------- */
    function dupont(p, color, parent) {
      var g = new T.Mesh(new T.BoxGeometry(2.5, 9, 2.5), M.black); g.position.set(p.x, p.y + 7.5, p.z); scene.add(g);
      var c = new T.Mesh(new T.BoxGeometry(2.6, 1.2, 2.6), mat(color)); c.position.set(p.x, p.y + 11.6, p.z); scene.add(c);
    }
    var wires = [['TX', 1, 0x5fb82a], ['RX', 0, 0xf06a1f], ['GND', 2, 0x2a2f35]];
    wires.forEach(function (w, k) {
      var a = ftdiPin(w[0]), h = hdr[w[1]], b = new T.Vector3(h.x, 0, h.z);
      dupont(a, w[2]); dupont(b, w[2]);
      var pts2 = [new T.Vector3(a.x, a.y + 12, a.z), new T.Vector3(a.x + 2, a.y + 24, a.z - 4), new T.Vector3(-64 + k * 2, 36 + k * 2, 30 - k * 2),
        new T.Vector3(-45 + k * 1.5, 34 + k * 1.5, 22 + k), new T.Vector3(h.x - 2, 22, h.z + 1), new T.Vector3(h.x, 12, h.z)];
      scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts2), 120, 0.75, 10), mat(w[2], { roughness: 0.4 })));
    });

    /* ---------- rótulos ---------- */
    function tag(t, c) { var e = document.createElement('span'); e.className = 'tag3' + (c ? ' ' + c : ''); e.textContent = t; host.appendChild(e); return e; }
    var swTag = tag('SW2', 'sw');
    var CSSC = { TX: '#5fb82a', RX: '#f06a1f', GND: '#8a96a3' }, BOARDC = ['#f06a1f', '#5fb82a', '#8a96a3'];
    var lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lines.setAttribute('class', 'pinlines'); host.appendChild(lines);
    function pinTag(name, color) { var e = tag(name, 'pin'); e.style.borderColor = color; return e; }
    var groups = [
      { mode: 'above', cap: tag('Pinos da placa (J3)', 'cap'),
        pins: hdr.map(function (h, k) { return { el: pinTag(['TX', 'RX', 'GND'][k], BOARDC[k]), c: BOARDC[k], p: new T.Vector3(h.x, 12.4, h.z) }; }) },
      { mode: 'below', cap: tag('Pinos do conversor', 'cap'),
        pins: wires.map(function (w) { var a = ftdiPin(w[0]); return { el: pinTag(w[0], CSSC[w[0]]), c: CSSC[w[0]], p: new T.Vector3(a.x, a.y + 12.4, a.z) }; }) }
    ];
    var v = new T.Vector3();
    function place(el, x, y) { el.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; }
    function layoutPins(Wd, Hd) {
      var svg = '', all = [];
      groups.forEach(function (g) {
        g.pins.forEach(function (q) { v.copy(q.p).project(camera); q.sx = (v.x + 1) / 2 * Wd; q.sy = (1 - v.y) / 2 * Hd; });
        var ps = g.pins.slice(), n = ps.length, cx = 0, cy = 0, minX = 1e9, minY = 1e9;
        ps.forEach(function (q) { cx += q.sx / n; cy += q.sy / n; minX = Math.min(minX, q.sx); minY = Math.min(minY, q.sy); });
        if (g.mode === 'above') {
          ps.sort(function (a, b) { return a.sx - b.sx; });
          var ly = Math.max(44, minY - 62);
          ps.forEach(function (q, k) { q.lx = Math.min(Wd - 30, Math.max(30, cx + (k - (n - 1) / 2) * 62)); q.ly = ly; });
          g.cx = Math.min(Wd - 70, Math.max(70, cx)); g.cy = ly - 28;
        } else if (g.mode === 'below') {
          var maxY = -1e9; ps.forEach(function (q) { maxY = Math.max(maxY, q.sy); });
          ps.sort(function (a, b) { return a.sx - b.sx; });
          var by = Math.min(Hd - 40, maxY + 70);
          ps.forEach(function (q, k) { q.lx = Math.min(Wd - 30, Math.max(30, cx - 20 + (k - (n - 1) / 2) * 62)); q.ly = by; });
          g.cx = Math.min(Wd - 70, Math.max(70, cx - 20)); g.cy = by + 28;
        } else {
          ps.sort(function (a, b) { return a.sy - b.sy; });
          var lx = Math.max(34, minX - 78);
          ps.forEach(function (q, k) { q.lx = lx; q.ly = Math.min(Hd - 16, Math.max(16, cy + (k - (n - 1) / 2) * 34)); });
          g.cx = Math.max(70, lx); g.cy = ps[0].ly - 30;
        }
        place(g.cap, g.cx, g.cy);
        ps.forEach(function (q) {
          place(q.el, q.lx, q.ly); all.push({ x: q.lx, y: q.ly, w: q.el.offsetWidth, h: q.el.offsetHeight });
          svg += '<line x1="' + q.sx.toFixed(1) + '" y1="' + q.sy.toFixed(1) + '" x2="' + q.lx.toFixed(1) + '" y2="' + q.ly.toFixed(1) + '" stroke="' + q.c + '" stroke-width="2"/>' +
            '<circle cx="' + q.sx.toFixed(1) + '" cy="' + q.sy.toFixed(1) + '" r="3.5" fill="' + q.c + '" stroke="#08131E" stroke-width="1.5"/>';
        });
      });
      lines.innerHTML = svg;
      groups.forEach(function (g) {
        var cw = g.cap.offsetWidth / 2 + 4, ch = g.cap.offsetHeight / 2 + 4;
        var hit = all.some(function (b) { return Math.abs(b.x - g.cx) < cw + b.w / 2 && Math.abs(b.y - g.cy) < ch + b.h / 2; });
        g.cap.style.visibility = hit ? 'hidden' : 'visible';
      });
    }

    /* ---------- câmera em órbita (th = giro, ph = ângulo a partir da vertical) ---------- */
    var VIEW_ALL = { x: -32, z: 22, r: 235, th: 0.5, ph: 0.74 }, VIEW_BTN = { x: 9, z: 18, r: 130, th: 0.3, ph: 0.45 };
    var cam = Object.assign({}, VIEW_ALL), goal = Object.assign({}, VIEW_ALL), hot = false, userTurned = false, pressT = -1;
    function placeCamera() { var s = Math.sin(cam.ph); camera.position.set(cam.x + cam.r * s * Math.sin(cam.th), cam.r * Math.cos(cam.ph), cam.z + cam.r * s * Math.cos(cam.th)); camera.lookAt(cam.x, 0, cam.z); }
    var drag = null, moved = 0, ray = new T.Raycaster(), ndc = new T.Vector2();
    canvas.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; moved = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
      moved += Math.abs(dx) + Math.abs(dy); if (moved < 6) return;
      userTurned = true; goal.th -= dx * 0.006; goal.ph = Math.min(1.45, Math.max(0.1, goal.ph - dy * 0.006));
    });
    canvas.addEventListener('pointerup', function (e) {
      if (drag && moved < 6 && opts.onSw2Click) {
        var r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
        ray.setFromCamera(ndc, camera); if (ray.intersectObject(btn.sw2.hit).length) opts.onSw2Click();
      }
      drag = null;
    });
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); userTurned = true; goal.r = Math.min(460, Math.max(50, goal.r * Math.exp(e.deltaY * 0.001))); }, { passive: false });
    canvas.addEventListener('dblclick', function () { userTurned = false; Object.assign(goal, hot ? VIEW_BTN : VIEW_ALL); });

    function resize() {
      var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < 520 ? 46 : 35; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(host); resize();

    function frame(now) {
      requestAnimationFrame(frame);
      if (!userTurned) Object.assign(goal, hot ? VIEW_BTN : VIEW_ALL);
      var k = reduce ? 1 : 0.06, sway = (!reduce && !userTurned && !drag && !hot) ? Math.sin(now / 2800) * 0.08 : 0;
      ['x', 'z', 'r', 'th', 'ph'].forEach(function (p) { cam[p] += (goal[p] - cam[p]) * k; });
      var th0 = cam.th; cam.th += sway; placeCamera(); cam.th = th0;
      var o = btn.sw2, dt = pressT < 0 ? 1e9 : now - pressT, down = dt < 420;
      o.cap.position.y += ((o.baseY - (down ? 0.9 : 0)) - o.cap.position.y) * 0.45;
      o.capM.emissiveIntensity = down ? 1.2 : 0;
      o.ring.material.opacity = hot ? (reduce ? 0.85 : 0.5 + 0.4 * Math.sin(now / 140)) : 0;
      renderer.render(scene, camera);
      var r = canvas.getBoundingClientRect();
      v.copy(o.anchor).project(camera); place(swTag, (v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height);
      swTag.classList.toggle('on', hot);
      layoutPins(r.width, r.height);
    }
    requestAnimationFrame(frame);

    return {
      setHot: function (on) { if (hot !== !!on) userTurned = false; hot = !!on; },
      press: function () { pressT = performance.now(); }
    };
  }
  window.Board3D = { create: create };
})();

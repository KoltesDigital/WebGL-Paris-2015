var demo = {Config:{}};
(function() {
  demo.Config.BEATS_PER_MINUTE = 98;
  demo.Config.BEATS_PER_BAR = 4;
  demo.Config.TICKS_PER_BEAT = 24;
  demo.Config.MUSIC_BEGIN = 500;
  demo.Config.song = {src:"bin/bg.ogg", enableFFT:!0};
  demo.Config.SEED = 123;
  demo.Config.DEBUG = !1;
  var a = function(c, b, d) {
    return new kvg.core.TimeSig(c, b, d);
  };
  demo.Config.PARTS = {MetaBalls:"demo.parts.MetaBalls", Clouds:"demo.parts.Clouds", CloudsEnd:"demo.parts.CloudsEnd", Well:"demo.parts.Well", Forest:"demo.parts.Forest", Falling:"demo.parts.falling"};
  demo.Config.TIMELINE = [{part:"Clouds", start:a(0, 0, 0), end:a(17, 3, 0), rts:!0}, {part:"Falling", start:a(17, 3, 0), end:a(24, 0, 0), rts:!0}, {part:"Forest", transitionIn:a(-1, 0, 0), start:a(24, 0, 0), end:a(30, 0, 0), rts:!0}, {part:"Well", start:a(30, 0, 0), end:a(58, 0, 0), rts:!0}, {part:"MetaBalls", start:a(58, 0, 0), end:a(66, 0, 0), rts:!0}, {part:"CloudsEnd", start:a(66, 0, 0), end:a(122, 0, 0), rts:!0}];
})();
demo.parts = {};
demo.parts.clouds = {};
demo.parts.clouds.CloudDepthShader = {};
(function() {
  demo.parts.clouds.CloudDepthShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nuniform sampler2D texture;\nvoid main() {\nvec2 uv = vUv;\nvec4 c = texture2D(texture, uv);\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat color = 1.0 - smoothstep( 1., 4000., depth );\nfloat alpha = c.a < 0.5 ? 0. : 1.;\ngl_FragColor = vec4( vec3( color  ), alpha );\n}";
})();
THREE.MarchingCubes = function(a, c, b, d) {
  THREE.ImmediateRenderObject.call(this);
  this.material = c;
  this.enableUvs = void 0 !== b ? b : !1;
  this.enableColors = void 0 !== d ? d : !1;
  this.init = function(b) {
    this.resolution = b;
    this.isolation = 80;
    this.size = b;
    this.size2 = this.size * this.size;
    this.size3 = this.size2 * this.size;
    this.halfsize = this.size / 2;
    this.delta = 2 / this.size;
    this.yd = this.size;
    this.zd = this.size2;
    this.field = new Float32Array(this.size3);
    this.normal_cache = new Float32Array(3 * this.size3);
    this.vlist = new Float32Array(36);
    this.nlist = new Float32Array(36);
    this.firstDraw = !0;
    this.maxCount = 4096;
    this.count = 0;
    this.hasUvs = this.hasColors = this.hasNormals = this.hasPositions = !1;
    this.positionArray = new Float32Array(3 * this.maxCount);
    this.normalArray = new Float32Array(3 * this.maxCount);
    this.enableUvs && (this.uvArray = new Float32Array(2 * this.maxCount));
    this.enableColors && (this.colorArray = new Float32Array(3 * this.maxCount));
  };
  this.lerp = function(b, c, d) {
    return b + (c - b) * d;
  };
  this.VIntX = function(b, c, d, a, e, p, g, m, k, n) {
    e = (e - k) / (n - k);
    k = this.normal_cache;
    c[a] = p + e * this.delta;
    c[a + 1] = g;
    c[a + 2] = m;
    d[a] = this.lerp(k[b], k[b + 3], e);
    d[a + 1] = this.lerp(k[b + 1], k[b + 4], e);
    d[a + 2] = this.lerp(k[b + 2], k[b + 5], e);
  };
  this.VIntY = function(b, c, d, a, e, p, g, m, k, n) {
    e = (e - k) / (n - k);
    k = this.normal_cache;
    c[a] = p;
    c[a + 1] = g + e * this.delta;
    c[a + 2] = m;
    c = b + 3 * this.yd;
    d[a] = this.lerp(k[b], k[c], e);
    d[a + 1] = this.lerp(k[b + 1], k[c + 1], e);
    d[a + 2] = this.lerp(k[b + 2], k[c + 2], e);
  };
  this.VIntZ = function(b, c, d, a, e, p, g, m, k, n) {
    e = (e - k) / (n - k);
    k = this.normal_cache;
    c[a] = p;
    c[a + 1] = g;
    c[a + 2] = m + e * this.delta;
    c = b + 3 * this.zd;
    d[a] = this.lerp(k[b], k[c], e);
    d[a + 1] = this.lerp(k[b + 1], k[c + 1], e);
    d[a + 2] = this.lerp(k[b + 2], k[c + 2], e);
  };
  this.compNorm = function(b) {
    var c = 3 * b;
    0 === this.normal_cache[c] && (this.normal_cache[c] = this.field[b - 1] - this.field[b + 1], this.normal_cache[c + 1] = this.field[b - this.yd] - this.field[b + this.yd], this.normal_cache[c + 2] = this.field[b - this.zd] - this.field[b + this.zd]);
  };
  this.polygonize = function(b, c, d, a, e, p) {
    var g = a + 1, m = a + this.yd, k = a + this.zd, n = g + this.yd, r = g + this.zd, t = a + this.yd + this.zd, u = g + this.yd + this.zd, q = 0, y = this.field[a], w = this.field[g], A = this.field[m], B = this.field[n], C = this.field[k], D = this.field[r], E = this.field[t], F = this.field[u];
    y < e && (q |= 1);
    w < e && (q |= 2);
    A < e && (q |= 8);
    B < e && (q |= 4);
    C < e && (q |= 16);
    D < e && (q |= 32);
    E < e && (q |= 128);
    F < e && (q |= 64);
    var v = THREE.edgeTable[q];
    if (0 === v) {
      return 0;
    }
    var z = this.delta, G = b + z, H = c + z, z = d + z;
    v & 1 && (this.compNorm(a), this.compNorm(g), this.VIntX(3 * a, this.vlist, this.nlist, 0, e, b, c, d, y, w));
    v & 2 && (this.compNorm(g), this.compNorm(n), this.VIntY(3 * g, this.vlist, this.nlist, 3, e, G, c, d, w, B));
    v & 4 && (this.compNorm(m), this.compNorm(n), this.VIntX(3 * m, this.vlist, this.nlist, 6, e, b, H, d, A, B));
    v & 8 && (this.compNorm(a), this.compNorm(m), this.VIntY(3 * a, this.vlist, this.nlist, 9, e, b, c, d, y, A));
    v & 16 && (this.compNorm(k), this.compNorm(r), this.VIntX(3 * k, this.vlist, this.nlist, 12, e, b, c, z, C, D));
    v & 32 && (this.compNorm(r), this.compNorm(u), this.VIntY(3 * r, this.vlist, this.nlist, 15, e, G, c, z, D, F));
    v & 64 && (this.compNorm(t), this.compNorm(u), this.VIntX(3 * t, this.vlist, this.nlist, 18, e, b, H, z, E, F));
    v & 128 && (this.compNorm(k), this.compNorm(t), this.VIntY(3 * k, this.vlist, this.nlist, 21, e, b, c, z, C, E));
    v & 256 && (this.compNorm(a), this.compNorm(k), this.VIntZ(3 * a, this.vlist, this.nlist, 24, e, b, c, d, y, C));
    v & 512 && (this.compNorm(g), this.compNorm(r), this.VIntZ(3 * g, this.vlist, this.nlist, 27, e, G, c, d, w, D));
    v & 1024 && (this.compNorm(n), this.compNorm(u), this.VIntZ(3 * n, this.vlist, this.nlist, 30, e, G, H, d, B, F));
    v & 2048 && (this.compNorm(m), this.compNorm(t), this.VIntZ(3 * m, this.vlist, this.nlist, 33, e, b, H, d, A, E));
    q <<= 4;
    for (e = a = 0;-1 != THREE.triTable[q + e];) {
      b = q + e, c = b + 1, d = b + 2, this.posnormtriv(this.vlist, this.nlist, 3 * THREE.triTable[b], 3 * THREE.triTable[c], 3 * THREE.triTable[d], p), e += 3, a++;
    }
    return a;
  };
  this.posnormtriv = function(b, c, d, a, e, p) {
    var g = 3 * this.count;
    this.positionArray[g] = b[d];
    this.positionArray[g + 1] = b[d + 1];
    this.positionArray[g + 2] = b[d + 2];
    this.positionArray[g + 3] = b[a];
    this.positionArray[g + 4] = b[a + 1];
    this.positionArray[g + 5] = b[a + 2];
    this.positionArray[g + 6] = b[e];
    this.positionArray[g + 7] = b[e + 1];
    this.positionArray[g + 8] = b[e + 2];
    this.normalArray[g] = c[d];
    this.normalArray[g + 1] = c[d + 1];
    this.normalArray[g + 2] = c[d + 2];
    this.normalArray[g + 3] = c[a];
    this.normalArray[g + 4] = c[a + 1];
    this.normalArray[g + 5] = c[a + 2];
    this.normalArray[g + 6] = c[e];
    this.normalArray[g + 7] = c[e + 1];
    this.normalArray[g + 8] = c[e + 2];
    this.enableUvs && (c = 2 * this.count, this.uvArray[c] = b[d], this.uvArray[c + 1] = b[d + 2], this.uvArray[c + 2] = b[a], this.uvArray[c + 3] = b[a + 2], this.uvArray[c + 4] = b[e], this.uvArray[c + 5] = b[e + 2]);
    this.enableColors && (this.colorArray[g] = b[d], this.colorArray[g + 1] = b[d + 1], this.colorArray[g + 2] = b[d + 2], this.colorArray[g + 3] = b[a], this.colorArray[g + 4] = b[a + 1], this.colorArray[g + 5] = b[a + 2], this.colorArray[g + 6] = b[e], this.colorArray[g + 7] = b[e + 1], this.colorArray[g + 8] = b[e + 2]);
    this.count += 3;
    this.count >= this.maxCount - 3 && (this.hasPositions = !0, this.hasNormals = null == this.container.scene.overrideMaterial, this.enableUvs && (this.hasUvs = !0), this.enableColors && (this.hasColors = !0), p(this));
  };
  this.begin = function() {
    this.count = 0;
    this.hasColors = this.hasUvs = this.hasNormals = this.hasPositions = !1;
  };
  this.end = function(b) {
    if (0 !== this.count) {
      for (var c = 3 * this.count;c < this.positionArray.length;c++) {
        this.positionArray[c] = 0;
      }
      this.hasPositions = !0;
      this.hasNormals = null == this.container.scene.overrideMaterial;
      this.enableUvs && (this.hasUvs = !0);
      this.enableColors && (this.hasColors = !0);
      b(this);
    }
  };
  this.addBall = function(b, c, d, a, e) {
    var p = this.size * Math.sqrt(a / e), g = d * this.size, m = c * this.size, k = b * this.size, n = Math.floor(g - p);
    1 > n && (n = 1);
    g = Math.floor(g + p);
    g > this.size - 1 && (g = this.size - 1);
    var r = Math.floor(m - p);
    1 > r && (r = 1);
    m = Math.floor(m + p);
    m > this.size - 1 && (m = this.size - 1);
    var t = Math.floor(k - p);
    1 > t && (t = 1);
    p = Math.floor(k + p);
    p > this.size - 1 && (p = this.size - 1);
    for (var u, q, y, w, A, B;n < g;n++) {
      for (k = this.size2 * n, q = n / this.size - d, A = q * q, q = r;q < m;q++) {
        for (y = k + this.size * q, u = q / this.size - c, B = u * u, u = t;u < p;u++) {
          w = u / this.size - b, w = a / (1E-6 + w * w + B + A) - e, 0 < w && (this.field[y + u] += w);
        }
      }
    }
  };
  this.addPlaneX = function(b, c) {
    var d, a, e, p, g, m = this.size, k = this.yd, n = this.zd, r = this.field, t = m * Math.sqrt(b / c);
    t > m && (t = m);
    for (d = 0;d < t;d++) {
      if (a = d / m, a *= a, p = b / (1E-4 + a) - c, 0 < p) {
        for (a = 0;a < m;a++) {
          for (g = d + a * k, e = 0;e < m;e++) {
            r[n * e + g] += p;
          }
        }
      }
    }
  };
  this.addPlaneY = function(b, c) {
    var d, a, e, p, g, m, k = this.size, n = this.yd, r = this.zd, t = this.field, u = k * Math.sqrt(b / c);
    u > k && (u = k);
    for (a = 0;a < u;a++) {
      if (d = a / k, d *= d, p = b / (1E-4 + d) - c, 0 < p) {
        for (g = a * n, d = 0;d < k;d++) {
          for (m = g + d, e = 0;e < k;e++) {
            t[r * e + m] += p;
          }
        }
      }
    }
  };
  this.addPlaneZ = function(b, c) {
    var d, a, e, p, g, m, k = this.size, n = this.yd, r = this.zd, t = this.field, u = k * Math.sqrt(b / c);
    u > k && (u = k);
    for (e = 0;e < u;e++) {
      if (d = e / k, d *= d, p = b / (1E-4 + d) - c, 0 < p) {
        for (g = r * e, a = 0;a < k;a++) {
          for (m = g + a * n, d = 0;d < k;d++) {
            t[m + d] += p;
          }
        }
      }
    }
  };
  this.reset = function() {
    var b;
    for (b = 0;b < this.size3;b++) {
      this.normal_cache[3 * b] = 0, this.field[b] = 0;
    }
  };
  this.render = function(b) {
    this.begin();
    var c, d, a, e, p, g, m, k, n, r = this.size - 2;
    for (e = 1;e < r;e++) {
      for (n = this.size2 * e, m = (e - this.halfsize) / this.halfsize, a = 1;a < r;a++) {
        for (k = n + this.size * a, g = (a - this.halfsize) / this.halfsize, d = 1;d < r;d++) {
          p = (d - this.halfsize) / this.halfsize, c = k + d, this.polygonize(p, g, m, c, this.isolation, b);
        }
      }
    }
    this.end(b);
  };
  this.generateGeometry = function() {
    var b = 0, c = new THREE.Geometry, d = [];
    this.render(function(a) {
      var e, p, g, m, k, n, r, t;
      for (e = 0;e < a.count;e++) {
        n = 3 * e, r = n + 1, t = n + 2, p = a.positionArray[n], g = a.positionArray[r], m = a.positionArray[t], k = new THREE.Vector3(p, g, m), p = a.normalArray[n], g = a.normalArray[r], m = a.normalArray[t], n = new THREE.Vector3(p, g, m), n.normalize(), c.vertices.push(k), d.push(n);
      }
      k = a.count / 3;
      for (e = 0;e < k;e++) {
        n = 3 * (b + e), r = n + 1, t = n + 2, p = d[n], g = d[r], m = d[t], n = new THREE.Face3(n, r, t, [p, g, m]), c.faces.push(n);
      }
      b += k;
      a.count = 0;
    });
    return c;
  };
  this.init(a);
};
THREE.MarchingCubes.prototype = Object.create(THREE.ImmediateRenderObject.prototype);
THREE.MarchingCubes.prototype.constructor = THREE.MarchingCubes;
THREE.edgeTable = new Int32Array([0, 265, 515, 778, 1030, 1295, 1541, 1804, 2060, 2309, 2575, 2822, 3082, 3331, 3593, 3840, 400, 153, 915, 666, 1430, 1183, 1941, 1692, 2460, 2197, 2975, 2710, 3482, 3219, 3993, 3728, 560, 825, 51, 314, 1590, 1855, 1077, 1340, 2620, 2869, 2111, 2358, 3642, 3891, 3129, 3376, 928, 681, 419, 170, 1958, 1711, 1445, 1196, 2988, 2725, 2479, 2214, 4010, 3747, 3497, 3232, 1120, 1385, 1635, 1898, 102, 367, 613, 876, 3180, 3429, 3695, 3942, 2154, 2403, 2665, 2912, 1520, 1273, 
2035, 1786, 502, 255, 1013, 764, 3580, 3317, 4095, 3830, 2554, 2291, 3065, 2800, 1616, 1881, 1107, 1370, 598, 863, 85, 348, 3676, 3925, 3167, 3414, 2650, 2899, 2137, 2384, 1984, 1737, 1475, 1226, 966, 719, 453, 204, 4044, 3781, 3535, 3270, 3018, 2755, 2505, 2240, 2240, 2505, 2755, 3018, 3270, 3535, 3781, 4044, 204, 453, 719, 966, 1226, 1475, 1737, 1984, 2384, 2137, 2899, 2650, 3414, 3167, 3925, 3676, 348, 85, 863, 598, 1370, 1107, 1881, 1616, 2800, 3065, 2291, 2554, 3830, 4095, 3317, 3580, 764, 1013, 
255, 502, 1786, 2035, 1273, 1520, 2912, 2665, 2403, 2154, 3942, 3695, 3429, 3180, 876, 613, 367, 102, 1898, 1635, 1385, 1120, 3232, 3497, 3747, 4010, 2214, 2479, 2725, 2988, 1196, 1445, 1711, 1958, 170, 419, 681, 928, 3376, 3129, 3891, 3642, 2358, 2111, 2869, 2620, 1340, 1077, 1855, 1590, 314, 51, 825, 560, 3728, 3993, 3219, 3482, 2710, 2975, 2197, 2460, 1692, 1941, 1183, 1430, 666, 915, 153, 400, 3840, 3593, 3331, 3082, 2822, 2575, 2309, 2060, 1804, 1541, 1295, 1030, 778, 515, 265, 0]);
THREE.triTable = new Int32Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, 
-1, -1, -1, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1, 3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1, 3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1, 9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 7, 8, -1, 
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1, 8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 
11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1, 3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1, 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1, 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1, 4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, 
-1, -1, -1, 0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1, 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1, 9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, 
-1, -1, -1, -1, -1, 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1, 10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1, 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1, 5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, 9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1, 0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1, 1, 5, 3, 3, 5, 7, -1, -1, -1, -1, 
-1, -1, -1, -1, -1, -1, 9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1, 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1, 2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, 7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1, 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1, 11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1, 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, 
-1, -1, -1, 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1, 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1, 11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 1, 2, 6, 3, 0, 8, -1, 
-1, -1, -1, -1, -1, -1, 9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1, 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1, 2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1, 6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1, 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 
5, 9, -1, -1, -1, -1, 6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1, 6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1, 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1, 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 
6, 9, -1, 3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1, 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1, 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1, 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1, 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1, 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1, 10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 
10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, 10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1, 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1, 1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1, 0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, 10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1, 3, 11, 
2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1, 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1, 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1, 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1, 3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1, 6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1, 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1, 10, 6, 7, 10, 7, 
1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1, 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1, 7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1, 7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1, 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1, 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1, 8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 
3, 1, 3, 6, -1, 0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1, 7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 
8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1, 7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1, 2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1, 10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1, 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1, 0, 3, 7, 0, 7, 10, 
0, 10, 9, 6, 10, 7, -1, -1, -1, -1, 7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1, 6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1, 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1, 6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1, 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1, 10, 9, 3, 10, 3, 
2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1, 8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, 0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1, 1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1, 10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1, 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1, 10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 7, 6, 11, -1, -1, 
-1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1, 9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1, 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1, 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1, 7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 
7, -1, -1, -1, -1, 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1, 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1, 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1, 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1, 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1, 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1, 6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1, 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1, 6, 
11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1, 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1, 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1, 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1, 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1, 9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1, 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1, 1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 3, 6, 1, 6, 10, 
3, 8, 6, 5, 6, 9, 8, 9, 6, -1, 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1, 0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1, 5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1, 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1, 11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 
3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1, 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1, 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1, 2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1, 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1, 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1, 1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1, 9, 0, 3, 9, 3, 5, 5, 3, 7, 
-1, -1, -1, -1, -1, -1, -1, 9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1, 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1, 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1, 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1, 0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1, 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1, 9, 4, 5, 2, 11, 3, -1, -1, -1, -1, 
-1, -1, -1, -1, -1, -1, 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1, 5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1, 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1, 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1, 9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, 
-1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1, 1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1, 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1, 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1, 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1, 11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1, 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1, 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1, 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, 
-1, 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1, 1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1, 4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, 
-1, -1, -1, -1, -1, 3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1, 0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1, 9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1, 1, 10, 2, -1, -1, 
-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
demo.parts.Henri1 = {};
(function() {
  var a = (demo.parts.Henri1 = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    this.generateDepthMap = !0;
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer();
    this.dofPass = new kvg.graphics.post.DoF(this.depthMap);
    this.composer.passes = [this.renderModel, this.dofPass, this.copyPass];
    this.camera.far = 200;
    var c = new THREE.BoxGeometry(1E3, 1, 1E3), b = new THREE.MeshPhongMaterial({color:2105376, specular:1118481}), c = new THREE.Mesh(c, b);
    c.receiveShadow = !0;
    c.castShadow = !1;
    this.scene.add(c);
    b = b.clone();
    b.color = new THREE.Color(13883533);
    var c = new THREE.BoxGeometry(50, 50, 50), d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.castShadow = !0;
    b = b.clone();
    b.color = new THREE.Color(5033164.5);
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = 100;
    d.position.x = -70;
    d.castShadow = !0;
    b = b.clone();
    b.color = new THREE.Color(666951);
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = -100;
    d.position.x = -70;
    d.castShadow = !0;
    b = b.clone();
    b.color = new THREE.Color(1.1707140627E7);
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = 100;
    d.position.x = 70;
    d.castShadow = !0;
    this.addShroom(new THREE.Vector3(0, 15, 0));
    this.addShroom(new THREE.Vector3(100, 15, -70));
    this.addShroom(new THREE.Vector3(-70, 15, -100));
    this.addShroom(new THREE.Vector3(70, 15, 100));
    b = new THREE.AmbientLight(4473924);
    this.scene.add(b);
    light = new THREE.SpotLight(16777215, 1, 0, Math.PI / 2, 1);
    light.position.set(0, 1500, 1E3);
    light.target.position.set(0, 0, 0);
    light.castShadow = !0;
    light.shadowCameraNear = 1200;
    light.shadowCameraFar = 2500;
    light.shadowCameraFov = 50;
    light.shadowBias = 1E-4;
    light.shadowDarkness = .5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 1024;
    this.scene.add(light);
    this.spotLight = new THREE.SpotLight(15634464, 5.7, 500);
    this.spotLight.position.set(0, 200, 0);
    this.spotLight.castShadow = !0;
    this.spotLight.shadowCameraVisible = !1;
    this.spotLight.shadowMapWidth = 1024;
    this.spotLight.shadowMapHeight = 1024;
    this.spotLight.shadowCameraNear = 50;
    this.spotLight.shadowCameraFar = 250;
    this.spotLight.shadowCameraFov = 80;
    this.spotLight.shadowDarkness = .2;
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.cameraControl.initialize([new THREE.Vector3(-70, 35, -141), new THREE.Vector3(-70, 55, -138), new THREE.Vector3(-70, 75, -134), new THREE.Vector3(-70, 72, -115), new THREE.Vector3(-71, 65, -73), new THREE.Vector3(-92, 84, 78), new THREE.Vector3(-39, 69, 107), new THREE.Vector3(-5, 29, 105), new THREE.Vector3(10, 28, 80), new THREE.Vector3(35, 30, 49), new THREE.Vector3(50, 33, 24), new THREE.Vector3(89, 34, 15), new THREE.Vector3(95, 26, 6), new THREE.Vector3(55, 25, 3), new THREE.Vector3(30, 
    25, 5)], [new THREE.Vector3(-70, 34, -131), new THREE.Vector3(-70, 54, -128), new THREE.Vector3(-70, 73, -125), new THREE.Vector3(-70, 70, -105), new THREE.Vector3(-68, 64, -64), new THREE.Vector3(-86, 79, 71), new THREE.Vector3(-39, 65, 97), new THREE.Vector3(-8, 31, 96), new THREE.Vector3(16, 28, 71), new THREE.Vector3(43, 30, 44), new THREE.Vector3(51, 35, 14), new THREE.Vector3(80, 34, 10), new THREE.Vector3(85, 26, 5), new THREE.Vector3(45, 25, 5), new THREE.Vector3(25, 25, 5)], kvg.demo.CameraController.BEZIER);
  };
  a.update = function(c, b, d) {
    kvg.core.Part.prototype.update.call(this, c);
    this.spotLight.target.position.x = 70.4 * Math.sin(.001 * c.toMilliseconds());
    this.cameraControl.update(b);
    this.fovIn && (this.camera.rotation.x += .015 * Math.sin(.004 * c.toMilliseconds() + .2), this.camera.rotation.z += .01 * Math.sin(.005 * c.toMilliseconds()), this.camera.rotation.y += .02 * Math.sin(.008 * c.toMilliseconds() + 1.3));
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
  a.fovChange = function() {
    this.camera.updateProjectionMatrix();
  };
  a.everyBar = function(c) {
    var b = this;
    b.fovIn = !0;
    createjs.Tween.get(this.camera, {onChange:createjs.proxy(this.fovChange, this)}).to({fov:30}, 400).wait(3E3, !1).call(function() {
      b.fovIn = !1;
      createjs.Tween.get(b.camera, {onChange:createjs.proxy(b.fovChange, b)}).to({fov:70}, 400);
    });
  };
  a.addShroom = function(c) {
    var b = new THREE.OfflineJSONLoader, d = new THREE.SphereGeometry(10, 10, 10), a;
    b.load(kvg.core.assets.get("mushroom1"), function(b, c) {
      c[0].map = new THREE.Texture(kvg.core.assets.get("mushroom1.jpg"));
      c[0].map.needsUpdate = !0;
      a = new THREE.MeshFaceMaterial(c);
      d = b;
    });
    b = new THREE.Mesh(d, a);
    b.scale.set(5, 5, 5);
    b.position.set(c.x, c.y, c.z);
    this.scene.add(b);
  };
})();
demo.parts.Henri2 = {};
(function() {
  var a = (demo.parts.Henri2 = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.clearColor = 16777215;
    this.initStandardScene();
    this.initStandardComposer();
    var c = new THREE.BoxGeometry(1E3, 1, 1E3), b = new THREE.MeshPhongMaterial({color:2105376, specular:1118481}), c = new THREE.Mesh(c, b);
    c.receiveShadow = !0;
    c.castShadow = !1;
    this.scene.add(c);
    b = b.clone();
    b.color = new THREE.Color(666951);
    var c = new THREE.BoxGeometry(50, 50, 50), d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.castShadow = !0;
    this.scene.add(d);
    b = b.clone();
    b.color = new THREE.Color(16777215 * Math.random());
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = 100;
    d.position.x = -70;
    d.castShadow = !0;
    this.scene.add(d);
    b = b.clone();
    b.color = new THREE.Color(13883533);
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = -100;
    d.position.x = -70;
    d.castShadow = !0;
    this.scene.add(d);
    b = b.clone();
    b.color = new THREE.Color(16777215 * Math.random());
    d = new THREE.Mesh(c, b);
    d.position.y = 25;
    d.position.z = 100;
    d.position.x = 70;
    d.castShadow = !0;
    this.scene.add(d);
    b = new THREE.AmbientLight(4473924);
    this.scene.add(b);
    light = new THREE.SpotLight(16777215, 1, 0, Math.PI / 2, 1);
    light.position.set(0, 1500, 1E3);
    light.target.position.set(0, 0, 0);
    light.castShadow = !0;
    light.shadowCameraNear = 1200;
    light.shadowCameraFar = 2500;
    light.shadowCameraFov = 50;
    light.shadowBias = 1E-4;
    light.shadowDarkness = .5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 1024;
    this.scene.add(light);
    this.spotLight = new THREE.SpotLight(15634464, 5.7, 500);
    this.spotLight.position.set(0, 200, 0);
    this.spotLight.castShadow = !0;
    this.spotLight.shadowCameraVisible = !1;
    this.spotLight.shadowMapWidth = 1024;
    this.spotLight.shadowMapHeight = 1024;
    this.spotLight.shadowCameraNear = 50;
    this.spotLight.shadowCameraFar = 250;
    this.spotLight.shadowCameraFov = 80;
    this.spotLight.shadowDarkness = .2;
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.cameraControl.initialize([new THREE.Vector3(-70, 35, -141), new THREE.Vector3(-70, 55, -138), new THREE.Vector3(-70, 75, -134), new THREE.Vector3(-70, 72, -115), new THREE.Vector3(-71, 65, -73), new THREE.Vector3(-92, 84, 78), new THREE.Vector3(-39, 69, 107), new THREE.Vector3(-5, 29, 105), new THREE.Vector3(10, 28, 80), new THREE.Vector3(35, 30, 49), new THREE.Vector3(50, 33, 24), new THREE.Vector3(89, 34, 15), new THREE.Vector3(95, 26, 6), new THREE.Vector3(55, 25, 3), new THREE.Vector3(30, 
    25, 5)], [new THREE.Vector3(-70, 34, -131), new THREE.Vector3(-70, 54, -128), new THREE.Vector3(-70, 73, -125), new THREE.Vector3(-70, 70, -105), new THREE.Vector3(-68, 64, -64), new THREE.Vector3(-86, 79, 71), new THREE.Vector3(-39, 65, 97), new THREE.Vector3(-8, 31, 96), new THREE.Vector3(16, 28, 71), new THREE.Vector3(43, 30, 44), new THREE.Vector3(51, 35, 14), new THREE.Vector3(80, 34, 10), new THREE.Vector3(85, 26, 5), new THREE.Vector3(45, 25, 5), new THREE.Vector3(25, 25, 5)], kvg.demo.CameraController.BEZIER);
  };
  a.update = function(c, b, d) {
    kvg.core.Part.prototype.update.call(this, c);
    this.spotLight.target.position.x = 70.4 * Math.sin(.001 * c.toMilliseconds());
    this.cameraControl.update(b);
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
})();
demo.parts.HenriTest3 = {};
(function() {
  var a = (demo.parts.HenriTest3 = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    this.stopval = 0;
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer(!1, !1, !1);
    this.renderContinuous = !0;
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.beginCamera = new THREE.Vector3(1, 5, -92);
    this.endCamera = new THREE.Vector3(-63, -5, -37);
    this.cameraControl.initialize([new THREE.Vector3(1, 5, -92), new THREE.Vector3(2, 5, -72), new THREE.Vector3(32, 15, -62), new THREE.Vector3(19, 33, -52), new THREE.Vector3(-11, 42, -52), new THREE.Vector3(-30, 21, -53), new THREE.Vector3(-27, -9, -53), new THREE.Vector3(-19, -44, -38), new THREE.Vector3(-38, -66, -7), new THREE.Vector3(-43, -42, -43), new THREE.Vector3(-0, -0, -100), new THREE.Vector3(-0, -0, -130)], [new THREE.Vector3(2, 5, -82), new THREE.Vector3(2, 5, -62), new THREE.Vector3(32, 
    15, -52), new THREE.Vector3(16, 31, -43), new THREE.Vector3(-8, 37, -44), new THREE.Vector3(-27, 20, -43), new THREE.Vector3(-24, -6, -44), new THREE.Vector3(-16, -38, -32), new THREE.Vector3(-35, -58, -1), new THREE.Vector3(-39, -39, -34), new THREE.Vector3(-0, -0, -34), new THREE.Vector3(-0, -0, -34)], kvg.demo.CameraController.BEZIER);
    var c = [kvg.core.assets.get("ballbg.png"), kvg.core.assets.get("ballbg.png"), kvg.core.assets.get("ballbg.png"), kvg.core.assets.get("ballbg.png"), kvg.core.assets.get("ballbg.png"), kvg.core.assets.get("ballbg.png")], c = new THREE.CubeTexture(c);
    c.needsUpdate = !0;
    c.flipY = !1;
    c.format = THREE.RGBFormat;
    c = new THREE.MeshBasicMaterial({depthWrite:!1, side:THREE.BackSide, color:9502608, lights:!1});
    (new THREE.Texture(kvg.core.assets.get("normal.png"))).needsUpdate = !0;
    this.skybox = c = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), c);
    this.camera.position.z = 60;
    this.scene.add(c);
    c = new THREE.TetrahedronGeometry(20, 0);
    this.cubes = [];
    this.ballholder = new THREE.Object3D;
    this.amount = 6;
    this.light1 = new THREE.PointLight(13140223, 2, 300);
    this.light1.position.set(0, 0, 0);
    this.scene.add(this.light1);
    this.light2 = new THREE.PointLight(3489165, 5, 400);
    this.light2.position.set(0, 0, 0);
    this.scene.add(this.light2);
    this.light3 = new THREE.PointLight(16760831, 5, 450);
    this.light3.position.set(0, 0, 0);
    this.scene.add(this.light3);
    var b = new THREE.TetrahedronGeometry(1, 0), d = new THREE.MeshPhongMaterial({emissive:15658734, opacity:.5});
    this.l1sp = new THREE.Mesh(b, d);
    d = new THREE.MeshPhongMaterial({emissive:16748608, opacity:.5});
    this.l2sp = new THREE.Mesh(b, d);
    d = new THREE.MeshPhongMaterial({emissive:37119, opacity:.5});
    this.l3sp = new THREE.Mesh(b, d);
    b = new THREE.AmbientLight(4210752);
    this.scene.add(b);
    for (var b = [0, 3 * Math.PI / 6 * 2, 0, 3 * Math.PI / 6 * 2, 0, 3 * Math.PI / 6 * 2], d = [40, 40, 40, 40, 40, 40], a = [0, 0, 0, 0, 0, 0, 0], f = [13140223, 10506447, 2838694, 16760831, 1397420, 3489165, 13075446], l = 0;l < this.amount;l++) {
      var x = new THREE.CubeCamera(1, 2E3, 512), e = new THREE.MeshBasicMaterial({envMap:x.renderTarget, side:THREE.DoubleSide, color:f[l], emissive:1052688}), e = new THREE.Mesh(c, e);
      e.position.x = 200 * Math.random() - 100;
      e.position.y = 200 * Math.random() - 100;
      e.position.z = 200 * Math.random() - 100;
      e.lookAt(new THREE.Vector3(0, 0, 0));
      e.phase = b[l];
      e.speed = .001;
      e.r = d[l];
      e.po = a[l];
      this.scene.add(x);
      e.cubecam = x;
      this.ballholder.add(e);
      this.cubes.push(e);
    }
    this.scene.add(this.ballholder);
    this.scale = 1;
    this.cameraTime = (new kvg.core.TimeSig(28, 0, 0)).toMilliseconds();
    console.log("CAMERA TIEM  " + this.cameraTime);
    this.addTrigger(new kvg.core.TimeSig(43, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.beginLineFade);
    this.addTrigger(new kvg.core.TimeSig(22, 0, 0, kvg.core.TimeSig.RELATIVE), this.beginBallFade);
    this.addTrigger(new kvg.core.TimeSig(15, 0, 0, kvg.core.TimeSig.RELATIVE), this.beginPortal);
    this.addTrigger(new kvg.core.TimeSig(24, 0, 0, kvg.core.TimeSig.RELATIVE), this.beginPortalFinal);
    this.addTrigger(new kvg.core.TimeSig(-1, 2, 0, kvg.core.TimeSig.PATTERN), this.everySecondBeat);
    this.increase = 0;
  };
  a.postInit = function() {
  };
  a.beginLineFade = function() {
    console.log("BEGIN LINE FADE");
  };
  a.update = function(c, b) {
    var d = c.toMilliseconds() - this.begin.toMilliseconds();
    this.cameraControl.update(b);
    kvg.core.Part.prototype.update.call(this, c);
    for (var a = 0;a < this.amount;a++) {
      var f = this.cubes[a], l = f.phase + d * f.speed;
      0 == a % 3 ? (f.position.x = Math.sin(l + f.po) * f.r, f.position.y = Math.cos(l + f.po) * f.r, f.position.z = 0) : 1 == a % 3 ? (f.position.x = 0, f.position.y = Math.sin(l + f.po) * f.r, f.position.z = Math.cos(l + f.po) * f.r) : (f.position.x = Math.cos(l + f.po) * f.r, f.position.y = 0, f.position.z = Math.sin(l + f.po) * f.r);
      f.position.z += 200 * this.stopval;
      f.lookAt(new THREE.Vector3(0, 0, 0));
    }
    this.light2.position.x = 80 * Math.sin(5E-4 * d);
    this.light2.position.y = 75 * Math.sin(.001 * d);
    this.light2.position.z = 70 * Math.cos(.001 * d);
    this.l2sp.position.x = this.light2.position.x;
    this.l2sp.position.y = this.light2.position.y;
    this.l2sp.position.z = this.light2.position.z;
    this.light3.position.x = 80 * Math.sin(7E-4 * d + .4);
    this.light3.position.y = 65 * Math.sin(5E-4 * d + 18);
    this.light3.position.z = 70 * Math.cos(2E-4 * d);
    this.l3sp.position.x = this.light3.position.x;
    this.l3sp.position.y = this.light3.position.y;
    this.l3sp.position.z = this.light3.position.z;
  };
  a.render = function() {
    var c = kvg.core.graphics.renderer;
    c.autoClear = !0;
    c.setClearColor("#fff", 1);
    for (var b = 0;b < this.amount;b++) {
      var d = this.cubes[b];
      d.visible = !1;
      d.cubecam.position.copy(d.position);
      d.cubecam.updateCubeMap(c, this.scene);
      d.material.needsUpdate = !0;
      d.visible = !0;
    }
    kvg.core.Part.prototype.render.call(this);
  };
  a.everytick = function(c) {
  };
  a.everySecondBeat = function(c) {
    console.log("begin ball beat");
  };
  a.beginBallFade = function() {
    console.log("begin ball fade");
    createjs.Tween.get(this).to({stopval:1}, (new kvg.core.TimeSig(6, 2, 0)).toMilliseconds(), createjs.Ease.quintInOut);
  };
  a.beginPortal = function() {
    console.log("BEGIN portal");
    this.scale = 2;
  };
  a.beginPortalFinal = function() {
    console.log("begin portal final");
  };
})();
demo.parts.CubePart = {};
(function() {
  var a = (demo.parts.CubePart = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer();
    for (var c = new THREE.CubeGeometry(50, 50, 50), b = 0;b < c.faces.length;b += 2) {
      var d = 16777215 * Math.random();
      c.faces[b].color.setHex(d);
      c.faces[b + 1].color.setHex(d);
    }
    d = new THREE.MeshBasicMaterial({vertexColors:THREE.FaceColors});
    this.cube = new THREE.Mesh(c, d);
    this.cube.position.y = 0;
    this.cubes = [];
    for (b = 0;100 > b;b++) {
      var a = new THREE.Mesh(c, d);
      a.position.x = 800 * Math.random() - 400;
      a.position.y = 0 + 600 * Math.random() - 300;
      a.position.z = -200;
      a.scale.x = .1;
      a.scale.y = .1;
      a.scale.z = .1;
      this.scene.add(a);
      this.cubes.push(a);
    }
    this.scene.add(this.cube);
    this.scale = 1;
    this.addTrigger(new kvg.core.TimeSig(0, 0, 0, kvg.core.TimeSig.PATTERN), this.everyBar);
  };
  a.update = function(c) {
    kvg.core.Part.prototype.update.call(this, c);
    this.cube.rotateX(.01);
    this.cube.rotateY(.01);
    this.scale = 1 >= this.scale ? 1 : this.scale - .05;
    this.cube.scale.set(this.scale, this.scale, this.scale);
    kvg.sound.getFFT();
    c = this.cube.geometry;
    for (var b = 0;b < c.faces.length;b += 2) {
    }
    c.colorsNeedUpdate = !0;
    for (b = 0;b < this.cubes.length;b++) {
    }
  };
  a.render = function() {
    var c = kvg.core.graphics.renderer;
    c.autoClear = this.autoClear;
    c.setClearColor("#000", 1);
    this.composer.render();
  };
  a.everyBar = function() {
    this.scale = 2;
    this.cube.rotateX(-.2);
    this.cube.rotateY(-.2);
  };
})();
demo.parts.CubePart2 = {};
(function() {
  var a = (demo.parts.CubePart2 = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer();
    var c = new THREE.CubeGeometry(50, 50, 50), b = new THREE.MeshBasicMaterial({map:kvg.core.demo.parts.CubePart.renderTo});
    this.cube = new THREE.Mesh(c, b);
    this.cube.position.y = 0;
    this.cube.position.z = 400;
    this.scene.add(this.cube);
    this.scale = 1;
    this.addTrigger(new kvg.core.TimeSig(0, 0, 0, kvg.core.TimeSig.PATTERN), this.everyBar);
  };
  a.update = function(c) {
    kvg.core.Part.prototype.update.call(this, c);
    this.cube.rotateX(.03);
    this.cube.rotateY(.03);
    this.scale = 1 >= this.scale ? 1 : this.scale - .05;
    this.cube.scale.set(this.scale, this.scale, this.scale);
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
  a.everyBar = function() {
    this.scale = 2;
    this.cube.rotateX(-.4);
    this.cube.rotateY(-.4);
  };
})();
demo.parts.WaterPartShaders = {};
demo.parts.WaterPartShaders.SphereShader = {};
(function() {
  demo.parts.WaterPartShaders.SphereShader = {attributes:{}, vertex:"vec3 mod289(vec3 x)\n{\nreturn x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x)\n{\nreturn x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x)\n{\nreturn mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\nreturn 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec3 fade(vec3 t) {\nreturn t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nfloat cnoise(vec3 P)\n{\nvec3 Pi0 = floor(P); // Integer part for indexing\nvec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\nPi0 = mod289(Pi0);\nPi1 = mod289(Pi1);\nvec3 Pf0 = fract(P); // Fractional part for interpolation\nvec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\nvec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\nvec4 iy = vec4(Pi0.yy, Pi1.yy);\nvec4 iz0 = Pi0.zzzz;\nvec4 iz1 = Pi1.zzzz;\n\nvec4 ixy = permute(permute(ix) + iy);\nvec4 ixy0 = permute(ixy + iz0);\nvec4 ixy1 = permute(ixy + iz1);\n\nvec4 gx0 = ixy0 * (1.0 / 7.0);\nvec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\ngx0 = fract(gx0);\nvec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\nvec4 sz0 = step(gz0, vec4(0.0));\ngx0 -= sz0 * (step(0.0, gx0) - 0.5);\ngy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\nvec4 gx1 = ixy1 * (1.0 / 7.0);\nvec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\ngx1 = fract(gx1);\nvec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\nvec4 sz1 = step(gz1, vec4(0.0));\ngx1 -= sz1 * (step(0.0, gx1) - 0.5);\ngy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\nvec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\nvec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\nvec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\nvec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\nvec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\nvec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\nvec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\nvec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\nvec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\ng000 *= norm0.x;\ng010 *= norm0.y;\ng100 *= norm0.z;\ng110 *= norm0.w;\nvec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\ng001 *= norm1.x;\ng011 *= norm1.y;\ng101 *= norm1.z;\ng111 *= norm1.w;\n\nfloat n000 = dot(g000, Pf0);\nfloat n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\nfloat n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\nfloat n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\nfloat n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\nfloat n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\nfloat n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\nfloat n111 = dot(g111, Pf1);\n\nvec3 fade_xyz = fade(Pf0);\nvec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\nvec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\nfloat n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); \nreturn 2.2 * n_xyz;\n}\n\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\nvec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\nvec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\nPi0 = mod289(Pi0);\nPi1 = mod289(Pi1);\nvec3 Pf0 = fract(P); // Fractional part for interpolation\nvec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\nvec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\nvec4 iy = vec4(Pi0.yy, Pi1.yy);\nvec4 iz0 = Pi0.zzzz;\nvec4 iz1 = Pi1.zzzz;\n\nvec4 ixy = permute(permute(ix) + iy);\nvec4 ixy0 = permute(ixy + iz0);\nvec4 ixy1 = permute(ixy + iz1);\n\nvec4 gx0 = ixy0 * (1.0 / 7.0);\nvec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\ngx0 = fract(gx0);\nvec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\nvec4 sz0 = step(gz0, vec4(0.0));\ngx0 -= sz0 * (step(0.0, gx0) - 0.5);\ngy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\nvec4 gx1 = ixy1 * (1.0 / 7.0);\nvec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\ngx1 = fract(gx1);\nvec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\nvec4 sz1 = step(gz1, vec4(0.0));\ngx1 -= sz1 * (step(0.0, gx1) - 0.5);\ngy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\nvec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\nvec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\nvec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\nvec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\nvec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\nvec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\nvec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\nvec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\nvec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\ng000 *= norm0.x;\ng010 *= norm0.y;\ng100 *= norm0.z;\ng110 *= norm0.w;\nvec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\ng001 *= norm1.x;\ng011 *= norm1.y;\ng101 *= norm1.z;\ng111 *= norm1.w;\n\nfloat n000 = dot(g000, Pf0);\nfloat n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\nfloat n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\nfloat n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\nfloat n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\nfloat n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\nfloat n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\nfloat n111 = dot(g111, Pf1);\n\nvec3 fade_xyz = fade(Pf0);\nvec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\nvec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\nfloat n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); \nreturn 2.2 * n_xyz;\n}\nattribute vec4 tangent;\nuniform float time;\nvarying float noise;\nuniform vec2 repeat;\nuniform float useNormal;\nuniform float useRim;\nuniform float shred;\nvarying vec2 vUv;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec3 vEye;\nvarying vec3 vU;\nvarying vec2 vN;\nfloat turbulence( vec3 p ) {\nfloat w = 100.0;\nfloat t = -.5;\nfor (float f = 1.0 ; f <= 10.0 ; f++ ){\nfloat power = pow( 2.0, f );\nt += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );\n}\nreturn t;\n}\nvoid main() {\nvU = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );\nif( useNormal == 0. ) {\nvec3 n = normalize( normalMatrix * normal );\nvec3 r = reflect( vU, n );\nfloat m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );\nvN = vec2( r.x / m + 0.5,  r.y / m + 0.5 );\n} else {\nvN = vec2( 0. );\n}\nvUv = repeat * uv;\nnoise = 10.0 *  -.10 * turbulence( .5 * normal + time );\nfloat b = 15.0 * shred * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );\nfloat displacement = - 2. * noise + b;\nvec3 newPosition = position + normal * displacement;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );\nvNormal = normalize( normalMatrix * normal );\nif( useNormal == 1. ) {\nvTangent = normalize( normalMatrix * tangent.xyz );\nvBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );\n} else {\nvTangent = vec3( 0. );\nvBinormal = vec3( 0. );\n}\nif( useRim > 0. ) {\nvEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;\n} else {\nvEye = vec3( 0. );\n}\n}", 
  fragment:"uniform float time;\nuniform float bump;\nuniform sampler2D tNormal;\nuniform sampler2D tMatCap;\nuniform float noise;\nuniform float useNormal;\nuniform float useRim;\nuniform float rimPower;\nuniform float useScreen;\nuniform float normalScale;\nuniform float normalRepeat;\nuniform float lightness;\nvarying vec2 vUv;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec3 vEye;\nvarying vec3 vU;\nvarying vec2 vN;\nfloat random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}\nvoid main() {\nvec3 finalNormal = vNormal;\nvec2 calculatedNormal = vN;\nif( useNormal == 1. ) {\nvec3 normalTex = texture2D( tNormal, vUv  ).xyz * 2.0 - 1.0;\nnormalTex.xy *= normalScale;\nnormalTex.y *= -1.;\nnormalTex = normalize( normalTex );\nmat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );\nfinalNormal = tsb * normalTex;\nvec3 r = reflect( vU, normalize( finalNormal ) );\nfloat m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z+1.0 ) );\ncalculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );\n}\nvec3 base = texture2D( tMatCap, calculatedNormal ).rgb;\nif( useRim > 0. ) {\nfloat f = rimPower * abs( dot( vNormal, normalize( vEye ) ) );\nf = useRim * ( 1. - smoothstep( 0.0, 1., f ) );\nbase += vec3( f );\n}\nif( useScreen == 1. ) {\nbase = vec3( 1. ) - ( vec3( 1. ) - base ) * ( vec3( 1. ) - base );\n}\ngl_FragColor = vec4( lightness * 2.0*base, 1. );\n}"};
})();
demo.parts.Well = {};
(function() {
  var a = (demo.parts.Well = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer({dof:!0, standard:!0, bloom:!1, rgb:!1});
    var c = new THREE.OfflineJSONLoader, b = new THREE.BoxGeometry(3, 3, 2);
    c.load(kvg.core.assets.get("rock1"), function(b) {
    });
    this.greetbricks = [];
    this.makeGreetBricks(b);
    this.bricks = new THREE.Object3D;
    new THREE.SpotLight(16777215);
    this.camera.add(new THREE.PointLight(16777215, 1, 500));
    this.unmovedBricks = [];
    this.scene.add(this.bricks);
    c = new THREE.Texture(kvg.core.assets.get("rock_uvmap.png"));
    c.needsUpdate = !0;
    var d = new THREE.MeshLambertMaterial({color:"white", map:c});
    new THREE.PlaneGeometry(10, 10);
    new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:!0, map:kvg.core.assets.getTexture("well_lightray.png")});
    for (var a = 0;200 > a;++a) {
      for (c = 0;15 > c;++c) {
        var f = new THREE.Mesh(b, d.clone()), l = 10 * Math.sin(2 * Math.PI / 16 * c + 3 * a), x = 10 * Math.cos(2 * Math.PI / 16 * c + 3 * a), e = 2 * a;
        f.position.set(l, x, e);
        f.lookAt(new THREE.Vector3(0, 0, e));
        f.targetPosition = f.position.clone();
        f.targetRotation = f.rotation.clone();
        this.bricks.add(f);
        10 < a && (l = 140 * Math.sin(2 * Math.PI / 16 * c + a * c * 2), x = 140 * Math.cos(2 * Math.PI / 16 * c + a * c * 2), f.position.set(l, x, a + 100), f.lookAt(new THREE.Vector3(0, 0, 0)), f.startPosition = f.position.clone(), f.startRotation = f.rotation.clone(), this.unmovedBricks.push(f));
        a % 16 == 15 - c - 1 && (this.blue = 2671035, f.material.emissive.setHex(this.blue), f.colourfulB = !0);
        a % 16 == 15 - c - 4 && (this.red = 15676197, f.material.emissive.setHex(this.red), f.colourfulR = !0);
        a % 16 == 15 - c - 9 && (this.green = 2276257, f.material.emissive.setHex(this.green), f.colourfulG = !0);
      }
    }
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    b = c = 1;
    this.cameraControl.initialize([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-2, -5, 63 * c++), new THREE.Vector3(5.5, -3, 63 * c++), new THREE.Vector3(-4.4, -4.3, 63 * c++), new THREE.Vector3(-4.7, -4.8, 63 * c++), new THREE.Vector3(6, -4.2, 63 * c++), new THREE.Vector3(6, -3, 63 * c++ + 20)], [new THREE.Vector3(0, 0, -20), new THREE.Vector3(4, -3, 63 * b++ + 10), new THREE.Vector3(2, -2, 63 * b++ + 10), new THREE.Vector3(-1, -1, 63 * b++ + 10), new THREE.Vector3(2, -4, 63 * b++ + 10), new THREE.Vector3(-3, 
    -2, 63 * b++ + 10), new THREE.Vector3(0, 3, 63 * b++ + 40)], kvg.demo.CameraController.BEZIER);
    this.brickBuffer = [];
    this.bricksMoved = 0;
    this.flyingGreets = [];
    this.scene.fog = new THREE.Fog(0, 1, 50);
    for (c = 0;12 > c;++c) {
      this.addTrigger(new kvg.core.TimeSig(-1, -1, c, kvg.core.TimeSig.PATTERN), this.everyTick);
    }
    this.addTrigger(new kvg.core.TimeSig(3, 0, 0, kvg.core.TimeSig.RELATIVE), this.startGreets);
    this.addTrigger(new kvg.core.TimeSig(1, 0, 2, kvg.core.TimeSig.PATTERN), this.lightGreen);
    this.addTrigger(new kvg.core.TimeSig(2, 1, 1, kvg.core.TimeSig.PATTERN), this.lightBlue);
    this.addTrigger(new kvg.core.TimeSig(2, 2, 0, kvg.core.TimeSig.PATTERN), this.lightRed);
    this.addTrigger(new kvg.core.TimeSig(57, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeout);
  };
  a.fadeout = function() {
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:1}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds());
  };
  a.postInit = function() {
    var c = new THREE.PlaneGeometry(20, 11.25), b = new THREE.MeshBasicMaterial({map:kvg.core.demo.parts.Forest.renderTo}), c = new THREE.Mesh(c, b);
    c.position.z = -8;
    this.plane = c;
    this.scene.add(c);
  };
  a.lightGreen = function() {
    console.log("light green");
    for (var c = 0;c < this.bricks.children.length;++c) {
      var b = this.bricks.children[c];
      b.colourfulG && b.material.emissive.setHex(this.green);
    }
  };
  a.lightBlue = function() {
    for (var c = 0;c < this.bricks.children.length;++c) {
      var b = this.bricks.children[c];
      b.colourfulB && b.material.emissive.setHex(this.blue);
    }
  };
  a.lightRed = function() {
    for (var c = 0;c < this.bricks.children.length;++c) {
      var b = this.bricks.children[c];
      b.colourfulR && b.material.emissive.setHex(this.red);
    }
  };
  a.startGreets = function() {
    this.addTrigger(new kvg.core.TimeSig(-1, 0, 0, kvg.core.TimeSig.PATTERN), this.launchGreet);
    this.addTrigger(new kvg.core.TimeSig(2, 2, 0, kvg.core.TimeSig.PATTERN), this.launchGreet);
  };
  a.launchGreet = function() {
    var c = this.greetbricks.pop();
    c.position.set(4 * Math.random() - 2, 4 * Math.random() - 2, this.camera.position.z + 60);
    createjs.Tween.get(c.position).to({z:this.camera.position.z + 45}, (new kvg.core.TimeSig(4, 0, 0)).toMilliseconds(), createjs.Ease.quadOut);
    this.flyingGreets.push(c);
    this.scene.add(c);
  };
  a.update = function(c, b, d) {
    kvg.core.Part.prototype.update.call(this, c);
    this.cameraControl.update(b);
    this.plane.scale.x = this.plane.scale.y = this.plane.scale.z = Math.min(4, 1 + .14 * this.camera.position.z);
    for (b = 0;b < this.flyingGreets.length;++b) {
      var a = this.flyingGreets[b];
      a.rotateZ(.5 * Math.random() * d);
      a.rotateY(.77 * Math.random() * d);
      a.rotateX(1.1 * Math.random() * d);
    }
    for (b = 0;b < this.bricks.children.length;++b) {
      a = this.bricks.children[b], a.colourfulB && a.material.emissive.addScalar(-.3 * d), a.colourfulR && a.material.emissive.addScalar(-.4 * d), a.colourfulG && a.material.emissive.addScalar(-.2 * d);
    }
    this.infov && (this.camera.rotation.x += .005 * Math.sin(.004 * c.toMilliseconds() + .2), this.camera.rotation.z += .005 * Math.sin(.005 * c.toMilliseconds()), this.camera.rotation.y += .01 * Math.sin(.008 * c.toMilliseconds() + 1.3));
  };
  a.moveBrick = function(c) {
    if (!c.ismoving) {
      c.ismoving = !0;
      this.unmovedBricks.splice(this.unmovedBricks.indexOf(c), 1);
      var b = c.targetPosition, d = c.targetRotation, a = this, f = 500 * kvg.util.random.nextFloat(), l = 2E3 + 2E3 * kvg.util.random.nextFloat();
      createjs.Tween.get(c.rotation).wait(f).to({x:d.x, y:d.y, z:d.z}, l, createjs.Ease.circOut);
      createjs.Tween.get(c.position).wait(f).to({x:b.x, y:b.y, z:b.z}, l, createjs.Ease.circOut).call(function() {
        a.bricksMoved++;
        var b = a.brickBuffer.indexOf(c);
        a.brickBuffer.splice(b, 1);
      });
    }
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
  a.everyTick = function() {
    for (;150 > this.brickBuffer.length && 0 != this.unmovedBricks.length;) {
      var c = kvg.util.random.getRange(0, Math.min(this.unmovedBricks.length, 50));
      c >= this.bricks.length && (c = this.bricks.length - 1);
      c = this.unmovedBricks[c];
      this.brickBuffer.push(c);
      this.moveBrick(c);
    }
  };
  a.makeGreetBricks = function(c) {
    for (var b = "pyrotech;konvergence;kewlers;matt current;hedelmae;hbc;fgj;mercury;fairlight;darklite;primitive;npli;elventhor;paraguay;doo;_soleil_;damones;byterapers;conspiracy;bombsquad;asd;traction;api;jumalauta;alumni;ananasmurska".split(";"), a = 0;a < b.length;a++) {
      var h = [new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + b[a] + ".png")}), new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + b[a] + ".png")}), new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + b[a] + ".png")}), new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + b[a] + ".png")}), new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + b[a] + ".png")}), new THREE.MeshLambertMaterial({map:kvg.core.assets.getTexture("rock_" + 
      b[a] + ".png")})];
      this.greetbricks.push(new THREE.Mesh(c, new THREE.MeshFaceMaterial(h)));
    }
  };
})();
demo.parts.Forest = {};
(function() {
  var a = (demo.parts.Forest = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    this.generateDepthMap = !0;
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.mushrooms = new THREE.Object3D;
    this.loadScene();
    this.initStandardComposer({dof:!0, standard:!1, bloom:!1, rgb:!1});
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 200));
    this.cameraController = new kvg.demo.CameraController;
    this.cameraController.attachCamera(this.camera);
    this.cameraController.initialize([new THREE.Vector3(-12, 7, -396), new THREE.Vector3(-12, 7, -396), new THREE.Vector3(10, 7, -385), new THREE.Vector3(20, 7, -370), new THREE.Vector3(30, 7, -350), new THREE.Vector3(20, 7, -321), new THREE.Vector3(20, 7, -321), new THREE.Vector3(9, 7, -285), new THREE.Vector3(-4, 10, -258), new THREE.Vector3(-4, 10, -258), new THREE.Vector3(-4, 10, -258), new THREE.Vector3(-4, 10, -258), new THREE.Vector3(-4, 10, -258)], [new THREE.Vector3(-2, 7, -396), new THREE.Vector3(-2, 
    7, -393), new THREE.Vector3(25, 7, -380), new THREE.Vector3(34, 7, -362), new THREE.Vector3(34, 7, -341), new THREE.Vector3(23, 7, -311), new THREE.Vector3(21, 7, -312), new THREE.Vector3(5, 8, -276), new THREE.Vector3(-8, 11, -249), new THREE.Vector3(-10, 15, -252), new THREE.Vector3(-10, 15, -255), new THREE.Vector3(-10, 15, -260), new THREE.Vector3(-10, 15, -260)], kvg.demo.CameraController.BEZIER);
  };
  a.moveRainbows = function() {
    console.log("move rainbows");
    createjs.Tween.get(this.rainbow1.container.position).to({z:1E3}, 2E4, createjs.Ease.linear);
  };
  a.update = function(c, b, a) {
    kvg.core.Part.prototype.update.call(this, c);
    this.cameraController.update(b);
    this.mushrooms.position.x -= 20 * a;
    this.mushrooms.rotateX(Math.PI / 16 * a);
    this.mushrooms.position.z = this.camera.position.z + 20;
    for (var h = 0;h < this.mushrooms.children.length;++h) {
      this.mushrooms.children[h].position.y = 30 * Math.sin(h * a * Math.PI * 2 / 20);
    }
    this.rainbow1.update(c, b, a);
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
  a.fovChange = function() {
    this.camera.updateProjectionMatrix();
  };
  a.everyBar = function(c) {
  };
  a.createPlatforms = function(c) {
    new THREE.MeshBasicMaterial({color:"black"});
    new THREE.BoxGeometry(5, 1, 5);
    var b, a;
    this.mushrooms.position.x = 100;
    c.load(kvg.core.assets.get("mushroom1"), function(c, h) {
      a = c;
      b = h;
      b[0].map = new THREE.Texture(kvg.core.assets.get("mushroom1.jpg"));
      b[0].map.needsUpdate = !0;
    });
    for (c = 0;100 > c;++c) {
      var h = new THREE.Mesh(a, new THREE.MeshFaceMaterial(b));
      h.position.set(10 * c, 0, 0);
      h.rotateX(c * Math.PI / 8);
      this.mushrooms.add(h);
    }
  };
  a.loadScene = function() {
    new THREE.OfflineObjectLoader;
    var c = new THREE.OfflineJSONLoader;
    new THREE.SphereGeometry(10, 10, 10);
    this.scene.add(new THREE.AmbientLight("white", 2));
    this.createPlatforms(c);
    var c = new THREE.CylinderGeometry(0, 12, 1600, 8, 200), b = new demo.parts.forest.RainbowShader;
    this.material = new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment, transparent:!0, side:THREE.DoubleSide});
    this.container = this.mesh = new THREE.Mesh(c, this.material);
    this.rainbow1 = new demo.parts.forest.RainbowEffect;
    this.rainbow1.container.scale.set(5, 5, 5);
    this.rainbow1.container.rotateX(Math.PI / 2);
    this.scene.add(this.rainbow1.container);
    (new THREE.Texture(kvg.core.assets.get("green_particle.png"))).needsUpdate = !0;
  };
})();
demo.parts.Lonkerot = {};
(function() {
  var a = (demo.parts.Lonkerot = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer();
  };
  a.update = function(c) {
    kvg.core.Part.prototype.update.call(this, c);
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
})();
demo.parts.falling2 = {};
demo.parts.falling2.FadeTrans = {};
(function() {
  (demo.parts.falling2.FadeTrans = function(c) {
    this.uniforms = THREE.UniformsUtils.clone(a.uniforms);
    this.blendIn = kvg.core.graphics.getRenderTarget();
    this.blendPart = c;
    this.uniforms.resolution.value = new THREE.Vector2(kvg.core.graphics.viewport.width, kvg.core.graphics.viewport.height);
    this.material = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:a.vertex, fragmentShader:a.fragment});
    this.enabled = !0;
    this.renderToScreen = !1;
    this.needsSwap = !0;
  }).prototype.render = function(c, b, a, h) {
    c.render(this.blendPart.scene, this.blendPart.camera, this.blendIn);
    this.uniforms.tBlend.value = this.blendIn;
    this.uniforms.tColor.value = a;
    THREE.EffectComposer.quad.material = this.material;
    this.renderToScreen ? c.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera) : c.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, b, !1);
  };
  var a = {attributes:{}, uniforms:{tColor:{type:"t", value:null}, tBlend:{type:"t", value:null}, amount:{type:"f", value:0}, resolution:{type:"v2", value:new THREE.Vector2(1280, 720)}}, vertex:"varying vec2 vUv;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\n}", fragment:"varying vec2 vUv;\nuniform sampler2D tColor;\nuniform sampler2D tBlend;\nuniform vec2 resolution;\nuniform float aperture;\nuniform float amount;\nvoid main() {\nvec2 uv = vUv;\nvec4 base = texture2D(tColor, uv);\nvec4 into = texture2D(tBlend, uv);\nvec4 combined = mix(base, into, 1.-smoothstep(amount*1.2-0.1, amount*1.2, uv.x));//amount*1.2>uv.x ? 1. : 0.);\ngl_FragColor = combined;\n}"};
})();
demo.parts.clouds.CloudShader = {};
(function() {
  demo.parts.clouds.CloudShader = {uniforms:{texture:{type:"t", value:null}, fogColor:{type:"c", value:9474303}, fogNear:{type:"f", value:10}, fogFar:{type:"f", value:500}}, vertex:"varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", fragment:"varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nuniform float fogNear;\nuniform float fogFar;\nuniform vec4 fogColor;\nuniform sampler2D texture;\nvoid main() {\nvec2 uv = vUv;\nvec4 color = texture2D(texture, uv);\ngl_FragColor = color;\n}"};
})();
demo.parts.CloudsEnd = {};
(function() {
  var a = (demo.parts.CloudsEnd = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer({dof:!1, rgb:!1, bloom:!1, standard:!0});
    this.buildScene();
    this.rotover = 0;
    this.camera.far = 4E3;
    this.camera.updateProjectionMatrix();
    console.log("UPDATE CAMERA far");
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.layerEffect.standard.uniforms.brightness.value = 1;
    this.cameraControl.initialize([new THREE.Vector3(59, 96, 1773), new THREE.Vector3(59, 94, 1684), new THREE.Vector3(49, 96, 1575), new THREE.Vector3(54, 97, 1466), new THREE.Vector3(61, 94, 1406), new THREE.Vector3(70, 91, 1327), new THREE.Vector3(78, 88, 1258), new THREE.Vector3(87, 85, 1178), new THREE.Vector3(96, 81, 1099), new THREE.Vector3(104, 88, 1029), new THREE.Vector3(112, 90, 960), new THREE.Vector3(119, 90, 900), new THREE.Vector3(123, 81, 861), new THREE.Vector3(127, 80, 831), new THREE.Vector3(130, 
    76, 801), new THREE.Vector3(135, 75, 761), new THREE.Vector3(140, 77, 723), new THREE.Vector3(147, 76, 675), new THREE.Vector3(153, 75, 636), new THREE.Vector3(158, 60, 597), new THREE.Vector3(164, 51, 558), new THREE.Vector3(171, 40, 510), new THREE.Vector3(171, 30, 410), new THREE.Vector3(171, 20, 310)], [new THREE.Vector3(59, 95, 1763), new THREE.Vector3(60, 95, 1674), new THREE.Vector3(48, 95, 1565), new THREE.Vector3(55, 97, 1456), new THREE.Vector3(62, 94, 1397), new THREE.Vector3(71, 91, 
    1317), new THREE.Vector3(79, 88, 1248), new THREE.Vector3(88, 84, 1168), new THREE.Vector3(97, 81, 1089), new THREE.Vector3(105, 88, 1019), new THREE.Vector3(113, 90, 950), new THREE.Vector3(120, 90, 890), new THREE.Vector3(124, 81, 851), new THREE.Vector3(128, 80, 821), new THREE.Vector3(131, 76, 791), new THREE.Vector3(136, 75, 752), new THREE.Vector3(142, 77, 713), new THREE.Vector3(149, 76, 665), new THREE.Vector3(154, 75, 626), new THREE.Vector3(159, 60, 587), new THREE.Vector3(165, 51, 
    549), new THREE.Vector3(172, 40, 501), new THREE.Vector3(172, 30, 401), new THREE.Vector3(172, 20, 301)], kvg.demo.CameraController.BEZIER);
    this.addTrigger(new kvg.core.TimeSig(70, 1, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeout);
  };
  a.fadeout = function() {
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:1}, (new kvg.core.TimeSig(0, 4, 0)).toMilliseconds());
  };
  a.temp = function() {
  };
  a.start = function() {
    this.running = !0;
    this.textMaterial.uniforms.fallout.value = 0;
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:0}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds());
  };
  a.buildScene = function() {
    this.clearColor = 9474303;
    var c = demo.parts.clouds.CloudShader;
    c.uniforms.texture.value = kvg.core.assets.getTexture("cloud.png");
    this.blockPlane = new THREE.Mesh(new THREE.PlaneGeometry(7E3, 7E3), new THREE.MeshBasicMaterial({color:13027528}));
    this.blockPlane.rotation.x = -Math.PI / 2;
    this.blockPlane.position.y = -110;
    this.scene.add(this.blockPlane);
    skytexture = kvg.core.assets.getTexture("sky.jpg");
    skytexture.needsUpdate = !0;
    var b = new THREE.MeshBasicMaterial({map:skytexture, side:THREE.DoubleSide});
    this.outerCube = new THREE.Mesh(new THREE.BoxGeometry(7E3, 7E3, 3400), b);
    this.scene.add(this.outerCube);
    var c = this.cloudmat = new THREE.ShaderMaterial({uniforms:c.uniforms, vertexShader:c.vertex, fragmentShader:c.fragment, depthWrite:!0, depthTest:!0, transparent:!0}), a = new THREE.PlaneGeometry(128, 128, 1), b = new THREE.Geometry;
    this.planes = [];
    for (var a = new THREE.Mesh(a, c), h = 0;4E3 > h;h++) {
      a.material = c, a.position.x = 4E3 * Math.random() - 2E3, a.position.y = 5 * Math.random(), a.position.z = .5 * h, a.rotation.z = Math.random() * Math.PI, a.scale.x = a.scale.y = Math.random() * Math.random() * 1.5 + .5, a.updateMatrix(), b.merge(a.geometry, a.matrix);
    }
    this.planeMesh = new THREE.Mesh(b, c);
    this.scene.add(this.planeMesh);
    this.rainbows = [];
    this.rainbow1 = new demo.parts.clouds.RainbowEffect;
    for (h = 0;50 > h;h++) {
      this.rainbow1 = new demo.parts.clouds.RainbowEffect, this.rainbow1.container.rotation.x = -Math.PI / 2, this.rainbow1.container.position.x = -600 + 40 * h, this.rainbow1.container.position.y = 40, this.rainbow1.container.position.z = 25 * -h - 450, this.rainbows.push(this.rainbow1);
    }
    for (h = 0;h < this.rainbows.length;h++) {
      this.scene.add(this.rainbows[h].container), this.rainbows[h].container.rotation.y = Math.PI + .4;
    }
    c = demo.parts.clouds.CombineShader;
    b = new demo.parts.clouds.RainbowDepthShader;
    a = new demo.parts.clouds.CloudDepthShader;
    a.uniforms.texture.value = kvg.core.assets.getTexture("cloud.png");
    var f = this;
    this.combinePass = {renderToScreen:!1, needsSwap:!0, enabled:!0, uniforms:c.uniforms, bottomT:kvg.core.graphics.getRenderTarget(), bottomD:kvg.core.graphics.getRenderTarget(), topT:kvg.core.graphics.getRenderTarget(null, null, THREE.RGBAFormat), topD:kvg.core.graphics.getRenderTarget(null, null, THREE.RGBAFormat), material:new THREE.ShaderMaterial({uniforms:c.uniforms, vertexShader:c.vertex, fragmentShader:c.fragment}), rbdMaterial:new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, 
    fragmentShader:b.fragment}), cdMaterial:new THREE.ShaderMaterial({uniforms:a.uniforms, vertexShader:a.vertex, fragmentShader:a.fragment, transparent:!0}), render:function(b, c, a, d) {
      for (a = 0;a < f.rainbows.length;a++) {
        f.rainbows[a].container.visible = !0, f.rainbows[a].container.material = this.rbdMaterial;
      }
      f.blockPlane.visible = !0;
      f.outerCube.visible = !0;
      f.planeMesh.visible = !1;
      b.autoClear = !0;
      b.setClearColor(0, 0);
      b.render(f.scene, f.camera, this.bottomD, !1);
      for (a = 0;a < f.rainbows.length;a++) {
        f.rainbows[a].container.visible = !0, f.rainbows[a].container.material = f.rainbows[a].material;
      }
      b.render(f.scene, f.camera, this.bottomT, !1);
      for (a = 0;a < f.rainbows.length;a++) {
        f.rainbows[a].container.visible = !0;
      }
      f.blockPlane.visible = !1;
      f.outerCube.visible = !1;
      f.planeMesh.visible = !0;
      b.setClearColor(0, 1);
      f.planeMesh.material = this.cdMaterial;
      b.render(f.scene, f.camera, this.topD, !1);
      f.planeMesh.material = f.cloudmat;
      b.setClearColor(0, 0);
      b.render(f.scene, f.camera, this.topT, !1);
      this.uniforms.bottomT.value = this.bottomT;
      this.uniforms.bottomD.value = this.bottomD;
      this.uniforms.topT.value = this.topT;
      this.uniforms.topD.value = this.topD;
      f.scene.overrideMaterial = null;
      THREE.EffectComposer.quad.material = this.material;
      b.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, c, !1);
    }};
    this.composer.passes = [this.combinePass, this.layerEffect.standard, this.copyPass];
    c = demo.parts.clouds.TextShader;
    this.textMaterial = new THREE.ShaderMaterial({uniforms:c.uniforms, vertexShader:c.vertex, fragmentShader:c.fragment, transparent:!0});
    this.text = this.createText("CODE: EXCA, PORO", new THREE.Vector3(70, 500, 700), 0);
    this.text = this.createText("MUSIC: ECLIPSER", new THREE.Vector3(70, 330, 700), 0);
  };
  a.createText = function(c, b, a) {
    c = new THREE.TextGeometry(c, {font:"911 porscha", size:100, height:.2});
    c.center();
    a = new THREE.Mesh(c, this.textMaterial);
    a.rotation.y = 0;
    a.position.x = b.x;
    a.position.y = b.y;
    a.position.z = b.z;
    c.computeBoundingBox();
    this.scene.add(a);
    return a;
  };
  a.postInit = function() {
    kvg.core.Part.prototype.postInit.call(this);
  };
  a.update = function(c, b, a) {
    this.cameraControl.update(b);
    kvg.core.Part.prototype.update.call(this, c, b, a);
    for (var h = 0;h < this.rainbows.length;h++) {
      this.rainbows[h].update(c, b, a), this.rainbows[h].container.scale.x += (1 - this.rainbows[h].container.scale.x) / 8, this.rainbows[h].container.scale.y = this.rainbows[h].container.scale.z = this.rainbows[h].container.scale.x;
    }
    this.rainbow1.update(c, b, a);
    this.textMaterial.uniforms.time.value = c.toMilliseconds();
    this.freeBegin && (this.rotover = 2 * Math.PI + .2 * Math.sin((c.toMilliseconds() - this.freeBegin) / 3E3));
    this.camera.rotation.z = this.rotover;
  };
  a.render = function(c) {
    this.outerCube.position.x = this.camera.position.x;
    this.outerCube.position.y = this.camera.position.y + 750;
    this.outerCube.position.z = this.camera.position.z;
    kvg.core.Part.prototype.render.call(this);
  };
})();
demo.parts.Clouds = {};
(function() {
  var a = (demo.parts.Clouds = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer({dof:!1, rgb:!1, bloom:!1, standard:!0});
    this.buildScene();
    this.rotover = 0;
    this.camera.far = 4E3;
    this.camera.updateProjectionMatrix();
    console.log("UPDATE CAMERA far");
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.cameraControl.initialize([new THREE.Vector3(68, 8, 2013), new THREE.Vector3(68, 28, 1993), new THREE.Vector3(68, 48, 1973), new THREE.Vector3(68, 68, 1953), new THREE.Vector3(68, 68, 1913), new THREE.Vector3(66, 88, 1843), new THREE.Vector3(59, 96, 1773), new THREE.Vector3(59, 94, 1684), new THREE.Vector3(49, 96, 1575), new THREE.Vector3(54, 97, 1466), new THREE.Vector3(61, 94, 1406), new THREE.Vector3(70, 91, 1327), new THREE.Vector3(78, 88, 1258), new THREE.Vector3(87, 85, 1178), new THREE.Vector3(96, 
    81, 1099), new THREE.Vector3(104, 88, 1029), new THREE.Vector3(112, 90, 960), new THREE.Vector3(119, 90, 900), new THREE.Vector3(123, 81, 861), new THREE.Vector3(127, 80, 831), new THREE.Vector3(130, 76, 801), new THREE.Vector3(135, 75, 761), new THREE.Vector3(140, 77, 723), new THREE.Vector3(147, 76, 675), new THREE.Vector3(153, 75, 636), new THREE.Vector3(158, 60, 597), new THREE.Vector3(164, 51, 558), new THREE.Vector3(171, 40, 510), new THREE.Vector3(171, 30, 410), new THREE.Vector3(171, 
    20, 310)], [new THREE.Vector3(68, 8, 2003), new THREE.Vector3(68, 28, 1983), new THREE.Vector3(68, 48, 1963), new THREE.Vector3(68, 68, 1943), new THREE.Vector3(68, 68, 1903), new THREE.Vector3(66, 88, 1833), new THREE.Vector3(59, 95, 1763), new THREE.Vector3(60, 95, 1674), new THREE.Vector3(48, 95, 1565), new THREE.Vector3(55, 97, 1456), new THREE.Vector3(62, 94, 1397), new THREE.Vector3(71, 91, 1317), new THREE.Vector3(79, 88, 1248), new THREE.Vector3(88, 84, 1168), new THREE.Vector3(97, 81, 
    1089), new THREE.Vector3(105, 88, 1019), new THREE.Vector3(113, 90, 950), new THREE.Vector3(120, 90, 890), new THREE.Vector3(124, 81, 851), new THREE.Vector3(128, 80, 821), new THREE.Vector3(131, 76, 791), new THREE.Vector3(136, 75, 752), new THREE.Vector3(142, 77, 713), new THREE.Vector3(149, 76, 665), new THREE.Vector3(154, 75, 626), new THREE.Vector3(159, 60, 587), new THREE.Vector3(165, 51, 549), new THREE.Vector3(172, 40, 501), new THREE.Vector3(172, 30, 401), new THREE.Vector3(172, 20, 
    301)], kvg.demo.CameraController.BEZIER);
    this.addTrigger(new kvg.core.TimeSig(5, 2, 0, kvg.core.TimeSig.RELATIVE), this.beginBarrel, this);
    this.addTrigger(new kvg.core.TimeSig(7, 0, 0, kvg.core.TimeSig.RELATIVE), this.fadeRainbow, this);
    this.addTrigger(new kvg.core.TimeSig(17, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeOut, this);
    this.addTrigger(new kvg.core.TimeSig(17, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeOut, this);
    this.addTrigger(new kvg.core.TimeSig(6, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.temp);
    this.addTrigger(new kvg.core.TimeSig(6, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(7, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(9, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(10, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(12, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(13, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(15, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(16, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(18, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(19, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
    this.addTrigger(new kvg.core.TimeSig(21, 0, 0, kvg.core.TimeSig.ABSOLUTE), this.bringUp);
  };
  a.temp = function() {
  };
  var c = [1, 9, 2, 12, 10, 3, 7, 18, 6, 20, 11, 20, 22, 14, 17, 20, 10, 3, 6, 2, 7, 4, 1, 9, 2, 8, 10, 3, 7, 4, 6, 5, 11, 20, 22, 14, 17, 20, 10, 3, 6, 2, 7, 4];
  a.bringUp = function() {
    var b = this.rainbows[c.shift()];
    b.container.scale.x = b.container.scale.y = b.container.scale.z = 1.25;
    b = this.rainbows[c.shift()];
    b.container.scale.x = b.container.scale.y = b.container.scale.z = 1.25;
    b = this.rainbows[c.shift()];
    b.container.scale.x = b.container.scale.y = b.container.scale.z = 1.25;
    b = this.rainbows[c.shift()];
    b.container.scale.x = b.container.scale.y = b.container.scale.z = 1.25;
  };
  a.fadeOut = function() {
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:1}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds());
  };
  a.beginBarrel = function() {
    var b = this;
    createjs.Tween.get(this).to({rotover:2 * Math.PI}, 4500, createjs.Ease.quadInOut).call(function() {
      b.free = !0;
    });
    createjs.Tween.get(this.text.material.uniforms.fallout).wait(2200).to({value:10}, 4500, createjs.Ease.quadInOut).call(function() {
      b.text.visible = !1;
    });
  };
  a.fadeRainbow = function() {
    for (var b = 0;b < this.rainbows.length;b++) {
      createjs.Tween.get(this.rainbows[b].material.uniforms.opacity).wait(300 * b).to({value:1}, 500).call(function(b) {
        return function() {
          createjs.Tween.get(b.container.rotation).to({y:10 * Math.PI}, 4E4);
        };
      }(this.rainbows[b]));
    }
  };
  a.buildScene = function() {
    this.clearColor = 9474303;
    var b = demo.parts.clouds.CloudShader;
    b.uniforms.texture.value = kvg.core.assets.getTexture("cloud.png");
    this.blockPlane = new THREE.Mesh(new THREE.PlaneGeometry(7E3, 7E3), new THREE.MeshBasicMaterial({color:13027528}));
    this.blockPlane.rotation.x = -Math.PI / 2;
    this.blockPlane.position.y = -110;
    this.scene.add(this.blockPlane);
    skytexture = kvg.core.assets.getTexture("sky.jpg");
    skytexture.needsUpdate = !0;
    var c = new THREE.MeshBasicMaterial({map:skytexture, side:THREE.DoubleSide});
    this.outerCube = new THREE.Mesh(new THREE.BoxGeometry(7E3, 7E3, 3400), c);
    this.scene.add(this.outerCube);
    var b = this.cloudmat = new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment, depthWrite:!0, depthTest:!0, transparent:!0}), a = new THREE.PlaneGeometry(128, 128, 1), c = new THREE.Geometry;
    this.planes = [];
    for (var a = new THREE.Mesh(a, b), f = 0;4E3 > f;f++) {
      a.material = b, a.position.x = 4E3 * Math.random() - 2E3, a.position.y = 5 * Math.random(), a.position.z = .5 * f, a.rotation.z = Math.random() * Math.PI, a.scale.x = a.scale.y = Math.random() * Math.random() * 1.5 + .5, a.updateMatrix(), c.merge(a.geometry, a.matrix);
    }
    this.planeMesh = new THREE.Mesh(c, b);
    this.scene.add(this.planeMesh);
    this.rainbows = [];
    this.rainbow1 = new demo.parts.clouds.RainbowEffect;
    for (f = 0;50 > f;f++) {
      this.rainbow1 = new demo.parts.clouds.RainbowEffect, this.rainbow1.container.rotation.x = -Math.PI / 2, this.rainbow1.container.position.x = -600 + 40 * f, this.rainbow1.container.position.y = 40, this.rainbow1.container.position.z = 25 * -f - 450, this.rainbows.push(this.rainbow1);
    }
    for (f = 0;f < this.rainbows.length;f++) {
      this.scene.add(this.rainbows[f].container), this.rainbows[f].container.rotation.y = Math.PI + .4;
    }
    b = demo.parts.clouds.CombineShader;
    c = new demo.parts.clouds.RainbowDepthShader;
    a = new demo.parts.clouds.CloudDepthShader;
    a.uniforms.texture.value = kvg.core.assets.getTexture("cloud.png");
    var l = this;
    this.combinePass = {renderToScreen:!1, needsSwap:!0, enabled:!0, uniforms:b.uniforms, bottomT:kvg.core.graphics.getRenderTarget(), bottomD:kvg.core.graphics.getRenderTarget(), topT:kvg.core.graphics.getRenderTarget(null, null, THREE.RGBAFormat), topD:kvg.core.graphics.getRenderTarget(null, null, THREE.RGBAFormat), material:new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment}), rbdMaterial:new THREE.ShaderMaterial({uniforms:c.uniforms, vertexShader:c.vertex, 
    fragmentShader:c.fragment}), cdMaterial:new THREE.ShaderMaterial({uniforms:a.uniforms, vertexShader:a.vertex, fragmentShader:a.fragment, transparent:!0}), render:function(b, c, a, d) {
      for (a = 0;a < l.rainbows.length;a++) {
        l.rainbows[a].container.visible = !0, l.rainbows[a].container.material = this.rbdMaterial;
      }
      l.blockPlane.visible = !0;
      l.outerCube.visible = !0;
      l.planeMesh.visible = !1;
      b.autoClear = !0;
      b.setClearColor(0, 0);
      b.render(l.scene, l.camera, this.bottomD, !1);
      for (a = 0;a < l.rainbows.length;a++) {
        l.rainbows[a].container.visible = !0, l.rainbows[a].container.material = l.rainbows[a].material;
      }
      b.render(l.scene, l.camera, this.bottomT, !1);
      for (a = 0;a < l.rainbows.length;a++) {
        l.rainbows[a].container.visible = !0;
      }
      l.blockPlane.visible = !1;
      l.outerCube.visible = !1;
      l.planeMesh.visible = !0;
      b.setClearColor(0, 1);
      l.planeMesh.material = this.cdMaterial;
      b.render(l.scene, l.camera, this.topD, !1);
      l.planeMesh.material = l.cloudmat;
      b.setClearColor(0, 0);
      b.render(l.scene, l.camera, this.topT, !1);
      this.uniforms.bottomT.value = this.bottomT;
      this.uniforms.bottomD.value = this.bottomD;
      this.uniforms.topT.value = this.topT;
      this.uniforms.topD.value = this.topD;
      l.scene.overrideMaterial = null;
      THREE.EffectComposer.quad.material = this.material;
      b.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, c, !1);
    }};
    this.composer.passes = [this.combinePass, this.layerEffect.standard, this.copyPass];
    b = demo.parts.clouds.TextShader;
    this.textMaterial = new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment, transparent:!0});
    this.text = this.createText("AIR TO GROUND", new THREE.Vector3(0, 170, 700), 0);
  };
  a.createText = function(b, a, c) {
    b = new THREE.TextGeometry(b, {font:"911 porscha", size:100, height:.2});
    b.center();
    c = new THREE.Mesh(b, this.textMaterial);
    c.rotation.y = 0;
    c.position.x = a.x;
    c.position.y = a.y;
    c.position.z = a.z;
    b.computeBoundingBox();
    this.scene.add(c);
    return c;
  };
  a.postInit = function() {
    kvg.core.Part.prototype.postInit.call(this);
  };
  a.update = function(b, a, c) {
    this.free && (this.free = !1, this.freeBegin = b.toMilliseconds());
    this.cameraControl.update(a);
    kvg.core.Part.prototype.update.call(this, b, a, c);
    for (var f = 0;f < this.rainbows.length;f++) {
      this.rainbows[f].update(b, a, c), this.rainbows[f].container.scale.x += (1 - this.rainbows[f].container.scale.x) / 8, this.rainbows[f].container.scale.y = this.rainbows[f].container.scale.z = this.rainbows[f].container.scale.x;
    }
    this.rainbow1.update(b, a, c);
    this.textMaterial.uniforms.time.value = b.toMilliseconds();
    this.freeBegin && (this.rotover = 2 * Math.PI + .2 * Math.sin((b.toMilliseconds() - this.freeBegin) / 3E3));
    this.camera.rotation.z = this.rotover;
  };
  a.render = function(b) {
    this.outerCube.position.x = this.camera.position.x;
    this.outerCube.position.y = this.camera.position.y + 750;
    this.outerCube.position.z = this.camera.position.z;
    kvg.core.Part.prototype.render.call(this);
  };
})();
demo.parts.clouds.CombineShader = {};
(function() {
  demo.parts.clouds.CombineShader = {uniforms:{bottomD:{type:"t", value:null}, bottomT:{type:"t", value:null}, topD:{type:"t", value:null}, topT:{type:"t", value:null}}, vertex:"varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", fragment:"varying vec2 vUv;\nvarying vec3 vP;\nuniform sampler2D bottomD;\nuniform sampler2D bottomT;\nuniform sampler2D topD;\nuniform sampler2D topT;\nvoid main() {\nvec2 uv = vUv;\nvec4 botD = texture2D(bottomD, uv);\nvec4 botT = texture2D(bottomT, uv);\nvec4 tD = texture2D(topD, uv);\nvec4 tT = texture2D(topT, uv);\nvec4 color = (1.-tT.a)*botT + tT;\ngl_FragColor = color;\n}"};
})();
demo.parts.clouds.RainbowDepthShader = {};
(function() {
  demo.parts.clouds.RainbowDepthShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\np.x+=sin(p.y*0.01)*350.;\np.z+=cos(p.y*0.01)*350.;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nvoid main() {\nvec2 uv = vUv;\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat color = 1.0 - smoothstep( 1., 4000., depth );\ngl_FragColor = vec4( vec3( color ), 1. );\n}";
})();
demo.parts.clouds.RainbowShader = {};
(function() {
  demo.parts.clouds.RainbowShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}, opacity:{type:"f", value:0}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\np.x+=sin(p.y*0.01)*350.;\np.z+=cos(p.y*0.01)*350.;\np.y*=0.05;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nuniform float opacity;\nvec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )\n{\n\treturn a + b*cos( 6.28318*(c*t+d) );\n}\nvoid main() {\nvec2 uv = vUv;\nvec4 color = vec4(sin(uv.x*50.+time*5.+sin(uv.y)*2.)*.5+.5,\n    sin(uv.x*50.+3.14/3.+time*4.+12.*cos(uv.y))*.5+.5,\n    sin(uv.x*50.+3.14/3.*2.+time*3.+sin(uv.y*3.)*2.)*.5+.5,1.0);\ncolor.a = (color.r+color.g+color.b)/3.*opacity;\ngl_FragColor = color;\n}";
})();
demo.parts.clouds.RainbowEffect = {};
(function() {
  var a = (demo.parts.clouds.RainbowEffect = function() {
    this.init();
  }).prototype;
  a.init = function() {
    var a = new THREE.CylinderGeometry(52, 52, 350, 8, 200), b = new demo.parts.clouds.RainbowShader;
    this.material = new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment, transparent:!0, side:THREE.DoubleSide});
    this.container = this.mesh = new THREE.Mesh(a, this.material);
  };
  a.update = function(a, b, d) {
    this.mesh.material.uniforms.time.value = a.toMilliseconds() / 500;
  };
})();
demo.parts.clouds.TextShader = {};
(function() {
  demo.parts.clouds.TextShader = {uniforms:{fallout:{type:"f", value:0}, time:{type:"f", value:0}}, vertex:"varying vec2 vUv;\nvarying vec3 vP;\nuniform float fallout;\nvoid main() {\nvec3 p = position;\nvUv = uv;\np.x*=1.+fallout*sin(fallout*0.1)*0.5;\np.y*=1.+fallout*sin(fallout*0.06+4.2)*0.2*p.x;\np.z*=1.+fallout*sin(fallout*0.14+1.)*0.1*p.x;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", fragment:"varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float fallout;\nuniform float time;\nvoid main() {\nvec2 uv = vUv;\nvec4 color = vec4(sin(uv.x*0.2+time)*0.05*cos(uv.y*.2+time)+0.7,sin(uv.x*0.2+time)*0.05*cos(uv.y*.2+time)+0.7,sin(uv.x*0.2+time)*0.05*cos(uv.y*.2+time)+0.7 ,1. );\ncolor.a = (10.-fallout)/10.;\ngl_FragColor = color;\n}"};
})();
demo.parts.MetaBalls = {};
(function() {
  var a = (demo.parts.MetaBalls = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer({dof:!0, rgb:!1, bloom:!0, standard:!0});
    this.camera.near = 20;
    this.camera.far = 700;
    this.camera.updateProjectionMatrix();
    this.buildScene();
    this.cameraControl = new kvg.demo.CameraController;
    this.cameraControl.attachCamera(this.camera);
    this.cameraControl.initialize([new THREE.Vector3(0, 60, -261), new THREE.Vector3(0, -88, -245), new THREE.Vector3(99, -77, -174), new THREE.Vector3(157, 91, -77), new THREE.Vector3(56, 100, 90), new THREE.Vector3(109, 81, 141), new THREE.Vector3(27, 59, 184), new THREE.Vector3(56, -84, 153), new THREE.Vector3(83, -206, 185), new THREE.Vector3(90, -206, 180)], [new THREE.Vector3(0, 60, -251), new THREE.Vector3(0, -85, -236), new THREE.Vector3(90, -75, -169), new THREE.Vector3(148, 88, -75), new THREE.Vector3(48, 
    99, 85), new THREE.Vector3(100, 81, 136), new THREE.Vector3(28, 60, 175), new THREE.Vector3(55, -78, 145), new THREE.Vector3(81, -198, 179), new THREE.Vector3(81, -190, 173)], kvg.demo.CameraController.BEZIER);
    this.addTrigger(new kvg.core.TimeSig(69, 3, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeout);
  };
  a.fadeout = function() {
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:1}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds()).call(function() {
      this.effect.visible = !1;
    });
  };
  a.buildScene = function() {
    this.clearColor = 0;
    var a = demo.parts.clouds.CloudShader, b = this.cubecam = new THREE.CubeCamera(1, 4E3, 512);
    a.uniforms.texture.value = new THREE.Texture(kvg.core.assets.get("cloud.png"));
    a.uniforms.texture.value.needsUpdate = !0;
    var a = this.cloudmat = new THREE.MeshLambertMaterial({color:16777215, transparent:!1, side:THREE.DoubleSide, envMap:b.renderTarget}), d = new demo.parts.metaballs.SphereShader, h = new THREE.SphereGeometry(400, 100), d = new THREE.ShaderMaterial({side:THREE.DoubleSide, uniforms:d.uniforms, vertexShader:d.vertex, fragmentShader:d.fragment});
    this.sphere = new THREE.Mesh(h, d);
    this.scene.add(this.sphere);
    h = new THREE.SphereGeometry(400, 100);
    d = new demo.parts.metaballs.SphereShader2;
    d.uniforms.texture.value = kvg.core.assets.getTexture("underground.jpg");
    d = new THREE.ShaderMaterial({side:THREE.DoubleSide, uniforms:d.uniforms, vertexShader:d.vertex, fragmentShader:d.fragment});
    this.sphere2 = new THREE.Mesh(h, d);
    this.scene.add(this.sphere2);
    h = new THREE.AmbientLight(5263440);
    this.scene.add(h);
    h = this.light1 = new THREE.PointLight(16777215, 2, 400);
    h.position.set(50, 50, 50);
    this.scene.add(h);
    h = this.light2 = new THREE.PointLight(16777215, 2, 400);
    h.position.set(350, 50, 50);
    this.scene.add(h);
    h = this.light3 = new THREE.PointLight(16777215, 2, 400);
    h.position.set(50, 50, -350);
    this.scene.add(h);
    resolution = 40;
    this.numBlobs = 17;
    a = this.effect = new THREE.MarchingCubes(resolution, a, !1, !1);
    a.container = this;
    a.position.set(0, 0, 0);
    a.scale.set(200, 200, 200);
    a.enableUvs = !1;
    a.enableColors = !1;
    this.scene.add(a);
    this.layerEffect.standard.uniforms.brightness.value = 1;
    this.scene.add(b);
  };
  a.start = function() {
    this.running = !0;
    createjs.Tween.get(this.layerEffect.standard.uniforms.brightness).to({value:0}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds());
  };
  a.updateCubes = function(a, b, d) {
    a.reset();
    var h, f, l, x, e;
    for (h = 0;h < this.numBlobs;h++) {
      f = .5 + Math.sin(3 * b + h / 3 + Math.cos(h / 4 + .3 * b)) * Math.sin(.3 * b + h / 8) * .17, l = .5 + .33 * Math.sin(b + h / 2 + 2.7) + .05 * Math.cos(b + .3 + h / 3), x = .5 + .2 * Math.sin((b * h / 2.6 + 1.3) * Math.cos(1.3 * b + .3 + h / 3)), e = 0 == d.beat % 2 && 0 == h % 7 ? .8 : .4, a.addBall(f, l, x, e, 12);
    }
    this.light1.position.x = 150 * Math.sin(5 * b);
    this.light1.position.y = 150 * Math.cos(1 * b);
    this.light1.position.z = 150 * Math.sin(8 * b);
    this.light2.position.x = 120 * Math.sin(6 * b + 2);
    this.light2.position.y = 180 * Math.cos(7 * b + 1);
    this.light2.position.z = 150 * Math.sin(5 * b + 4);
    this.light3.position.x = 130 * Math.sin(8 * b + 3.1);
    this.light3.position.y = 100 * Math.cos(6 * b);
    this.light3.position.z = 150 * Math.sin(3 * b + 1);
  };
  a.postInit = function() {
    kvg.core.Part.prototype.postInit.call(this);
  };
  a.update = function(a, b, d) {
    this.cameraControl.update(b);
    kvg.core.Part.prototype.update.call(this, a, b, d);
    this.sphere.material.uniforms.time.value = 1E-4 * a.toMilliseconds();
    this.updateCubes(this.effect, 6E-5 * a.toMilliseconds(), a);
    this.sphere2.rotation.y = 5 * -b * Math.PI;
  };
  a.render = function(a) {
    this.sphere.visible = !0;
    this.sphere2.visible = !1;
    this.effect.visible = !1;
    this.cubecam.updateCubeMap(kvg.core.graphics.renderer, this.scene);
    this.effect.visible = !0;
    this.cloudmat.needsUpdate = !0;
    this.sphere.visible = !1;
    this.sphere2.visible = !0;
    kvg.core.Part.prototype.render.call(this);
  };
})();
demo.parts.metaballs = {};
demo.parts.metaballs.SphereShader = {};
(function() {
  demo.parts.metaballs.SphereShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}, opacity:{type:"f", value:0}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nuniform float opacity;\nvoid main() {\nvec2 uv = vUv;\nvec4 color = vec4(sin(uv.x*50.+time*5.+sin(uv.y)*2.)*.5+.5,\n    sin(uv.x*50.+3.14/3.+time*4.+12.*cos(uv.y))*.5+.5,\n    sin(uv.x*50.+3.14/3.*2.+time*3.+sin(uv.y*3.)*2.)*.5+.5,1.0);\ncolor.a = (color.r+color.g+color.b)/3.*opacity;\ngl_FragColor = color;\n}";
})();
demo.parts.metaballs.SphereShader2 = {};
(function() {
  demo.parts.metaballs.SphereShader2 = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}, opacity:{type:"f", value:0}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nuniform float opacity;\nuniform sampler2D texture;\nvoid main() {\nvec2 uv = vUv;\nvec2 d = uv/resolution;\nvec4 color = texture2D(texture, uv);\ncolor += texture2D(texture, uv+vec2(d.x,0.));\ncolor += texture2D(texture, uv+vec2(-d.x,0.));\ncolor += texture2D(texture, uv+vec2(0.,d.y));\ncolor += texture2D(texture, uv+vec2(0.,-d.y));\ncolor += texture2D(texture, uv+5.*vec2(d.x,0.));\n color += texture2D(texture, uv+5.*vec2(-d.x,0.));\ncolor += texture2D(texture, uv+5.*vec2(0.,d.y));\ncolor += texture2D(texture, uv+5.*vec2(0.,-d.y));\ncolor += texture2D(texture, uv+20.*vec2(d.x,0.));\ncolor += texture2D(texture, uv+20.*vec2(-d.x,0.));\ncolor += texture2D(texture, uv+20.*vec2(0.,d.y));\ncolor += texture2D(texture, uv+20.*vec2(0.,-d.y));\ncolor += texture2D(texture, uv+10.*vec2(d.x,0.));\n color += texture2D(texture, uv+10.*vec2(-d.x,0.));\ncolor += texture2D(texture, uv+10.*vec2(0.,d.y));\ncolor += texture2D(texture, uv+10.*vec2(0.,-d.y));\ncolor/= 18.;\ngl_FragColor = color;\n}";
})();
demo.parts.WaterDroplet = {};
(function() {
  var a = (demo.parts.WaterDroplet = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer();
    var a = new THREE.OfflineJSONLoader, b = new THREE.SphereGeometry(10, 10, 10);
    a.load(kvg.core.assets.get("monkeyhead"), function(a, c) {
      b = a;
    });
    var d = new THREE.ShaderMaterial({fragmentShader:demo.parts.WaterDroplet.WireframeShader.fragment, vertexShader:demo.parts.WaterDroplet.WireframeShader.vertex, uniforms:demo.parts.WaterDroplet.WireframeShader.uniforms, attributes:demo.parts.WaterDroplet.WireframeShader.attributes, side:THREE.DoubleSide, transparent:!1});
    this.mesh = new THREE.Mesh(b, d);
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
    this.mesh.scale.set(150, 150, 150);
    for (var a = this.mesh.geometry.faces, d = d.attributes.barycentric.value, h = 0;h < a.length;h++) {
      d.push([new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]);
    }
    this.camera.position.z = -400;
    this.camera.lookAt(this.mesh.position);
    this.scene.add(this.mesh);
    this.scale = 1;
    this.addTrigger(new kvg.core.TimeSig(0, 0, 0, kvg.core.TimeSig.PATTERN), this.everyBar);
  };
  a.update = function(a) {
    kvg.core.Part.prototype.update.call(this, a);
    this.mesh.rotateX(.03);
    this.mesh.rotateY(.03);
  };
  a.render = function() {
    kvg.core.Part.prototype.render.call(this);
  };
  a.everyBar = function() {
    this.mesh.rotateX(-.4);
    this.mesh.rotateY(-.4);
  };
})();
demo.parts.WaterDroplet.WireframeShader = {};
(function() {
  demo.parts.WaterDroplet.WireframeShader = {uniforms:[], attributes:{barycentric:{type:"v3", boundTo:"faceVertices", value:[]}}, vertex:"varying vec3 vBC;\nattribute vec3 barycentric;\nvoid main(){\n    vBC = barycentric;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}", fragment:"#extension GL_OES_standard_derivatives : enable\nvarying vec3 vBC;\nfloat edgeFactor(){\n    vec3 d = fwidth(vBC);\n    vec3 a3 = smoothstep(vec3(0.0), d*0.95, vBC);\n    return min(min(a3.x, a3.y), a3.z);\n}\nvoid main(){\n   gl_FragColor.rgb = mix(vec3(0.1), vec3(0.5), edgeFactor());\n   gl_FragColor.a = 1.0;\n//gl_FragColor=vec4(0.0,1.0,1.0,1.0);\n}"};
})();
demo.parts.forest = {};
demo.parts.forest.RainbowShader = {};
(function() {
  demo.parts.forest.RainbowShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}, opacity:{type:"f", value:0}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nuniform float time;\nvoid main() {\nvec3 p = position;\nvUv = uv;\np.y+=cos(p.y*0.01*time/100.)*(280.);\np.z*=1.;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nvoid main() {\nvec2 uv = vUv;\nvec4 color = vec4(sin(uv.x*50.+time*5.+sin(uv.y)*2.)*.5+.5,\n    sin(uv.x*50.+3.14/3.+time*4.+12.*cos(uv.y))*.5+.5,\n    sin(uv.x*50.+3.14/3.*2.+time*3.+sin(uv.y*3.)*2.)*.5+.5,1.0);\ncolor.a = (color.r+color.g+color.b)/3.;\ngl_FragColor = color;\n}";
})();
demo.parts.forest.RainbowEffect = {};
(function() {
  var a = (demo.parts.forest.RainbowEffect = function() {
    this.init();
  }).prototype;
  a.init = function() {
    var a = new THREE.CylinderGeometry(0, 12, 1600, 8, 200), b = new demo.parts.forest.RainbowShader;
    this.material = new THREE.ShaderMaterial({uniforms:b.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment, transparent:!0, side:THREE.DoubleSide});
    this.container = this.mesh = new THREE.Mesh(a, this.material);
  };
  a.update = function(a, b, d) {
    this.mesh.material.uniforms.time.value = a.toMilliseconds() / 500;
  };
})();
demo.parts.falling = {};
(function() {
  var a = (demo.parts.falling = function() {
  }).prototype = new kvg.core.Part;
  a.init = function() {
    kvg.core.Part.prototype.init.call(this);
    this.initStandardScene();
    this.initStandardComposer({dof:!0, standard:!0, bloom:!1, rgb:!1});
    this.camera.position.set(0, 0, -40);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.rainbow1 = new demo.parts.falling.RainbowEffect;
    this.rainbow1.container.rotateZ(-Math.PI / 4);
    this.rainbow2 = new demo.parts.falling.RainbowEffect(3 * Math.PI / 4);
    this.rainbow2.container.rotateZ(-Math.PI / 4);
    this.rainbow2.container.position.x = -20;
    this.rainbow3 = new demo.parts.falling.RainbowEffect(5 * Math.PI / 4);
    this.rainbow3.container.rotateZ(-Math.PI / 4);
    this.rainbow3.container.position.x = 20;
    this.scene.add(this.rainbow1.container);
    this.scene.add(this.rainbow2.container);
    this.scene.add(this.rainbow3.container);
    this.cameraController = new kvg.demo.CameraController;
    this.cameraController.attachCamera(this.camera);
    this.cameraController.initialize([new THREE.Vector3(-650, -580, -60), new THREE.Vector3(-470, -490, -80), new THREE.Vector3(-410, -490, -100), new THREE.Vector3(-380, -460, -170), new THREE.Vector3(-290, -380, -300), new THREE.Vector3(-270, -260, -340)], [new THREE.Vector3(-650, -580, 0), new THREE.Vector3(-470, -490, -70), new THREE.Vector3(-410, -490, -90), new THREE.Vector3(-380, -460, -160), new THREE.Vector3(-290, -380, -290), new THREE.Vector3(-270, -260, -340)], kvg.demo.CameraController.BEZIER);
    this.planeCollection = new THREE.Object3D;
    for (var a = kvg.core.assets.getTexture("cloud.png"), b = 0;200 > b;++b) {
      var d = new THREE.Mesh(new THREE.PlaneGeometry(32, 32), new THREE.MeshBasicMaterial({map:a, transparent:!0, alphatest:.5, side:THREE.DoubleSide, opacity:.4}));
      d.scale.set(Math.random() + .5, Math.random() + .5, Math.random() + .5);
      d.position.set(1E3 * Math.random() - 500, 1E3 * Math.random() - 500, 0);
      this.planeCollection.add(d);
    }
    this.planeCollection.position.set(-1E3, -1E3, -30);
    this.scene.add(this.planeCollection);
    this.clearColor = 16777215;
    this.clearWhite = 255;
    this.addTrigger(new kvg.core.TimeSig(23, 2, 0, kvg.core.TimeSig.ABSOLUTE), this.fadeOut, this);
  };
  a.fadeOut = function() {
    createjs.Tween.get(this.fadeTrans.uniforms.amount).to({value:1}, (new kvg.core.TimeSig(0, 2, 0)).toMilliseconds());
  };
  a.postInit = function() {
    this.fadeTrans = new demo.parts.falling2.FadeTrans(kvg.core.demo.parts.Forest);
    this.composer.passes = [this.renderModel, this.layerEffect.dof, this.layerEffect.standard, this.fadeTrans, this.copyPass];
  };
  a.start = function() {
    kvg.core.Part.prototype.start.call(this);
    createjs.Tween.get(this.planeCollection.position).to({x:5200, y:5200}, (new kvg.core.TimeSig(18, 0, 0)).toMilliseconds(), createjs.Ease.linear);
    createjs.Tween.get(this).to({clearWhite:206}, 700);
  };
  a.update = function(a, b, d) {
    kvg.core.Part.prototype.update.call(this, a);
    this.cameraController.update(b);
    this.rainbow1.container.rotateY(2 * d);
    this.rainbow2.container.rotateY(2 * d);
    this.rainbow3.container.rotateY(2 * d);
    this.rainbow1.update(a, b, d);
    this.rainbow2.update(a, b, d);
    this.rainbow3.update(a, b, d);
    this.camera.rotation.x += .015 * Math.sin(.004 * a.toMilliseconds() + .2);
    this.camera.rotation.z += .01 * Math.sin(.005 * a.toMilliseconds());
    this.camera.rotation.y += .02 * Math.sin(.008 * a.toMilliseconds() + 1.3);
  };
  a.fovChange = function() {
    this.camera.updateProjectionMatrix();
  };
  a.render = function() {
    this.clearColor = this.clearWhite << 16 | this.clearWhite << 8 | this.clearWhite;
    kvg.core.Part.prototype.render.call(this);
  };
  a.everyBar = function(a) {
    var b = this;
    b.fovIn = !0;
    createjs.Tween.get(this.camera, {onChange:createjs.proxy(this.fovChange, this)}).to({fov:30}, 400).wait(3E3, !1).call(function() {
      b.fovIn = !1;
      createjs.Tween.get(b.camera, {onChange:createjs.proxy(b.fovChange, b)}).to({fov:70}, 400);
    });
  };
})();
demo.parts.falling.RainbowShader = {};
(function() {
  demo.parts.falling.RainbowShader = function() {
    this.uniforms = {texture:{type:"t", value:null}, time:{type:"f", value:10}, offset:{type:"f", value:0}};
    this.vertex = a;
    this.fragment = c;
  };
  var a = "varying vec2 vUv;\nvarying vec3 vP;\nuniform float offset;\nvoid main() {\nvec3 p = position;\nvUv = uv;\np.x+=sin(p.y*0.01+offset)*16.;\np.z+=cos(p.y*0.01+offset)*16.;\ngl_Position =projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\nvP = (modelMatrix  * vec4( p, 1.0 )).xyz;\n}", c = "varying vec2 vUv;\nvarying vec3 vP;\nuniform vec2 resolution;\nuniform float time;\nvoid main() {\nvec2 uv = vUv;\nvec4 color = vec4(sin(uv.x*50.+time*5.+sin(uv.y)*2.)*.5+.5,\n    sin(uv.x*50.+3.14/3.+time*4.+12.*cos(uv.y))*.5+.5,\n    sin(uv.x*50.+3.14/3.*2.+time*3.+sin(uv.y*3.)*2.)*.5+.5,1.0);\ncolor.a = (color.r+color.g+color.b)/1.;\ngl_FragColor = color;\n}";
})();
demo.parts.falling.RainbowEffect = {};
(function() {
  var a = (demo.parts.falling.RainbowEffect = function(a) {
    this.init(a);
  }).prototype;
  a.init = function(a) {
    var b = new THREE.CylinderGeometry(12, 12, 1500, 8, 500), d = new demo.parts.falling.RainbowShader, d = new THREE.ShaderMaterial({uniforms:d.uniforms, vertexShader:d.vertex, fragmentShader:d.fragment, transparent:!0, side:THREE.DoubleSide});
    this.container = this.mesh = new THREE.Mesh(b, d);
    this.mesh.material.uniforms.offset.value = a || 0;
  };
  a.update = function(a, b, d) {
    this.mesh.material.uniforms.time.value = a.toMilliseconds() / 500;
  };
})();


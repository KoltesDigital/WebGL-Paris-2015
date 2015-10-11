var kvg = {core:{}};
kvg.core.assets = {};
(function() {
  var a = kvg.core.assets, b = {};
  a.register = function(a, c, d, g) {
    console.log("register " + a);
    if (g && (d = base64DecToArr(d, 1), d = (new Zlib.Inflate(d)).decompress(), "json" === c)) {
      g = "";
      for (var k = 0;k < d.length;k++) {
        g += String.fromCharCode(d[k]);
      }
      d = g;
    }
    "png" === c || "jpg" === c ? (g = new Image, g.src = "data:image/" + ("jpg" === c ? "jpeg" : c) + ";base64," + d, b[a] = g) : "mp3" === c || "ogg" === c ? b[a] = d : "json" === c ? b[a] = JSON.parse(d) : "object" === c && (b[a] = d);
  };
  a.preload = function() {
  };
  a.get = function(a) {
    b[a] || console.warn("Asset " + a + " not found");
    return b[a];
  };
  a.getTexture = function(e) {
    e = new THREE.Texture(a.get(e));
    e.needsUpdate = !0;
    return e;
  };
})();
kvg.util = {};
kvg.util.geometryHelper = {};
(function() {
  kvg.util.geometryHelper.assignUVs = function(a) {
    a.faceVertexUvs[0] = [];
    a.faces.forEach(function(b) {
      var e = ["x", "y", "z"].sort(function(a, e) {
        return Math.abs(b.normal[a]) > Math.abs(b.normal[e]);
      }), c = a.vertices[b.a], d = a.vertices[b.b], g = a.vertices[b.c];
      a.faceVertexUvs[0].push([new THREE.Vector2(c[e[0]], c[e[1]]), new THREE.Vector2(d[e[0]], d[e[1]]), new THREE.Vector2(g[e[0]], g[e[1]])]);
    });
    a.uvsNeedUpdate = !0;
  };
})();
kvg.graphics = {};
kvg.graphics.post = {};
kvg.graphics.post.DoF = {};
(function() {
  var a = kvg.graphics.post;
  a.DoF = function(a) {
    this.uniforms = b.uniforms;
    this.uniforms.tDepth.value = a;
    this.uniforms.resolution.value = new THREE.Vector2(kvg.core.graphics.viewport.width, kvg.core.graphics.viewport.height);
    this.material = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment});
    this.enabled = !0;
    this.renderToScreen = !1;
    this.needsSwap = !0;
    this.blurX = kvg.core.graphics.getRenderTarget();
  };
  a.DoF.prototype.render = function(a, c, d, b) {
    this.uniforms.tColor.value = d;
    THREE.EffectComposer.quad.material = this.material;
    this.renderToScreen ? a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera) : (this.uniforms.x.value = 0, a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.blurX, !1), this.uniforms.x.value = 1, this.uniforms.tColor.value = this.blurX, a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, c, !1));
  };
  var b = {attributes:{}, uniforms:{tColor:{type:"t", value:null}, tDepth:{type:"t", value:null}, focus:{type:"f", value:.75}, aspect:{type:"f", value:1}, aperture:{type:"f", value:.18}, maxblur:{type:"f", value:40}, x:{type:"f", value:0}, resolution:{type:"v2", value:new THREE.Vector2(1280, 720)}}, vertex:"varying vec2 vUv;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\n}", fragment:"varying vec2 vUv;\nuniform sampler2D tColor;\nuniform sampler2D tDepth;\nuniform vec2 resolution;\nuniform float maxblur;\nuniform float aperture;\nuniform float x;\nuniform float focus;\nuniform float aspect;\nvec3 GaussianBlur( sampler2D tex0, vec2 centreUV, vec2 halfPixelOffset, vec2 pixelOffset )\n{\nvec3 colOut = vec3( 0, 0, 0 );\nconst int stepCount = 9;\nfloat gWeights[stepCount];\ngWeights[0] =  0.10855;\ngWeights[1] = 0.13135;\ngWeights[2] = 0.10406;\ngWeights[3] = 0.07216;\ngWeights[4] = 0.04380;\ngWeights[5] = 0.02328;\ngWeights[6] = 0.01083;\ngWeights[7] = 0.00441;\ngWeights[8] = 0.00157;\nfloat gOffsets[stepCount];\ngOffsets[0] = 0.66293;\ngOffsets[1] = 2.47904;\ngOffsets[2] = 4.46232;\ngOffsets[3] = 6.44568;\ngOffsets[4] = 8.42917;\ngOffsets[5] = 10.41281;\ngOffsets[6] = 12.39664;\ngOffsets[7] = 14.38070;\ngOffsets[8] = 16.36501;\nfor( int i = 0; i < stepCount; i++ )\n{\nvec2 texCoordOffset = gOffsets[i] * pixelOffset;\nvec3 col = texture2D( tex0, centreUV+texCoordOffset ).xyz+\ntexture2D( tex0, centreUV-texCoordOffset ).xyz;\ncolOut += gWeights[i]*col;\n}\nreturn colOut;\n} \nvoid main() {\nfloat dy = (1.-x)* 1./resolution.y*1.;\nfloat dx = x*1./resolution.x*1.;\nvec2 aspectcorrect = vec2( 1.0, aspect );\nvec4 depth1 = texture2D( tDepth, vUv );\nfloat factor = abs(depth1.x - focus);\nvec2 dofblur = vec2 (  factor * aperture);//, -maxblur, maxblur ) );\nvec2 dofblur9 = dofblur * 0.9;\nvec2 dofblur7 = dofblur * 0.7;\nvec2 dofblur4 = dofblur * 0.4;\nvec3 col = vec3( 0.0 );\ncol= texture2D(tColor, vUv.xy).rgb;\nvec3 blur = GaussianBlur(tColor, vUv, vec2(dx, dy)*.5, vec2(dx,dy));\ncol = mix(col, blur, factor); \ngl_FragColor = vec4(col.r, col.g, col.b,1.);\ngl_FragColor.a = 1.0;\n}"};
})();
kvg.demo = {};
kvg.demo.CameraController = {};
(function() {
  var a = function() {
    this.modes = [a.STATIC, a.LINEAR, a.BEZIER, a.FOLLOW];
  };
  a.STATIC = "static";
  a.LINEAR = "linear";
  a.BEZIER = "bezier";
  a.FOLLOW = "follow";
  var b = a.prototype;
  kvg.demo.CameraController = a;
  a.stopAllControl = function() {
    a.HALT = !0;
  };
  b.attachCamera = function(a) {
    this.camera = a;
  };
  b.setMode = function(e) {
    -1 == this.modes.indexOf(e) && (e = a.STATIC);
    this.mode = e;
  };
  b.initialize = function(e, c, d) {
    this.setMode(d);
    this.points = e;
    this.looks = c;
    this.mode == a.STATIC ? this.initStatic() : this.mode == a.LINEAR ? this.initLinear() : this.mode == a.FOLLOW ? this.initFollow() : this.initBezier();
  };
  b.initStatic = function() {
  };
  b.initFollow = function() {
    this.follow || (this.mode = STATIC);
    this.followOffset || (this.followOffset = new THREE.Vector3(0, 0, 0));
    this.followLookOffset || (this.followLookOffset = new THREE.Vector3(0, 0, 0));
  };
  b.initLinear = function() {
  };
  b.initBezier = function() {
    this.path = new THREE.SplineCurve3(this.points);
    this.lookPath = new THREE.SplineCurve3(this.looks);
  };
  b.update = function(e) {
    if (!a.HALT) {
      if (this.mode == a.STATIC) {
        this.camera.position.x = this.points[e].x, this.camera.position.y = this.points[e].y, this.camera.position.z = this.points[e].z, this.camera.lookAt(this.points[e].look);
      } else {
        if (this.mode != a.LINEAR) {
          if (this.mode == a.FOLLOW) {
            this.camera.position.x = this.follow.position.x + this.followOffset.x, this.camera.position.y = this.follow.position.y + this.followOffset.y, this.camera.position.z = this.follow.position.z + this.followOffset.z, this.camera.lookAt(this.follow.position + this.followLookOffset);
          } else {
            if (this.mode == a.BEZIER) {
              0 > e ? e = 0 : 1 < e && (e = 1);
              var c = this.path.getPoint(e);
              this.camera.position.x = c.x;
              this.camera.position.y = c.y;
              this.camera.position.z = c.z;
              c = this.lookPath.getPoint(e);
              this.camera.lookAt(c);
            }
          }
        }
      }
    }
  };
})();
(function() {
})();
kvg.core.graphics = {};
(function() {
  var a = kvg.core.graphics;
  a.container = null;
  a.renderer = null;
  a.stopped = !1;
  a.onRender = new signals.Signal;
  a.initWebGL = function(e) {
    a.clearColor = e.clearColor ? e.clearColor : 0;
    a.container = $("#demo");
    a.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:e.DEBUG});
    a.renderer.shadowMapEnabled = !0;
    a.renderer.shadowMapType = THREE.PCFShadowMap;
    a.renderer.setClearColor(e.clearColor);
    a.renderer.setSize(e.width, e.height);
    a.container.append(a.renderer.domElement);
    a.renderer.domElement.width = e.width;
    a.renderer.domElement.height = e.height;
    a.viewport = {width:e.width, height:e.height};
    a.layerEffect = {};
    a.frameCount = 0;
    a.renderer.setClearColor(a.clearColor, 1);
    a.renderer.autoClear = !0;
    a.depthMaterial = new THREE.MeshDepthMaterial;
  };
  a.store = function() {
    a.renderer.storeClear = a.renderer.autoClear;
    a.renderer.storeClearColor = a.renderer.getClearColor();
  };
  a.restore = function() {
    a.renderer.autoClear = a.renderer.storeClear;
    a.renderer.setClearColor(a.renderer.storeClearColor);
  };
  a.getRenderTarget = function(e, c, d) {
    return new THREE.WebGLRenderTarget(a.viewport.width, a.viewport.height, {minFilter:e ? e : THREE.LinearFilter, magFilter:c ? c : THREE.NearestFilter, format:d ? d : THREE.RGBFormat});
  };
  a.start = function() {
    a.stopped = !1;
    b();
  };
  a.stop = function() {
    a.stopped = !0;
  };
  var b = function() {
    a.onRender.dispatch();
    a.stopped || requestAnimationFrame(b);
  };
})();
kvg.loader = {};
(function() {
})();
kvg.core.Part = {};
(function() {
  var a = function() {
  };
  kvg.core.Part = a;
  var b = a.prototype;
  a.prototype.addTrigger = function(a, c) {
    this.trigger.has(a) ? this.trigger.get(a).push(c) : this.trigger.set(a, [c]);
  };
  b.addEffect = function(a) {
    this.effects.push(a);
  };
  b.init = function(a) {
    this.generateDepthMap && (this.depthMap = kvg.core.graphics.getRenderTarget());
    this.clearColor = "#000";
    this.trigger = new Map;
    this.running = !1;
    this.autoClear = a;
    this.layerEffect = {};
    this.renderTo = kvg.core.graphics.getRenderTarget();
    this.effects = [];
  };
  b.postInit = function() {
  };
  b.initStandardScene = function() {
    this.scene = new THREE.Scene;
    this.camera = new THREE.PerspectiveCamera(70, kvg.core.graphics.viewport.width / kvg.core.graphics.viewport.height, 1, 1E3);
    this.camera.position.y = 0;
    this.camera.position.x = 0;
    this.camera.position.z = 500;
    this.camera.part = this;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.autoUpdate = !0;
    this.scene.add(this.camera);
    this.renderPass = new THREE.RenderPass(this.scene, this.camera, null, 0, 0);
    kvg.debug.ManualControl.attachCamera(this.camera);
  };
  b.initStandardComposer = function(a) {
    a || (a = {dof:!0, standard:!0, bloom:!0, rgb:!0});
    var c = kvg.core.graphics;
    this.composerRT = this.renderTo || c.getRenderTarget();
    var d = this.renderModel = new THREE.RenderPass(this.scene, this.camera, null, 0, 0);
    this.composer = new THREE.EffectComposer(c.renderer, this.composerRT);
    this.composer.renderTarget1.format = THREE.RGBAFormat;
    this.composer.renderTarget2.format = THREE.RGBAFormat;
    this.composer.addPass(d);
    a.standard && (this.layerEffect.standard = a.standard.render ? a.standard : new kvg.graphics.post.StandardShader, this.composer.addPass(this.layerEffect.standard));
    a.dof && (this.generateDepthMap = !0, this.layerEffect.dof = a.dof.render ? a.dof : new kvg.graphics.post.DoF(this.depthMap), this.composer.addPass(this.layerEffect.dof));
    a.bloom && (this.layerEffect.bloom = a.bloom.render ? a.bloom : new THREE.BloomPass(1.32, 20, 18, 512), this.composer.addPass(this.layerEffect.bloom));
    a.rgb && (this.layerEffect.rgbShift = a.rgb.render ? a.rgb : new kvg.graphics.post.RGBShift(.002, -.002, 0), this.composer.addPass(this.layerEffect.rgbShift));
    this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
    this.copyPass.renderToScreen = this.renderToScreen;
    this.composer.addPass(this.copyPass);
  };
  b.setRenderToScreen = function(a) {
    this.copyPass && (this.copyPass.renderToScreen = a || this._debug_renderToScreen);
    this.renderToScreen = a || this._debug_renderToScreen;
  };
  b.start = function() {
    this.running = !0;
  };
  b.stop = function() {
    this.running = !1;
  };
  b.update = function(a, c, d) {
  };
  b.render = function(a) {
    a = kvg.core.graphics.renderer;
    this.generateDepthMap && (a.autoClear = !0, a.setClearColor(0, 1), this.scene.overrideMaterial = kvg.core.graphics.depthMaterial, kvg.core.graphics.renderer.render(this.scene, this.camera, this.depthMap), this.scene.overrideMaterial = null);
    a.autoClear = this.autoClear;
    a.setClearColor(this.clearColor, 1);
    this.composer ? this.composer.render() : kvg.core.graphics.renderer.render(this.scene, this.camera, this.renderTo);
  };
})();
kvg.core.TimeSig = {};
(function() {
  var a = function(a, c, d, b) {
    this.bar = a;
    this.beat = c;
    this.tick = d;
    this.pattern = b || "absolute";
  };
  kvg.core.TimeSig = a;
  var b = a.prototype;
  a.ABSOLUTE = "absolute";
  a.RELATIVE = "relative";
  a.PATTERN = "pattern";
  a.BEATSPATTERN = "beats";
  a.TICKSPATTERN = "bars";
  b.matchesPattern = function(e, c) {
    if (this.pattern === a.ABSOLUTE) {
      return e.equals(this);
    }
    if (this.pattern === a.RELATIVE) {
      return e.bar === c.bar + this.bar && e.beat === c.beat + this.beat && e.tick === c.tick + this.tick;
    }
    if (this.pattern === a.PATTERN) {
      return(-1 === this.bar || 0 === e.bar % this.bar) && (-1 === this.beat || e.beat % kvg.Config.BEATS_PER_BAR === this.beat) && (-1 === this.tick || e.tick % kvg.Config.TICKS_PER_BEAT === this.tick);
    }
    if (this.pattern == a.BEATSPATTERN) {
      return e.beat % kvg.Config.BEATS_PER_BAR === this.beat;
    }
    if (this.pattern == a.TICKSPATTERN) {
      return e.tick % kvg.Config.TICKS_PER_BEAT === this.tick;
    }
  };
  b.add = function(a) {
    this.addBars(a.bar);
    this.addBeats(a.beat);
    this.addTicks(a.tick);
  };
  b.addBars = function(a) {
    this.bar += a;
  };
  b.addBeats = function(a) {
    this.beat += a;
    this.bar += Math.floor(this.beat / kvg.Config.BEATS_PER_BAR);
    this.beat %= kvg.Config.BEATS_PER_BAR;
  };
  b.addTicks = function(a) {
    for (this.tick += a;this.tick >= kvg.Config.TICKS_PER_BEAT;) {
      this.tick -= kvg.Config.TICKS_PER_BEAT, this.beat++;
    }
    for (;this.beat >= kvg.Config.BEATS_PER_BAR;) {
      this.beat -= kvg.Config.BEATS_PER_BAR, this.bar++;
    }
  };
  b.subtract = function(a) {
    this.subtractBars(a.bar);
    this.subtractBeats(a.beats);
    this.subtractTicks(a.ticks);
  };
  b.subtractBars = function(a) {
    this.bar -= bars;
  };
  b.subtractBeats = function(a) {
    for (this.beat -= a;0 > this.beat;) {
      this.bar--, this.beat += kvg.Config.BEATS_PER_BAR;
    }
  };
  b.subtractTicks = function(a) {
    for (this.tick -= a;0 > this.tick;) {
      this.tick += kvg.Config.TICKS_PER_BEAT, this.beat--;
    }
    for (;0 > this.beat;) {
      this.bar--, this.beat += kvg.Config.BEATS_PER_BAR;
    }
  };
  b.fromTime = function(a) {
    a *= kvg.Config.BEATS_PER_MINUTE;
    this.bar = Math.floor(a / kvg.Config.BEATS_PER_BAR);
    this.beat = Math.floor(a % kvg.Config.BEATS_PER_BAR);
    this.tick = Math.floor((a - Math.floor(a)) * kvg.Config.TICKS_PER_BEAT);
    return this;
  };
  b.isInside = function(a, c) {
    return this.isSmallerThan(c) && this.isLargerThan(a);
  };
  b.isSmallerThan = function(a) {
    return this.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + this.beat * kvg.Config.TICKS_PER_BEAT + this.tick < a.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + a.beat * kvg.Config.TICKS_PER_BEAT + a.tick;
  };
  b.isLargerThan = function(a) {
    return this.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + this.beat * kvg.Config.TICKS_PER_BEAT + this.tick >= a.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + a.beat * kvg.Config.TICKS_PER_BEAT + a.tick;
  };
  b.toMilliseconds = function() {
    return 6E4 * (this.bar * kvg.Config.BEATS_PER_BAR / kvg.Config.BEATS_PER_MINUTE + this.beat / kvg.Config.BEATS_PER_MINUTE + this.tick / kvg.Config.TICKS_PER_BEAT / kvg.Config.BEATS_PER_MINUTE);
  };
  b.equals = function(a) {
    return this.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + this.beat * kvg.Config.TICKS_PER_BEAT + this.tick == a.bar * kvg.Config.BEATS_PER_BAR * kvg.Config.TICKS_PER_BEAT + a.beat * kvg.Config.TICKS_PER_BEAT + a.tick;
  };
  b.clone = function() {
    return new a(this.bar, this.beat, this.tick);
  };
  b.toString = function() {
    return this.bar + ":" + this.beat + ":" + this.tick;
  };
})();
kvg.sound = {};
(function() {
  var a = kvg.sound;
  a.onSoundLoaded = new signals.Signal;
  a.onSoundComplete = new signals.Signal;
  a.onSoundReady = new signals.Signal;
  var b = new kvg.core.TimeSig(0, 0, 0);
  a.init = function() {
    console.log("sound init");
    a.FFT = {db:g, frequency:k, waveform:m};
    a.volume = 1;
    if (createjs.Sound.initializeDefaultPlugins()) {
      if (createjs.WebAudioPlugin.isSupported()) {
        c();
      } else {
        a: {
          if (console.log("Player not compatible with web audio plugin. Trying to load scripted sounds"), okToInit = !1, a.musicAsset = kvg.core.assets.get("bg.ogg"), a.musicAsset) {
            try {
              a.musicByteArray = Base64Binary.decodeArrayBuffer(a.musicAsset), a.loaded = !0, console.log("Sound loaded ");
            } catch (d) {
              c();
              break a;
            }
            a.onSoundLoaded.dispatch();
          } else {
            c();
          }
        }
      }
    } else {
      alert("Sound could not be initialized.");
    }
  };
  a.setVolume = function(c) {
    console.log("set volume to: " + c);
    a.volume = c;
    null != a.instance && (a.instance.volume = c);
  };
  a.getPosition = function() {
    a.instance ? b.fromTime(a.instance.position / 1E3 / 60 - kvg.Config.MUSIC_BEGIN / 1E3 / 60) : a.context && b.fromTime((a.context.currentTime - a.startTime) / 60 - kvg.Config.MUSIC_BEGIN / 1E3 / 60);
    return b;
  };
  a.getFFT = function() {
    var c = 0;
    a.instance && (c = a.instance.position);
    a.context && (c = a.context.currentTime);
    if (a.lastFFT != c) {
      if (a.lastFFT = c, (a.instance || a.context) && kvg.Config.song.enableFFT && d) {
        d.getFloatFrequencyData(g), d.getByteFrequencyData(k), d.getByteTimeDomainData(m);
      } else {
        if (c = Math.floor(c / 33), null != a.precalcFFT && 0 <= c && c < a.precalcFFT.length) {
          for (var c = a.precalcFFT[c], e = c.d.length, b = g.length / e, f = 0;f < e;f++) {
            g[f * b] = c.d[f];
            k[f * b] = c.f[f];
            m[f * b] = c.w[f];
            for (var l = f < e - 1 ? f + 1 : f, r = 1;r < b;r++) {
              g[f * b + r] = c.d[f] + (c.d[l] - c.d[f]) * r / b, k[f * b + r] = c.f[f] + (c.f[l] - c.f[f]) * r / b, m[f * b + r] = c.w[f] + (c.w[l] - c.w[f]) * r / b;
            }
          }
        }
      }
    }
    return a.FFT;
  };
  a.start = function() {
    a.musicAsset ? (console.log("Load asset"), a.context = new AudioContext, a.context.decodeAudioData(a.musicByteArray, function(c) {
      a.dynamicsCompressorNode = a.context.createDynamicsCompressor();
      a.dynamicsCompressorNode.connect(a.context.destination);
      a.gainNode = a.context.createGain();
      a.gainNode.connect(a.dynamicsCompressorNode);
      a.gainNode.value = this.volume;
      var d = a.context.createBufferSource();
      d.buffer = c;
      d.connect(a.context.destination);
      d.start();
      a.startTime = a.context.currentTime;
      d.onended = e;
      kvg.Config.song.enableFFT && l();
      a.onSoundReady.dispatch();
    }, function(d) {
      console.log("err(decodeAudioData): " + d);
      a.musicAsset = null;
      c();
    })) : (console.log("File music"), console.log("volume: " + a.volume), a.context = createjs.Sound.activePlugin.context, a.dynamicsCompressorNode = createjs.Sound.activePlugin.dynamicsCompressorNode, a.instance = createjs.Sound.play("music"), a.instance.on("complete", e), a.instance.volume = a.volume, kvg.Config.song.enableFFT && l(), console.log("dispatch onSoundReady"), a.onSoundReady.dispatch());
  };
  var e = function() {
    a.onSoundComplete.dispatch();
  }, c = function() {
    var a = [{id:"music", src:kvg.Config.song.src}];
    createjs.Sound.alternateExtensions = ["mp3"];
    createjs.Sound.addEventListener("fileload", f);
    createjs.Sound.registerSounds(a);
  }, d, g, k, m, l = function() {
    var c = a.context, b = 1024;
    c && c.createAnalyser ? (d = c.createAnalyser(), d.fftSize = b, d.smoothingTimeConstant = .85, d.connect(c.destination), c = a.dynamicsCompressorNode, c.disconnect(), c.connect(d), g = new Float32Array(d.frequencyBinCount), k = new Uint8Array(d.frequencyBinCount), m = new Uint8Array(d.frequencyBinCount), console.log("Live FFT initialized")) : (b = 1024, a.precalcFFT = kvg.core.assets.get("fft.json"), g = new Float32Array(b >> 2), k = new Uint8Array(b >> 2), m = new Uint8Array(b >> 2), console.log("Precalculated FFT initialized. Current configuration does not support real time calculation. Run on browser with web audio with local file reading allowed or from a server to enable live FFT."));
    a.FFT.db = g;
    a.FFT.frequency = k;
    a.FFT.waveform = m;
  }, f = function() {
    a.loaded = !0;
    console.log("Sound loaded ");
    a.onSoundLoaded.dispatch();
  };
})();
kvg.proxy = {};
(function() {
  kvg.proxy = function() {
  };
})();
kvg.util.random = {};
(function() {
  var a = kvg.util.random;
  a.init = function(b) {
    a.seed = b;
    a.inited = !0;
    Math.random = a.nextFloat;
  };
  a.next = function() {
    a.inited || a.init(1237);
    a.seed = 16807 * a.seed % 4294967295;
    return a.seed;
  };
  a.getRange = function(b, e) {
    var c = a.nextFloat();
    return Math.floor(c * (e - b) + b);
  };
  a.nextFloat = function() {
    a.inited || a.init(1237);
    return a.next() / 4294967295;
  };
})();
kvg.graphics.post.RGBShift = {};
(function() {
  var a = kvg.graphics.post;
  a.RGBShift = function(a, c, d) {
    this.uniforms = b.uniforms;
    this.uniforms.rshift.value = a;
    this.uniforms.gshift.value = c;
    this.uniforms.bshift.value = d;
    this.material = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment});
    this.enabled = !0;
    this.renderToScreen = !1;
    this.needsSwap = !0;
  };
  a.RGBShift.prototype.render = function(a, c, d, b) {
    this.uniforms.tDiffuse.value = d;
    THREE.EffectComposer.quad.material = this.material;
    this.renderToScreen ? a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera) : a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, c, !1);
  };
  var b = {attributes:{}, uniforms:{gshift:{type:"f", value:0}, rshift:{type:"f", value:0}, bshift:{type:"f", value:0}, zoom:{type:"f", value:0}, resolution:{type:"v2", value:new THREE.Vector2(1280, 720)}, time:{type:"f", value:164}, tear:{type:"f", value:0}, rndStrength:{type:"f", value:0}, color:{type:"v3", value:new THREE.Vector3(0, 0, 0)}, tDiffuse:{type:"t"}, pixelate:{type:"v2", value:new THREE.Vector2(1280, 720)}, pixelsize:{type:"v2", value:new THREE.Vector2(0, 0)}, pixelcenter:{type:"v2", 
  value:new THREE.Vector2(.5, .5)}}, vertex:"varying vec2 vUv;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\n}", fragment:"varying vec2 vUv;\nuniform vec2 resolution;\nuniform vec2 pixelate;\nuniform vec2 pixelsize;\nuniform vec2 pixelcenter;\nuniform float time;\nuniform float tear;\nuniform float rshift;\nuniform float gshift;\nuniform float bshift;\nuniform sampler2D tDiffuse;\nuniform vec3 color;\nuniform float rndStrength;\nfloat rand(vec2 co){\nreturn fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\nvoid main() {\nvec2 uv = gl_FragCoord.xy;\nfloat rnd =rndStrength* rand(vec2(time*0.5*uv.x, time*uv.y*1.2));\nvec2 uv2 = vUv;\nuv2.x = abs(uv2.y-pixelcenter.x) > pixelsize.x ? uv2.x : floor(uv2.x*pixelate.x)/pixelate.x;\nuv2.y = abs(uv2.x-pixelcenter.y) > pixelsize.y ? uv2.y : floor(uv2.y*pixelate.y)/pixelate.y;\nuv2.x += tear*rnd*sin(time);\nvec4 c = texture2D(tDiffuse,uv2);\nvec4 ro = texture2D(tDiffuse,vec2(uv2.x-rshift, uv2.y));\nvec4 go = texture2D(tDiffuse,vec2(uv2.x-gshift, uv2.y));\nvec4 bo = texture2D(tDiffuse,vec2(uv2.x-bshift, uv2.y));\nc = vec4(ro.r, go.g, bo.b, c.w);\ngl_FragColor = c *1.0 + 0.12* vec4(rnd*0.25+color.r,rnd*0.25+color.g,rnd*0.250+color.b,0);\n}"};
})();
kvg.graphics.post.StandardShader = {};
(function() {
  var a = kvg.graphics.post;
  a.StandardShader = function(a) {
    this.uniforms = THREE.UniformsUtils.clone(b.uniforms);
    this.uniforms.gamma.value = a || 1.2;
    this.material = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:b.vertex, fragmentShader:b.fragment});
    this.enabled = !0;
    this.renderToScreen = !1;
    this.needsSwap = !0;
  };
  a.StandardShader.prototype.render = function(a, c, d, b) {
    this.uniforms.tDiffuse.value = d;
    THREE.EffectComposer.quad.material = this.material;
    this.renderToScreen ? a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera) : a.render(THREE.EffectComposer.scene, THREE.EffectComposer.camera, c, !1);
  };
  var b = {attributes:{}, uniforms:{brightness:{type:"f", value:0}, gamma:{type:"f", value:0}, tDiffuse:{type:"t"}}, vertex:"varying vec2 vUv;\nvoid main() {\nvec3 p = position;\nvUv = uv;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );\n}", fragment:"uniform float brightness;\nuniform float gamma;\nuniform sampler2D tDiffuse;\nvarying vec2 vUv;\nvoid main() {\nvec2 uv = vUv;\nvec4 c = texture2D(tDiffuse,uv);\nc = pow(c, vec4(1.0/gamma));\nc+=brightness;\ngl_FragColor = c;\n}"};
})();
kvg.graphics.demo = {};
(function() {
  var a = kvg.graphics.demo;
  a.Effect = function() {
    this.onInitialize = new signals.Signal;
    this.onUpdate = new signals.Signal;
    this.onRender = new signals.Signal;
  };
  a.Effect.setRenderPass = function(a) {
    this.renderPass = a;
  };
  a.Effect.prototype.initialize = function(a) {
    this.onInitialize.dispatch();
  };
  a.Effect.prototype.update = function(a, e, c) {
    this.time = a;
    this.partial = e;
    this.timesig = c;
    this.onUpdate.dispatch(elapsedtime, e, c);
  };
})();
kvg.debug = {};
kvg.debug.ManualControl = {};
(function() {
  var a = {};
  kvg.debug.ManualControl = a;
  var b = !1;
  a.init = function() {
    b || (b = !0, document.addEventListener("keydown", kvg.debug.ManualControl.handleKeyDown, !1), a.ctrlDown = !0, a.cameras = [], a.storedPoints = {});
  };
  a.attachCamera = function(b) {
    a.cameras && a.cameras.push(b);
  };
  a.handleKeyDown = function(b) {
    console.log("keydown " + b.keyCode);
    "17" == b.keyCode && (a.ctrlDown = !1, document.addEventListener("keyup", function(c) {
      "17" == c.keyCode && (a.ctrlDown = !0);
    }));
    for (var c = 0;c < a.cameras.length;c++) {
      var d = a.cameras[c];
      if (null != d && null != d.part && d.part.renderToScreen) {
        var g = new THREE.Vector3(0, 0, -1 * (a.ctrlDown ? 10 : 1)), k = new THREE.Vector3(-1 * (a.ctrlDown ? 10 : 1), 0, 0), m = new THREE.Vector3(1 * (a.ctrlDown ? 10 : 1), 0, 0), l = new THREE.Vector3(0, 1 * (a.ctrlDown ? 10 : 1), 0), f = new THREE.Vector3(0, -1 * (a.ctrlDown ? 10 : 1), 0), p = new THREE.Vector3(0, 0, -1 * (a.ctrlDown ? 10 : 1)), q = new THREE.Vector3(0, 0, 1 * (a.ctrlDown ? 10 : 1)), t = new THREE.Vector3(0, 0, .1 * (a.ctrlDown ? 10 : 1)), u = new THREE.Vector3(.1 * (a.ctrlDown ? 
        10 : 1), 0, 0), v = new THREE.Vector3(0, .1 * (a.ctrlDown ? 10 : 1), 0), r = new THREE.Vector3(0, -.1 * (a.ctrlDown ? 10 : 1), 0);
        g.applyQuaternion(d.quaternion);
        k.applyQuaternion(d.quaternion);
        m.applyQuaternion(d.quaternion);
        l.applyQuaternion(d.quaternion);
        f.applyQuaternion(d.quaternion);
        p.applyQuaternion(d.quaternion);
        q.applyQuaternion(d.quaternion);
        t.applyQuaternion(d.quaternion);
        u.applyQuaternion(d.quaternion);
        v.applyQuaternion(d.quaternion);
        r.applyQuaternion(d.quaternion);
        "37" == b.keyCode && d.position.add(k);
        "39" == b.keyCode && d.position.add(m);
        "38" == b.keyCode && d.position.add(l);
        "40" == b.keyCode && d.position.add(f);
        "79" == b.keyCode && d.position.add(p);
        "76" == b.keyCode && d.position.add(q);
        "65" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(0, 1, 0), .01 * (a.ctrlDown ? 10 : 1));
        "68" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(0, 1, 0), -.01 * (a.ctrlDown ? 10 : 1));
        "87" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(1, 0, 0), .01 * (a.ctrlDown ? 10 : 1));
        "83" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(1, 0, 0), -.01 * (a.ctrlDown ? 10 : 1));
        "81" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(0, 0, 1), .01 * (a.ctrlDown ? 10 : 1));
        "69" == b.keyCode && d.rotateOnAxis(new THREE.Vector3(0, 0, 1), -.01 * (a.ctrlDown ? 10 : 1));
        "80" == b.keyCode && (kvg.demo.CameraController.stopAllControl(), console.log("--- " + d.name + " ---"), console.log("Pos: x: " + d.position.x + " y: " + d.position.y + " z: " + d.position.z), console.log("Dir: " + g.x + ", " + g.y + ", " + g.z), console.log("Look at: "), k = d.position.clone().add(g), console.log(k.x + ", " + k.y + ", " + k.z), console.log("Camera rotations: x " + d.rotation.x + " y " + d.rotation.y + " z " + d.rotation.z + " Array ( " + d.rotation.x + "," + d.rotation.y + 
        "," + d.rotation.z + " )"));
        "84" == b.keyCode && (console.log("point stored"), null == a.storedPoints[d.name] && (a.storedPoints[d.name] = {pos:[], rot:[], look:[]}), k = d.position.clone().add(g), a.storedPoints[d.name].pos.push("new THREE.Vector3(" + Math.round(d.position.x) + "," + Math.round(d.position.y) + "," + Math.round(d.position.z) + ")"), a.storedPoints[d.name].rot.push("new THREE.Vector3(" + Math.round(d.rotation.x) + "," + Math.round(d.rotation.y) + "," + Math.round(d.rotation.z) + ")\n"), a.storedPoints[d.name].look.push("new THREE.Vector3(" + 
        Math.round(k.x) + "," + Math.round(k.y) + "," + Math.round(k.z) + ")"));
        if ("82" == b.keyCode) {
          console.log("------------------------");
          for (point in a.storedPoints) {
            console.log("--- " + point + " ---"), console.log("[\r\n" + a.storedPoints[point].pos.join(",\r\n") + "],[\r\n" + a.storedPoints[point].look.join(",\r\n") + "]");
          }
          storedPoints = {};
        }
      }
    }
  };
})();
kvg.core.demo = {};
(function() {
  var a = kvg.core.demo;
  a.initialize = function() {
    kvg.util.random.init(kvg.Config.SEED);
    kvg.Config.DEBUG && kvg.debug.ManualControl.init();
    kvg.debug.ShaderController.init();
    a.previousTS = (new kvg.core.TimeSig).fromTime(0);
    if (null === kvg.Config) {
      throw Error("Config not found");
    }
    a.parts = {};
    for (part in kvg.Config.PARTS) {
      if ("string" === typeof kvg.Config.PARTS[part]) {
        for (var g = kvg.Config.PARTS[part].split("."), e = window, m = 0;m < g.length;m++) {
          e = e[g[m]];
        }
        a.parts[part] = new e;
      } else {
        a.parts[part] = kvg.Config.PARTS[part]();
      }
    }
    for (part in a.parts) {
      a.parts[part].id = part, a.parts[part].init();
    }
    for (part in a.parts) {
      a.parts[part].postInit();
    }
    for (part in a.parts) {
      a.parts[part].render();
    }
    for (timeline in kvg.Config.TIMELINE) {
      timeline = kvg.Config.TIMELINE[timeline], timeline.transitionIn ? (g = timeline.start.clone(), g.add(timeline.transitionIn), console.log("TRANS BEGIN " + g), timeline.tbegin = g) : timeline.tbegin = timeline.start, timeline.transitionOut ? (g = timeline.begin.clone(), g.subtract(timeline.transitionOut), timeline.tend = g) : timeline.tend = timeline.end;
    }
    kvg.sound.onSoundReady.add(b);
    kvg.sound.onSoundComplete.add(d);
    kvg.core.graphics.onRender.add(c);
  };
  a.start = function() {
    a.clock = new THREE.Clock;
    console.log("Demo starting");
    $("#demo canvas").css("display", "none");
    kvg.core.graphics.start();
    a.interval = setInterval(e, 33);
    setTimeout(kvg.sound.start, 1E3);
  };
  var b = function() {
  };
  a.end = function() {
    console.log("Demo ended, thanks for watching.");
    clearInterval(a.interval);
    kvg.core.graphics.stop();
  };
  var e = function() {
    var c = kvg.sound.getPosition(), b = a.clock.getDelta();
    createjs.Tween.tick(b, !1);
    !this.visible && 0 < c.toMilliseconds() && (this.visible = !0, $("#demo canvas").css("display", ""));
    for (var d = 0;d < kvg.Config.TIMELINE.length;d++) {
      var e = kvg.Config.TIMELINE[d];
      if (c.isInside(e.tbegin, e.tend)) {
        var f = a.parts[e.part], p = c.isInside(e.tbegin, e.start) || c.isInside(e.end, e.tend);
        f.inTransition = p;
        f.setRenderToScreen(e.rts && !p);
        f.running || (f.tl = e, f.begin = e.tbegin, f.start());
        f._wasInside = !0;
      }
    }
    for (name in a.parts) {
      if (f = a.parts[name], !f._wasInside && f.running) {
        f.stop();
      } else {
        if (f.running) {
          f._wasInside = !1;
          d = f.tl.tend.toMilliseconds() - f.tl.tbegin.toMilliseconds();
          e = 0;
          0 < d && (e = (c.toMilliseconds() - f.tl.tbegin.toMilliseconds()) / d);
          f.update(c, e, b);
          for (var q in f.effects) {
            q = f.effects[q], q.update(c, e, b);
          }
        }
      }
    }
    for (;a.previousTS.isSmallerThan(c);) {
      for (name in a.parts) {
        f = a.parts[name], f.running && f.trigger.forEach(function(c, b) {
          var d = b.matchesPattern(a.previousTS, f.begin);
          if (d && !b._triggered) {
            for (b._triggered = !0, d = 0;d < c.length;d++) {
              c[d] ? c[d].call(f, a.previousTS) : alert("Trigger given but not found.");
            }
          } else {
            d || (b._triggered = !1);
          }
        });
      }
      a.previousTS.addTicks(1);
    }
  }, c = function() {
    var c = null, b = null;
    for (name in a.parts) {
      var d = a.parts[name];
      d.inTransition ? d.render(a.previousTS) : d.running && (null == c && d.renderToScreen ? c = d : d.render(a.previousTS));
      d._debug_renderToScreen && (b = d);
    }
    c ? console.log(c.id) : console.log("no rts");
    c && c.render(a.previousTS);
    b && b.render(a.previousTS);
  }, d = function() {
    a.end();
  };
})();
kvg.setup = {};
(function() {
  function a(a) {
    $("#setup").hide();
    BigScreen.enabled ? BigScreen.request($("#demo")[0], b, e, c) : alert("Something went wrong while setting fullscreen. Try again or run in windowed mode");
  }
  function b() {
    $("#muted input").is(":checked") && kvg.sound.setVolume(0);
    w = screen.width;
    h = screen.height;
    var a = 1280 / 720, c = "on" === $("#aspectLock input").val();
    c && 1 * w / a < h ? h = 720 * screen.width / 1280 : c && h < 1 * w / a && (w = 1280 * screen.height / 720);
    kvg.core.graphics.initWebGL({width:w, height:h, clearColor:2105376});
    g();
  }
  function e() {
  }
  function c() {
    alert("Error starting fullscreen. Try again or run in window.");
    console.log("Could not start fullscreen");
  }
  function d(a) {
    $("#setup").hide();
    $("#demo").css("transform", "").css("-webkit-transform", "");
    a = "on" === $("#aspectLock input").val();
    var c = $("#muted input").is(":checked"), d = $("#resolution .active input[name='options']").val(), b = 1280, e = 720;
    "b" === d ? (b = 1920, e = 1080) : "c" === d && (b = window.innerWidth, e = window.innerHeight, d = 1280 / 720, a && 1 * b / d < e ? e = 720 * window.innerWidth / 1280 : a && e < 1 * b / d && (b = 1280 * window.innerHeight / 720));
    $("#demo").css("width", b).css("height", e);
    kvg.core.graphics.initWebGL({width:b, height:e, clearColor:2105376});
    c && kvg.sound.setVolume(0);
    g();
  }
  function g() {
    kvg.core.demo.initialize();
    kvg.sound.loaded ? kvg.core.demo.start() : kvg.sound.onSoundLoaded.add(k);
  }
  function k() {
    kvg.core.demo.start();
  }
  kvg.setup.init = function() {
    var c = $("#setup");
    c.find("#resolution");
    var b = c.find("#fullscreen"), c = c.find("#start");
    b.click(a);
    c.click(d);
  };
})();
(function() {
  kvg.debug.init = function() {
    kvg.Config && kvg.Config.DEBUG && $().ready(a);
  };
  var a = function() {
    var a = kvg.core.demo.start;
    kvg.core.demo.start = function() {
      a.call(kvg.core.demo);
      e(kvg.core.demo);
      setInterval(b, 33);
      document.addEventListener("keydown", function(a) {
        "109" != a.keyCode && "188" != a.keyCode || !kvg.sound.instance || (kvg.sound.instance.setPosition(kvg.sound.instance.getPosition() - 5E3), createjs.Tween.tick(-5E3, !1));
        "107" != a.keyCode && "190" != a.keyCode || !kvg.sound.instance || (kvg.sound.instance.setPosition(kvg.sound.instance.getPosition() + 5E3), createjs.Tween.tick(5E3, !1));
      }, !1);
    };
  }, b = function() {
    var a = kvg.sound.getPosition();
    $("#debug_timesig").html(a.toString() + "<br/>" + Math.round(a.toMilliseconds() / 100) / 10 + "s");
    for (n in kvg.core.demo.parts) {
      (a = kvg.core.demo.parts[n]) && a.running ? $("#debug_parts div").filter(function() {
        return $(this).text() === n;
      }).addClass("running") : $("#debug_parts div").filter(function() {
        return $(this).text() === n;
      }).removeClass("running");
    }
  }, e = function(a) {
    for (name in a.parts) {
      a = $('<div id="debug_' + name + '">' + name + "</div>"), $("#debug_parts").append(a), a.mouseover(c), a.mouseout(d);
    }
    kvg.core.graphics.onRender.add(g);
  }, c = function(a) {
    a = $(a.currentTarget).text();
    a = kvg.core.demo.parts[a];
    for (n in kvg.core.demo.parts) {
      kvg.core.demo.parts[n]._debug_renderToScreen = !1;
    }
    a && (a._debug_renderToScreen = !0, a.setRenderToScreen(!1));
  }, d = function(a) {
    for (n in kvg.core.demo.parts) {
      kvg.core.demo.parts[n] && (kvg.core.demo.parts[n]._debug_renderToScreen = !1);
    }
  }, g = function() {
  };
})();
kvg.debug.ShaderController = {};
(function() {
  function a(a, b) {
    if ("t" == a.type) {
      b.append(" - texture");
    } else {
      if ("f" == a.type && null != a.range) {
        var e = $("<input type='range' min='" + a.range[0] + "' max='" + a.range[1] + "' step='" + (a.range[1] - a.range[0]) / 1E3 + "' value='" + a.value + "'/>"), k = $("<span>" + a.value + "</span>"), m = $("<div></div>");
        e.on("input", function() {
          k.text(e.val());
          a.value = e.val();
        });
        m.append(e);
        m.append(k);
        b.append(m);
        Object.observe(a, function(a) {
          k.text(a[0].object.value);
        });
      } else {
        if ("f" == a.type) {
          e = $("<input type='number' value='" + a.value + "'/>"), b.append(e), e.on("input", function() {
            a.value = e.val();
          }), Object.observe(a, function(a) {
            e.val(a[0].object.value);
          });
        } else {
          if ("v2" == a.type) {
            var l = $("<input type='number' value='" + a.value.x + "'/>"), f = $("<input type='number' value='" + a.value.y + "'/>");
            b.append(l);
            b.append(f);
            l.on("input", function() {
              a.value.x = l.val();
            });
            f.on("input", function() {
              a.value.y = f.val();
            });
            Object.observe(a.value, function(b) {
              l.val(a.value.x);
              f.val(a.value.y);
            });
          } else {
            if ("v3" == a.type) {
              var l = $("<input type='number' value='" + a.value.x + "'/>"), f = $("<input type='number' value='" + a.value.y + "'/>"), p = $("<input type='number' value='" + a.value.z + "'/>");
              b.append(l);
              b.append(f);
              b.append(p);
              l.on("input", function() {
                a.value.x = l.val();
              });
              f.on("input", function() {
                a.value.y = f.val();
              });
              p.on("input", function() {
                a.value.z = p.val();
              });
              Object.observe(a.value, function(b) {
                l.val(a.value.x);
                f.val(a.value.y);
                p.val(a.value.z);
              });
            } else {
              if ("v4" == a.type) {
                var l = $("<input type='number' value='" + a.value.x + "'/>"), f = $("<input type='number' value='" + a.value.y + "'/>"), p = $("<input type='number' value='" + a.value.z + "'/>"), q = $("<input type='number' value='" + a.value.w + "'/>");
                b.append(l);
                b.append(f);
                b.append(p);
                b.append(q);
                l.on("input", function() {
                  a.value.x = l.val();
                });
                f.on("input", function() {
                  a.value.y = f.val();
                });
                p.on("input", function() {
                  a.value.z = p.val();
                });
                q.on("input", function() {
                  a.value.w = q.val();
                });
                Object.observe(a.value, function(b) {
                  l.val(a.value.x);
                  f.val(a.value.y);
                  p.val(a.value.z);
                  q.val(a.value.w);
                });
              }
            }
          }
        }
      }
    }
  }
  var b = kvg.debug.ShaderController = function() {
  }, e = b.shaders = [];
  b.init = function() {
    b.el = $("<div class='list-group'></div>");
    $("#shaderDebug").append(b.el);
  };
  b.attachShader = function(c, d) {
    var g = $("<li class='list-group-item'></li>"), k = $("<h6>" + d.id + "/" + c.name + "</h6>"), m = $("<ul></ul>");
    g.append(k);
    g.append(m);
    b.el.append(g);
    e.push({part:d, shader:c, el:g});
    for (uniform in c.uniforms) {
      g = $("<li>" + uniform + "</li>"), uniform = c.uniforms[uniform], a(uniform, g), m.append(g);
    }
  };
})();


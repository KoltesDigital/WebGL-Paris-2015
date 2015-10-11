function DemoBase() {
	"use strict";

	this.forcedRenderUpdate = false;
	this.model = new Model();

	this.init();

	return {
		get model() {
			return this.model;
		},
		get sceneList() {
			return this.sceneList.list();
		},
		set sceneList(newList) {
			this.sceneList.list(newList);
			this.forceRenderUpdate();
		},
		get audio() {
			return this.audio;
		}
	};
}

DemoBase.prototype.init = function () {

	if (!this.model.stage) {
		this.model.stage = document.createElement('div');
		this.model.stage.setAttribute('class', 'demo');
		document.getElementById('root').appendChild(this.model.stage);
		this.model.scale(false);

		if (1920 / window.innerWidth >= 1080 / window.innerHeight) {
			this.model.height(window.innerWidth * 1080 / 1920);
			this.model.width(window.innerWidth);
		} else {
			this.model.width(window.innerHeight * 1920 / 1080);
			this.model.height(window.innerHeight);
		}

		this.model.stage.style.cssText = 'padding-left:' + (window.innerWidth - this.model.width()) / 2 + 'px;' +
			'padding-top:' + (window.innerHeight - this.model.height()) / 2 + 'px;';

		var canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:absolute;top:0;background:#fff;left:' + (window.innerWidth - this.model.width()) / 2 + 'px;' +
			'top:' + (window.innerHeight - this.model.height()) / 2 + 'px;';
		canvas.width = this.model.width();
		canvas.height = this.model.height();
		this.model.twoDeeRenderer = canvas.getContext('2d');
		this.model.stage.appendChild(canvas);
	}
};

DemoBase.prototype.start = function () {

	if (!this.syncDevice) {
		this.syncDevice = new JSRocket.SyncDevice();
		this.model.sync = this.syncDevice;
	}

	if (this.model.demoMode) {
		this.syncDevice.setConfig({'rocketXML': this.model.ROCKET_URL});
		this.syncDevice.init('demo');
	} else {
		this.syncDevice.init();
	}
	var self = this;
	this.syncDevice.on('ready', function (e) {
		self.syncReady(e);
	});
	this.syncDevice.on('update', function (e) {
		self.onSyncUpdate(e);
	});
	this.syncDevice.on('play', function (e) {
		self.onPlay(e);
	});
	this.syncDevice.on('pause', function (e) {
		self.onPause(e);
	});
};

DemoBase.prototype.syncReady = function () {
	this.initAudio();
	this.initScenes();
};

DemoBase.prototype.initAudio = function () {
	this.audio = new Tune(this.model);

	this.audio.loopPoint(this.model.LOOP_POSITION);

	var self = this;

	this.audio.on('play', function () {
		self.onAudioReady();
	});
	this.audio.on('ended', function () {
		self.onEnded();
	});

	this.audio.create(this.model.AUDIO_URL);
};

DemoBase.prototype.onAudioReady = function () {

	console.log("Duration:", this.audio.duration(), "Rows:", this.audio.duration() * this.model.ROW_RATE);
	if (this.model.readyToRoll === false) {
		return;
	}

	//nuke callback
	this.audio.on("play", function () {
	});

	this.loop();
};

DemoBase.prototype.initScenes = function () {
	this.sceneList = new SceneList(this.model);

	var self = this;

	this.sceneList.on('ready', function () {
		self.onPreflightDone();
	});
};

DemoBase.prototype.onPreflightDone = function () {
	this.model.readyToRoll = true;

	if (this.model.demoMode) {
		this.audio.play();
	}
};

DemoBase.prototype.onPlay = function () {
	this.audio.volume(this.model.AUDIO_VOLUME);
	this.audio.position(this.row / this.model.ROW_RATE);
	this.audio.play();
	this.loop();
};

DemoBase.prototype.onPause = function () {
	this.audio.pause();

	this.row = this.audio.position() * this.model.ROW_RATE;
};

DemoBase.prototype.loop = function (t) {

	var self = this,
		position = this.audio.position() * this.model.ROW_RATE;

	if (this.audio.isPaused() === false) {
		this.syncDevice.update(position);
		if (!this.forcedRenderUpdate) {
			//requestAnimationFrame(this.loop.bind(this));

			window.requestAnimationFrame(function (t) {
				self.loop(t);
			});
		}
	}

	this.forcedRenderUpdate = false;
	if (position < (this.audio.duration() * this.model.ROW_RATE)) {
		this.sceneList.update(position, t);
	}
};

DemoBase.prototype.onEnded = function () {
	document.getElementById('root').classList.remove('cursorHidden');
};

DemoBase.prototype.onSyncUpdate = function (row) {

	//on interpolation change, we don't get a valid row
	if (!isNaN(row)) {
		this.row = row;
	}

	this.audio.position(this.row / this.model.ROW_RATE);

	this.loop();
};

DemoBase.prototype.pause = function (setPaused) {

	if ((setPaused === true) && (!this.audio.isPaused())) {
		this.audio.pause();
	} else if (this.audio.isPaused()) {
		this.audio.play();
		this.loop();
	}
};

DemoBase.prototype.forceRenderUpdate = function () {
	this.forcedRenderUpdate = true;
	this.loop();
};
var TRBLMaker = (function () {

    var _gui,
        _interaction;

    function start() {

        _gui = new TRBLMaker.GUI();
        _interaction = new TRBLMaker.Interaction();
    }

    return {
        start:start
    };
}());
var Model = function () {

	"use strict";

	var BPM = 170,
		ROWS_PER_BEAT = 8,
		ROW_RATE = BPM / 60 * ROWS_PER_BEAT;

	var TIMELINE_SCALE = 1, //width  of a row in px
		TIMELINE_DURATION = 600 * ROW_RATE, //rows
		TIMELINE_WIDTH = TIMELINE_DURATION * TIMELINE_SCALE,
		TIMELINE_CURSOR_PADDING = 3;

	var _cfg,
		_scale = true,
		_width = window.innerWidth,
		_height = window.innerHeight,
		_eventHandler = {
			"resize": function () {
			}
		};

	//this.demoMode;// = false;

	function updateDimension() {

		if (_scale) {
			_width = window.innerWidth;
			_height = window.innerHeight;
		}

		_eventHandler.resize(_width, _height);
	}

	window.onresize = updateDimension;

	function setFromObject(cfg) {

		_cfg = cfg;
	}

	function scale(newScale) {

		if ((newScale === false) || (newScale === true)) {
			_scale = newScale;
		}

		return _scale;
	}

	function width(newWidth) {

		if (!isNaN(newWidth)) {
			_width = newWidth;
		}

		return _width;
	}

	function height(newHeight) {

		if (!isNaN(newHeight)) {
			_height = newHeight;
		}

		return _height;
	}

	function setEvent(name, fn) {
		_eventHandler[name] = fn;
	}

	return {
		set: setFromObject,
		scale: scale,
		width: width,
		height: height,
		on: setEvent,
		get demoMode() {
			return ((window.location.hash).indexOf('jsrocket') === -1);
		},
		set demoMode(newMode) {
			console.log("demomode:", newMode);
			if (newMode === true) {
				(window.location.hash) = '';
			} else if (newMode === false) {
				(window.location.hash) = '#jsrocket';
			}
		},
		get TIMELINE_WIDTH() {
			return TIMELINE_WIDTH;
		},
		set TIMELINE_WIDTH(newWidth) {
			TIMELINE_WIDTH = newWidth;
		},
		get TIMELINE_DURATION() {
			return TIMELINE_DURATION;
		},
		set TIMELINE_DURATION(newDuration) {
			TIMELINE_DURATION = newDuration;
		},
		get TIMELINE_SCALE() {
			return TIMELINE_SCALE;
		},
		set TIMELINE_SCALE(newScale) {
			TIMELINE_SCALE = parseInt(newScale, 10);
			TIMELINE_WIDTH = TIMELINE_DURATION * TIMELINE_SCALE;
		},
		get TIMELINE_CURSOR_PADDING() {
			return TIMELINE_CURSOR_PADDING;
		},

		get BPM() {
			return BPM;
		},
		set BPM(newBPM) {
			BPM = newBPM;
			ROW_RATE = BPM / 60 * ROWS_PER_BEAT;
		},

		get ROWS_PER_BEAT() {
			return ROWS_PER_BEAT;
		},
		set ROWS_PER_BEAT(newRows) {
			ROWS_PER_BEAT = newRows;
		},
		get ROW_RATE() {
			return ROW_RATE;
		},
		set ROW_RATE(newRate) {
			ROW_RATE = newRate;
		}
	};
};
// mog
/*jslint devel: true, browser: true */
var Tune = function (model) {
	"use strict";

	var LOOP_POINT,
		_model = model,
		_audio,
		_url,
		_requestPlay = false,
		_loaded = false,
		_isPaused = true,
		_eventHandler = {
			"play": function () {
			},
			"ended": function () {
			}
		};

	function play() {

		_requestPlay = true;
		if (_audio && _loaded) {
			_audio.volume = _model.volume;
			_audio.play();
			_isPaused = false;
			_eventHandler.play();
		}
	}

	function onReady() {

		_audio.removeEventListener('canplaythrough', onReady);

		_loaded = true;

		if (_requestPlay === true) {
			play();
		}
	}

	function create(url) {

		_url = url;

		_audio = new Audio();

		//safari return nothing on this, all the other 'probably'
		if (_audio.canPlayType('audio/ogg; codecs="vorbis"') === "probably") {
			_url += '.ogg';
		} else {
			_url += '.mp3';
		}

		_audio.src = _url;

		_audio.addEventListener('canplaythrough', onReady);
		_audio.addEventListener('timeupdate', function () {
			if (_audio.currentTime >= _audio.duration - 0.25) {
				_eventHandler.ended();
			}
		}, false);

		_audio.load();
	}

	function pause() {

		if (_audio) {
			_audio.pause();
			_isPaused = true;
		}
	}

	function volume(vol) {

		if (_audio && !isNaN(vol)) {
			_audio.volume = vol;
		}

		return _audio.volume;
	}

	function isPaused() {

		return _isPaused;
	}

	function getURL() {

		return _url;
	}

	function position(newPosition) {

		if (_audio) {

			if (newPosition && newPosition <= duration()) {
				_audio.currentTime = newPosition;
			}

			return _audio.currentTime;
		}

		return 0;
	}

	function duration() {

		if (_audio) {
			return _audio.duration;
		} else {
			return NaN;
		}
	}

	function setEvent(name, fn) {
		_eventHandler[name] = fn;
	}

	function setLoopPoint(loopTime) {
		if (!isNaN(loopTime)) {
			LOOP_POINT = loopTime;
		}
	}

	function playbackRate(newRate) {
		if (newRate) {
			_audio.playbackRate = newRate;
		}

		return _audio.playbackRate;
	}

	return { create: create,
		play: play,
		pause: pause,
		volume: volume,
		position: position,
		duration: duration,
		loopPoint: setLoopPoint,
		on: setEvent,
		isPaused: isPaused,
		getURL: getURL,
		playbackRate: playbackRate
	};
};
//mog
/*jslint devel: true, browser: true */
var SceneList = function (model) {
	"use strict";

	var _model = model,
		_sceneList = [],
		_previousMsTime = Date.now(),
		_row;

	var _theyCalled = 0;

	var _eventList = {
		"ready": function () {
		}
	};

	function add(scene, startTime, endTime) {

		_sceneList.push({
			'scene': scene,
			'startTime': startTime,
			'endTime': endTime,
			'duration': endTime - startTime,
			'active': false});
	}

	function callMeMaybe() {
		_theyCalled++;

		if (_theyCalled >= _sceneList.length) {

			_eventList.ready();
		}
	}

	function preflight() {

		for (var i = 0; i < _sceneList.length; i++) {
			_sceneList[i].scene.preflight(callMeMaybe, _sceneList[i].duration, _model);
		}
	}

	function update(row, timestamp) {

		_row = row;

		var i = 0,
			//on rocket row change we have no frameDelta, so set 16ms
			frameDelta = (timestamp - _previousMsTime) || 16;

		for (; i < _sceneList.length; i++) {

			if (((row >= _sceneList[i].endTime) || (row < _sceneList[i].startTime)) &&
				(_sceneList[i].active === true)) {

				//deactivate, but keep in list
				_sceneList[i].scene.clear();
				_sceneList[i].active = false;

			} else if ((row >= _sceneList[i].startTime) && (_sceneList[i].endTime > row)) {

				if (_sceneList[i].active === false) {

					//init
					_sceneList[i].scene.init();
					_sceneList[i].active = true;
				}

				//render row, sceneRow, frameDelta
				_sceneList[i].scene.render(row, (row - _sceneList[i].startTime), frameDelta);
			}
		}

		_previousMsTime = timestamp;
	}

	function list(newList) {
		if (newList) {
			_sceneList = newList;
		}
		else {
			return _sceneList;
		}
	}

	function getTiming() {
		return {
			'row': _row,
			'time': _row
		};
	}

	function setListener(evt, f) {
		_eventList[evt] = f;
	}

	return {
		add: add,
		on: setListener,
		preflight: preflight,
		update: update,
		list: list,
		getTiming: getTiming
	};
};
// keyj
// mog
/*jslint devel: true, browser: true */
var Random = (function () {
	"use strict";

	var x = 2323233,
		y = 8000085,
		z = 1333337,
		w = 4242424;

	function seed(newX, newY, newZ, newW) {
		x = newX;
		y = newY;
		z = newZ;
		w = newW;
	}

	function xor128() {
		var t = x ^ (x << 11);
		x = y;
		y = z;
		z = w;
		w = w ^ (w >>> 19) ^ (t ^ (t >>> 8));
		return (w < 0) ? (w + 4294967296) : w;
	}

	function xor128Float() {
		return (xor128() * (1 / 4294967296));
	}

	function range(min, max) {
		return xor128Float() * (max - min + 1) + min;
	}

	function color() {
		return "#" + ((1 << 24) * xor128Float() | 0).toString(16);
	}

	function uniqueID() {
		return Math.random().toString(36).substr(2, 8);
	}

	return {
		int: xor128,
		float: xor128Float,
		range: range,
		color: color,
		uniqueID: uniqueID,
		seed: seed
	};
}());
// mog
/*jslint devel: true, browser: true */

var ImgLoader = function () {

    "use strict";

    var _resource = [],
        _resourceURL = [],
        _callback,
        _loaded = 0;

    function load(resourceURL, callback) {

        _resourceURL = resourceURL;

        _callback = callback;

        for (var entry in _resourceURL) {

            for (var key in _resourceURL[entry]) {

                var img = document.createElement('img');
                img.onload = loadGuard;
                img.src = _resourceURL[entry][key];

                _resource[key] = img;
            }
        }
    }

    function loadGuard() {

        _loaded++;

        if (_loaded === _resourceURL.length) {

            _callback(_resource);
        }
    }

    return {
        load:load,
        resource:_resource
    };
};
function Effect(){

}

Effect.prototype.setContext = function(newContext){
    console.log(newContext);
    this.ctx = newContext;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
};
function Noise() {
	Effect.call(this);
}

Noise.prototype = Object.create(Effect.prototype);
Noise.prototype.render = function () {

	for (var y = 0; y < this.scaledHeight; y++) {
		for (var x = 0; x < this.scaledWidth; x++) {
			var col = Math.round(Random.float() * 100);
			this.bctx.fillStyle = '#' + col + '' + col + '' + col;
			this.bctx.fillRect(x, y, 1, 1);
		}
	}

	var pattern = this.ctx.createPattern(this.bctx.canvas, 'repeat');
	this.ctx.save();
	this.ctx.rect(0, 0, this.width, this.height);
	this.ctx.fillStyle = pattern;
	this.ctx.fill();
	this.ctx.restore();
};

Noise.prototype.init = function () {

};

Noise.prototype.clear = function () {

};

Noise.prototype.setContext = function (newContext) {
	console.log("setContext");
	Effect.prototype.setContext(newContext);

	this.bctx = document.createElement('canvas').getContext('2d');

	this.scaledWidth = this.width / 8;
	this.scaledHeight = this.height / 8;
	this.bctx.canvas.width = this.scaledWidth;
	this.bctx.canvas.height = this.scaledHeight;
};
Noise.prototype.constructor = Noise;
var TRBLz = { REVISION: '0' };

TRBLz.deg2rad = Math.PI / 180.0;
//*
TRBLz.Vector4 = function(_x, _y, _z, _w) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.w = _w;
};

TRBLz.Vector4.prototype.toString = function() {
    return "< " + this.x.toFixed(2) +
           ", " + this.y.toFixed(2) +
           ", " + this.z.toFixed(2) +
           ", " + this.w.toFixed(2) + " >";
};

TRBLz.Vector4.prototype.set = function(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    this.w = other.w;
};

TRBLz.Vector4.prototype._mul = function(m, x, y, z, w) {
    this.x = m.xx * x + m.yx * y + m.zx * z + m.wx * w;
    this.y = m.xy * x + m.yy * y + m.zy * z + m.wy * w;
    this.z = m.xz * x + m.yz * y + m.zz * z + m.wz * w;
    this.w = m.xw * x + m.yw * y + m.zw * z + m.ww * w;
    return this;
};

TRBLz.Vector4.prototype.set_mul = function(m, v) {
    return this._mul(m, v.x, v.y, v.z, v.w);
};

TRBLz.Vector4.prototype.mul = function(m) {
    return this._mul(m, this.x, this.y, this.z, this.w);
};

/*/
TRBLz.Vector4 = function(_x, _y, _z, _w) {

    var x = _x,
        y = _y,
        z = _z,
        w = _w;
        
    function toString() {
        return "< " + x.toFixed(2) +
            ", " + y.toFixed(2) +
            ", " + z.toFixed(2) +
            ", " + w.toFixed(2) + " >";
    }

    function set(other) {
        x = other.x;
        y = other.y;
        z = other.z;
        w = other.w;
    }

    function _mul(mp, xp, yp, zp, wp) {
        x = mp.xx * xp + mp.yx * yp + mp.zx * zp + mp.wx * wp;
        y = mp.xy * xp + mp.yy * yp + mp.zy * zp + mp.wy * wp;
        z = mp.xz * xp + mp.yz * yp + mp.zz * zp + mp.wz * wp;
        w = mp.xw * xp + mp.yw * yp + mp.zw * zp + mp.ww * wp;
        return {"x":x, "y":y, "z":z, "w":w};
    }

    function set_mul(mp, v) {
        return _mul(mp, v.x, v.y, v.z, v.w);
    }

    function mul(m) {
        return _mul(m, x, y, z, w);
    }
    
    return {
        toString:toString,
        set:set,
        set_mul:set_mul,
        mul:mul,
        get x(){return x;},
        set x(newX){x = newX;},
        get y(){return y;},
        set y(newY){y = newY;},
        get z(){return z;},
        set z(newZ){z = newZ;},
        get w(){return w;},
        set w(newW){w = newW;}
    };
};//*/
TRBLz.Matrix4 = function() {
    this.set_identity();
};

TRBLz.Matrix4.prototype = {
    get xx() { return this.m[ 0]; },  set xx(f) { this.m[ 0] = f; },
    get xy() { return this.m[ 1]; },  set xy(f) { this.m[ 1] = f; },
    get xz() { return this.m[ 2]; },  set xz(f) { this.m[ 2] = f; },
    get xw() { return this.m[ 3]; },  set xw(f) { this.m[ 3] = f; },
    get yx() { return this.m[ 4]; },  set yx(f) { this.m[ 4] = f; },
    get yy() { return this.m[ 5]; },  set yy(f) { this.m[ 5] = f; },
    get yz() { return this.m[ 6]; },  set yz(f) { this.m[ 6] = f; },
    get yw() { return this.m[ 7]; },  set yw(f) { this.m[ 7] = f; },
    get zx() { return this.m[ 8]; },  set zx(f) { this.m[ 8] = f; },
    get zy() { return this.m[ 9]; },  set zy(f) { this.m[ 9] = f; },
    get zz() { return this.m[10]; },  set zz(f) { this.m[10] = f; },
    get zw() { return this.m[11]; },  set zw(f) { this.m[11] = f; },
    get wx() { return this.m[12]; },  set wx(f) { this.m[12] = f; },
    get wy() { return this.m[13]; },  set wy(f) { this.m[13] = f; },
    get wz() { return this.m[14]; },  set wz(f) { this.m[14] = f; },
    get ww() { return this.m[15]; },  set ww(f) { this.m[15] = f; }
};

TRBLz.Matrix4.prototype.toString = function() {
    var f2s = function(f) { return ("        " + f.toFixed(2)).slice(-8); };
    return "/" + f2s(this.xx) + f2s(this.yx) + f2s(this.zx) + f2s(this.wx) + " \\\n" +
           "|" + f2s(this.xy) + f2s(this.yy) + f2s(this.zy) + f2s(this.wy) + " |\n" +
           "|" + f2s(this.xz) + f2s(this.yz) + f2s(this.zz) + f2s(this.wz) + " |\n" +
          "\\" + f2s(this.xw) + f2s(this.yw) + f2s(this.zw) + f2s(this.ww) + " /";
};

TRBLz.Matrix4.prototype.set = function(other) {
    this.m = [ other.xx, other.xy, other.xz, other.xw,
               other.yx, other.yy, other.yz, other.yw,
               other.zx, other.zy, other.zz, other.zw,
               other.wx, other.wy, other.wz, other.ww ];
    return this;
};

TRBLz.Matrix4.prototype.set_identity = function() {
    this.m = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    return this;
};

TRBLz.Matrix4.prototype.set_mul = function(a, b) {
    // replace the matrix atomically, because 'a' or 'b' might be 'this'
    this.m = [ a.xx*b.xx + a.yx*b.xy + a.zx*b.xz + a.wx*b.xw,
               a.xy*b.xx + a.yy*b.xy + a.zy*b.xz + a.wy*b.xw,
               a.xz*b.xx + a.yz*b.xy + a.zz*b.xz + a.wz*b.xw,
               a.xw*b.xx + a.yw*b.xy + a.zw*b.xz + a.ww*b.xw,
               a.xx*b.yx + a.yx*b.yy + a.zx*b.yz + a.wx*b.yw,
               a.xy*b.yx + a.yy*b.yy + a.zy*b.yz + a.wy*b.yw,
               a.xz*b.yx + a.yz*b.yy + a.zz*b.yz + a.wz*b.yw,
               a.xw*b.yx + a.yw*b.yy + a.zw*b.yz + a.ww*b.yw,
               a.xx*b.zx + a.yx*b.zy + a.zx*b.zz + a.wx*b.zw,
               a.xy*b.zx + a.yy*b.zy + a.zy*b.zz + a.wy*b.zw,
               a.xz*b.zx + a.yz*b.zy + a.zz*b.zz + a.wz*b.zw,
               a.xw*b.zx + a.yw*b.zy + a.zw*b.zz + a.ww*b.zw,
               a.xx*b.wx + a.yx*b.wy + a.zx*b.wz + a.wx*b.ww,
               a.xy*b.wx + a.yy*b.wy + a.zy*b.wz + a.wy*b.ww,
               a.xz*b.wx + a.yz*b.wy + a.zz*b.wz + a.wz*b.ww,
               a.xw*b.wx + a.yw*b.wy + a.zw*b.wz + a.ww*b.ww ];
    return this;
};

TRBLz.Matrix4.prototype.set_translate = function(x, y, z) {
    this.m = [ 1.0, 0.0, 0.0, 0.0,
               0.0, 1.0, 0.0, 0.0,
               0.0, 0.0, 1.0, 0.0,
               x,   y,   z,   1.0 ];
    return this;
};

TRBLz.Matrix4.prototype.translate = function(x, y, z) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_translate(x, y, z));
};

TRBLz.Matrix4.prototype.set_scale = function(x, y, z) {
    this.m = [ x,   0.0, 0.0, 0.0,
               0.0, y,   0.0, 0.0,
               0.0, 0.0, z,   0.0,
               0.0, 0.0, 0.0, 1.0 ];
    return this;
};

TRBLz.Matrix4.prototype.scale = function(x, y, z) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_scale(x, y, z));
};

TRBLz.Matrix4.prototype.set_rotate = function(degrees, _x, _y, _z) {
    
    var n = 1.0 / Math.sqrt(_x*_x + _y*_y + _z*_z),
        x = _x * n,
        y = _y * n,
        z = _z * n,
        radians = degrees * TRBLz.deg2rad,
        s = Math.sin(radians),
        c = Math.cos(radians),
        cx = x * (1.0 - c),
        cy = y * (1.0 - c),
        cz = z * (1.0 - c);

    this.m = [ cx * x + c,
               cx * y + s * z,
               cx * z - s * y,
               0.0,
               cy * x - s * z,
               cy * y + c,
               cx * z + s * x,
               0.0,
               cz * x + s * y,
               cz * y - s * x,
               cz * z + c,
               0.0,
               0.0, 0.0, 0.0, 1.0 ];
    return this;
};

TRBLz.Matrix4.prototype.rotate = function(degrees, x, y, z) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_rotate(degrees, x, y, z));
};

TRBLz.Matrix4.prototype.set_ortho = function(left, right, bottom, top, zNear, zFar) {
    var rl = 1.0 / (left - right),
        tb = 1.0 / (bottom - top),
        fn = 1.0 / (zNear - zFar);

    this.m = [ -2.0 * rl, 0.0, 0.0, 0.0,
               0.0, -2.0 * tb, 0.0, 0.0,
               0.0, 0.0,  2.0 * fn, 0.0,
               rl * (right + left),
               tb * (top + bottom),
               fn * (zFar + zNear),
               1.0 ];

    return this;
};

TRBLz.Matrix4.prototype.ortho = function(left, right, bottom, top, zNear, zFar) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_ortho(left, right, bottom, top, zNear, zFar));
};

TRBLz.Matrix4.prototype.set_frustum = function(left, right, bottom, top, zNear, zFar) {
    
    var rl = 1.0 / (right - left),
        tb = 1.0 / (top - bottom),
        fn = 1.0 / (zNear - zFar);
        
    this.m = [ 2.0 * rl * zNear, 0.0, 0.0, 0.0,
               0.0, 2.0 * tb * zNear, 0.0, 0.0,
               rl * (right + left),
               tb * (top + bottom),
               fn * (zFar + zNear),
               -1.0,
               0.0, 0.0, 2.0 * fn * zFar * zNear, 0.0 ];

    return this;
};

TRBLz.Matrix4.prototype.frustum = function(left, right, bottom, top, zNear, zFar) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_frustum(left, right, bottom, top, zNear, zFar));
};

TRBLz.Matrix4.prototype.set_perspective = function(fovy, aspect, zNear, zFar) {
    
    var f = 1.0 / Math.tan(fovy * (0.5 * TRBLz.deg2rad)),
        nf = 1.0 / (zNear - zFar);
        
    this.m = [ f / aspect, 0.0, 0.0, 0.0,
               0.0, f, 0.0, 0.0,
               0.0, 0.0, (zFar + zNear) * nf, -1.0,
               0.0, 0.0, 2.0 * zFar * zNear * nf, 0.0 ];
               
    return this;
};

TRBLz.Matrix4.prototype.perspective = function(fovy, aspect, zNear, zFar) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_perspective(fovy, aspect, zNear, zFar));
};

TRBLz.Matrix4.prototype.set_look_at = function(ex, ey, ez, _cx, _cy, _cz, _ux, _uy, _uz) {
    // C = C - E  (turn the center position into a relative vector)
    var cx = _cx - ex,
        cy = _cy - ey,
        cz = _cz - ez,
        n = 1.0 / Math.sqrt(cx*cx + cy*cy + cz*cz);

    cx *= n;
    cy *= n;
    cz *= n;

    // S = C x U  (compute side vector)
    var sx = cy * _uz - cz * _uy,
        sy = cz * _ux - cx * _uz,
        sz = cx * _uy - cy * _ux;
    n = 1.0 / Math.sqrt(sx*sx + sy*sy + sz*sz);
    sx *= n;
    sy *= n;
    sz *= n;

    // U = S x C  (re-orthogonalize up vector)
    var ux = sy * cz - sz * cy,
        uy = sz * cx - sx * cz,
        uz = sx * cy - sy * cx;

    // build the rotation matrix first
    var rot = new TRBLz.Matrix4();
    rot.m = [ sx, ux, -cx, 0.0,
              sy, uy, -cy, 0.0,
              sz, uz, -cz, 0.0,
              0.0, 0.0, 0.0, 1.0 ];

    // finally, translate to eye position
    return this.set_mul(rot, (new TRBLz.Matrix4()).set_translate(-ex, -ey, -ez));
};

TRBLz.Matrix4.prototype.look_at = function(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    return this.set_mul(this, (new TRBLz.Matrix4()).set_look_at(ex, ey, ez, cx, cy, cz, ux, uy, uz));
};
TRBLz.Screen = function(canvas, width, height) {
    this.width = width;
    this.height = height;
    this.halfWidth = 0.5 * width;
    this.halfHeight = 0.5 * height;
    this.aspect = this.halfWidth / this.halfHeight;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d');
};

TRBLz.Screen.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
};
TRBLz.Vertice = function(x, y, z) {
    this.pos = new TRBLz.Vector4(x, y, z, 1.0);
    this.transformed = new TRBLz.Vector4(0.0, 0.0, 0.0, 0.0);
};

TRBLz.Vertice.prototype.toString = function() {
    return this.pos.toString() + " => " + this.transformed.toString();
};

TRBLz.Vertice.prototype.transform = function(matrix, screen) {
    this.transformed.set_mul(matrix, this.pos);

    // perform perspective division
    var w = 1.0 / this.transformed.w;
    this.transformed.x *= w;
    this.transformed.y *= w;
    this.transformed.z *= w;

    // convert from clip coordinates to device coordinates
    this.transformed.x = screen.halfWidth  * (1.0 + this.transformed.x);
    this.transformed.y = screen.halfHeight * (1.0 - this.transformed.y);
};
TRBLz.Mesh = function () {
    this.vertices = [];
    this.lines = [];
    this.faces = [];
};

TRBLz.Line = function(a, b) {
    this.a = a;
    this.b = b;
};

TRBLz.Mesh.prototype.toString = function() {
    var s = "Mesh with " + this.vertices.length + " vertices and " + this.lines.length + " lines:";
    for (var i = 0; i < this.vertices.length; i++) {
        s += "\n" + this.vertices[i].toString();
    }
    return s;
};

TRBLz.Mesh.prototype.transform = function(matrix, screen) {
    for (var i = 0; i < this.vertices.length; i++) {
        this.vertices[i].transform(matrix, screen);
    }
};

TRBLz.Mesh.prototype.drawPoints = function(screen) {
    screen.ctx.fillStyle = "#ff0000";
    for (var i = 0; i < this.vertices.length; i++) {
        var x = this.vertices[i].transformed.x,
            y = this.vertices[i].transformed.y,
            size = 12 - 10 * this.vertices[i].transformed.z;
        screen.ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
};
function compare(a, b){
    if(a.z > b.z) {
        return -1;
	} else if(a.z < b.z){
        return 1;
	} else {
        return 0;
	}
}
TRBLz.Mesh.prototype.drawVertices = function(screen) {

    var i,
        len,
        cull,
        zAvg,
        verticesToDraw = [],
        idx,
		z_dist;

    for (i = 0, len = this.faces.length; i < len; i++) {
        //dx1=x1-x2; dy1=y1-y2; dx2=x2-x3; dy2=y2-y3
        var dx1 = this.vertices[this.faces[i].A].transformed.x - this.vertices[this.faces[i].B].transformed.x,
            dy1 = this.vertices[this.faces[i].A].transformed.y - this.vertices[this.faces[i].B].transformed.y,

            dx2 = this.vertices[this.faces[i].B].transformed.x - this.vertices[this.faces[i].C].transformed.x,
            dy2 = this.vertices[this.faces[i].B].transformed.y - this.vertices[this.faces[i].C].transformed.y;

        //if (dx1*dy2 - dy1*dx2 < 0) cull_that_shit();
        cull = (dx1 * dy2) - (dy1 * dx2);
        if(cull >= 0){

            zAvg = Math.min(this.vertices[this.faces[i].A].transformed.z,this.vertices[this.faces[i].B].transformed.z,this.vertices[this.faces[i].C].transformed.z);

            //throw('');
            //TODO Bottleneck, creating object is costly and the approach might be naive
            verticesToDraw.push({"idx":i, "cull":cull, "z":zAvg});
        }
    }

    verticesToDraw.sort(compare);
	z_dist = Math.abs(verticesToDraw[0].z - verticesToDraw[verticesToDraw.length - 1].z);
	//throw("");
    for (i = 0, len = verticesToDraw.length; i < len; i++) {

        idx = verticesToDraw[i].idx;

        var col = 100 / z_dist * Math.abs(verticesToDraw[0].z - verticesToDraw[i].z);//Math.abs(verticesToDraw[i].z);
		//console.log(verticesToDraw[0].z - verticesToDraw[i].z, verticesToDraw[0].z, verticesToDraw[i].z, verticesToDraw[len - 1].z,  z_dist);
		//throw("");

        screen.ctx.strokeStyle = "hsl(8,55%, "+ col +"%)";
        screen.ctx.fillStyle = "hsl(8,55%, "+ col +"%)";

        screen.ctx.beginPath();
        screen.ctx.moveTo(this.vertices[this.faces[idx].A].transformed.x, this.vertices[this.faces[idx].A].transformed.y);
        screen.ctx.lineTo(this.vertices[this.faces[idx].B].transformed.x, this.vertices[this.faces[idx].B].transformed.y);
        screen.ctx.lineTo(this.vertices[this.faces[idx].C].transformed.x, this.vertices[this.faces[idx].C].transformed.y);

        screen.ctx.closePath();
        screen.ctx.fill();
        screen.ctx.stroke();
    }
};

TRBLz.Mesh.prototype.calculateSurfaceNormal = function(screen){
    
    var pIdx = 0,
        u = new TRBLz.Vector4(),
        v = new TRBLz.Vector4(),
        normal = new TRBLz.Vector4();
    
    screen.ctx.fillStyle = "#00ff00";
    screen.ctx.fillRect(this.vertices[pIdx].transformed.x, this.vertices[pIdx].transformed.y, 15, 3);
    screen.ctx.fillRect(this.vertices[pIdx + 1].transformed.x, this.vertices[pIdx + 1].transformed.y, 30, 3);
    screen.ctx.fillRect(this.vertices[pIdx + 2].transformed.x, this.vertices[pIdx + 2].transformed.y, 45, 3);
    
    u.x = this.vertices[pIdx + 1].pos.x - (this.vertices[pIdx].pos.x);
    u.y = this.vertices[pIdx + 1].pos.y - (this.vertices[pIdx].pos.y);
    u.z = this.vertices[pIdx + 1].pos.z - (this.vertices[pIdx].pos.z);
    //u.w = this.vertices[1].transformed.w + (this.vertices[0].transformed.w * -1);

    v.x = this.vertices[pIdx + 2].pos.x - (this.vertices[pIdx].pos.x);
    v.y = this.vertices[pIdx + 2].pos.y - (this.vertices[pIdx].pos.y);
    v.z = this.vertices[pIdx + 2].pos.z - (this.vertices[pIdx].pos.z);
    //v.w = this.vertices[2].transformed.w + (this.vertices[0].transformed.w * -1);

    normal.x = (u.y * v.z) - (u.z * v.y);
    normal.y = -(v.z * u.x) - (v.x * u.z);
    normal.z = (u.x * v.y) - (u.y * v.x);

    console.log("pew", normal);

    return normal;
};

TRBLz.Mesh.prototype.drawLines = function(screen) {
    screen.ctx.fillStyle = "#ff0000";
    var inPath = false;
    for (var i = 0; i < this.lines.length; i++) {
        var n = this.lines[i];
        if (n < 0) {
            if (inPath) {
                //screen.ctx.fill();
                screen.ctx.stroke();
            }
            inPath = false;
        } else {
            var x = this.vertices[n].transformed.x,
                y = this.vertices[n].transformed.y;
                
            if (inPath) {
                screen.ctx.lineTo(x, y);
            } else {
                screen.ctx.beginPath();
                screen.ctx.moveTo(x, y);
                inPath = true;
            }
        }
    }
    
    if (inPath) {
        screen.ctx.stroke();
    }
};
var Dither = function () {

	"use strict";

	var _ctx,
		_bctx,
		_ictx,
		_width,
		_height;

	var DIVISOR = 8,
		SCALE = 1,
		PIXEL_THRESHOLD,
		DIV_WIDTH,
		DIV_HEIGHT,
		_imgData,
		_pixData,
		_fillColor = '#5B97AB';

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		PIXEL_THRESHOLD = 4 / 1920 * _width;
	}

	function setContextInput(newContext) {
		_ictx = newContext;

		DIV_WIDTH = _ictx.canvas.width;
		DIV_HEIGHT = _ictx.canvas.height;

		_bctx = document.createElement('canvas').getContext('2d');
		_bctx.canvas.width = DIV_WIDTH;
		_bctx.canvas.height = DIV_HEIGHT;
	}

	function render() {

		_bctx.clearRect(0, 0, DIV_WIDTH, DIV_HEIGHT);
		//fix border issues when a bit of alpha is kept due resize
		_bctx.drawImage(_ictx.canvas, 0, 0, DIV_WIDTH + 2, DIV_HEIGHT + 2);

		_imgData = _bctx.getImageData(0, 0, DIV_WIDTH, DIV_HEIGHT);
		_pixData = _imgData.data;

		//_ctx.clearRect(0, 0, _width, _height);
		_ctx.fillStyle = '#C71616';

		for (var i = 0, len = _pixData.length, x = 0, y = 0; i < len; i += 4) {

			var size = (DIVISOR * 2) / 255 * _pixData[i + 3];

			if (size > PIXEL_THRESHOLD) {

				var posX = x * DIVISOR * SCALE,
					posY = y * DIVISOR * SCALE;

				if (y % 2 === 0) {
					posX = posX - ((DIVISOR * 2) / 2);
				}

				_ctx.fillRect(posX - (size * 0.5), posY - (size * 0.5), size, size);
				//_ctx.fillRect(((y % 2 ? x : x - 0.5) * DIVISOR * SCALE) + (size * 0.5), (y * DIVISOR * SCALE) + (size * 0.5), size, size);
			}

			if (++x >= DIV_WIDTH) {
				x = 0;
				y++;
			}
		}
	}

	function setFillColor(newColor) {
		_fillColor = newColor;
	}

	return {
		setContext: setContext,
		setContextInput: setContextInput,
		setFillColor: setFillColor,
		render: render
	};
};

var MetaBalls = function () {

	"use strict";

	var _ctx,
		_width,
		_height;

	var imgData,
		pixData;

	var _p = [],
		_textures = [];

	var AMOUNT = 45,
		THRESHOLD = 20, //gooability of the blob
		SPEED_MOVEMENT_MIN,
		SPEED_MOVEMENT_MAX,
		DIAMETER_MIN,
		DIAMETER_MAX;

	function setTextureArray(newArrayOfTextures) {
		_textures = newArrayOfTextures;
	}

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		SPEED_MOVEMENT_MIN = (1 / 1920 * _width) * -1;
		SPEED_MOVEMENT_MAX = 6 / 1920 * _width;
		DIAMETER_MIN = 80 / 1920 * _width;
		DIAMETER_MAX = 360 / 1920 * _width;

		init();
	}

	function init() {

		for (var i = 0; i < AMOUNT; i++) {
			var d = Random.range(DIAMETER_MIN, DIAMETER_MAX),
				speed = (SPEED_MOVEMENT_MAX - (d / DIAMETER_MAX * SPEED_MOVEMENT_MAX)) + SPEED_MOVEMENT_MIN;

			_p.push({
				"x": Random.range(d, _width - d),
				"y": Random.range(d, _height - d),
				"vX": speed * (Random.float() > 0.5 ? 1 : -1),
				"vY": speed * (Random.float() > 0.5 ? 1 : -1),
				"d": d,
				"t": Math.floor(Random.range(0, _textures.length - 1))
			});
		}
	}

	function render(frameDelta) {

		for (var i = 0; i < AMOUNT; i++) {

			var pDia = _p[i].d,
				w2 = _p[i].d * 0.5,
				x = _p[i].x + (_p[i].vX * frameDelta),
				y = _p[i].y + (_p[i].vY * frameDelta);

			if ((x > _width - w2) || (x < w2)) {
				_p[i].vX *= -1;
			}

			if ((y > _height - w2) || (y < w2)) {
				_p[i].vY *= -1;
			}

			_p[i].x = _p[i].x + (_p[i].vX * frameDelta);
			_p[i].y = _p[i].y + (_p[i].vY * frameDelta);

			_ctx.drawImage(_textures[_p[i].t], _p[i].x - pDia * 0.5, _p[i].y - pDia * 0.5, pDia, pDia);
		}

		imgData = _ctx.getImageData(0, 0, _width, _height);
		pixData = imgData.data;
		var len = pixData.length;
		for (i = 0; i < len; i += 4) {

			if (pixData[i + 3] < THRESHOLD) {
				pixData[i + 3] = 0;
			}
		}

		_ctx.putImageData(imgData, 0, 0);
	}

	return {
		render: render,
		setContext: setContext,
		setTextureArray: setTextureArray
	};
};
var Flower = function () {

	"use strict";

	var _ctx,
		_width,
		_height;

	var _p = [],
		_diameter = 0,
		_centerX,
		_centerY,
		_fillColor = "#3c3c3c",
		_lineColor = "#ffc100";

	var POINTS = 12,
		PARTS = 20,
		DIAMETER_INCREMENT,
		SPEED = 0.001,
		GROW_SPEED;

	var r = (360 / POINTS);

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		_centerX = _width / 2;
		_centerY = _height / 2;

		DIAMETER_INCREMENT = _width / PARTS;
		GROW_SPEED = 0.6 / 1920 * _width;
		init();
	}

	function init() {

		for (var i = 0; i < PARTS; i++) {

			_p.push({
					"start": 0,
					"diameter": i * DIAMETER_INCREMENT,
					"idx": [Math.floor(Random.range(0, 10))],
					"len": [1]}
			);
		}
	}

	function getShapeCoords(diameter, startRot) {

		var rot = startRot,
			pOut = [];

		for (var i = 0; i < POINTS; i++) {

			pOut.push({
				"x": _centerX + (Math.cos(rot) * diameter),
				"y": _centerY + (Math.sin(rot) * diameter),
				//edges
				"xLow": _centerX + (Math.cos(rot) * (diameter - 10)),
				"yLow": _centerY + (Math.sin(rot) * (diameter - 10)),
				"xHigh": _centerX + (Math.cos(rot - 0.1) * diameter),
				"yHigh": _centerY + (Math.sin(rot - 0.1) * diameter),
			});

			rot += r / 180 * Math.PI;
		}

		return pOut;
	}

	function setFillColor(newColor){
		_ctx.fillColor = newColor;
	}

	function setLineColor(newColor){
		_lineColor = newColor;
	}

	function render(frameDelta, row) {

		_ctx.strokeStyle = _lineColor;
		_ctx.lineWidth = 0.5;

		_ctx.fillStyle = _fillColor;
		_diameter = _diameter + (GROW_SPEED * frameDelta);

		if (_diameter >= _width / PARTS) {

			_p.unshift({
					"start": 0,
					"diameter": 0,
					"idx": [Math.floor(Random.range(0, 10)), Math.floor(Random.range(0, 10)), Math.floor(Random.range(0, 10))],
					"len": [1, 1, 1]}
			);

			//remove last
			_p.pop();

			_diameter = 0;
		}

		for (var i = 0; i < _p.length - 1; i++) {

			var iS = 1 / PARTS * i,
				iB = 1 / PARTS * (i + 1);

			var diaS = (iS * iS * (3 - 2 * iS) * DIAMETER_INCREMENT) + _diameter,
				diaB = (iB * iB * (3 - 2 * iB) * 3 * DIAMETER_INCREMENT) + _diameter;

			var c,
				s = getShapeCoords(diaS, _p[i].start + row * SPEED),
				b = getShapeCoords(diaB, _p[i + 1].start + row * SPEED);

			for (c = 0; c < _p[i].idx.length; c++) {
				var idx = _p[i].idx[c],
					toIdx = ((idx + _p[i].len[c]) > POINTS) ? ((idx + _p[i].len[c]) - POINTS) : idx + _p[i].len[c];

				_ctx.beginPath();
				_ctx.moveTo(s[idx].x, s[idx].y);
				_ctx.lineTo(s[toIdx].x, s[toIdx].y);

				_ctx.lineTo(b[toIdx].xLow, b[toIdx].yLow);
				_ctx.lineTo(b[toIdx].xHigh, b[toIdx].yHigh);

				_ctx.lineTo(b[idx].x, b[idx].y);
				_ctx.closePath();
				_ctx.fill();
				_ctx.stroke();
			}
		}
	}

	return {
		render: render,
		setContext: setContext,
		setFillColor:setFillColor,
		setLineColor:setLineColor
	};
};
var PolyTunnel = function () {

	var POINTS = 4,
		SEGMENTS = 20,
		MAX_Z,
		SEGMENT_DISTANCE;

	var passed;
	//console.log(MAX_Z, SEGMENTS, SEGMENT_DISTANCE);
	//throw("");
	var _ctx,
		_width,
		_height,
		_halfWidth,
		_p = [],
		_speed = 2,
		frameDelta;

	var START_X,
		START_Y;

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;
		_halfWidth = _width / 2;

		init();
	}

	function _byZ(a, b) {
		if (a.z > b.z) {
			return 1;
		}
		else if (a.z < b.z) {
			return -1;
		}

		return 0;
	}

	function init() {
		MAX_Z = Math.sqrt(Math.pow(_width, 2) + Math.pow(_height, 2));
		SEGMENT_DISTANCE = MAX_Z / SEGMENTS;

		for (var i = 0; i < SEGMENTS; i++) {
			_p.push({
				points: POINTS,
				z: i * SEGMENT_DISTANCE
			});
		}

		START_X = _halfWidth;
		START_Y = _height / 3;

		_p.sort(_byZ);
	}

	function setCenter(newX, newY){
		START_X = newX;
		START_Y = newY;
	}

	function render(frameDelta, row) {

		passed = 0;

		var lastGoodZ = MAX_Z,
			frameIncrement = _speed * (frameDelta / 10),
			rotationIncrement = ((360 / POINTS) / 180 * Math.PI);

		_ctx.fillStyle = '#000';
		_ctx.fillRect(0, 0, _width, _height);

		for (var i = 0; i < SEGMENTS - 1; i++) {

			_p[i].z += frameIncrement;

			if (_p[i].z < MAX_Z) {

				if (lastGoodZ > _p[i].z) {
					lastGoodZ = _p[i].z;
				}

				var nextSegmentZ = _p[i + 1].z + frameIncrement,
					easedZ_small = Math.pow(_p[i].z / MAX_Z, 1.8),
					easedZ_big = Math.pow(nextSegmentZ / MAX_Z, 1.8),
					diameter = easedZ_small * MAX_Z,
					nextDiameter = easedZ_big * MAX_Z;

				var rotAngleSmall = _p[i].z / MAX_Z + row / 8000,
					rotAngleBig = nextSegmentZ / MAX_Z + row / 8000,
					lightFalloff = 100 / 1 * easedZ_small;

				var startX = START_X + ((_halfWidth * 0.5) * (_p[i].z / MAX_Z)),
					startY = START_Y,
					nextStartX = _halfWidth + ((_halfWidth * 0.5) * (nextSegmentZ / MAX_Z));

				for (var c = 0; c < POINTS; c++) {

					_ctx.fillStyle = 'hsl(0, ' + (((c + 1) / POINTS) * 100) + '%, ' + lightFalloff + '%)';

					var x1_small = Math.round((Math.cos(rotAngleSmall + (rotationIncrement * c)) * diameter) + startX),
						y1_small = Math.round((Math.sin(rotAngleSmall + (rotationIncrement * c)) * diameter) + startY),
						x2_small = Math.round((Math.cos(rotAngleSmall + (rotationIncrement * (c + 1))) * diameter) + startX),
						y2_small = Math.round((Math.sin(rotAngleSmall + (rotationIncrement * (c + 1))) * diameter) + startY),

						x1_big = Math.round((Math.cos(rotAngleBig + (rotationIncrement * c)) * nextDiameter) + nextStartX),
						y1_big = Math.round((Math.sin(rotAngleBig + (rotationIncrement * c)) * nextDiameter) + startY),
						x2_big = Math.round((Math.cos(rotAngleBig + (rotationIncrement * (c + 1))) * nextDiameter) + nextStartX),
						y2_big = Math.round((Math.sin(rotAngleBig + (rotationIncrement * (c + 1))) * nextDiameter) + startY);

					_ctx.beginPath();
					_ctx.moveTo(x1_small, y1_small);
					_ctx.lineTo(x1_big, y1_big);
					_ctx.lineTo(x2_big, y2_big);
					_ctx.lineTo(x2_small, y2_small);
					_ctx.lineTo(x1_small, y1_small);
					_ctx.closePath();

					_ctx.fill();
				}
			} else {
				passed++;
			}
		}

		//second pass - add new for passed away ones
		for (i = 0; i < SEGMENTS; i++) {

			if (_p[i].z > MAX_Z) {
				_p[i] = {
					points: POINTS,
					z: lastGoodZ - (SEGMENT_DISTANCE * passed--)
				};
			}
		}

		_p.sort(_byZ);
	}

	return {
		setContext: setContext,
		render: render,
		setCenter:setCenter
	};
};
var Hopalong = function () {

	var _width,
		_height,
		_ctx,
		_bctx;

	var _num = 20000,
		_x = 1,
		_y = 1;

	var VAR_A = -14,
		VAR_B = 0.9,
		VAR_C;

	function setParams(newA, newB, newC){

		VAR_A = newA;
		VAR_B = newB;
		VAR_C = newC;
	}

	function render(row) {

		//hopalong(_x, _y, -14, 0.9, row * 0.05);
		hopalong(_x, _y, VAR_A, VAR_B, VAR_C);
	}

	function hopalong(x, y, a, b, c) {

		_ctx.fillStyle = '#101010';
		for (var i = 0; i < _num; ++i) {

			var xx = y - Math.round(x / Math.abs(x)) * Math.sqrt(Math.abs(b * x - c));
			var yy = a - x;
			x = xx;
			y = yy;

			_ctx.fillRect((_width * 0.5) + (x *0.5), (_height * 0.5) + (y * 0.5), 0.5, 0.5);
		}
	}

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		_bctx = document.createElement('canvas');
		_bctx.width = _width;
		_bctx.height = _height;
		_bctx = _bctx.getContext('2d');
	}

	return {
		setContext: setContext,
		render: render,
		setParams:setParams
	};
};
var ZLayerTiles = function () {

	var _ctx,
		_bctx,
		_width,
		_height,
		_halfWidth,
		_halfHeight,
		_layer,
		MAX_Z,
		MAX_SEGMENT = 10,
		DISTANCE = 2;

	function setContext(newContext) {
		_ctx = newContext;
		_width = newContext.canvas.width;
		_height = newContext.canvas.height;

		_halfWidth = _width * 0.5;
		_halfHeight = _height * 0.5;

		init();
	}

	function setContextInput(newContext) {
		_bctx = newContext;
	}

	function init() {

		_layer = [];

		MAX_Z = MAX_SEGMENT * DISTANCE;
		for (var i = 0; i < MAX_SEGMENT; i++) {
			_layer.push({
				"z": i * DISTANCE
			});
		}
	}

	function render(frameDelta) {
		var speed = (0.1 * frameDelta);

		_layer = _layer.sort(function (a, b) {
			return ((a.z > b.z) ? -1 : ((a.z < b.z) ? 1 : 0));
		});

		var shadowParticle = [];

		for (var i = 0; i < MAX_SEGMENT; i += 1) {

			var drawX = _halfWidth - (_halfWidth / _layer[i].z * 8),
				drawY = _halfHeight - (_halfHeight / _layer[i].z * 8),
				drawWidth = (_halfWidth - drawX) * 2,
				drawHeight = (_halfHeight - drawY) * 2;

			_layer[i].z -= speed;

			if (_layer[i].z < 0) {

				shadowParticle.push({
					"z": MAX_Z
				});

			} else {
				shadowParticle.push(_layer[i]);


				if (drawWidth > _halfWidth) {

					_ctx.save();
					_ctx.globalAlpha = Math.sin((_layer[i].z / MAX_Z) * (Math.PI));//0.1 + (1 / MAX_Z * _layer[i].z);
					_ctx.drawImage(_bctx.canvas, drawX, drawY, drawWidth, drawHeight);
					_ctx.restore();
				}
			}
		}

		_layer = shadowParticle;
	}

	return {
		setContext: setContext,
		setContextInput: setContextInput,
		render: render
	};
};
var LineBall = function () {

	var _width,
		_height,
		_ctx;

	var SPEED = 0.10;

	var _p = [],
		_pSmall = [];

	var d,
		wobble,
		xOffset,
		yOffset,
		cxOffset,
		cyOffset;

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		init();
	}

	function _byCoords(a, b) {
		return a.x > b.x || (a.x === b.x && a.y > b.y);
	}

	function init() {

		for (var i = 0; i < 80; i++) {
			_p.push({
				"x": Random.range(-(_width / 3), (_width / 3) * 2),
				"y": Random.range((_height / 3), _height + (_height / 3))
			});
		}

		for (i = 0; i < 15; i++) {
			_pSmall.push({
				"x": Random.range((_width / 6), (_width / 3)),
				"y": Random.range((_height / 3) * 2, _height - (_height / 6))
			});
		}

		_p.sort(_byCoords);
		_pSmall.sort(_byCoords);

		_ctx.lineWidth = 1 / 1080 * _height;
		wobble = (60 / 1080 * _height) * -1;
		d = (8 / 1080 * _height);
	}

	function render(row) {
		drawField(row, _p, "rgba(56,41,38,1)", "rgba(56,41,38,.3)");
		drawField(row, _pSmall, "rgba(254,254,252,1)", "rgba(254,254,252,.3)");
	}

	function drawField(row, pArray, color, strokeColor) {

		_ctx.strokeStyle = strokeColor;

		for (var i = 0, len = pArray.length; i < len; i++) {

			xOffset = Math[(i % 2 === 0) ? 'cos' : 'sin']((row + i) * SPEED) * wobble;
			yOffset = Math[(i % 2 === 0) ? 'sin' : 'cos']((row + i) * SPEED) * wobble;

			for (var c = i; c < len; c += 3) {
				_ctx.beginPath();
				_ctx.moveTo(pArray[i].x + xOffset, pArray[i].y + yOffset);

				cxOffset = Math[(c % 2 === 0) ? 'cos' : 'sin']((row + c) * SPEED) * wobble;
				cyOffset = Math[(c % 2 === 0) ? 'sin' : 'cos']((row + c) * SPEED) * wobble;
				_ctx.lineTo(pArray[c].x + cxOffset, pArray[c].y + cyOffset);
				_ctx.closePath();
				_ctx.stroke();
			}

			_ctx.fillStyle = color;
			_ctx.fillRect(pArray[i].x - (d / 2) + xOffset, pArray[i].y - (d / 2) + yOffset, d, d);
		}
	}

	return {
		setContext: setContext,
		render: render
	};
};
var TileTwister = function () {

	var _ctx,
		_width,
		_height;

	var _startX = 300,
		_startY = 0;

	var _scale = 1;

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		_startX = _width / 3 * 2;
		//_startY = 0 / 1920 * _height;
	}

	function render(row) {

		var d,
			i,
			maxD,
			dist;

		dist = (12 / 1080 * _height) * _scale;
		maxD = (80 / 1920 * _width) * _scale;
		for (i = 0; i < 40; i++) {
			d = (Math.cos((row + i) / 4) * maxD);
			drawBoard(_startX + (Math.cos(row / 8 + (i * 10)) * maxD),
				_startY + (i * (32 / 1080 * _height)),
				(dist + (d / maxD * 3)) * _scale,
				((90 / 1920 * _width) + d) * _scale);
		}

		dist = (24 / 1080 * _height) * _scale;
		maxD = (100 / 1920 * _width) * _scale;
		for (i = 0; i < 20; i++) {
			d = (Math.sin((row + i) / 8) * maxD);
			drawBoard(_startX,
				_startY + (i * (64 / 1080 * _height)),
				(dist + (d / maxD * 6)) * _scale,
				((200 / 1920 * _width) + d) * _scale);
		}

		dist = (12 / 1080 * _height) * _scale;
		maxD = (80 / 1920 * _width) * _scale;
		for (i = 0; i < 40; i++) {
			d = (Math.sin((row + i) / 4) * maxD);
			drawBoard(_startX,
				_startY + (i * (32 / 1080 * _height)),
				(dist + (d / maxD * 3)) * _scale,
				((90 / 1920 * _width) + d) * _scale);
		}
/*
for (i = 0; i < 40; i++) {
d = (Math.cos(row / 4 + i) * (120 / 1920 * _width));
drawBoard(_startX,
_startY + (i * (8 / 1080 * _height)),
dist + (d / 120 * 6),
(80 / 1920 * _width)+ d);
}

for (i = 0; i < 40; i++) {
d = (Math.sin(row / 4 + i) * (40/1920 * _width));
drawBoard(_startX,
_startY + (i * (8 / 1080 * _height)),
dist + (d / 120 * 6),
(80 / 1920 * _width) + d);
}*/
	}

	function drawBoard(x, y, rimThickness, diameter) {

		//if smaller, move front y down a bit
		var maxTilt = 40 / 1080 * _height,
			h = 28 / 1080 * _height,
			maxDia = 80 / 1080 * _height;

		var dH = maxTilt - (maxTilt / _height * (y + 1));
		y = y - (h + (diameter / maxDia * h));

		//rim
		//====
		_ctx.beginPath();
		_ctx.moveTo(x, y);
		//right edge
		_ctx.lineTo(x + diameter, y + dH);
		//right edge lower
		_ctx.lineTo(x + diameter, y + dH + rimThickness);
		//middle
		_ctx.lineTo(x, y + rimThickness);
		//left lower
		_ctx.lineTo(x - diameter, y + (dH * 2) + rimThickness);
		//left top
		_ctx.lineTo(x - diameter, y + (dH * 2));
		//back to start
		_ctx.lineTo(x, y);

		_ctx.fillStyle = "#ffbf11";
		_ctx.fill();
		_ctx.closePath();

		_ctx.beginPath();
		y += rimThickness;
		//upper edge
		_ctx.moveTo(x, y);
		//right edge
		_ctx.lineTo(x + diameter, y + dH);
		//back edge
		_ctx.lineTo(x, y + (dH * 2));
		//leftEdge
		_ctx.lineTo(x - diameter, y + (dH * 2));
		//close
		_ctx.lineTo(x, y);

		_ctx.fillStyle = "#252525";
		_ctx.fill();
		_ctx.closePath();
	}

	function setScale(newScale){
		_scale = newScale;
	}

	return{
		setContext: setContext,
		render: render,
		setScale:setScale
	};
};
var WavingWave = function () {

	var _p = [],
		_ctx,
		_width,
		_height;

	var PALETTE = ['#e4554f', '#634a4d', '#b2aba5', '#c1c1c3'],
		AMPLITUDE,
		MIN_STEP,
		MAX_STEP,
		LINEWIDTH_BACK,
		LINEWIDTH_FRONT,
		POINTS = 20,
		SCALE = 0.3;

	var WAVE_MUL = 10,
		WAVE_DIV = 10;

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		AMPLITUDE = 40 / 1920 * _width;
		MIN_STEP = 30 / 1920 * _width;
		MAX_STEP = 60 / 1920 * _width;
		LINEWIDTH_BACK = 0.8 / 1920 * _width;
		LINEWIDTH_FRONT = 0.9 / 1920 * _width;

		init();
	}

	function init() {
		var x = 0,
			startX = 0;

		for (var i = 0; i < POINTS; i++) {

			x += ((i === 0) ? startX : Random.range(MIN_STEP, MAX_STEP));

			_p.push({
				x: x,
				y: Random.range(-AMPLITUDE, AMPLITUDE),
				c: Math.floor(Random.range(0, PALETTE.length * 1.2))
			});
		}
	}

	function render(row) {
		//big wave in front
		var xOffset = (_width - _p[_p.length - 1].x) / 2,
			yOffset = (_height / 2),

		//mirror wave in the back
			xOffsetS = (_width - (_p[_p.length - 1].x * SCALE)) / 2,
			yOffsetS = (_height / 2);

		for (var i = 0; i < POINTS - 1; i++) {

			var waveY = Math.sin((row + (i * WAVE_MUL)) / WAVE_DIV) * AMPLITUDE;
			_ctx.beginPath();
			_ctx.moveTo(xOffset + _p[i].x, (yOffset + _p[i].y) + waveY);
			//same point but scaled down
			_ctx.lineTo(xOffsetS + (_p[i].x * SCALE), (yOffsetS + (_p[i].y * SCALE)) + (waveY * SCALE));

			//next point
			waveY = Math.sin((row + ((i + 1) * WAVE_MUL)) / WAVE_DIV) * AMPLITUDE;
			_ctx.lineTo(xOffsetS + (_p[i + 1].x * SCALE), (yOffsetS + (_p[i + 1].y * SCALE)) + (waveY * SCALE));
			_ctx.lineTo(xOffset + _p[i + 1].x, (yOffset + _p[i + 1].y) + waveY);

			//keep some totally transparent
			if (_p[i].c < PALETTE.length) {
				_ctx.save();
				_ctx.globalAlpha = 0.5;
				_ctx.fillStyle = PALETTE[_p[i].c];
				_ctx.fill();
				_ctx.restore();
			}

			_ctx.closePath();
			_ctx.lineWidth = LINEWIDTH_BACK;
			_ctx.stroke();

			//redraw front with thicker line
			_ctx.beginPath();
			_ctx.moveTo(xOffset + _p[i].x, (yOffset + _p[i].y) + Math.sin((row + (i * WAVE_MUL)) / WAVE_DIV) * AMPLITUDE);
			_ctx.lineTo(xOffset + _p[i + 1].x, (yOffset + _p[i + 1].y) + waveY);
			_ctx.lineWidth = LINEWIDTH_FRONT;
			_ctx.stroke();
			_ctx.closePath();
		}
	}

	return {
		setContext: setContext,
		render: render
	};
};
// mog
/*jslint devel: true, browser: true */
var Slice = function () {

	"use strict";

	var _width,
		_height,
		_amplitudeMultiplicator = 0,
		_hypo,
		_ctx,
		_image,
		_bctx,
		_imgBackup;

	var _row;

	var MAX_AMP,
		ANGLE = 45,
		STRIPE_AMOUNT = 21,
		STRIPE_WIDTH;

	function newBuffer() {
		var canvas = document.createElement('canvas');
		canvas.width = _hypo;
		canvas.height = _hypo;

		return canvas.getContext('2d');
	}

	function setContext(newContext) {
		_ctx = newContext;

		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		STRIPE_WIDTH = Math.ceil(_width / STRIPE_AMOUNT);

		_hypo = Math.round(Math.sqrt(Math.pow(_width, 2) + Math.pow(_height, 2)));

		MAX_AMP = 300 / 1920 * _width;
		_bctx = newBuffer();
		_imgBackup = newBuffer();
	}

	function setImage(newImage) {

		_image = newImage;
		//fillPic(_ctx);
	}

	function render(row) {

		_row = row;

		//cut angular pieces
		_imgBackup.clearRect(0, 0, _hypo, _hypo);

		rotate(-ANGLE, _ctx, true);
		_imgBackup.drawImage(_bctx.canvas, 0, 0);
		cut();

		//rotate back
		_imgBackup.clearRect(0, 0, _hypo, _hypo);
		_imgBackup.drawImage(_bctx.canvas, 0, 0);
		rotate(ANGLE, _imgBackup, false);

		//apply
		_ctx.clearRect(0, 0, _width, _height);
		_ctx.drawImage(_bctx.canvas, Math.round((_hypo - _width) / 2), Math.round((_hypo - _height) / 2),
			_width, _height, 0, 0, _width, _height);
	}

	function rotate(angle, from, center) {
		_bctx.clearRect(0, 0, _hypo, _hypo);

		//rotate
		_bctx.save();
		_bctx.translate(Math.round(_bctx.canvas.width / 2), Math.round(_bctx.canvas.height / 2));
		_bctx.rotate(Math.PI * angle / 180);
		_bctx.translate(Math.round(-_bctx.canvas.width / 2), Math.round(-_bctx.canvas.height / 2));
		if (center) {
			_bctx.drawImage(from.canvas, Math.round((_hypo - _width) / 2), Math.round((_hypo - _height) / 2));
		}
		else {
			_bctx.drawImage(from.canvas, 0, 0);
		}
		_bctx.restore();
	}

	function cut() {

		_bctx.clearRect(0, 0, _hypo, _hypo);

		for (var i = 0; i < STRIPE_AMOUNT; i++) {
			_bctx.drawImage(_imgBackup.canvas, STRIPE_WIDTH * i, 0, STRIPE_WIDTH, _hypo,
				STRIPE_WIDTH * i, Math.sin((_row + (i * 1000)) / MAX_AMP) * _amplitudeMultiplicator, STRIPE_WIDTH, _hypo);
		}
	}

	function setMaxAmplitude(newAmplitude) {
		MAX_AMP = newAmplitude / 1920 * _width;
	}

	function setAmplitudeMultiplicator(newMulti) {
		_amplitudeMultiplicator = newMulti;
	}

	function setAngle(newAngle) {
		ANGLE = newAngle;
	}

	function setStripes(newAmount) {
		STRIPE_AMOUNT = Math.round(newAmount);
		STRIPE_WIDTH = Math.ceil(_width / STRIPE_AMOUNT);
	}

	return {
		render: render,
		setContext: setContext,
		setImage: setImage,
		setAngle: setAngle,
		setStripes: setStripes,
		setMaxAmplitude: setMaxAmplitude,
		setAmplitudeMultiplicator: setAmplitudeMultiplicator
	};
};
var HexaGone = function () {

	var _ctx,
		_width,
		_height,
		_p;

	var PALETTE = ['#ffc100', '#d9a300' ],//['#B3B399', '#D9D9B3'],
		DIAMETER,
		POINTS = 6,
		LIFE = 4;

	var scaleX = 3,
		scaleY = 0.80;

	var COLUMNS,
		ROWS,
		LEN;

	function setContext(ctx) {
		_ctx = ctx;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		DIAMETER = 50 / 1920 * _width;

		COLUMNS = Math.ceil(_width / (DIAMETER * scaleX)) + 2;
		ROWS = Math.ceil(_height / (DIAMETER * scaleY)) + 2;

		LEN = COLUMNS * ROWS;
		//console.log(COLUMNS, ROWS);
		init();
	}

	function init() {

		_p = [];

		for (var i = 0; i < LEN; i++) {

			_p.push({ "c": ((Math.round(Math.random()) === 1) ? 0 : 1),
				"life": Math.min(Math.round(Math.random() * LIFE), LIFE)
			});
		}
	}

	function drawHex(oX, oY, diameter) {

		var rot = 0,
			r = 360 / POINTS;

		_ctx.beginPath();

		for (var i = 0; i < POINTS + 1; i++) {

			var x = Math.cos(rot) * diameter,
				y = Math.sin(rot) * diameter;

			if (i === 0) {
				_ctx.moveTo(x + oX, y + oY);
			}

			rot += r / 180 * Math.PI;

			_ctx.lineTo(x + oX, y + oY);
		}

		_ctx.closePath();
		_ctx.fill();
	}

	function render(posX, posY, frameDelta) {

		var oX = posX,
			oY = posY - (DIAMETER);

		var line = 0;

		for (var c = 0; c < LEN; c++) {

			_p[c].life -= frameDelta;

			if (_p[c].life <= 0) {
				_p[c].c = ((_p[c].c === 1) ? 0 : 1);
				_p[c].life = Math.min(Math.round(Math.random() * LIFE * 2), LIFE);
			}

			oX += (DIAMETER * scaleX);

			if (c % COLUMNS === 0) {

				line++;

				if (line % 2 === 0) {
					oX = posX - (DIAMETER * scaleX) / 2;
				} else {
					oX = posX - (DIAMETER * scaleX);
				}

				oY += DIAMETER * scaleY;
			}

			for (var i = 0; i < 2; i++) {
				if (i === 0) {
					_ctx.fillStyle = PALETTE[_p[c].c === 0 ? 1 : 0];
					drawHex(oX, oY, DIAMETER);
				} else {
					_ctx.fillStyle = PALETTE[_p[c].c];
					drawHex(oX, oY, DIAMETER / LIFE * _p[c].life);
				}
			}
		}
	}

	function setSpeed(newLife) {
		LIFE = newLife;
	}

	return {
		render: render,
		setContext: setContext,
		setSpeed: setSpeed
	};
};
var PyTree = function () {

	var _ctx,
		_width,
		_height;

	var SPEED = 100;

	var ANGLE_START = Math.PI / 8,
		ANGLE_VARY = Math.PI / 4,
		MAX_DEPTH = 3,
		MIN_DEPTH = 0,
		_step = Math.PI / 8;

	var _img,
		_imgWidth,
		_imgHeight;

	function setContext(newContext) {

		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		_ctx.translate(_width / 2, _height / 2);
	}

	function setImage(newTexture) {

		_img = newTexture;
		_imgWidth = _img.width / 1920 * _width;
		_imgHeight = _img.height / 1080 * _height;
	}

	function render(angle) {

		_ctx.clearRect(-_width / 2, -_height / 2, _width, _height);

		pyTree(_imgWidth, Math.abs(Math.sin(angle) * ANGLE_VARY), MIN_DEPTH, MAX_DEPTH);

		_ctx.save();
		_ctx.scale(1, -1);
		_ctx.drawImage(_ctx.canvas, -_width / 2, -_height / 2);
		_ctx.restore();
	}

	function pyTree(size, angle, depth, maxDepth) {

		var ta = angle,
			tb = angle,
			tc = Math.PI - ta - tb;

		var c = size,
			a = c * Math.sin(ta) / Math.sin(tc),
			b = c * Math.sin(tb) / Math.sin(tc);

		var h = b * Math.sin(ta),
			bl = Math.sqrt(b * b - h * h),
			br = c - bl;//,
		//offs = c * .5 - br;

		var height = _imgHeight / _imgWidth * size;
		_ctx.drawImage(_img, -size * 0.5, 0, size, height);

		if (depth++ < maxDepth) {

			_ctx.save();

			_ctx.translate(-bl * 0.5, (_imgHeight / _imgWidth * size));
			/*size * .5 */

			_ctx.rotate(angle);

			pyTree(b, angle, depth, maxDepth);

			_ctx.restore();

			_ctx.save();

			_ctx.translate(br * 0.5/* + offs*/, (_imgHeight / _imgWidth * size));

			_ctx.rotate(-angle);

			pyTree(a, angle, depth, maxDepth);

			_ctx.restore();
		}
	}

	function setMaxDepth(newDepth) {
		MAX_DEPTH = Math.floor(newDepth);
	}

	function setMinDepth(newDepth) {
		MIN_DEPTH = Math.floor(newDepth);
	}

	return {
		render: render,
		setMaxDepth: setMaxDepth,
		setMinDepth: setMinDepth,
		setContext: setContext,
		setImage: setImage
	};
};
var Kaleidoscope = function () {

    "use strict";

    var START_ANGLE = -33,
        PARTS = 3,
        _ctx,
        _bcxt,
        _width,
        _height;

    function setContext(ctx) {

        _ctx = ctx;

        _width = _ctx.canvas.width;
        _height = _ctx.canvas.height;

        var canvas = document.createElement('canvas');
        canvas.width = _width;
        canvas.height = _height;
        _bcxt = canvas.getContext('2d');
    }

    function buffer(x, y, width, height) {

        _bcxt.clearRect(0, 0, _bcxt.canvas.width, _bcxt.canvas.height);
        /*
         _bcxt.width = width;
         _bcxt.height = height;
         */
        _bcxt.drawImage(_ctx.canvas, x, y, width, height, 0, 0, width, height);
    }

    //mirrors right part to the left
    function mirrorAtY(x) {

        //save buffer
        buffer(x, 0, _width - x, _height);
        /*
        _bcxt.clearRect(0, 0, _width, _height);
        _bcxt.drawImage(_ctx.canvas, x, 0, _width - x, _height);//, 0, 0, _width - x, _height);
        */
        //clear part of mirror
        _ctx.clearRect(0, 0, x, _height);

        //mirror
        _ctx.save();
        _ctx.translate(x, 0);
        _ctx.scale(-1, 1);
        _ctx.drawImage(_bcxt.canvas, 0, 0, _width, _height);
        _ctx.restore();
    }

    function rotate(angle) {

        //save buffer
        _bcxt.clearRect(0, 0, _bcxt.canvas.width, _bcxt.canvas.height);
        _bcxt.drawImage(_ctx.canvas, 0, 0, _width, _height, 0, 0, _width, _height);

        //clear part of mirror
        _ctx.clearRect(0, 0, _width, _height);

        //mirror
        _ctx.save();
        _ctx.translate(_width / 2, _height / 2);
        _ctx.rotate(Math.PI * angle / 180);
        _ctx.translate(-_width / 2, -_height / 2);

        _ctx.drawImage(_bcxt.canvas, 0, 0);
        _ctx.restore();
    }

    function render() {

        for (var i = 0; i < 180; i += (180 / PARTS)) {
            rotate(START_ANGLE + i);
            mirrorAtY(_width / 2);
            rotate((START_ANGLE + i) * -1);
        }
    }

    function setAngle(newAngle){
        START_ANGLE = newAngle;
    }

    function setParts(newParts){
        PARTS = Math.round(newParts);
    }

    return {
        render    :render,
        setContext:setContext,
        setAngle:setAngle,
        setParts:setParts
    };
};
var Multiply = function() {

    var _width,
        _height,
        _ctx,

        _imgData,
        _imgWidth,
        _imgHeight;

    function setContext(ctx) {

        _ctx = ctx;
        _width = _ctx.canvas.width;
        _height = _ctx.canvas.height;
    }

    function setImage(img) {

        _imgWidth = Math.round(img.width / 1920 * _width);
        _imgHeight = Math.round(img.height / 1080 * _height);

        var canvas = document.createElement('canvas');
        canvas.width = _imgWidth;
        canvas.height = _imgHeight;

        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, _imgWidth, _imgHeight);

        _imgData = context.getImageData(0, 0, _imgWidth, _imgHeight).data;
    }

    function render(x, y) {

        var ctxImg = _ctx.getImageData(x, y, _imgWidth, _imgHeight),
            ctxData = ctxImg.data,
            len = _imgWidth * _imgHeight,
            pos;

        while(len--) {
            pos = len << 2;
            if(ctxData[pos+3] > 0){
                ctxData[pos] *= _imgData[pos] * 0.00392156862745098;
                ctxData[pos+1] *= _imgData[pos+1] * 0.003921568627450980;
                ctxData[pos+2] *= _imgData[pos+2] * 0.003921568627450980;
            }
        }

        _ctx.putImageData(ctxImg, x, y);
    }

    return {
        setImage:setImage,
        setContext:setContext,
        render:render
    };
};
// mog
/*jslint devel: true, browser: true */
var Verlet = function () {

    var VerletPoint = function () {

        var _x,
            _y,
            _oldX,
            _oldY;

        function init(x, y) {
            setPos(x, y);
        }

        function setPos(x, y) {
            _x = x;
            _oldX = x;

            _y = y;
            _oldY = y;
        }

        function refresh() {
            var tempX = _x,
                tempY = _y;

            _x += _x - _oldX;
            _y += _y - _oldY;

            _oldX = tempX;
            _oldY = tempY;
        }

        function getX() {
            return _x;
        }

        function setX(newX) {
            _x = newX;
        }

        function getY() {
            return _y;
        }

        function setY(newY) {
            _y = newY;
        }

        return {
            init    :init,
            setPoint:setPos,
            refresh :refresh,
            getX    :getX,
            setX    :setX,
            getY    :getY,
            setY    :setY
        };
    };

    var VerletStick = function () {
        var _pointA,
            _pointB,
            _hypotenuse;

        function init(a, b) {
            _pointA = a;
            _pointB = b;

            var dX = _pointA.getX() - _pointB.getX();
            var dY = _pointA.getY() - _pointB.getY();

            _hypotenuse = Math.sqrt(dX * dX + dY * dY);
        }

        function contract() {
            var dX = _pointB.getX() - _pointA.getX(),
                dY = _pointB.getY() - _pointA.getY(),
                h = Math.sqrt(dX * dX + dY * dY),
                diff = _hypotenuse - h,
                offsetX = (diff * dX / h) * 0.5,
                offsetY = (diff * dY / h) * 0.5;

            _pointA.setX(_pointA.getX() - offsetX);
            _pointA.setY(_pointA.getY() - offsetY);
            _pointB.setX(_pointB.getX() + offsetX);
            _pointB.setY(_pointB.getY() + offsetY);
        }

        function getPointA() {
            return _pointA;
        }

        function getPointB() {
            return _pointB;
        }

        return {
            init     :init,
            contract :contract,
            getPointA:getPointA,
            getPointB:getPointB
        };
    };

    var verlet = function () {

        var COLUMNS,
            ROWS,
            STICK_LENGTH,
            FLOPPYNESS,
            COLOR,
            THICKNESS,
            START_X,
            START_Y,
            END_X,
            END_Y,
            _point = [],
            _stick = [],
            _anchorLeft,
            _anchorRight,
            _ctx,
            _weightElement;

        function initialize() {

            var i = 0;

            for (var r = 0; r < ROWS; r++) {

                for (var c = 0; c < COLUMNS; c++) {

                    _point[r * COLUMNS + c] = new VerletPoint();
                    _point[r * COLUMNS + c].init(c * STICK_LENGTH, r * STICK_LENGTH);

                    var stick;

                    if (c > 0) {

                        stick = new VerletStick();
                        stick.init(_point[r * COLUMNS + c - 1], _point[r * COLUMNS + c]);
                        _stick[i++] = stick;
                    }

                    if (r > 0) {
                        stick = new VerletStick();
                        stick.init(_point[r * COLUMNS + c], _point[(r - 1) * COLUMNS + c]);
                        _stick[i++] = stick;
                    }
                }
            }

            _anchorLeft = {'x':START_X, 'y':START_Y};
            _anchorRight = {'x':START_X + COLUMNS * STICK_LENGTH, 'y':START_Y};

            for (var index = 0; index < _point.length; index++) {
                //_point[index].setPoint(_point[index].getX(), 0);
                if (END_X && END_Y) {
                    _point[index].setPoint(END_X, END_Y);
                } else {
                    _point[index].setPoint(_anchorLeft.x, -_weightElement.width);
                }
            }
        }

        function animate() {

            var i,
                t = _point.length;

            _point[0].setPoint(_anchorLeft.x, _anchorLeft.y);

            if (END_X && END_Y) {
                _point[ROWS * COLUMNS - 1].setPoint(END_X, END_Y);
            } else {
                _point[COLUMNS - 1].setPoint(_anchorRight.x, _anchorRight.y);
            }
        
            for (i = COLUMNS; i < t; i++) {

                _point[i].setY(_point[i].getY() + FLOPPYNESS);
                _point[i].refresh();
            }

            t = _stick.length;

            for (var stiff = 0; stiff < 10; stiff++) {
                for (i = 0; i < t; i++) {
                    _stick[i].contract();
                }
            }
        }

        function drawWeight(pointStart, pointEnd) {

            var angle = Math.atan2(pointStart.getY() - pointEnd.getY(), pointStart.getX() - pointEnd.getX()) * 180 /
                Math.PI;

            var cssText = 'position:absolute;left:' + (pointStart.getX() - _weightElement.width / 2) + 'px;top:' +
                pointStart.getY() + 'px;';
            cssText += '-webkit-transform: rotateZ(' + (angle - 90) + 'deg);';
            cssText += '-webkit-transform-origin: 50% 0;';

            _weightElement.style.cssText = cssText;
        }

        function draw() {

            _ctx.strokeStyle = COLOR;
            _ctx.lineWidth = THICKNESS;
            _ctx.lineCap = 'round';

            for (var i = 0; i < _stick.length; i++) {

                _ctx.beginPath();
                _ctx.moveTo((_stick[i].getPointA()).getX(), _stick[i].getPointA().getY());
                _ctx.lineTo(_stick[i].getPointB().getX(), _stick[i].getPointB().getY());
                _ctx.stroke();
                _ctx.closePath();
            }

            drawWeight(_stick[_stick.length - 1].getPointA(), _stick[_stick.length - 1].getPointB());
        }

        function render() {

            animate();
            draw();
        }

        function setContext(newCTX) {
            _ctx = newCTX;
        }

        function setWeightElement(someDiv) {
            _weightElement = someDiv;
        }

        function init(cfg) {

            if (cfg === undefined) {
                cfg = {};
            }

            COLOR = cfg.color || '#ff0000';
            THICKNESS = cfg.thickness || 2;
            COLUMNS = cfg.columns || 1;
            ROWS = cfg.rows || 20;
            FLOPPYNESS = cfg.floppyness || 0.3;
            START_X = cfg.startX || 10;
            START_Y = cfg.startY || -10;
            END_X = cfg.endX;
            END_Y = cfg.endY;
            STICK_LENGTH = cfg.stickLength || 10;

            initialize();
        }

        function setEnd(newX, newY){
            END_X = newX;
            END_Y = newY;
        }

        return {
            setDiv          :setDiv,
            setContext      :setContext,
            setEnd          :setEnd,
            setWeightElement:setWeightElement,
            init            :init,
            render          :render
        };
    };

    var v = new Verlet();

    function render() {
        v.render();
    }

    function init(cfg) {
        v.init(cfg);
    }

    function setDiv(divElement) {
        v.setWeightElement(divElement);
    }

    function setEnd(newX, newY) {
        v.setEnd(newX, newY);
    }

    function setContext(newContext) {
        v.setContext(newContext);
    }

    return {
        setContext:setContext,
        setDiv    :setDiv,
        setEnd    :setEnd,
        render    :render,
        init      :init
    };
};

// mog
/*jslint devel: true, browser: true */
var Filter = function () {
    "use strict";

    var _ctx,
        _w,
        _h,
        _imgData,
        _len;

    function setContext(ctx) {

        _ctx = ctx;

        _w = _ctx.canvas.width;
        _h = _ctx.canvas.height;

        _imgData = _ctx.getImageData(0, 0, _w, _h);
        _len = _imgData.data.length;
    }

    function noise() {

        _ctx.putImageData(_imgData, 0, 0);

        for(var i = _len; i > 0; i -= 4) {
            _imgData.data[i + 3] = 50 + Math.round(Math.random() * 20);
        }

        _ctx.putImageData(_imgData, 0, 0);
    }

    return {
        setContext:setContext,
        render:noise
    };
};
// mog
/*jslint devel: true, browser: true */
var Pixel = function () {
    "use strict";

    var _ctx;

    function setContext(ctx) {

        _ctx = ctx;
    }

    //http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
    function line(x0, y0, x1, y1) {

        var dx = Math.abs(x1 - x0),
            sx = x0 < x1 ? 1 : -1,
            dy = -Math.abs(y1 - y0),
            sy = y0 < y1 ? 1 : -1,
            err = dx + dy,
            e2;

        while((x0 === x1 && y0 === y1)) {

            _ctx.fillRect(x0, y0, 1, 1);
/*
            if  {
                break;
            }*/

            e2 = 2 * err;
            if (e2 > dy) {
                err += dy;
                x0 += sx;
            }

            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    function shape(pCloud) {

        if (pCloud.length > 2) {

            var i,
                p = pCloud.slice(0, pCloud.length); //needed deref

            //add first as last again, to close the shape
            p.push(p[0]);

            var len = p.length - 1;
            for (i = 0; i < len; i++) {
                line(Math.round(p[i].x), Math.round(p[i].y), Math.round(p[i + 1].x), Math.round(p[i + 1].y));
            }
        }
    }

    return {
        setContext:setContext,
        shape:shape,
        line:line
    };
};
// mog
var ZLayer = function () {
	"use strict";

	var _ctx,
		_feed,
		_width,
		_height,
		particle = [],
		MAX_SEGMENT = 10,
		dist = 3,
		MAX_Z = MAX_SEGMENT * dist;

	var _fillFeedCallback = function () {
		console.log("set me with .setFeedFunction(fn)");
	};

	function setFeedFunction(fn) {
		_fillFeedCallback = fn;
	}

	function init() {

		var zDistance = 0;

		for (var i = 0; i < MAX_SEGMENT; i += 1) {
			particle.push({
				"x": _width / 2,
				"y": _height / 2,
				"z": MAX_Z - zDistance,
				"sprite": (i < 4) ? i + 100 : Math.floor(Random.float() * 8)
			});
			zDistance += dist;
		}
	}

	function setContext(ctx) {

		init();

		_ctx = ctx;

		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;
	}

	function setFeed(ctx) {

		_feed = ctx;
	}

	var specialLength = 4,
		specialIndex = 0;
	var prevRow;

	function render(row) {

		if (isNaN(prevRow)) {
			prevRow = row - 0.1;
		}

		var speed = 0.2 * (row - prevRow);

		particle = particle.sort(function (a, b) {
			return ((a.z > b.z) ? -1 : ((a.z < b.z) ? 1 : 0));
		});

		var shadowParticle = [],
			halfWidth = _width / 2,
			halfHeight = _height / 2;

		for (var i = 0; i < MAX_SEGMENT; i += 1) {

			var vpY = -(halfHeight / 4) - (100 / MAX_Z * (particle[i].z * 2)) + (Math.sin(row / 5) * Math.sin(row) * 10),
				drawX = halfWidth - (particle[i].x / particle[i].z * 8),
				drawY = halfHeight - (particle[i].y / particle[i].z * 4),
				drawWidth = (halfWidth - drawX) * 2,
				drawHeight = (halfHeight - drawY) * 2;

			particle[i].z -= speed;

			if (particle[i].z < 0) {

				var idx = Math.floor(Random.float() * 8);

				if (specialIndex < specialLength) {
					idx = 100 + specialIndex;
					specialIndex++;
				}

				shadowParticle.push({
					"x": _width / 2,
					"y": _height / 2,
					"z": MAX_Z,
					"sprite": idx
				});

			} else {
				shadowParticle.push(particle[i]);
				_ctx.save();
				_ctx.globalAlpha = 1 - (particle[i].z / MAX_Z);
				_ctx.translate(0, vpY);

				if (drawWidth > 50) {
					_fillFeedCallback(particle[i].sprite, particle[i].z, MAX_Z);

					_ctx.drawImage(_feed.canvas, drawX + (halfWidth / 2), drawY, drawWidth, drawHeight);
				} else {
					//console.log(particle[i].z);
				}
				_ctx.restore();
			}
		}

		particle = shadowParticle;
		prevRow = row;
	}

	return {
		setContext: setContext,
		setFeed: setFeed,
		render: render,
		setFeedFunction: setFeedFunction
	};
};
var ZLayerTunnel = function () {

	var _ctx,
		_feed,
		_width,
		_height,
		particle = [],
		SPEED = 2,
		MAX_Z,
		MAX_SEGMENT = 40,
		dist = 0.6,
		_row;

	function init() {

		var zDistance = 0;
		MAX_Z = (MAX_SEGMENT) * dist;

		for (var i = 0; i < MAX_SEGMENT; i += 1) {
			particle.push({
				"x": _width / 2,
				"y": _height / 2,
				"z": MAX_Z - zDistance
			});

			zDistance += dist;
		}
	}

	function setContext(newContext) {
		_ctx = newContext;
		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		init();
	}

	function setFeed(newContext) {
		_feed = newContext;
	}

	function render(frameDelta, row) {

		_row = row;

		particle = particle.sort(function (a, b) {
			return ((a.z > b.z) ? -1 : ((a.z < b.z) ? 1 : 0));
		});

		var shadowParticle = [],
			halfWidth = _width / 2,
			halfHeight = _height / 2;

		for (var i = 0; i < MAX_SEGMENT; i += 1) {

			var vpY = (halfHeight / 2) - _height / MAX_Z * particle[i].z + (Math.sin(_row / 10) * (150 / 1920 * _width)),
				drawX = halfWidth - (particle[i].x / particle[i].z * 8),
				drawY = halfHeight - (particle[i].y / particle[i].z * 8),
				drawWidth = (halfWidth - drawX) * 2,
				drawHeight = (halfHeight - drawY) * 2;

			particle[i].z = particle[i].z - (SPEED * frameDelta);

			if (particle[i].z < 0) {

				shadowParticle.push({
					"x": _width / 2,
					"y": _height / 2,
					"z": MAX_Z
				});

			} else {
				shadowParticle.push(particle[i]);
				_ctx.save();
				_ctx.globalAlpha = (5 / MAX_Z * particle[i].z);
				_ctx.translate(0, vpY);

				if (drawWidth > 50) {
					renderQuirkle(particle[i].z);
					_ctx.drawImage(_feed.canvas, drawX, drawY, drawWidth, drawHeight);
				}

				_ctx.restore();
			}
		}

		particle = shadowParticle;
	}

	function renderQuirkle(off) {

		_feed.fillStyle = '#ff8673';
		_feed.fillRect(0, 0, _width, _height);

		//_feed.clearRect(0, 0, _width, _height);

		var width = (60 / 1920 * _width) + Math.sin(_row / 10) * 20,
			diameter = width / 2 * 1.7320508075688772;
		qwirkle((_width - diameter) / 2, (_height - diameter) / 2, width, Math.sin(off / 3));
	}

	function qwirkle(posX, posY, width, r) {

		_feed.beginPath();

		var first = true,
			rot = r,
			parts = 5,
			max = 360 / parts,
			start = {};

		for (var c = 0; c < parts; c++) {
			r = max;
			rot += r / 180 * Math.PI;
			var dist = width,
				x = Math.cos(rot) * dist + posX,
				y = Math.sin(rot) * dist + posY;

			if (first) {
				first = false;
				_feed.moveTo(x, y);
				start.x = x;
				start.y = y;
			} else {
				_feed.lineTo(x, y);
			}
		}

		_feed.lineTo(start.x, start.y);
		_feed.fillStyle = 'rgba(44,255,206,.7)';
		_feed.lineWidth = 2;
		_feed.lineCap = 'round';
		_feed.strokeStyle = 'rgba(0,0,0,1)';
		_feed.fill();
		_feed.stroke();
	}

	return {
		setContext: setContext,
		setFeed: setFeed,
		render: render
	};
};
// mog
/*jslint devel: true, browser: true */
var Starfield = function () {

	"use strict";

	var PARTICLE_COUNT = 2000,
		palette = ['#615859', '#E4554F', '#CBCBCB', '#E9E8E6', '#FFFEFC'],
		maxZ,
		particles = [],
		_ctx,
		_width,
		_height,
		_speed = 2,
		_centerX,
		_centerY,
		MIN_DIAMETER,
		MAX_DIAMETER;

	function setContext(ctx) {

		_ctx = ctx;

		_width = _ctx.canvas.width;
		_height = _ctx.canvas.height;

		maxZ = _width - _height;

		_ctx.lineWidth = 1;

		MIN_DIAMETER = 2 / 1920 * _width;
		MAX_DIAMETER = 7 / 1920 * _width;

		setCenter(_width / 2, _height / 2);
	}

	function setCenter(centerX, centerY) {
		_centerX = centerX;
		_centerY = centerY;
	}

	function moveParticle(frameDelta) {

		var i = 0,
			p,
			newX,
			newY;

		for (i; i < PARTICLE_COUNT; i++) {

			if (particles[i] === undefined) {
				particles[i] = {};
				particles[i].z = -1;
			}

			p = particles[i];

			p.z = p.z - (_speed * frameDelta);

			if (p.z < 0) {

				p.x = ((Random.float() * _centerX - 1) + 1) * ((Random.float() * 99) > 50 ? -1 : 1);
				p.y = ((Random.float() * _centerY - 1) + 1) * ((Random.float() * 99) > 50 ? -1 : 1);
				p.w = Random.range(MIN_DIAMETER, MAX_DIAMETER);
				p.z = Random.range(0, maxZ);
				p.d = Math.round(Random.range(3, 6));

				p.oldX = null;
				p.oldY = null;

				p.color = palette[Math.round(Random.range(0, palette.length))];

			} else {

				newX = (_centerX) + (p.x / p.z) * _width / 2;
				newY = (_centerY) + (p.y / p.z) * _height / 2;

				if (((newX >= -p.w) && (newX <= _width + p.w)) && (newY >= -p.w) && (newY <= _height + p.w)) {

					var alpha = 0;
					if (p.z < maxZ) {
						alpha = (maxZ - p.z) / maxZ;
					}

					_ctx.globalAlpha = alpha;

					if (p.oldX) {
						//_ctx.strokeStyle = p.color;
						_ctx.fillStyle = p.color;
						_ctx.beginPath();

						//Math.max(p.oldX, newX) - Math.min(p.oldX, newX)
						var width = p.w / maxZ * (maxZ - p.z),
							first = true,
							rot = alpha * 10,
							parts = p.d,
							max = 360 / parts,
							start = {};
						//easeIn quart
						//width = (width * width * width * width) * p.w;

						for (var pC = 0; pC < parts; pC++) {
							rot += max / 180 * Math.PI;

							var x = Math.cos(rot) * width + newX,
								y = Math.sin(rot) * width + newY;

							if (first) {
								first = false;
								_ctx.moveTo(x, y);
								start.x = x;
								start.y = y;
							} else {
								_ctx.lineTo(x, y);
							}
						}

						/*
						_ctx.beginPath();
						_ctx.moveTo(p.oldX, p.oldY);
						_ctx.lineTo(newX, newY);
						*/
						_ctx.closePath();

						_ctx.fill();
						//_ctx.stroke();
					}

					p.oldX = newX;
					p.oldY = newY;

				} else {
					p.z = -1;
				}
			}
		}

		_ctx.restore();
	}

	function setSpeed(newSpeed) {
		if (newSpeed) {
			_speed = newSpeed;
		}
	}

	return {
		setContext: setContext,
		render: moveParticle,
		setSpeed: setSpeed,
		setCenter: setCenter
	};
};
// mog

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
(function () {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
			window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				},
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}
}());

//http://gizma.com/easing/
Math.easeOutQuad = function (t, b, c, d) {
	t /= d;
	return -c * t * (t - 2) + b;
};

function hashFromString(string) {

	var hash = 0;

	for (var i = 0; i < string.length; i++) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}

	return Math.abs(hash);
}

function droidColor(hexColor) {

	var hex = (hexColor + '').split(''),
		i = 0;

	for (; i < 6; i += 2) {

		if ((hex[i + 2] === undefined) && (i < 4)) {
			hex[i + 2] = 0;
		}

		hex[i] = parseInt(hex[i], 16);

		if (i < 2) {
			hex[i] = (hex[i] % 3) > 0 ? ((hex[i] % 3) * 3).toString(16) : hex[i].toString(16);
		}

		hex[i] = (hex[i] + '').length > 1 ? (hex[i]).toString(16) : hex[i];
		hex[i + 1] = hex[i];
	}

	var sixDigits = hex.slice(0, 6);
	return '#' + sixDigits.join('');
}

function getVariableName(variable) {

	var arr = [];

	for (var param in window) {
		if (window.hasOwnProperty(param)) {
			arr.push(param);
		}
	}

	return arr.map(
		function (ele) {
			if (window[ele] === variable) {
				return ele;
			}
		}
	).sort()[0];
}
// mog
/*jslint devel: true, browser: true */
TRBLMaker.Interaction = function () {

	var _audio,
		_audioReadyTimer;

	function keyHandler(event) {

		var SPACEBAR = 32,
			ESC = 27,
			TAB = 9,
			M = 77,
			KEY_0 = 48,
			KEY_1 = 49,
			KEY_2 = 50,
			KEY_3 = 51,
			KEY_4 = 52,
			KEY_5 = 53,
			KEY_6 = 54,
			KEY_7 = 55,
			KEY_8 = 56,
			KEY_9 = 57;

		switch (event.keyCode) {

			case SPACEBAR:
				event.preventDefault();
				sync();
				break;

			case ESC:
				togglePause();
				break;

			case TAB:
				event.preventDefault();
				toggleGUIVisibility();
				break;

			case KEY_0:
			case KEY_1:
			case KEY_2:
			case KEY_3:
			case KEY_4:
			case KEY_5:
			case KEY_6:
			case KEY_7:
			case KEY_8:
			case KEY_9:
				setVolume(event.keyCode - 48);
				break;

			case M:
				toggleMute();
				break;
		}
	}

	function sync() {

		console.log('[Beat] ', JSON.stringify(Demo.sceneController().getTiming()));
	}

	function togglePause() {

		Demo.pause(!_audio.isPaused());
	}

	function setVolume(newVolume) {

		//KEY_0 press
		if (newVolume === 0) {
			newVolume = 10;
		}

		_audio.volume(newVolume / 10);
	}

	function toggleMute() {

		if (_audio.volume() <= 0) {
			_audio.volume(Demo.model.volume || 0.8);
		}
		else {
			_audio.volume(0);
		}
	}

	function toggleGUIVisibility() {

		var elements = document.querySelectorAll('.trblDebug'),
			displayMode = (elements[0].style.display !== 'none') ? 'none' : 'block';

		for (var i = 0; i < elements.length; i++) {
			elements[i].style.display = displayMode;
		}
	}

	function create() {

		_audio = Demo.audio;

		document.getElementById('root').onkeydown = keyHandler;
	}

	function init() {

		clearInterval(_audioReadyTimer);

		if (!Demo.audio || isNaN(Demo.audio.duration())) {
			_audioReadyTimer = setInterval(init, 250);
		} else {
			create();
		}
	}

	init();
};
// mog
/*jslint devel: true, browser: true */
TRBLMaker.GUI = function () {
    "use strict";

    var _holder,
        _fpsGUI,
        _timelineGUI,
        _modifierGUI,
        _previousTime = 0,
        _fpsTime = 0,
        _fCount = 0;

    function fps(tDelta) {

        if (_fpsTime < 1000) {

            _fCount++;
            _fpsTime += tDelta;

        } else {
            _fpsGUI.update(_fCount);

            _fpsTime = 0;
            _fCount = 0;
        }
    }

    function fpsUpdate() {

        window.requestAnimationFrame(fpsUpdate, document);

        fps(Date.now() - _previousTime);
        _previousTime = Date.now();
    }

    function start() {

        fpsUpdate();
    }

    function init() {

        _holder = document.createElement("div");
        _holder.setAttribute('class', 'trblDebug');
        _holder.style.cssText = 'top:0; left:0;';

        _fpsGUI = new TRBLMaker.GUI.FPS(_holder);
        _timelineGUI = new TRBLMaker.GUI.Timeline(_holder);
        _modifierGUI = new TRBLMaker.GUI.Modifier(_holder);
        document.getElementById('root').appendChild(_holder);

        var objectlist = new TRBLMaker.GUI.ObjectList(_timelineGUI);
        start();
    }

    init();
};
// mog
/*jslint devel: true, browser: true */
TRBLMaker.GUI.Modifier = function (holder) {

	var _holder = holder,
		VENDOR = ['-moz-', '-o-', '-webkit-', ''],
		BUTTON_CODE = 'float:left;width:24px;height:24px;background-color:#333333;cursor:pointer;',
		ACTIVE_BUTTON_CODE = 'background-color:#9933cc !important;',
		FLIP_H_CODE = ' scaleX(-1) ',
		FLIP_V_CODE = ' scaleY(-1) ',
		FLIP_H_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAJ0Uk5T/wDltzBKAAAAQElEQVR42mJgxAoYCAozMBArzIBO4xFmYABxIRgigVsYxoQZA5bGIYwQRNBQgEWYNLNJdTepYUJqeBMZlwABBgBtuQFxRSO/zQAAAABJRU5ErkJggg==",
		FLIP_V_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAJ0Uk5T/wDltzBKAAAAOklEQVR42mJghAMGBiQ2AWEGMCBOGCKEkMAnjMSFsvAJYwLcwgzYME5h0swm3d2khAmp4U1kXAIEGABtuQFxkB1gkQAAAABJRU5ErkJggg==",
		AUDIO_RATE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////////VXz1bAAAAAJ0Uk5T/wDltzBKAAAAWUlEQVR42qSRUQoAIAhDn/e/dFRYmulHSalsNCchSdAvMZdEz+FUBIlaThR234gprMW+GNDGjRQjbjMc7obDv12rrj2Hn9XjN9g9EZoFCSL6tdwWJLfbBBgA5KEBpR5+Kb8AAAAASUVORK5CYII=",
		DESATURATE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////////VXz1bAAAAAJ0Uk5T/wDltzBKAAAAPElEQVR42mJgxAEY6CPBAKMYwBQIoOpggCqB0QgCvw4ENVTtICEQGUAIjYLYwwCxBJVCMg+FomLUAgQYADEAAdnYrYYNAAAAAElFTkSuQmCC",
		ROCKET = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////////VXz1bAAAAAJ0Uk5T/wDltzBKAAAAUUlEQVR42rSSSQ4AIAgDh/9/Wj0QGxbjQTmYNkNDRLGmuAFQA6JTRQbUfglmleBVAk8QGknCLXLsa6EJEGBpZZhOl5YfoF17/4KHxN0vGQIMADytAeNYyJ57AAAAAElFTkSuQmCC",
		_flipHElement,
		_flipVElement,
		_audioRateElement,
		_desaturateElement,
		_rocketModeElement,
		_horizontal = false,
		_vertical = false,

		_flipCSS = "",
		_desaturateCSS = "";

	function toggleFlipH() {

		_horizontal = _flipHElement.classList.toggle('active');

		updateFlip();
	}

	function toggleFlipV() {

		_vertical = _flipVElement.classList.toggle('active');

		updateFlip();
	}

	function toggleAudioRate() {

		if (Demo.audio.playbackRate() < 1) {
			Demo.audio.playbackRate(1);
		}
		else {
			Demo.audio.playbackRate(0.5);
		}

		_audioRateElement.classList.toggle('active');
	}

	function toggleDesaturate() {

		_desaturateElement.classList.toggle('active');

		if (_desaturateCSS.length > 0) {
			_desaturateCSS = "";
		}
		else {
			_desaturateCSS = "-webkit-filter:grayscale(1);";
		}

		document.querySelectorAll(".demo")[0].style.cssText = _flipCSS + _desaturateCSS;
	}

	function toggleRocket() {

		Demo.model.demoMode = !Demo.model.demoMode;

		location.reload();

		_rocketModeElement.classList.toggle('active');
	}

	function updateFlip() {

		_flipCSS = "";

		var i = 0,
			res = "";

		if (_vertical) {
			res += FLIP_V_CODE;
		}

		if (_horizontal) {
			res += FLIP_H_CODE;
		}

		for (; i < VENDOR.length; i++) {

			//adding the translate as our canvases are positioned absolute
			var extra = "";
			if (_vertical) {
				extra = ' translate(0, -' + Demo.model.height() + 'px)';
			}

			_flipCSS += VENDOR[i] + 'transform:' + res + extra + ';';
		}

		document.querySelectorAll(".demo")[0].style.cssText = _flipCSS + _desaturateCSS;
	}

	function create() {
		document.styleSheets[0].insertRule('.modifierButton.active, .modifierButton:hover {' + ACTIVE_BUTTON_CODE + '}', 0);

		_flipHElement = document.createElement('div');
		_flipHElement.setAttribute('class', 'modifierButton');
		_flipHElement.style.cssText = 'clear:both;' + "background:url(" + FLIP_H_IMG + ") no-repeat 50% 50%;" +
			BUTTON_CODE;
		_flipHElement.onclick = toggleFlipH;
		_holder.appendChild(_flipHElement);

		_flipVElement = document.createElement('div');
		_flipVElement.setAttribute('class', 'modifierButton');
		_flipVElement.style.cssText = "background:url(" + FLIP_V_IMG + ") no-repeat 50% 50%;" + BUTTON_CODE;
		_flipVElement.onclick = toggleFlipV;
		_holder.appendChild(_flipVElement);

		_audioRateElement = document.createElement('div');
		_audioRateElement.setAttribute('class', 'modifierButton');
		_audioRateElement.style.cssText = "clear:both;background:url(" + AUDIO_RATE + ") no-repeat 50% 50%;" + BUTTON_CODE;
		_audioRateElement.onclick = toggleAudioRate;
		_holder.appendChild(_audioRateElement);

		_desaturateElement = document.createElement('div');
		_desaturateElement.setAttribute('class', 'modifierButton');
		_desaturateElement.style.cssText = "clear:both;background:url(" + DESATURATE + ") no-repeat 50% 50%;" + BUTTON_CODE;
		_desaturateElement.onclick = toggleDesaturate;
		_holder.appendChild(_desaturateElement);

		_rocketModeElement = document.createElement('div');
		_rocketModeElement.setAttribute('class', 'modifierButton');
		_rocketModeElement.style.cssText = "clear:both;background:url(" + ROCKET + ") no-repeat 50% 50%;" + BUTTON_CODE;
		_rocketModeElement.onclick = toggleRocket;
		_holder.appendChild(_rocketModeElement);

		updateButtonVisibility();
	}

	var _modelReadyTimer;

	function updateButtonVisibility() {
		clearInterval(_modelReadyTimer);

		if (Demo.model && isNaN(Demo.model.width)) {
			_modelReadyTimer = setInterval(updateButtonVisibility, 250);
		} else if (Demo.model) {
			//check if we need to activate the rocket button
			if (!Demo.model.demoMode) {
				_rocketModeElement.classList.add('active');
			}
		}
	}

	function update() {

	}

	(function init() {
		create();
	})();

	return{
		update: update
	};
};
var DoublyLinkedList = function () {

	var _list = {};

	function insertAfter(pnode, pnewNode) {
		var node = pnode,
			newNode = pnewNode;
		if (_list.last === undefined) {
			insertBefore(_list.first, newNode);
		} else {

			newNode.previous = node;
			newNode.next = node.next;

			if (node.next === undefined) {
				_list.last = newNode;
			}
			else {
				node.next.previous = newNode;
			}

			node.next = newNode;
		}

		return newNode;
	}

	function insertBefore(pnode, pnewNode) {
		var node = pnode,
			newNode = pnewNode;
		//empty list
		if (_list.first === undefined) {
			console.warn("ADDING FIRST");
			_list.first = newNode;
			_list.last = newNode;

			newNode.previous = undefined;
			newNode.next = undefined;
		} else {

			newNode.previous = node.previous;
			newNode.next = node;

			if (node.previous === undefined) {
				_list.first = newNode;
			}
			else {
				node.previous.next = newNode;
			}

			node.previous = newNode;
		}

		return newNode;
	}

	function remove(node) {
		if (node.previous === undefined) {
			_list.first = node.next;
		}
		else {
			node.previous.next = node.next;
		}

		if (node.next === undefined) {
			_list.last = node.previous;
		}
		else {
			node.next.previous = node.previous;
		}

		node = null;
	}

	function find(nodeID) {
		var node = _list.first;

		while (node !== undefined) {
			if (node.id === nodeID) {
				return node;
			}
			node = node.next;
		}

		return undefined;
	}

	return{
		insertBefore: insertBefore,
		insertAfter: insertAfter,
		remove: remove,
		find: find,
		get first() {
			return _list.first;
		},
		get last() {
			return _list.last;
		}
	};
};
TRBLMaker.Scene = function(classReference, startTime, endTime, sceneName) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = this.endTime - this.startTime;
    this.scene = classReference;
    this.sceneName = sceneName;
    this.id = Random.uniqueID();
    this.element = document.createElement('div');
    this.element.setAttribute("class", "scene");

    this.element.style.background = droidColor(hashFromString((classReference.render).toString()));

    //scene.setAttribute('data-name', getVariableName(list[i].scene));
};

TRBLMaker.Scene.prototype.updateVisual = function() {

    var newX = Demo.model.TIMELINE_WIDTH / Demo.model.TIMELINE_DURATION * this.startTime;
    this.element.style.webkitTransform = 'translateX(' + newX + 'px)';
    this.element.style.mozTransform = 'translateX(' + newX + 'px)';

    this.element.style.width = Demo.model.TIMELINE_WIDTH / Demo.model.TIMELINE_DURATION * this.duration + 'px';
};
// mog
/*jslint devel: true, browser: true */
TRBLMaker.GUI.Timeline = function (holder) {
    "use strict";

    var _holder,
        _position,
        _audioReadyTimer,
        _audioDuration;

    var _sceneList;

    var _scaleElement,
        _element,
        _scrubber,
        _scrubberBar,
        _sceneHeaderHolder,
        _timelineScroll,
        _isDragging = false,
        _isDraggingBack = false,
        _isDraggingFront = false,
        _offsetX = 0,
        _dragElement;

    function pollAudioReady() {

        clearInterval(_audioReadyTimer);

        if (Demo.audio === undefined || isNaN(Demo.audio.duration())) {
            _audioReadyTimer = setInterval(pollAudioReady, 250);
        } else {
            init();
        }
    }

    function init() {
        //TODO totally the wrong place to do this
        _audioDuration = Demo.audio.duration() * Demo.model.ROW_RATE;
        Demo.model.TIMELINE_DURATION = _audioDuration;
        Demo.model.TIMELINE_WIDTH = _audioDuration * Demo.model.TIMELINE_SCALE;

        buildGUI();
        document.getElementById('root').appendChild(_holder);

        loadSceneListFromDemo();

        _scrubberBar.addEventListener('mousedown', function (e) {
            jumpInDemo(e);
            document.addEventListener('mousemove', jumpInDemo, false);
        }, false);
        document.addEventListener('mouseup', function () {
            document.removeEventListener('mousemove', jumpInDemo, false);
        }, false);

        //activate showing the progress
        update();
    }

    var _header,
        _headerBar;

    function buildGUI() {
        _holder = document.createElement('div');
        _holder.setAttribute('id', 'timeline');
        _holder.setAttribute('class', 'trblDebug');

        _scrubberBar = document.createElement('div');
        _scrubberBar.setAttribute("id", "scrubberBar");
        _scrubberBar.style.width = Demo.model.TIMELINE_WIDTH + 'px';
        _scrubber = document.createElement('div');
        _scrubber.setAttribute("id", "scrubber");
        _scrubberBar.appendChild(_scrubber);

        _header = document.createElement('div');
        _header.setAttribute("id", "header");
        _headerBar = document.createElement('div');
        _headerBar.setAttribute("id", "headerBar");
        _sceneHeaderHolder = document.createElement('div');
        _sceneHeaderHolder.setAttribute("id", "sceneHeaderHolder");
        _header.appendChild(_headerBar);
        _header.appendChild(_sceneHeaderHolder);


        _timelineScroll = document.createElement('div');
        _timelineScroll.setAttribute("id", "timelineScroll");

        _element = document.createElement('div');
        _element.style.width = Demo.model.TIMELINE_WIDTH + 'px';
        _element.setAttribute("id", "timelineHolder");


        _holder.appendChild(_header);
        _holder.appendChild(_timelineScroll);
        _timelineScroll.appendChild(_scrubberBar);
        _timelineScroll.appendChild(_element);

        _position = document.createElement('div');
        _position.setAttribute('class', 'timelinePosition');
        _element.appendChild(_position);

        _addScaleSlider();
        _drawGrid();
    }

    function _addScaleSlider() {
        _scaleElement = document.createElement('input');
        _scaleElement.setAttribute("id", "timelineScale");
        _scaleElement.setAttribute("type", "range");
        _scaleElement.setAttribute("min", "1");
        _scaleElement.setAttribute("max", "8");
        _scaleElement.setAttribute("value", Demo.model.TIMELINE_SCALE);
        _scaleElement.setAttribute("step", "1");

        _scaleElement.addEventListener("change", _handleScaleChange, false);

        _holder.appendChild(_scaleElement);
    }

    function _drawGrid() {
        var ctx = document.createElement('canvas').getContext('2d');

        ctx.canvas.width = Demo.model.TIMELINE_SCALE * (Demo.model.ROWS_PER_BEAT);

        ctx.canvas.height = 16;
        ctx.fillStyle = "#a1a1a1";

        for (var i = 0; i <= Demo.model.ROWS_PER_BEAT; i++) {
            ctx.fillRect(i * Demo.model.TIMELINE_SCALE, 15, Demo.model.TIMELINE_SCALE, 1);

            if (Demo.model.TIMELINE_SCALE > 1) {

                ctx.fillRect((Demo.model.TIMELINE_SCALE) * i, 0, 1, 16);

                if ((i === 0)) {
                    ctx.save();
                    ctx.fillStyle = '#bbb';
                    ctx.fillRect(1, 0, Demo.model.TIMELINE_SCALE - 1, 15);
                    ctx.restore();
                }
            }
        }

        _element.style.backgroundImage = 'url(' + ctx.canvas.toDataURL("image/png") + ')';
    }

    function update() {

        window.requestAnimationFrame(update, document);

        if (!isNaN(Demo.audio.position())) {

            var pixelOffset = 0,//_element.offsetLeft,
                tunePos = Math.round(Demo.model.TIMELINE_WIDTH / Demo.audio.duration() * Demo.audio.position());
            _position.style.webkitTransform = 'translateX(' + (pixelOffset + tunePos) + 'px)';
            _position.style.mozTransform = 'translateX(' + (pixelOffset + tunePos) + 'px)';
            _scrubber.style.webkitTransform = 'translateX(' + (pixelOffset + tunePos) + 'px)';
            _scrubber.style.mozTransform = 'translateX(' + (pixelOffset + tunePos) + 'px)';
        }
    }

    function jumpInDemo(e) {
        if (Demo && Demo.audio && !isNaN(Demo.audio.position())) {

            var clickX = e.pageX - _scrubberBar.offsetLeft + _scrubberBar.parentNode.scrollLeft,
                demoTime = Demo.audio.duration() / Demo.model.TIMELINE_WIDTH * clickX;

            Demo.audio.position(demoTime);
            Demo.forceRenderUpdate();
        }
    }

    function _handleScaleChange(e) {
        //updates the timelineWidth as well
        Demo.model.TIMELINE_SCALE = _scaleElement.value;

        Demo.model.TIMELINE_WIDTH = _audioDuration * Demo.model.TIMELINE_SCALE;
        _element.style.width = Demo.model.TIMELINE_WIDTH + 'px';

        _drawGrid();

        var node = _sceneList.first;
        while (node !== undefined) {

            node.data.updateVisual();
            node = node.next;
        }
    }

    function sceneDragDone(e) {
        _isDragging = false;
        _isDraggingBack = false;
        _isDraggingFront = false;
        document.removeEventListener('mousemove', sceneMouseChange, false);
        document.removeEventListener('mouseup', sceneDragDone, false);
    }

    function sceneMouseChange(e) {
        //HACK _element.parentNode.scrollLeft can break, if parent isn't the scrolled element
        var x = e.pageX - _offsetX - _element.offsetLeft + _element.parentNode.scrollLeft,
            pixelRatio = Demo.model.TIMELINE_WIDTH / Demo.model.TIMELINE_DURATION,
            timeRatio = Demo.model.TIMELINE_DURATION / Demo.model.TIMELINE_WIDTH,

            startTimeX = pixelRatio * _dragElement.startTime,
            endTimeX = pixelRatio * _dragElement.endTime,
            durationWidth = pixelRatio * _dragElement.duration;

        if (_isDragging) {
            x = Math.min(Math.max(x, 0), Demo.model.TIMELINE_WIDTH - durationWidth);
            x = Math.floor(x / Demo.model.TIMELINE_SCALE) * Demo.model.TIMELINE_SCALE;
            _dragElement.startTime = timeRatio * x;
            _dragElement.endTime = _dragElement.startTime + _dragElement.duration;

        } else if (_isDraggingBack) {
            x = Math.min(Math.max(x, startTimeX + Demo.model.TIMELINE_SCALE), Demo.model.TIMELINE_WIDTH);
            x = Math.floor(x / Demo.model.TIMELINE_SCALE) * Demo.model.TIMELINE_SCALE;
            _dragElement.endTime = timeRatio * x;

        } else if (_isDraggingFront) {
            x = Math.min(Math.max(x, 0), endTimeX - Demo.model.TIMELINE_SCALE);
            x = Math.floor(x / Demo.model.TIMELINE_SCALE) * Demo.model.TIMELINE_SCALE;
            _dragElement.startTime = timeRatio * x;
        }

        _dragElement.duration = Math.ceil(_dragElement.endTime - _dragElement.startTime);
        _dragElement.updateVisual();

        updateSceneList();
    }

    function sceneChangeStart(e) {

        _offsetX = e.offsetX;
        var dragElementID = e.target.getAttribute("dataID");
        _dragElement = _sceneList.find(dragElementID).data;

        var sceneWidth = Demo.model.TIMELINE_WIDTH / Demo.model.TIMELINE_DURATION * _dragElement.duration;

        if (e.offsetX < Demo.model.TIMELINE_CURSOR_PADDING) {
            e.target.classList.add('cursorResize');
            //change length by dragging at the font
            _isDraggingFront = true;
        } else if (e.offsetX > sceneWidth - Demo.model.TIMELINE_CURSOR_PADDING) {
            e.target.classList.add('cursorResize');
            //change length by dragging at the back
            _offsetX = _offsetX - sceneWidth;
            _isDraggingBack = true;
        } else {
            e.target.classList.add('cursorDrag');
            //move scene around
            _isDragging = true;
        }

        document.addEventListener('mousemove', sceneMouseChange, false);
        document.addEventListener('mouseup', sceneDragDone, false);
    }

    function _handleCursorChange(e) {

        if (!_isDragging && !_isDraggingBack && !_isDraggingFront) {
            var elementID = e.target.getAttribute("dataID"),
                sceneWidth = Demo.model.TIMELINE_WIDTH / Demo.model.TIMELINE_DURATION * _sceneList.find(elementID).data.duration;

            if ((e.offsetX < Demo.model.TIMELINE_CURSOR_PADDING) || (e.offsetX > sceneWidth - Demo.model.TIMELINE_CURSOR_PADDING)) {
                //resize
                e.target.classList.remove('cursorDrag');
                e.target.classList.add('cursorResize');
            } else {
                //move
                e.target.classList.add('cursorDrag');
                e.target.classList.remove('cursorResize');
            }
        }
    }

    function updateSceneList(redraw) {
        var rebuildList = [],
            node = _sceneList.first;

        while (node !== undefined) {
            var laScene = node.data;
            rebuildList.push({
                'name': node.name,
                'scene': laScene.scene,
                'startTime': laScene.startTime,
                'endTime': laScene.endTime,
                'duration': laScene.duration,
                'layerIndex': laScene.layerIndex,
                'active': false});

            node = node.next;
        }

        //for drawing order reverse the list
        Demo.sceneList.list(rebuildList.reverse());
        Demo.forceRenderUpdate();

        //dirty hack as we only append new scenes in the DOM despite we insert them at the top of the list
        if (redraw){
            loadSceneListFromDemo();
        }
    }

    function loadSceneListFromDemo() {

        _element.innerHTML = '';
        _sceneHeaderHolder.innerHTML = '';

        _sceneList = new DoublyLinkedList();

        var list = Demo.sceneList.list().reverse();

        for (var i = 0; i < list.length; i++) {
            add(new TRBLMaker.Scene(list[i].scene, list[i].startTime, list[i].endTime, list[i].name || getVariableName(list[i].scene)));
        }
    }

    function add(newScene, where, method) {

        var pointer = _sceneList.last,
            how = method || 'insertAfter';
        if (where === "front") {
            pointer = _sceneList.first;
        }

        //add into stack
        var added = _sceneList[how](pointer, {
            "data": newScene,
            "name": newScene.sceneName,
            "id": newScene.id,
            "properties": {
                "locked": false,
                "visible": true
            }
        });

        if (_sceneList.first) {
            var out = "",
                n = _sceneList.first;
            while (n !== undefined) {
                out += n.name + ' < ';
                n = n.next;
            }
            console.log(out);
        }

        var title = document.createElement('div');
        title.setAttribute('dataID', added.id);
        title.setAttribute('class', "header");
        title.innerText = added.name;
        _sceneHeaderHolder.appendChild(title);

        added.data.element.setAttribute('dataID', added.id);
        _element.appendChild(added.data.element);

        added.data.updateVisual();

        //HACKFIX: we can't define a different cursor for pseudo elements and the actual scene
        //therefore we can't show resize and move
        added.data.element.addEventListener('mousemove', _handleCursorChange, false);

        //moveable scene
        added.data.element.addEventListener('mousedown', sceneChangeStart, false);
    }

    //--
    pollAudioReady();

    return {
        update: update,
        add: add,
        updateSceneList: updateSceneList
    };
};
// mog
/*jslint devel: true, browser: true */
TRBLMaker.GUI.FPS = function (holder) {
    "use strict";

    var WIDTH = 48,
        HEIGHT = 48,
        MAX_FPS = 90,
        BG_COLOR = '#333333',
        BAR_COLOR = '#669900',
        GRID_COLOR = 'rgba(238, 238, 238, .5)',
        _holder = holder,
        _ctx,
        _fpsCounter;

    function addLine(fps) {

        var drawHeight = Math.round(HEIGHT / MAX_FPS * fps);

        //move one pixel left
        _ctx.drawImage(_ctx.canvas, 1, 0, WIDTH - 1, HEIGHT, 0, 0, WIDTH - 1, HEIGHT);

        _ctx.save();

        //bg
        _ctx.fillStyle = BG_COLOR;
        _ctx.fillRect(WIDTH - 1, 0, 1, HEIGHT - drawHeight);

        //graph
        _ctx.fillStyle = BAR_COLOR;
        _ctx.fillRect(WIDTH - 1, HEIGHT - drawHeight, 1, drawHeight);

        //grid
        _ctx.fillStyle = GRID_COLOR;
        _ctx.fillRect(WIDTH - 1, HEIGHT - Math.round(HEIGHT / MAX_FPS * 60), 1, 1);
        _ctx.fillRect(WIDTH - 1, HEIGHT - Math.round(HEIGHT / MAX_FPS * 30), 1, 1);
        _ctx.fillRect(WIDTH - 1, HEIGHT - Math.round(HEIGHT / MAX_FPS * 24), 1, 1);

        _ctx.restore();
    }

    function createGraph() {

       var canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.cssText = "float:left;";
        _ctx = canvas.getContext('2d');

        _ctx.save();
        _ctx.fillStyle = BG_COLOR;
        _ctx.fillRect(0, 0, WIDTH, HEIGHT);

        _ctx.fillStyle = GRID_COLOR;
        _ctx.fillRect(0, HEIGHT - Math.round(HEIGHT / MAX_FPS * 60), WIDTH, 1);
        _ctx.fillRect(0, HEIGHT - Math.round(HEIGHT / MAX_FPS * 30), WIDTH, 1);
        _ctx.fillRect(0, HEIGHT - Math.round(HEIGHT / MAX_FPS * 24), WIDTH, 1);
        _ctx.restore();

        _holder.appendChild(canvas);
    }

    function createText() {
        _fpsCounter = document.createElement("div");
        _fpsCounter.setAttribute("class", "fps text");
        _holder.appendChild(_fpsCounter);
    }

    function update(fps) {
        addLine(fps);

        _fpsCounter.innerHTML = fps;
    }

    (function init() {
        createText();
        createGraph();
    })();

    return {

        update:update
    };
};
TRBLMaker.GUI.ObjectList = function (timeline, pew) {

    var _timeline = timeline,
        _holder;

    //hardcoded for now
    var _available = [
        {name: "Noise",
        constructor: Noise}
    ];

    (function init(){
        _holder = document.createElement('div');
        _holder.setAttribute("id", "objectlist");
        _holder.setAttribute("class", "trblDebug");

        for(var i = 0; i < _available.length; i++){
            var effect = document.createElement('div');
            effect.innerHTML = _available[i].name;
            effect.setAttribute('dataID', i+"");

            effect.addEventListener("click", addToSceneList, false);
            _holder.appendChild(effect);
        }

        document.body.appendChild(_holder);
    })();

    var counter = 0;
    function addToSceneList(e){

        if(e.target.getAttribute('dataID')){

            var id = e.target.getAttribute('dataID');

            var newScene = new _available[id].constructor();
            newScene.setContext(Demo.model.twoDeeRenderer);

            _timeline.add(new TRBLMaker.Scene(newScene, 0, 100, _available[id].name + counter++), 'front', 'insertBefore');
            _timeline.updateSceneList(true);
        }
    }
};
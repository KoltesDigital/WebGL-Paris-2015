var EndSlide = (function () {

	"use strict";

	var _model,
		_duration = 0,
		_sync,
		_width,
		_height,
		_ctx,
		_btx,
		_preflightCallback,
		_wave,
		_s;

	var _blackFade,
		_glow;

	var text = "moep".toUpperCase(),
		fontSize,
		texture = [];

	function preflight(callbackFn, duration, model) {
		_preflightCallback = callbackFn;

		_duration = duration;
		_model = model;

		_sync = _model.sync;
		_width = _model.width();
		_height = _model.height();

		initSync();

		_ctx = _model.twoDeeRenderer;

		_btx = document.createElement('canvas').getContext('2d');
		_btx.canvas.width = _width;
		_btx.canvas.height = _height;

		_preflightCallback();
	}

	function init() {
		_model.on("resize", resize);

		Random.seed(243234234, 456456234, 456456546, 3446534435);

		_wave = new WavingWave();
		_wave.setContext(_ctx);

		_s = new Starfield();
		_s.setContext(_ctx);
		_s.setCenter(_width / 2, _height);

		_ctx.strokeStyle = '#000000';

		fontSize = 200 / 1920 * _width;

		texture = [
			Meat.himmel,
			Meat.kreise,
			Meat.kreuze,
			Meat.ovale_punkte,
			Meat.pillen,
			Meat.punkte,
			Meat.querstreifen,
			Meat.streifen,
			Meat.wellen_gr,
			Meat.wellen_kl,
			Meat.zickzack
		]
	}

	function initSync() {
		_blackFade = _sync.getTrack('blackFade');
		_glow = _sync.getTrack('glow');
	}

	function render(row, sceneTime, frameDelta) {

		_ctx.clearRect(0, 0, _width, _height);

		var glow = _glow.getValue(row),
			bF = _blackFade.getValue(row);

		if (bF > 0) {
			_ctx.fillStyle = "rgba(0,0,0," + bF + ")";
			_ctx.fillRect(0, 0, _width, _height);
		}

		//source in
		_ctx.save();
		_ctx.font = "bold "+ fontSize +"px Arial";
		_ctx.fillText(text, 20 / 1920 * _width, 200 / 1920 * _width);

		//draw shadow
		_btx.clearRect(0, 0, _width, _height);
		_btx.drawImage(texture[2], 0, 0, _width, _height);


		_btx.clearRect(0, 0, _width, _height);
		_btx.drawImage(texture[0], 0, 0, _width, _height);
		_btx.drawImage(texture[1], 0, 0, _width, _height);

		_ctx.clearRect(0, 0, _width, _height);
		//source in
		_ctx.save();
		_ctx.font = "bold "+ fontSize +"px Arial";
		_ctx.fillText(text, 20 / 1920 * _width, 200 / 1920 * _width);

		_ctx.globalCompositeOperation = "source-in";
		_ctx.drawImage(_btx.canvas, 0, 0, _width, _height);

		_ctx.restore();


		if (glow > 0) {
			var glowScale = 1;

			for (var i = 0; i < 4; i++) {
				glowScale += .01;
				var sW = _width * glowScale,
					sH = _height * glowScale;
				_ctx.save();
				_ctx.globalCompositeOperation = 'lighter';
				_ctx.globalAlpha = glow;
				_ctx.drawImage(_ctx.canvas, (_width - sW) / 2, (_height - sH) / 2, sW, sH);
				_ctx.restore();
			}
		}

		_ctx.drawImage(Meat.vignette, 0, 0, _width, _height);
	}

	function clear() {
		_model.on("resize", function () {
		});
	}

	function resize(width, height) {
		_width = width;
		_height = height;
	}

	return {
		preflight: preflight,
		init: init,
		render: render,
		clear: clear,
		resize: resize
	};
}());
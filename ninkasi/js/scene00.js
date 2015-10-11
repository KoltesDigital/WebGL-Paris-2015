var Intro = (function () {

	"use strict";

	var _model,
		_duration = 0,
		_sync,
		_width,
		_height,
		_ctx,
		_btx,
		_ltx,
		_preflightCallback,
		_wave,
		_s,
		_noise,
		_ntx

	var STROKE_COLOR = "#59ffff",
    	BACKGROUND_COLOR = "#0f0100",
    	OBJECT_COLOR = "#000100";
	
	var _startX = _width/2,
    	_startY = _height/2;

	var SPEED,
    	MAXWIDTH;

	var _blackFade,
		_glow,
		_objectIndex,
		_travelSpeed,
		_compoLogosIndex,

		_kaleidoskop,
        _kctx,
        _kParts,
        _kStartAngle,
        _kMulti,

        _sunHeight,

        _slice,
		_sliceStripes,
		_sliceMulti,
		_sliceAmp,
		_sliceAngle,

		_logoGlow,
		_logoAlpha,
		_noiseAlpha,

		_rotation,
		_cityScale,
		_cityScaleMonuments,
		_cityIndex,
		_cityMonumentIndex,

        _d;

	var _p = [];

	function preflight(callbackFn, duration, model) {

		_preflightCallback = callbackFn;

		_duration = duration;
		_model = model;

		_sync = _model.sync;
		_width = _model.width();
		_height = _model.height();

		MAXWIDTH = _width;

		initSync();

		_ctx = _model.twoDeeRenderer;

		_preflightCallback();


		var c = document.createElement('canvas');
        c.width = _width;
        c.height = _height;
        _kctx = c.getContext('2d');

        _kaleidoskop = new Kaleidoscope();
        _kaleidoskop.setContext(_kctx);
	}

	function init() {
		_model.on("resize", resize);

		Random.seed(243234234, 456456234, 456456546, 3446534435);
/*
		_wave = new WavingWave();
		_wave.setContext(_ctx);
*/
		_s = new Starfield();
		_s.setContext(_ctx);
		_s.setCenter(_width / 2, _height/2);

		_ctx.strokeStyle = '#000000';

		_btx = document.createElement('canvas').getContext('2d');

		_btx.canvas.width = _width;
		_btx.canvas.height = _height;

		_startX = _width/2;
		_startY = _height/2;


		_ltx = document.createElement('canvas').getContext('2d');

		_ltx.canvas.width = _width;
		_ltx.canvas.height = _height;

		_slice = new Slice();

		//noise start
		_noise = new Noise();
		_ntx = document.createElement('canvas').getContext('2d');
		_ntx.canvas.width = _width/4;
		_ntx.canvas.height = _height/4;
		_noise.setContext(_ntx);
		//noise end

/*
		_d = new Dither();
		_d.setFillColor('#1f1f1f');
		_d.setContextInput(_ctx);
		_d.setContext(_ctx);
		*/
	}

	function initSync() {
		_blackFade = _sync.getTrack('blackFade');
		_glow = _sync.getTrack('glow');

		_compoLogosIndex = _sync.getTrack('compoLogoIndex'),

		_objectIndex = _sync.getTrack('objectIndex');
		_travelSpeed = _sync.getTrack('travelSpeed');

		//_blackFade = _sync.getTrack('blackFade');
        _kParts = _sync.getTrack('k:Parts');
        _kStartAngle = _sync.getTrack('k:StartAngle');
        _kMulti = _sync.getTrack('k:xyMulti');

        _sunHeight = _sync.getTrack('sunY');

		_sliceStripes = _sync.getTrack('s:stripes');
        _sliceMulti = _sync.getTrack('s:multi');
        _sliceAmp = _sync.getTrack('s:amp');
        _sliceAngle = _sync.getTrack('s:angle');

        _logoAlpha = _sync.getTrack('logoAlpha');
        _logoGlow = _sync.getTrack('logoglow');

        _noiseAlpha = _sync.getTrack('noiseAlpha');

        _rotation = _sync.getTrack('rotation');

        _cityScale = _sync.getTrack('city_sprite');
        _cityScaleMonuments = _sync.getTrack('city_sprite_monuments');

        _cityIndex = _sync.getTrack('city_sprite_index');
        _cityMonumentIndex = _sync.getTrack('city_sprite_monuments_index');
	}

	var _prevObjIndex;
	function render(row, sceneTime, frameDelta) {

		_ctx.fillStyle = BACKGROUND_COLOR;
		_ctx.fillRect(0, 0, _width, _height);

		var glow = _glow.getValue(row),
			bF = _blackFade.getValue(row);

		SPEED = _travelSpeed.getValue(row);
/*
		if(_objectIndex.getValue(row) !== _prevObjIndex){

			var objList = Object.keys(objects);

			console.log("push", objects[ objList[ _objectIndex.getValue(row) ] ]);

    		_p.push( objects[ objList[ _objectIndex.getValue(row) ] ] );

    		console.log(">> insert", _p);

    		_prevObjIndex = _objectIndex.getValue(row);
		}
*/
		//--

		
//--

		_s.render(frameDelta / (SPEED * 10) );
		_ctx.globalAlpha = 1;

		drawBackground(row);

	    renderRoad(row);
	    
	    _ctx.fillStyle = OBJECT_COLOR;
	    _ctx.lineJoin = "round";
	    _ctx.strokeStyle = STROKE_COLOR;


	    //scale city start
	    var indexListCity = ["none", "city_sprite", "city_sprite_light"],
	    	indexCity = indexListCity[ _cityIndex.getValue(row) ],
	    	indexListMonument = ["none", "city_sprite_monuments", "city_sprite_monuments_light"],
	    	indexMonument = indexListMonument[ _cityMonumentIndex.getValue(row) ];

	    if(Meat[indexCity]){
		    var cityScaleValue = _cityScale.getValue(row),
		    	scaledCityWidth = (Meat[indexCity].width / 1920 * _width) * cityScaleValue,
		    	scaledCityHeight = (Meat[indexCity].height  /1920 * _width) * cityScaleValue;

		    _ctx.drawImage(Meat[indexCity], (_width - scaledCityWidth) / 2,
		    	//y value
		    	_startY - scaledCityHeight,

		     scaledCityWidth, scaledCityHeight);
		}

		if(Meat[indexMonument]){
		    //monuments start
		    var cityScaleMonumentsValue = _cityScaleMonuments.getValue(row),
		    	cityScaleMonumentsWidth = (Meat[indexMonument].width / 1920 * _width) * cityScaleMonumentsValue,
		    	cityScaleMonumentsHeight = (Meat[indexMonument].height / 1920 * _width) * cityScaleMonumentsValue;
		    	
		    _ctx.drawImage(Meat[indexMonument], (_width - cityScaleMonumentsWidth) / 2,
		    	//y value
		    	_startY - cityScaleMonumentsHeight,

		    cityScaleMonumentsWidth, cityScaleMonumentsHeight);
		}
		//scale city end


	    //rotation start
		_ctx.save();
		_ctx.translate(_width/2, _height/2);		
		_ctx.rotate( _rotation.getValue(row) * Math.PI / 180 );
		_ctx.translate(-_width/2, -_height/2);
		_ctx.drawImage(_ctx.canvas, 0, 0);
		_ctx.restore();
		//rotation end
		//--




/*
	    for(var i = 0, len = _p.length; i < len; i++){

//----!!!

			if(!_p[i])
				return;
//---!!!

	        if(_p[i].start && isNaN(_p[i].start)){
	        	console.log("isNaN", _p[i])
	            _p[i]["start"] = row;
	        }

	        var delta = row - _p[i].start,
	            factor,
	            depth;
	        
	        //parts
	        for(var objName in _p[i].parts){
	            
	            factor = Math.easeInExpo(delta, 0, MAXWIDTH, SPEED),
	            //depth = Math.min(Math.easeInExpo(delta, 0.2, .7, SPEED), .7);
	            depth = .5 / SPEED * delta;
	        
	            var object = _p[i].parts[objName];
	            
	            //draw object
	            for(var pointIndex = 0, pLen = object.points.length - 1; pointIndex < pLen; pointIndex++){
	            
	                drawQuad(object.points, pointIndex, factor, depth);
	            }
	        
	            if(!object.hollow){

	                drawQuadOutside(object.points, factor, depth);
	            }
	        }
	        
	        if(factor > MAXWIDTH){
	        	console.log("purge", _p.length);
	            //_p[i] = _objectIndex.getValue(row);
	            delete _p[i].start;
	        }
	    }
	    */
//--
	
		//_d.render();

		showCompoLogo(row);

		

		//kaleido start
		if(_kParts.getValue(row) > 0 ) {
			_kctx.clearRect(0, 0, _width, _height);

	        _kaleidoskop.setAngle(_kStartAngle.getValue(row));
	        _kaleidoskop.setParts(_kParts.getValue(row));
	        var multi = 100 / 1920 * _kMulti.getValue(row),
	            offX = Math.cos(row / 20) * multi,
	            offY = Math.sin(row / 10) * multi;

	        _kctx.drawImage(_ltx.canvas, offX, offY);

	        _kaleidoskop.render();

	        _ctx.drawImage(_kctx.canvas, 0,0);
		}
		//kaleido end

		var noiseAlpha = _noiseAlpha.getValue(row);
		if(noiseAlpha > 0){
			_ctx.save();
			_noise.render();
			_ctx.globalAlpha = noiseAlpha;
		    _ctx.drawImage(_ntx.canvas, 0, 0, _width, _height);
		    _ctx.restore();
		}

		//start glow
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
		//end glow

		

		_ctx.drawImage(Meat.vignette, 0, 0, _width, _height);

		//bars start
		/*
		_ctx.fillStyle = '#000';
	    var barHeight = Math.ceil(130 / 1920 * _width);
	    _ctx.fillRect(0, 0, _width, barHeight);
	    _ctx.fillRect(0, _height - barHeight, _width, barHeight);
	    */
	    //bars end

	    

		if (bF > 0) {
			_ctx.fillStyle = "rgba(0,0,0," + bF + ")";
			_ctx.fillRect(0, 0, _width, _height);
		}
	}

	function showCompoLogo(row){


		var idx = _compoLogosIndex.getValue(row);

		if(idx === 0)
			return;

		var compoLogos = ["none",
			"compo_wild",
			"compo_themed",
			"compo_animation_video",
			"compo_graphics_oldschool",
			"compo_graphics_freestyle",
			"compo_textmode",
			"compo_oldschool_intro",
			"compo_oldschool_demo",
			"compo_pc_8k",
			"compo_pc_64k",
			"compo_pc_demo",
			"compo_music_streaming",
			"compo_music_tracked",

			"intro_slide_0",
			"intro_slide_1",
			"intro_slide_2",

			"intro_slide_10",
			"intro_slide_11",
			"deadline",
			"deadline_date",

			"claim_01",
			"claim_02",
			"claim_03",
			"claim_04",
			"claim_05"
		];

		_ltx.save();
		_ltx.globalAlpha = _logoAlpha.getValue(row);


		_slice.setStripes(_sliceStripes.getValue(row));
        _slice.setAmplitudeMultiplicator(_sliceMulti.getValue(row));
        _slice.setMaxAmplitude((100 / 1920 * _width) * _sliceAmp.getValue(row));
        _slice.setAngle(_sliceAngle.getValue(row));

		_ltx.clearRect(0, 0, _width, _height);
		_slice.setContext(_ltx);

		if(Meat[ compoLogos[idx] ]) {
			var scaledWidth  = Meat[ compoLogos[idx] ].width / 1920 * _width,
				scaledHeight = Meat[ compoLogos[idx] ].height / 1920 * _width;

			_ltx.drawImage(Meat[ compoLogos[idx] ], (_width - scaledWidth) / 2, (_height - scaledHeight) / 2, scaledWidth, scaledHeight);
			_slice.setImage(_ltx.canvas);
		
			_slice.render(row);
		}

		var logoGlow = _logoGlow.getValue(row);

		//start logoGlow
		if (logoGlow > 0) {
			var glowScale = 1;

			for (var i = 0; i < 4; i++) {
				glowScale += .01;
				var sW = _width * glowScale,
					sH = _height * glowScale;

				_ltx.save();
				_ltx.globalCompositeOperation = 'lighter';
				_ltx.globalAlpha = logoGlow;
				_ltx.drawImage(_ltx.canvas, (_width - sW) / 2, (_height - sH) / 2, sW, sH);
				_ltx.restore();
			}
		}
		//end logoGlow
		if(_kParts.getValue(row) === 0 )
			_ctx.drawImage(_ltx.canvas, 0, 0);

		_ltx.restore();
	}

	function drawQuadOutside(pointList, factor, depth){

	    //top one
	    drawQuad(pointList, 0, factor, depth, true);

	    _ctx.beginPath();
	    //start in upper right corner
	    _ctx.moveTo(_startX + (pointList[0].x * factor),
	                _startY + (pointList[0].y * factor));

	    //front facing cam
	    for(var p = 1, pLen = pointList.length - 1; p < pLen; p++){
	        _ctx.lineTo(_startX + (pointList[p].x * factor),
	                    _startY + (pointList[p].y * factor));
	    }
	    
	    _ctx.closePath();
	    _ctx.stroke();
	    _ctx.fill();
	}

	function drawQuad(pointList, p, factor, depth, noStroke){

	    _ctx.beginPath();
	    //start in upper right corner
	    _ctx.moveTo(_startX + (pointList[p].x * factor),
	                _startY + (pointList[p].y * factor));
	    
	    _ctx.lineTo(_startX + (pointList[p+1].x * factor),
	                _startY + (pointList[p+1].y * factor));
	    
	    //draw far away part
	    factor *= depth;
	    _ctx.lineTo(_startX + (pointList[p+1].x * factor),
	                _startY + (pointList[p+1].y * factor));
	   
	    _ctx.lineTo(_startX + (pointList[p].x * factor),
	                _startY + (pointList[p].y * factor));
	                
	    _ctx.closePath();
	    
	    if(!noStroke){
	        _ctx.shadowColor = STROKE_COLOR;
	        _ctx.shadowBlur = 10 / 1920 * _width;
	    
	        _ctx.stroke();
	    }

	    _ctx.fill();
	    
	    _ctx.shadowBlur = 0;
	}

	function drawBackground(row){
	    //sun

	    var sunY = (200 / 1920 * _width) * _sunHeight.getValue(row);

	    _ctx.beginPath();
	    _ctx.fillStyle = STROKE_COLOR;
	    _ctx.arc(_startX, _startY + sunY, _height/3, 0, 2 * Math.PI);
	    _ctx.closePath();
	    _ctx.shadowColor = STROKE_COLOR;
	    _ctx.shadowBlur = 300 / 1920 * _width;
	    _ctx.fill();
	    
	    _ctx.shadowBlur = 0;
	    
	    //clear below horizon
	    _ctx.fillStyle = BACKGROUND_COLOR;
	    _ctx.fillRect(0, _startY, _width, _height - _startY);
	}

	var _startTime;
	function renderRoad(time){
	    
	    var delta = time - (_startTime || 0);

	    if(delta > SPEED){
	        delta = delta - SPEED;
	        _startTime = time - delta;
	    }

	    var stripes = 15,
	        stripeWidthMin = 0 / 1920 * _width,
	        stripeWidthMax = 40 / 1920 * _width;

	    _ctx.fillStyle = STROKE_COLOR;
	    
	    for(var i = 0; i < stripes; i++){

	        var currentTime = delta + (SPEED / stripes) * i;
	        
	        if(currentTime >= SPEED)
	            currentTime = currentTime - SPEED;

	        var y = Math.easeInExpo(currentTime, 0, _height - _startY, SPEED);
	        //_ctx.shadowBlur = 10 / 1920 * _width;
	        _ctx.fillRect(0, _startY + y, _width, Math.easeInExpo(currentTime, stripeWidthMin, stripeWidthMax, SPEED));
	    }
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
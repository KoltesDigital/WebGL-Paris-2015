// ----------------------------------------------------------------------------
//
// orca
//
// ----------------------------------------------------------------------------

// global
var screenCanvas, screenWidth, screenHeight, screenAspect;
var noiseBuffer, offScreenBuffer, offSecondBuffer;
var hBlurBuffer, vBlurBuffer, edgeBuffer;
var screenSize = 512;
var bufferSize = 512;
var offScreenSize = 512;
var w   = new wgld();
var mat = new matIV();
var qtn = new qtnIV();
var rad = new radian();

var scene = 0;
var count = 0;
var startTimes = 0;
var getTimes = 0;
var run = true;
var pi  = Math.PI;

var jsonData = null;
var jsonLoaded = false;

// events

// audio
var audioCtr = new AudioCtr(0.9, 0.9);

window.onload = function(){
	var i = 0;
	screenCanvas = document.getElementById('canvas');
	screenSize = Math.min(window.innerWidth, window.innerHeight);
	screenCanvas.width  = window.innerWidth;
	screenCanvas.height = screenSize;
	screenWidth  = screenCanvas.width;
	screenHeight = screenCanvas.height;
	screenAspect = screenWidth / screenHeight;
	w.init(screenCanvas);
	do{
		i++;
		offScreenSize = Math.pow(2, i);
	}while(Math.pow(2, i + 1) < screenSize);
	offScreenSize = Math.max(1024, offScreenSize);
	bufferSize = offScreenSize;

	window.addEventListener('keydown', keyDown, true);

	audioCtr.load('snd/bgm.mp3', 0, false, true);

	var e = document.getElementById('navi');
	e.style.lineHeight = window.innerHeight + 'px';
	e.innerText = 'loading...';

	main();
};

function main(){
	var i, j;
	var ease5  = [];
	var ease10 = [];
	var ease20 = [];
	var ease30 = [];

	var e = document.getElementById('navi');
	e.style.lineHeight = window.innerHeight + 'px';
	
	// line base shader program -----------------------------------------------
	var basePrg = w.generate_program(
		'baseVS',
		'baseFS',
		['position'],
		[3],
		['mvpMatrix', 'ambient'],
		['matrix4fv', '4fv']
	);

	// board rect program -----------------------------------------------------
	var boardPrg = w.generate_program(
		'boardVS',
		'boardFS',
		['index'],
		[1],
		['position', 'texCoord', 'texture', 'tex', 'bgcolor', 'aspect'],
		['3fv', '2fv', '1i', '1i', '4fv', '1f']
	);

	// noise programs ---------------------------------------------------------
	var noisePrg = w.generate_program(
		'noiseVS',
		'noiseFS',
		['position'],
		[3],
		['map', 'mapSize', 'resolution'],
		['1i', '1f', '2fv']
	);

	// glow programs ----------------------------------------------------------
	var glowPrg = w.generate_program(
		'glowVS',
		'glowFS',
		['position'],
		[3],
		['mode', 'time', 'resolution', 'texture', 'ambient', 'lines'],
		['1i', '1f', '2fv', '1i', '4fv', '1f']
	);

	// edge programs ----------------------------------------------------------
	var edgePrg = w.generate_program(
		'edgeVS',
		'edgeFS',
		['position', 'texCoord'],
		[3, 2],
		['mvpMatrix', 'texture', 'kernel', 'resolution', 'monochrome'],
		['matrix4fv', '1i', '1fv', '1f', '1i']
	);

	// blur programs ----------------------------------------------------------
	var blurPrg = w.generate_program(
		'blurVS',
		'blurFS',
		['position', 'texCoord'],
		[3, 2],
		['mvpMatrix', 'texture', 'weight', 'resolution', 'horizon'],
		['matrix4fv', '1i', '1fv', '1f', '1i']
	);

	// color programs ---------------------------------------------------------
	var colorPrg = w.generate_program(
		'colorVS',
		'colorFS',
		['position', 'normal', 'color', 'texCoord', 'type'],
		[3, 3, 4, 2, 1],
		['mMatrix', 'mvpMatrix', 'invMatrix', 'lightPosition', 'eyePosition', 'canterPoint', 'ambient', 'mode', 'texture', 'onData', 'times', 'motion'],
		['matrix4fv', 'matrix4fv', 'matrix4fv', '3fv', '3fv', '3fv', '4fv', '1i', '1i', '1iv', '1f', '1i']
	);

	// particle programs ------------------------------------------------------
	var particlePrg = w.generate_program(
		'particleVS',
		'particleFS',
		['position', 'params'],
		[3, 3],
		['mMatrix', 'mvpMatrix', 'eyePosition', 'times', 'ambient', 'canvasTexture', 'noiseTexture', 'scales'],
		['matrix4fv', 'matrix4fv', '3fv', '1f', '4fv', '1i', '1i', '1f']
	);

	// board
	var bIndex = [0, 1, 2, 3];
	var board = w.create_vbo(bIndex);
	var boardVBOList = [board];
	var boardPosition = new Array();
	var boardColor = new Array();
	var boardCoord = new Array();
	var idx = [0, 1, 2, 2, 1, 3];
	var boardIndex = w.create_ibo(idx);
	var boardIndexLength = idx.length;

	// board const
	var B_FULL = 0;
	var B_TITLE = 1;
	var B_END = 2;

	// board - full
	boardPosition[B_FULL] = [
		-1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	boardColor[B_FULL] = [1.0, 1.0, 1.0, 1.0];
	boardCoord[B_FULL] = [
		0.0, 0.0,
		0.0, 1.0,
		1.0, 0.0,
		1.0, 1.0
	];

	// board - title
	boardPosition[B_TITLE] = [
		-1.0,  0.5,  0.0,
		-1.0, -0.5,  0.0,
		 1.0,  0.5,  0.0,
		 1.0, -0.5,  0.0
	];
	boardColor[B_TITLE] = [1.0, 1.0, 1.0, 1.0];
	boardCoord[B_TITLE] = [
		0.0, 1.0,
		0.0, 0.5,
		1.0, 1.0,
		1.0, 0.5
	];

	// board - end
	boardPosition[B_END] = [
		-0.5,  0.5,  0.0,
		-0.5, -0.5,  0.0,
		 0.5,  0.5,  0.0,
		 0.5, -0.5,  0.0
	];
	boardColor[B_END] = [1.0, 1.0, 1.0, 1.0];
	boardCoord[B_END] = [
		0.5, 0.5,
		0.5, 0.0,
		1.0, 0.5,
		1.0, 0.0
	];

	var blurVBOList = [w.create_vbo(boardPosition[B_FULL]), w.create_vbo(boardCoord[B_FULL])];
	var blurIBO = w.create_ibo(idx);
	var blurIndexLength = idx.length;

	var innerData = [];
	innerData[0]  = sphere(16, 16, 1.0, [1.0, 0.1, 0.1, 1.0], [ 0.0,  0.0,  0.0], [1.0, 1.0, 1.0], 0.0);
	innerData[1]  = sphere(16, 16, 1.0, [0.0, 0.7, 0.2, 1.0], [ 0.8,  1.0,  2.1], [0.7, 0.3, 0.3], 1.0);
	innerData[2]  = sphere(16, 16, 1.5, [0.0, 0.2, 1.0, 1.0], [ 1.5,  0.5, -1.9], [0.8, 0.1, 0.1], 2.0);
	innerData[3]  = sphere(16, 16, 1.5, [0.0, 0.2, 1.0, 1.0], [ 2.1, -0.7, -2.5], [0.8, 0.1, 0.1], 2.0);
	innerData[4]  = sphere(16, 16, 1.5, [0.0, 0.2, 1.0, 1.0], [ 2.7, -1.8, -2.5], [0.8, 0.1, 0.1], 2.0);
	innerData[5]  = sphere(16, 16, 1.0, [0.7, 0.7, 1.0, 1.0], [-1.3, -1.0,  1.3], [0.5, 0.3, 0.3], 3.0);
	innerData[6]  = sphere(16, 16, 2.0, [0.7, 0.0, 1.0, 1.0], [-0.8, -1.3, -1.7], [0.6, 0.3, 0.3], 4.0);
	innerData[7]  = sphere(16, 16, 1.0, [0.0, 0.7, 1.0, 1.0], [-1.3, -2.0,  2.0], [1.0, 0.3, 0.3], 5.0);
	innerData[8]  = sphere(16, 16, 1.0, [0.6, 0.6, 0.8, 1.0], [ 2.3,  1.7, -2.0], [1.0, 0.5, 0.5], 6.0);
	innerData[9]  = sphere(16, 16, 1.0, [0.5, 0.5, 0.5, 1.0], [ 2.1,  0.5,  2.0], [1.0, 0.3, 0.3], 2.0);
	innerData[10] = sphere(16, 16, 2.0, [0.7, 0.0, 1.0, 1.0], [ 2.3, -1.0,  2.5], [0.4, 0.1, 0.1],10.0);
	innerData[11] = sphere(16, 16, 1.5, [0.0, 0.7, 1.0, 1.0], [ 0.7,  2.0,  0.7], [0.5, 0.3, 0.3], 5.0);
	innerData[12] = sphere(16, 16, 0.5, [0.0, 0.7, 0.2, 1.0], [ 4.0,  2.3, -2.5], [1.0, 0.3, 0.3], 2.0);
	innerData[13] = sphere(16, 16, 0.5, [0.7, 0.7, 0.2, 1.0], [ 1.7, -2.0,  1.3], [0.3, 0.3, 0.3], 3.0);
	innerData[14] = sphere(16, 16, 2.0, [0.3, 0.3, 0.5, 1.0], [-3.0,  0.8,  0.0], [0.3, 0.3, 0.3], 4.0);
	innerData[15] = sphere(16, 16, 0.5, [0.6, 0.6, 0.8, 1.0], [ 2.3, -2.5, -1.3], [0.3, 0.3, 0.3], 1.0);
	innerData[16] = sphere(16, 16, 1.3, [0.7, 0.1, 0.2, 1.0], [ 4.0,  0.5,  0.0], [1.0, 1.0, 1.0], 1.0);
	innerData[17] = sphere(16, 16, 1.1, [0.7, 0.1, 0.2, 1.0], [ 9.0,  0.2,  0.0], [1.0, 1.0, 1.0], 2.0);
	innerData[18] = sphere(16, 16, 0.9, [0.7, 0.1, 0.2, 1.0], [12.5, -0.4,  0.0], [1.0, 1.0, 1.0], 3.0);
	innerData[19] = sphere(16, 16, 0.7, [0.7, 0.1, 0.2, 1.0], [15.0, -1.2,  0.0], [1.0, 1.0, 1.0], 4.0);
	innerData[20] = sphere(16, 16, 0.5, [0.7, 0.1, 0.2, 1.0], [16.8, -1.8,  0.0], [1.0, 1.0, 1.0], 5.0);
	innerData[21] = sphere(16, 16, 0.3, [0.7, 0.1, 0.2, 1.0], [18.1, -2.2,  0.0], [1.0, 1.0, 1.0], 6.0);
	innerData[22] = sphere(16, 16, 0.2, [0.7, 0.1, 0.2, 1.0], [18.8, -2.7,  0.0], [1.0, 1.0, 1.0], 7.0);
	innerData[23] = sphere(16, 16, 0.1, [0.7, 0.1, 0.2, 1.0], [19.5, -3.3,  0.0], [1.0, 1.0, 1.0], 8.0);
	innerData[24] = sphere(16, 16, 1.0, [0.3, 0.3, 0.5, 1.0], [ 5.0, -2.0,  1.0], [0.5, 0.5, 0.5], 3.0);
	for(i = 1, j = innerData.length; i < j; i++){
		mergeIndex(innerData[0], innerData[i]);
	}
	var innerPosition    = w.create_vbo(innerData[0].position);
	var innerNormal      = w.create_vbo(innerData[0].normal);
	var innerColor       = w.create_vbo(innerData[0].color);
	var innerTexCoord    = w.create_vbo(innerData[0].texCoord);
	var innerType        = w.create_vbo(innerData[0].type);
	var innerVBOList     = [innerPosition, innerNormal, innerColor, innerTexCoord, innerType];
	var innerIndex       = w.create_ibo(innerData[0].index);
	var innerIndexLength = innerData[0].index.length;

	// box lines
	var boxData = ball(3, 3, 2.0);
	var boxPosition    = w.create_vbo(boxData.position);
	var boxVBOList     = [boxPosition];
	var boxIndexLength = boxData.position.length / 3;

	// ball lines
	var ballData = ball(6, 6, 1.5);
	var ballPosition    = w.create_vbo(ballData.position);
	var ballVBOList     = [ballPosition];
	var ballIndexLength = ballData.position.length / 3;

	// noise
	var noiseData = plane(1.0);
	var noisePosition    = w.create_vbo(noiseData.position);
	var noiseVBOList     = [noisePosition];
	var noiseIndex       = w.create_ibo(noiseData.index);
	var noiseIndexLength = noiseData.index.length;

	// particle
	var particleData = cylinderParticle(30.0, 20.0, 1500);
	var particlePosition = w.create_vbo(particleData.position);
	var particleParam    = w.create_vbo(particleData.param);
	var particleVBOList  = [particlePosition, particleParam];
	var particleLength   = particleData.position.length / 3;

	// json
	var jsonPosition = null;
	var jsonnormal   = null;
	var jsoncolor    = null;
	var jsontexcoord = null;
	var jsonvbolist  = null;
	var jsonindex    = null;
	var jsonindexlength = 0;
	jsonLoader('mdl/whale.json');

	// matrix and other data initialize phase ---------------------------------
	var mMatrix   = mat.identity(mat.create());
	var vMatrix   = mat.identity(mat.create());
	var pMatrix   = mat.identity(mat.create());
	var tmpMatrix = mat.identity(mat.create());
	var mvpMatrix = mat.identity(mat.create());
	var invMatrix = mat.identity(mat.create());
	var ortMatrix = mat.identity(mat.create());
	var jmMatrix  = mat.identity(mat.create());

	var qt1 = qtn.identity(qtn.create());
	var qt2 = qtn.identity(qtn.create());
	var qtd = qtn.identity(qtn.create());

	// ortho
	mat.lookAt([0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
	mat.ortho(-1.0, 1.0, 1.0, -1.0, 0.1, 1.0, pMatrix);
	mat.multiply(pMatrix, vMatrix, ortMatrix);

	// frame buffer  initialize phase -----------------------------------------
	noiseBuffer     = w.create_framebuffer(bufferSize, bufferSize);
	offScreenBuffer = w.create_framebuffer(offScreenSize, offScreenSize);
	offSecondBuffer = w.create_framebuffer(offScreenSize, offScreenSize);
	hBlurBuffer     = w.create_framebuffer(offScreenSize, offScreenSize);
	vBlurBuffer     = w.create_framebuffer(offScreenSize, offScreenSize);
	edgeBuffer      = w.create_framebuffer(offScreenSize, offScreenSize);

	// noise data initialize --------------------------------------------------
	w.gl.bindFramebuffer(w.gl.FRAMEBUFFER, noiseBuffer.f);
	w.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	w.gl.clear(w.gl.COLOR_BUFFER_BIT);
	w.gl.viewport(0, 0, bufferSize, bufferSize);
	noisePrg.set_program();
	noisePrg.set_attribute(noiseVBOList);
	w.gl.bindBuffer(w.gl.ELEMENT_ARRAY_BUFFER, noiseIndex);
	noisePrg.push_shader([true, bufferSize, [bufferSize, bufferSize]]);
	w.gl.drawElements(w.gl.TRIANGLES, noiseIndexLength, w.gl.UNSIGNED_SHORT, 0);
	w.gl.flush();

	// initialize setting phase -----------------------------------------------
	w.gl.bindFramebuffer(w.gl.FRAMEBUFFER, null);
	//w.gl.enable(w.gl.DEPTH_TEST);
	//w.gl.depthFunc(w.gl.LEQUAL);
	w.gl.enable(w.gl.CULL_FACE);
	w.gl.enable(w.gl.BLEND);
	w.gl.blendFuncSeparate(w.gl.SRC_ALPHA, w.gl.ONE, w.gl.ONE, w.gl.ONE);
	w.gl.blendEquationSeparate(w.gl.FUNC_ADD, w.gl.FUNC_ADD);
	w.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	w.gl.clearDepth(1.0);

	for(i = 0; i <= 5;  i++){ease5[i]  = easeOutCubic(i * 0.2);}
	for(i = 0; i <= 10; i++){ease10[i] = easeOutCubic(i * 0.1);}
	for(i = 0; i <= 20; i++){ease20[i] = easeOutCubic(i * (1 / 20));}
	for(i = 0; i <= 30; i++){ease30[i] = easeOutCubic(i * (1 / 30));}

	// gaussian weight
	var weight = new Array(10);
	var t = 0.0;
	var d = 100.0;
	for(i = 0; i < weight.length; i++){
		var r = 1.0 + 2.0 * i;
		var v = Math.exp(-0.5 * (r * r) / d);
		weight[i] = v;
		if(i > 0){v *= 2.0;}
		t += v;
	}
	for(i = 0; i < weight.length; i++){
		weight[i] /= t;
	}

	// kernel
	var kernel = [
		1.0,  1.0,  1.0,
		1.0, -8.0,  1.0,
		1.0,  1.0,  1.0
	];

	// light
	var lightPosition = [0.577, 0.577, 0.577];
	
	// loading wait -----------------------------------------------------------
	(function(){
		if(audioCtr.loadComplete() && jsonLoaded){
			// jsondata initialize phase --------------------------------------
			jsonData.color = [];
			jsonData.type = [];
			for(var i = 0, j = jsonData.vertex; i < j; i++){
				jsonData.color.push(0.3, 0.3, 0.3, 1.0);
				jsonData.type.push(0.0);
			}
			jsonPosition = w.create_vbo(jsonData.position);
			jsonNormal   = w.create_vbo(jsonData.normal);
			jsonColor    = w.create_vbo(jsonData.color);
			jsonTexCoord = w.create_vbo(jsonData.texCoord);
			jsonType     = w.create_vbo(jsonData.type);
			jsonVBOList  = [jsonPosition, jsonNormal, jsonColor, jsonTexCoord, jsonType];
			jsonIndex    = w.create_ibo(jsonData.index);
			jsonIndexLength = jsonData.index.length;

			// texture binding
			w.gl.activeTexture(w.gl.TEXTURE1);
			w.gl.bindTexture(w.gl.TEXTURE_2D, noiseBuffer.t);
			w.gl.activeTexture(w.gl.TEXTURE0);

			// dom update and background music play
			var e = document.getElementById('navi');
			e.innerText = 'done';
			e.className = 'hide';
			setTimeout(function(){
				// variable initialize
				startTimes = Date.now();
				scene = 0;
				e.className = 'none';

				var cd = new canvasDrawer('texture');
				cd.drawText('BALENA', 512, 65, 240, 20);
				cd.drawText('Tokyo Demo Fest 2015', 512, 360, 48, 20);
				cd.drawText('doxas', 768, 680, 120, 20);
				cd.drawText('- wgld.org -', 768, 830, 32, 20);
				cd.drawCircle(256, 768, 120, 100);
				cd.drawCircle(256, 768, 120, 100);
				cd.drawCircle(256, 768, 120,  90);
				cd.drawCircle(256, 768, 120,  90);
				cd.drawCircle(256, 768, 120,  80);
				cd.drawCircle(256, 768, 120,  80);
				cd.drawCircle(256, 768, 120,  70);
				cd.drawCircle(256, 768, 120,  70);
				cd.drawCircle(256, 768, 120,  60);
				cd.drawCircle(256, 768, 120,  60);
				cd.drawCircle(256, 768, 120,  50);
				cd.drawCircle(256, 768, 120,  50);
				cd.drawCircle(256, 768, 120,  40);
				cd.drawCircle(256, 768, 120,  40);
				cd.drawCircle(256, 768, 120,  30);
				cd.drawCircle(256, 768, 120,  30);
				cd.drawCircle(256, 768, 120,  20);
				cd.drawCircle(256, 768, 120,  20);
				cd.drawCircle(256, 768, 120,  10);
				cd.drawCircle(256, 768, 120,  10);

				// texture initialize phase -----------------------------------------------
				w.create_texture_canvas(document.getElementById('texture'), 0);

				audioCtr.src[0].play();
				render();
			}, 5000);
		}else{
			setTimeout(arguments.callee, 100);
		}
	})();

	// render function --------------------------------------------------------
	function render(){
		var i, j, k, l;
		var gl = w.gl;
		getTimes = (Date.now() - startTimes) / 1000;

		// initialize
		count++;
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		screenAspect = screenWidth / screenHeight;
		screenCanvas.width = screenWidth;
		screenCanvas.height = screenHeight;

		// scene
		var whaleColor, innerColor;
		var titleColor, endColor;
		var blurColor, edgeColor, glowColor, particleColor;
		var lines = 0.1, motion = 0, monochrome = false;
		var camPosition = [0.0, 0.0, 25.0];
		var camCenter   = [0.0, 0.0, 0.0];
		var camUp       = [0.0, 1.0, 0.0];
		var scaleCoef = 0.4;
		var onData = [];
		var particleScale = 1.0;
		var particleSize = 1.0;
		for(i = 0; i < 16; i++){onData[i] = audioCtr.src[0].onData[i];}
		mat.identity(jmMatrix);
		qt1 = qtn.identity(qtn.create());
		qt2 = qtn.identity(qtn.create());
		switch(scene){
			case 0:
				// opening scene > title fade in
				i = getTimes / 5;
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0,  i ];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 0.0];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 5){scene++;}
				break;
			case 1:
				// opening scene > title fade out
				i = 1 - (getTimes - 5) / 5;
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0,  i ];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 0.0];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 10){scene++;}
				break;
			case 2:
				// glow fade in
				i = (getTimes - 10) / 10;
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3,  i ];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 20){scene++;}
				break;
			case 3:
				// wait
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 27){scene++;}
				break;
			case 4:
				// whale fade in
				monochrome = true;
				i = Math.min((getTimes - 27) / 28, 1.0);
				j = -(1.0 - i) * 125.0;
				k = pi * 2.0 - (1.0 - i) * pi / 4;
				mat.translate(jmMatrix, [0.0, 0.0, j], jmMatrix);
				mat.rotate(jmMatrix, rad.rad[270], [0.0, 1.0, 0.0], jmMatrix);
				mat.rotate(jmMatrix, k, [0.0, 1.0, 1.0], jmMatrix);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5,  i ];
				edgeColor     = [1.0, 1.0, 1.0,  i ];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 55){scene++;}
				break;
			case 5:
				// whale roll 1
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 55) / 13, 1.0);
				qtn.rotate(pi * 4, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 2, [0.577, 0.577, 0.577], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 0.0, 9.0 + i * 5.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, i / 2];
				if(getTimes > 68){scene++;}
				break;
			case 6:
				// whale roll 2 high speed
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 68) / 6, 1.0);
				qtn.rotate(pi / 4, [0.0, 0.0, 1.0], qt1);
				qtn.rotate(pi / 4, [0.707, 0.707, 0.0], qt2);
				qtn.slerp(qt2, qt1, i, qtd);
				camPosition = [i * 5.0, 0.0, 12.0 - i * 4.0];
				camCenter = [i * 4.0, 0.0, 0.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, 0.5];
				if(getTimes > 71){scene++;}
				break;
			case 7:
				// whale roll 3
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 71) / 4, 1.0);
				qtn.rotate(-pi / 4, [0.0, 0.0, 1.0], qt1);
				qtn.rotate(pi / 4, [0.707, 0.0, 0.707], qt2);
				qtn.slerp(qt2, qt1, i, qtd);
				camPosition = [0.0, 0.0, 7.0 - i * 2.0];
				camCenter = [0.0, 0.0, 0.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, 0.5];
				if(getTimes > 74){scene++;}
				break;
			case 8:
				// whale roll 4
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 74) / 14, 1.0);
				j = easeOutCubic(i + 0.5);
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 2, [0.0, 0.707, 0.707], qt2);
				qtn.slerp(qt2, qt1, j, qtd);
				camPosition = [0.0, 5.0 - j * 5.0, 12.0 - j * 2.0];
				camCenter = [0.0, 5.0 - j * 5.0, 0.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.1, 0.5, 0.7, 0.5 + i];
				if(getTimes > 81){scene++;}
				break;
			case 9:
				// particle scale
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 81), 1.0);
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt1);
				camPosition = [0.0, 0.0, 10.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				particleScale = 1.0 - easeQuintic(i);
				particleSize = 1.0 + i * 5.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0, 0.2, 0.3, 1.0];
				particleColor = [0.5, 0.8, 1.0,  i ];
				if(getTimes > 82){scene++;}
				break;
			case 10:
				// white out
				motion = 1;
				monochrome = true;
				i = Math.min((getTimes - 82) * 1.25, 1.0);
				j = i * 25;
				lines *= 1.0 - i;
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt1);
				camPosition = [0.0, 0.0, 10.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				particleScale = easeQuintic(i);
				particleSize = 6.0 - i * 5.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0,  i ];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.0 + j, 0.2 + j, 0.3 + j, 1.0];
				particleColor = [0.5, 0.8, 1.0, 1.0];
				if(getTimes > 82.75){scene++;}
				break;
			case 11:
				// fade in
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 82.75) * 4.0, 1.0);
				j = i * 25;
				lines = 0.0;
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt1);
				camPosition = [0.0, 0.0, 10.0 + easeOutCubic(i) * 10.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [25.2 - j, 25.5 - j, 25.7 - j, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 83){scene++;}
				break;
			case 12:
				// color 1
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 83) / 6.0, 1.0);
				qtn.rotate(pi - pi * 2, [0.577, 0.577, 0.577], qt1);
				qtn.rotate(pi - pi * 3, [0.0, 0.707, 0.707], qt2);
				qtn.slerp(qt1, qt2, easing(i), qtd);
				camPosition = [0.0, 0.0, 15.0 - i * 5.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				particleScale = 0.8;
				particleSize = 1.5;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 89){scene++;}
				break;
			case 13:
				// color 2
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 89) / 5.0, 1.0);
				qtn.rotate(pi - pi / 4, [0.0, 0.707, 0.707], qt1);
				qtn.rotate(pi / 4, [0.707, -0.707, 0.0], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 0.0, 20.0 - easeOutCubic(i) * 3.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 0.8;
				particleSize = 1.5;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 94){scene++;}
				break;
			case 14:
				// color 3
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 94) / 6.0, 1.0);
				qtn.rotate(pi / 4, [0.577, 0.577, 0.577], qt1);
				qtn.rotate(pi - pi * 2, [0.0, 1.0, 0.0], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 0.0, 10.0 - i * 0.1];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 0.8;
				particleSize = 2.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 100){scene++;}
				break;
			case 15:
				// color 4
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 100) / 10.0, 1.0);
				qtn.rotate(pi / 4, [-0.577, 0.577, 0.577], qt1);
				qtn.rotate(pi - pi / 4, [0.707, 0.707, 0.0], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 0.0, 7.0 + i * 8.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 2.5;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 110){scene++;}
				break;
			case 16:
				// color 5
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 110) / 5.0, 1.0);
				qtn.rotate(pi - pi * 2, [-0.577, 0.577, 0.577], qt1);
				qtn.rotate(pi - pi * 2, [0.707, 0.707, 0.0], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 1.0, 10.0];
				camCenter = [0.0, 1.0, 3.0 - i * 6.0];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 2.5;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 115){scene++;}
				break;
			case 17:
				// color 6
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 115) / 15.0, 1.0);
				qtn.rotate(pi - pi / 4, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 2, [0.0, 1.0, 0.0], qt2);
				qtn.slerp(qt1, qt2, i, qtd);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 2.0 + i * 10.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2, 0.5, 0.7, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 130){scene++;}
				break;
			case 18:
				// color 7 and wait
				lines = 0.0;
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 130) / 5.0, 1.0);
				j = i * 0.3;
				qtn.rotate(pi / 2.5, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 2, [0.0, 1.0, 0.0], qt2);
				qtn.slerp(qt2, qt1, i, qtd);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 12.0 + i * 3.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.2 + j / 2, 0.5 + j / 2, 0.7 + j, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 135){scene++;}
				break;
			case 19:
				// color 8 and white
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 135) / 15.0, 1.0);
				lines *= i;
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 2.5, [0.0, 1.0, 0.0], qt2);
				qtn.slerp(qt2, qt1, i, qtd);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 15.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.35, 0.65, 1.0, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 150){scene++;}
				break;
			case 20:
				// color 9 and white
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 150) / 15.0, 1.0);
				lines += i * 0.1;
				qtn.rotate(pi - pi / 2, [0.0, 1.0, 0.0], qt1);
				qtn.rotate(pi / 4, [0.0, 1.0, 0.0], qt2);
				qtn.slerp(qt2, qt1, easing(i), qtd);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qtd, camPosition);
				qtn.toVecIII(camUp, qtd, camUp);
				particleScale = 1.0;
				particleSize = 15.0;
				whaleColor    = [1.0, 1.0, 1.0, 1.0];
				innerColor    = [1.0, 1.0, 1.0, 1.0];
				blurColor     = [5.5, 5.5, 5.5, 1.0];
				edgeColor     = [1.0, 1.0, 1.0, 1.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.35, 0.65, 1.0, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 165){scene++;}
				break;
			case 21:
				// whale fade out
				motion = 2;
				monochrome = false;
				i = Math.min((getTimes - 165) / 15.0, 1.0);
				j = easing(1.0 - i);
				k = Math.pow(1.0 - i, 5.0);
				lines = 0.2;
				mat.scale(jmMatrix, [j, j, j], jmMatrix);
				qtn.rotate(pi - pi / 2, [0.0, 1.0, 0.0], qt1);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qt1, camPosition);
				qtn.toVecIII(camUp, qt1, camUp);
				particleScale = 1.0;
				particleSize = 15.0;
				whaleColor    = [1.0, 1.0, 1.0,  k ];
				innerColor    = [1.0, 1.0, 1.0,  k ];
				blurColor     = [5.5, 5.5, 5.5,  k ];
				edgeColor     = [1.0, 1.0, 1.0,  k ];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0, 0.0];
				glowColor     = [0.35, 0.65, 1.0, 1.0];
				particleColor = [0.1, 0.5, 0.7, 1.0];
				if(getTimes > 180){scene++;}
				break;
			case 22:
				// whale fade out
				i = Math.min((getTimes - 180) / 10.0, 1.0);
				j = 1.0 - i;
				lines = 0.2;
				qtn.rotate(pi - pi / 2, [0.0, 1.0, 0.0], qt1);
				camPosition = [0.0, 15.0, 15.0];
				camUp = [0.0, 0.707, -0.707];
				qtn.toVecIII(camPosition, qt1, camPosition);
				qtn.toVecIII(camUp, qt1, camUp);
				particleScale = 1.0;
				particleSize = 15.0;
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0,  i ];
				glowColor     = [0.35, 0.65, 1.0,  j ];
				particleColor = [0.1, 0.5, 0.7,  j ];
				if(getTimes > 190){scene++;}
				break;
			case 23:
				// end roll
				i = Math.min((getTimes - 190) / 10.0, 1.0);
				j = 1.0 - i;
				whaleColor    = [1.0, 1.0, 1.0, 0.0];
				innerColor    = [1.0, 1.0, 1.0, 0.0];
				blurColor     = [5.5, 5.5, 5.5, 0.0];
				edgeColor     = [1.0, 1.0, 1.0, 0.0];
				titleColor    = [1.0, 1.0, 1.0, 0.0];
				endColor      = [1.0, 1.0, 1.0,  j ];
				glowColor     = [0.35, 0.65, 1.0, 0.0];
				particleColor = [0.1, 0.5, 0.7, 0.0];
				if(getTimes > 200){scene++;}
				break;
			case 24:
				run = false;
				break;
		}

		// camera and scene
		mat.lookAt(camPosition, camCenter, camUp, vMatrix);
		mat.perspective(45, screenAspect, 0.1, 200.0, pMatrix);
		mat.multiply(pMatrix, vMatrix, tmpMatrix);

		// off screen blend draw
		gl.enable(gl.BLEND);

		gl.bindFramebuffer(gl.FRAMEBUFFER, offSecondBuffer.f);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, offScreenSize, offScreenSize);

		offRender(false, true);

		// off screen edge color draw
		gl.disable(gl.BLEND);

		gl.bindFramebuffer(gl.FRAMEBUFFER, offScreenBuffer.f);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, offScreenSize, offScreenSize);

		offRender(true, true);

		// edge
		gl.bindTexture(gl.TEXTURE_2D, offScreenBuffer.t);
		gl.bindFramebuffer(gl.FRAMEBUFFER, edgeBuffer.f);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, offScreenSize, offScreenSize);

		edgePrg.set_program();
		edgePrg.set_attribute(blurVBOList);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, blurIBO);
		edgePrg.push_shader([ortMatrix, 0, kernel, offScreenSize, monochrome]);
		gl.drawElements(gl.TRIANGLES, blurIndexLength, gl.UNSIGNED_SHORT, 0);

		// horizon blur
		gl.bindTexture(gl.TEXTURE_2D, edgeBuffer.t);
		gl.bindFramebuffer(gl.FRAMEBUFFER, hBlurBuffer.f);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, offScreenSize, offScreenSize);

		blurPrg.set_program();
		blurPrg.set_attribute(blurVBOList);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, blurIBO);
		blurPrg.push_shader([ortMatrix, 0, weight, offScreenSize, true]);
		gl.drawElements(gl.TRIANGLES, blurIndexLength, gl.UNSIGNED_SHORT, 0);

		// vertical blur
		gl.bindTexture(gl.TEXTURE_2D, hBlurBuffer.t);
		gl.bindFramebuffer(gl.FRAMEBUFFER, vBlurBuffer.f);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, offScreenSize, offScreenSize);

		blurPrg.push_shader([ortMatrix, 0, weight, offScreenSize, false]);
		gl.drawElements(gl.TRIANGLES, blurIndexLength, gl.UNSIGNED_SHORT, 0);

		// final scene
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, screenWidth, screenHeight);
		gl.enable(gl.BLEND);

		// board
		boardPrg.set_program();
		boardPrg.set_attribute(boardVBOList);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boardIndex);
		// color
		gl.bindTexture(gl.TEXTURE_2D, offSecondBuffer.t);
		boardPrg.push_shader([boardPosition[B_FULL], boardCoord[B_FULL], 0, true, [1.0, 1.0, 1.0, 1.0], 1.0]);
		gl.drawElements(gl.TRIANGLES, boardIndexLength, gl.UNSIGNED_SHORT, 0);
		// edge blur
		gl.bindTexture(gl.TEXTURE_2D, vBlurBuffer.t);
		boardPrg.push_shader([boardPosition[B_FULL], boardCoord[B_FULL], 0, true, blurColor, 1.0]);
		gl.drawElements(gl.TRIANGLES, boardIndexLength, gl.UNSIGNED_SHORT, 0);
		// edge line
		gl.bindTexture(gl.TEXTURE_2D, edgeBuffer.t);
		boardPrg.push_shader([boardPosition[B_FULL], boardCoord[B_FULL], 0, true, edgeColor, 1.0]);
		gl.drawElements(gl.TRIANGLES, boardIndexLength, gl.UNSIGNED_SHORT, 0);
		// title text
		gl.bindTexture(gl.TEXTURE_2D, w.texture[0]);
		boardPrg.push_shader([boardPosition[B_TITLE], boardCoord[B_TITLE], 0, true, titleColor, screenAspect]);
		gl.drawElements(gl.TRIANGLES, boardIndexLength, gl.UNSIGNED_SHORT, 0);
		// end text
		gl.bindTexture(gl.TEXTURE_2D, w.texture[0]);
		boardPrg.push_shader([boardPosition[B_END], boardCoord[B_END], 0, true, endColor, screenAspect]);
		gl.drawElements(gl.TRIANGLES, boardIndexLength, gl.UNSIGNED_SHORT, 0);


		// noise glow
		glowPrg.set_program();
		glowPrg.set_attribute(noiseVBOList);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, noiseIndex);
		glowPrg.push_shader([0, getTimes, [screenWidth, screenHeight], 1, glowColor, lines]);
		gl.drawElements(gl.TRIANGLES, noiseIndexLength, gl.UNSIGNED_SHORT, 0);

		// particle vetices
		gl.bindTexture(gl.TEXTURE_2D, w.texture[0]);
		particlePrg.set_program();
		particlePrg.set_attribute(particleVBOList);
		mat.identity(mMatrix);
		mat.scale(mMatrix, [particleScale, particleScale, particleScale], mMatrix);
		mat.multiply(tmpMatrix, mMatrix, mvpMatrix);
		particlePrg.push_shader([mMatrix, mvpMatrix, camPosition, getTimes, particleColor, 0, 1, particleSize]);
		gl.drawArrays(gl.POINTS, 0, particleLength);


		// finish
		gl.flush();
		if(run){requestAnimationFrame(render);}

		// offrender
		function offRender(jsons, inners){
			// inner
			colorPrg.set_program();

			if(jsons){
				colorPrg.set_attribute(jsonVBOList);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, jsonIndex);
				mat.multiply(tmpMatrix, jmMatrix, mvpMatrix);
				mat.inverse(jmMatrix, invMatrix);
				colorPrg.push_shader([
					jmMatrix,
					mvpMatrix,
					invMatrix,
					lightPosition,
					camPosition,
					camCenter,
					whaleColor,
					3,
					0,
					onData,
					getTimes,
					motion
				]);
				gl.drawElements(gl.TRIANGLES, jsonIndexLength, gl.UNSIGNED_SHORT, 0);
			}

			if(inners){
				colorPrg.set_attribute(innerVBOList);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, innerIndex);
				mat.scale(jmMatrix, [scaleCoef, scaleCoef, scaleCoef], mMatrix);
				mat.multiply(tmpMatrix, mMatrix, mvpMatrix);
				mat.inverse(mMatrix, invMatrix);
				colorPrg.push_shader([
					jmMatrix,
					mvpMatrix,
					invMatrix,
					lightPosition,
					camPosition,
					camCenter,
					innerColor,
					3,
					0,
					onData,
					getTimes,
					motion
				]);
				gl.drawElements(gl.TRIANGLES, innerIndexLength, gl.UNSIGNED_SHORT, 0);
			}
		}
	}
}

// event and utility function =================================================
function mergeIndex(baseArr, concatArr){
	var i, j;
	var firstIndex = baseArr.position.length / 3;
	for(i = 0, j = concatArr.index.length; i < j; i++){
		baseArr.index.push(concatArr.index[i] + firstIndex);
	}
	baseArr.position = baseArr.position.concat(concatArr.position);
	baseArr.normal   = baseArr.normal.concat(concatArr.normal);
	baseArr.color    = baseArr.color.concat(concatArr.color);
	baseArr.texCoord = baseArr.texCoord.concat(concatArr.texCoord);
	baseArr.type     = baseArr.type.concat(concatArr.type);
}

function returnCoordArray(num, round){
	var i, j, k, l;
	var s = ('0000' + num).slice(-round);
	var n = new Array();
	var v = new Array();
	for(i = 0; i < round; i++){
		n[i] = parseInt(s.substr(i, 1));
		j = (n[i] % 4) * 0.25;
		k = Math.floor(n[i] / 4) * 0.25;
		v[i] = new Array(
			j, k, j, k + 0.25, j + 0.25, k, j + 0.25, k + 0.25
		);
	}
	return v;
}

function keyDown(e){
	var ck = e.keyCode;
	if(ck === 27){
		run = false;
		audioCtr.src[0].end(0);
	}else if(ck === 13){
		fullscreenRequest();
	}
}

function fullscreenRequest(){
	if(screenCanvas.requestFullscreen){
		screenCanvas.requestFullscreen();
	}else if(screenCanvas.webkitRequestFullscreen){
		screenCanvas.webkitRequestFullscreen();
	}else if(screenCanvas.mozRequestFullscreen){
		screenCanvas.mozRequestFullscreen();
	}else if(screenCanvas.msRequestFullscreen){
		screenCanvas.msRequestFullscreen();
	}
}
function easing(t){
	return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function easeOutCubic(t){
	return (t = t / 1 - 1) * t * t + 1;
}

function easeQuintic(t){
	var ts = (t = t / 1) * t;
	var tc = ts * t;
	return (tc * ts);
}

// ajax json data load ========================================================
function jsonLoader(url){
	var xml = new XMLHttpRequest();
	xml.open('GET', url, true);
	
	xml.onload = function(){
		jsonLoaded = false;
		try{
			jsonData = JSON.parse(xml.response);
			jsonLoaded = true;
		}catch(err){
			console.log(err);
		}
	};
	xml.send();
}

// ------------------------------------------------------------------------------------------------
// wgld.js
// version 0.0.3
// Copyright (c) doxas
// ------------------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------------------
// wgld
// ------------------------------------------------------------------------------------------------
function wgld(){}

wgld.prototype.ready   = false;
wgld.prototype.canvas  = null;
wgld.prototype.gl      = null;
wgld.prototype.texture = null;

wgld.prototype.init = function(canvas, options){
	var opt = options || {};
	this.canvas = canvas;
	this.gl = this.canvas.getContext('webgl', opt)
		   || this.canvas.getContext('experimental-webgl', opt);
	if(this.gl != null){
		this.ready = true;
		this.texture = new Array(this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	}
};

wgld.prototype.generate_program = function(vShader, fShader, attLocation, attStride, uniLocation, uniType){
	if(this.gl == null){return null;}
	var i;
	var w = new wgldPrg();
	w.parent = this.gl;
	w.vs = w.create_shader(vShader);
	w.fs = w.create_shader(fShader);
	w.prg = w.create_program(w.vs, w.fs);
	w.attL = new Array(attLocation.length);
	w.attS = new Array(attLocation.length);
	for(i = 0; i < attLocation.length; i++){
		w.attL[i] = this.gl.getAttribLocation(w.prg, attLocation[i]);
		w.attS[i] = attStride[i];
	}
	w.uniL = new Array(uniLocation.length);
	for(i = 0; i < uniLocation.length; i++){
		w.uniL[i] = this.gl.getUniformLocation(w.prg, uniLocation[i]);
	}
	w.uniT = uniType;
	return w;
};

wgld.prototype.create_vbo = function(data){
	var vbo = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
	return vbo;
};

wgld.prototype.create_ibo = function(data){
	var ibo = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
	return ibo;
};

wgld.prototype.create_texture = function(source, number){
	var img = new Image();
	var w = this;
	var gl = this.gl;
	img.onload = function(){
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		w.texture[number] = tex;
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	img.src = source;
};

wgld.prototype.create_texture_canvas = function(canvas, number){
	var tex = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
	this.texture[number] = tex;
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
};

wgld.prototype.create_framebuffer = function(width, height){
	var frameBuffer = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
	var depthRenderBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
	var fTexture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
};


wgld.prototype.create_framebuffer_cube = function(width, height, target){
	var frameBuffer = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
	var depthRenderBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);
	var fTexture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, fTexture);
	for(var i = 0; i < target.length; i++){
		this.gl.texImage2D(target[i], 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	}
	this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
};

wgld.prototype.create_cube_texture = function(source, target, number){
	var cImg = new Array();
	var gl = this.gl;
	for(var i = 0; i < source.length; i++){
		cImg[i] = new cubeMapImage();
		cImg[i].data.src = source[i];
	}
	function cubeMapImage(){
		this.data = new Image();
		this.data.onload = function(){
			this.imageDataLoaded = true;
			checkLoaded();
		};
	}
	function checkLoaded(){
		if( cImg[0].data.imageDataLoaded &&
			cImg[1].data.imageDataLoaded &&
			cImg[2].data.imageDataLoaded &&
			cImg[3].data.imageDataLoaded &&
			cImg[4].data.imageDataLoaded &&
			cImg[5].data.imageDataLoaded){generateCubeMap();}
	}
	function generateCubeMap(){
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
		for(var j = 0; j < source.length; j++){
			gl.texImage2D(target[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cImg[j].data);
		}
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		this.texture[number] = tex;
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	}
};

// ------------------------------------------------------------------------------------------------
// wgldPrg
// ------------------------------------------------------------------------------------------------
function wgldPrg(){}

wgldPrg.prototype.parent = null;
wgldPrg.prototype.vs     = null;
wgldPrg.prototype.fs     = null;
wgldPrg.prototype.prg    = null;
wgldPrg.prototype.attL   = null;
wgldPrg.prototype.attS   = null;
wgldPrg.prototype.uniL   = null;
wgldPrg.prototype.uniT   = null;

wgldPrg.prototype.create_shader = function(id){
	var shader;
	var scriptElement = document.getElementById(id);
	if(!scriptElement){return;}
	switch(scriptElement.type){
		case 'x-shader/x-vertex':
			shader = this.parent.createShader(this.parent.VERTEX_SHADER);
			break;
		case 'x-shader/x-fragment':
			shader = this.parent.createShader(this.parent.FRAGMENT_SHADER);
			break;
		default :
			return;
	}
	this.parent.shaderSource(shader, scriptElement.text);
	this.parent.compileShader(shader);
	if(this.parent.getShaderParameter(shader, this.parent.COMPILE_STATUS)){
		return shader;
	}else{
		alert(this.parent.getShaderInfoLog(shader));
	}
};

wgldPrg.prototype.create_program = function(vs, fs){
	var program = this.parent.createProgram();
	this.parent.attachShader(program, vs);
	this.parent.attachShader(program, fs);
	this.parent.linkProgram(program);
	if(this.parent.getProgramParameter(program, this.parent.LINK_STATUS)){
		this.parent.useProgram(program);
		return program;
	}else{
		alert(this.parent.getProgramInfoLog(program));
	}
};

wgldPrg.prototype.set_program = function(){
	this.parent.useProgram(this.prg);
};

wgldPrg.prototype.set_attribute = function(vbo){
	for(var i in vbo){
		this.parent.bindBuffer(this.parent.ARRAY_BUFFER, vbo[i]);
		this.parent.enableVertexAttribArray(this.attL[i]);
		this.parent.vertexAttribPointer(this.attL[i], this.attS[i], this.parent.FLOAT, false, 0, 0);
	}
};

wgldPrg.prototype.push_shader = function(any){
	for(var i = 0, l = this.uniT.length; i < l; i++){
		switch(this.uniT[i]){
			case 'matrix4fv':
				this.parent.uniformMatrix4fv(this.uniL[i], false, any[i]);
				break;
			case '4fv':
				this.parent.uniform4fv(this.uniL[i], any[i]);
				break;
			case '3fv':
				this.parent.uniform3fv(this.uniL[i], any[i]);
				break;
			case '2fv':
				this.parent.uniform2fv(this.uniL[i], any[i]);
				break;
			case '1fv':
				this.parent.uniform1fv(this.uniL[i], any[i]);
				break;
			case '1f':
				this.parent.uniform1f(this.uniL[i], any[i]);
				break;
			case '1iv':
				this.parent.uniform1iv(this.uniL[i], any[i]);
				break;
			case '1i':
				this.parent.uniform1i(this.uniL[i], any[i]);
				break;
			default :
				break;
		}
	}
};

// ------------------------------------------------------------------------------------------------
// util
// ------------------------------------------------------------------------------------------------
function hsva(h, s, v, a){
	if(s > 1 || v > 1 || a > 1){return;}
	var th = h % 360;
	var i = Math.floor(th / 60);
	var f = th / 60 - i;
	var m = v * (1 - s);
	var n = v * (1 - s * f);
	var k = v * (1 - s * (1 - f));
	var color = new Array();
	if(!s > 0 && !s < 0){
		color.push(v, v, v, a); 
	} else {
		var r = new Array(v, n, m, m, k, v);
		var g = new Array(k, v, v, n, m, m);
		var b = new Array(m, m, k, v, v, n);
		color.push(r[i], g[i], b[i], a);
	}
	return color;
}

function mesh(){
	this.position;
	this.normal;
	this.color;
	this.texCoord;
	this.index;
}

function radian(){
	this.rad = new Array();
	this.sin = new Array();
	this.cos = new Array();
	for(var i = 0; i < 360; i++){
		this.rad.push(i * Math.PI / 180);
		this.sin.push(Math.sin(this.rad[i]));
		this.cos.push(Math.cos(this.rad[i]));
	}
}

// ------------------------------------------------------------------------------------------------
// mesh
// ------------------------------------------------------------------------------------------------
function plane(r){
	var pos = [
		-r,  r,  0.0,
		 r,  r,  0.0,
		-r, -r,  0.0,
		 r, -r,  0.0
	];
	var nor = [
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0
	];
	var col = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	var st = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];
	var idx = [
		0, 2, 1,
		1, 2, 3
	];
	var obj = new mesh();
	obj.position = pos;
	obj.normal   = nor;
	obj.color    = col;
	obj.texCoord = st;
	obj.index    = idx;
	return obj;
}

function cube(side, color){
	var hs = side * 0.5;
	var pos = [
		-hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
		-hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
		-hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
		-hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
		 hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
		-hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
	];
	var nor = [
		-1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
	];
	var col = new Array();
	for(var i = 0; i < pos.length / 3; i++){
		if(color){
			var tc = color;
		}else{
			tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
		}
		col.push(tc[0], tc[1], tc[2], tc[3]);
	}
	var st = [
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
	];
	var idx = [
		 0,  1,  2,  0,  2,  3,
		 4,  5,  6,  4,  6,  7,
		 8,  9, 10,  8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	];
	var obj = new mesh();
	obj.position = pos;
	obj.normal   = nor;
	obj.color    = col;
	obj.texCoord = st;
	obj.index    = idx;
	return obj;
}

function sphere(row, column, rad, color, offset, scale, type){
	var pos = [], nor = [],
	    col = [], st  = [],
	    idx = [], scl = [], ofs = [], typ = [];
	if(offset != null && offset.length === 3){
		ofs = offset;
	}else{
		ofs = [0.0, 0.0, 0.0];
	}
	if(scale != null && scale.length === 3){
		scl = scale;
	}else{
		scl = [1.0, 1.0, 1.0];
	}
	for(var i = 0; i <= row; i++){
		var r = Math.PI / row * i;
		var ry = Math.cos(r);
		var rr = Math.sin(r);
		for(var j = 0; j <= column; j++){
			var tr = Math.PI * 2 / column * j;
			var tx = rr * rad * Math.cos(tr);
			var ty = ry * rad;
			var tz = rr * rad * Math.sin(tr);
			var rx = rr * Math.cos(tr);
			var rz = rr * Math.sin(tr);
			if(color){
				var tc = color;
			}else{
				tc = hsva(360 / row * i, 1, 1, 1);
			}
			pos.push(tx * scl[0] + ofs[0], ty * scl[1] + ofs[1], tz * scl[2] + ofs[2]);
			nor.push(rx, ry, rz);
			col.push(tc[0], tc[1], tc[2], tc[3]);
			st.push(1 - 1 / column * j, 1 / row * i);
			typ.push(type);
		}
	}
	r = 0;
	for(i = 0; i < row; i++){
		for(j = 0; j < column; j++){
			r = (column + 1) * i + j;
			idx.push(r, r + 1, r + column + 2);
			idx.push(r, r + column + 2, r + column + 1);
		}
	}
	var obj = new mesh();
	obj.position = pos;
	obj.normal   = nor;
	obj.color    = col;
	obj.texCoord = st;
	obj.index    = idx;
	obj.type     = typ;
	return obj;
}

function hexahedron(scales, halfRowSplit, holizonSplit, color){
	var i, j, k;
	var x, y, z;
	var pos = new Array(), col = new Array();
	i = scales / holizonSplit;
	j = scales / (halfRowSplit - 1);
	pos.push(0.0,  scales, 0.0);
	pos.push(0.0, -scales, 0.0);
	for(k = 0; k <= holizonSplit * 2; k++){
		pos.push( scales, 0.0, scales - k * i);
		pos.push(-scales, 0.0, scales - k * i);
	}
	for(k = 1; k < holizonSplit * 2; k++){
		pos.push(scales - k * i, 0.0,  scales);
		pos.push(scales - k * i, 0.0, -scales);
	}
	for(k = 1; k < halfRowSplit - 1; k++){
		x = scales - j * k;
		y = j * k;
		z = scales - j * k;
		pos.push( x,  y,  z);
		pos.push(-x,  y,  z);
		pos.push( x,  y, -z);
		pos.push(-x,  y, -z);
		pos.push( x, -y,  z);
		pos.push(-x, -y,  z);
		pos.push( x, -y, -z);
		pos.push(-x, -y, -z);
	}
	i = pos.length / 3;
	for(j = 0; j < i; j++){
		if(color){
			var tc = color;
		}else{
			tc = hsva(360 / i * j, 1, 1, 1);
		}
		col.push(tc[0], tc[1], tc[2], tc[3]);
	}
	var obj = new mesh();
	obj.position = pos;
	obj.color    = col;
	return obj;
}

function cylinderParticle(zScale, rad, num){
	var i;
	var pos = [], prm = [];
	for(i = 0; i < num; i++){
		var rRadian = Math.random() * Math.PI * 2;
		var rDepth = zScale - Math.random() * zScale * 2;
		var rLength = Math.random();
		pos.push(
			Math.cos(rRadian) * rad * rLength,
			Math.sin(rRadian) * rad * rLength,
			rDepth
		);
		prm.push(
			Math.random(),
			Math.random(),
			Math.random()
		);
	}
	var obj = {};
	obj.position = pos;
	obj.param = prm;
	return obj;
}

function genNormal(v){
	var n = [0, 0, 0];
	for(var i = 0; i < v.length; i++){
		n[0] += v[i][0];
		n[1] += v[i][1];
		n[2] += v[i][2];
	}
	return vec3Normalize(n);
}

function vec3Normalize(v){
	var e;
	var n = [0.0, 0.0, 0.0];
	var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	if(l > 0){
		e = 1.0 / l;
		n[0] = v[0] * e;
		n[1] = v[1] * e;
		n[2] = v[2] * e;
	}
	return n;
}

function faceNormal(v0, v1, v2){
	var n = new Array();
	var vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
	var vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
	n[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
	n[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
	n[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
	return vec3Normalize(n);
}

function vec3Cross(v0, v1){
	n = [0.0, 0.0, 0.0];
	n[0] = v0[1] * v1[2] - v0[2] * v1[1];
	n[1] = v0[2] * v1[0] - v0[0] * v1[2];
	n[2] = v0[0] * v1[1] - v0[1] * v1[0];
	return n;
}

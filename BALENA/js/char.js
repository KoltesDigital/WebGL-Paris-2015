// ----------------------------------------------------------------------------
// 
// char.js
// 
// ----------------------------------------------------------------------------

// box
function box(side){
	var hs = side * 0.5;
	var pos = [
		 hs,  hs,  hs,  hs,  hs, -hs,  hs, -hs,  hs,  hs, -hs, -hs,  hs,  hs,  hs, // px
		-hs,  hs,  hs, -hs,  hs, -hs, -hs, -hs,  hs, -hs, -hs, -hs, -hs,  hs,  hs, // nx
		-hs,  hs, -hs,  hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs, -hs,  hs, -hs, // py
		-hs, -hs, -hs,  hs, -hs, -hs, -hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs, -hs, // ny
		-hs,  hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs, -hs,  hs, -hs,  hs,  hs, // pz
		-hs,  hs, -hs, -hs, -hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs, -hs,  hs, -hs  // nz
	];
	var obj = new mesh();
	obj.position = pos;
	return obj;
}

// ball
function ball(row, col, side, scale){
	if(row < 3 || col < 3){return null;}
	var obj = new mesh();
	var pos = [];
	var rSplit = (180 / (row - 1)) * Math.PI / 180;
	var cSplit = (180 / (col - 1)) * Math.PI / 180;
	var scl = [];
	if(scale != null && scale.length === 3){
		scl = scale;
	}else{
		scl = [1.0, 1.0, 1.0];
	}
	for(var i = 0; i < row - 1; i++){
		var t = Math.cos(rSplit * i) * side;
		var n = Math.cos(rSplit * (i + 1)) * side;
		var v = Math.sin(rSplit * i) * side;
		var w = Math.sin(rSplit * (i + 1)) * side;
		for(var j = 0; j < col * 2 - 2; j++){
			var x = Math.sin(cSplit * j);
			var z = Math.cos(cSplit * j);
			var p = Math.sin(cSplit * (j + 1));
			var q = Math.cos(cSplit * (j + 1));
			pos.push(
				x * v * scl[0], t * scl[1], z * v * scl[2],
				x * w * scl[0], n * scl[1], z * w * scl[2],
				p * v * scl[0], t * scl[1], q * v * scl[2],
				x * v * scl[0], t * scl[1], z * v * scl[2]
			);
		}
	}
	obj.position = pos;
	return obj;
}

// vector
function Vec(){
	this.x = this.y = this.z = 0.0;
}

Vec.prototype.arrow = function(v){
	var d = new Vec();
	d.x = v.x - this.x;
	d.y = v.y - this.y;
	d.z = v.z - this.z;
	return d;
};

Vec.prototype.length = function(){
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

Vec.prototype.normalize = function(){
	var l = 1 / this.length();
	this.x *= l;
	this.y *= l;
	this.z *= l;
};

// character
function Char(){
	this.position = new Vec();
	this.vpos = new Vec();
	this.speed = 0.02;
	this.life = 0;
	this.size = 0.25;
	this.alive = false;
}

Char.prototype.init = function(){
	this.position.x = 0.0;
	this.position.y = 0.0;
	this.position.z = 0.0;
	this.vpos.x = 0.0;
	this.vpos.y = 0.0;
	this.vpos.z = 0.0;
	this.alive = true;
};

Char.prototype.update = function(){
	this.vpos.x *= 0.975;
	this.vpos.y *= 0.975;
	this.vpos.z *= 0.975;
	if(Math.abs(this.vpos.x) < 0.0005){this.vpos.x = 0;}
	if(Math.abs(this.vpos.y) < 0.0005){this.vpos.y = 0;}
	if(Math.abs(this.vpos.z) < 0.0005){this.vpos.z = 0;}
};

function canvasDrawer(id){
	this.canvas = document.getElementById(id);
	this.canvas.width = 1024;
	this.canvas.height = 1024;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.fillStyle = 'white';
	this.ctx.textAlign = 'center';
	this.ctx.textBaseline = 'top';
	this.ctx.shadowColor = 'white';
}

canvasDrawer.prototype.drawText = function(text, x, y, size, blur){
	this.ctx.shadowBlur = blur;
	this.ctx.font = size + "px 'Cinzel Decorative', consolas, Monaco, monospace";
	this.ctx.fillText(text, x, y, 1024);
};

canvasDrawer.prototype.drawCircle = function(x, y, r, blur){
	this.ctx.shadowBlur = blur;
	this.ctx.arc(x, y, r, 0, Math.PI * 2, false);
	this.ctx.fill();
};


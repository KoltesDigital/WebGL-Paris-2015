function DemoDemo() {
	"use strict";
	DemoBase.call(this);
	this.init();
}

DemoDemo.prototype = Object.create(DemoBase.prototype);

DemoDemo.prototype.init = function () {
	DemoBase.prototype.init.call(this);

	//set demo data here
	this.model.AUDIO_URL = "data/alpha_c_-_ninkasi";
	this.model.ROCKET_URL = "data/ninkasi.rocket";
	this.model.BPM = 118;
	this.model.ROWS_PER_BEAT = 8;
	this.model.volume = 1;

	//this.addVignetteLayer();
};

DemoDemo.prototype.addVignetteLayer = function () {
	var v = document.createElement('canvas');
	v.width = this.model.width();
	v.height = this.model.height();
	v.style.cssText = this.model.twoDeeRenderer.canvas.style.cssText + 'z-index:1;background:none;';
	this.model.vignette = v.getContext('2d');
	this.model.stage.appendChild(v);
};

DemoDemo.prototype.initScenes = function () {

	DemoBase.prototype.initScenes.call(this);
	this.sceneList.add(Intro, 0, 1244);
	//this.sceneList.add(EndSlide, 448, 1000);

	this.sceneList.preflight();
};

DemoDemo.prototype.constructor = DemoDemo;
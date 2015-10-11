/* globals actions */

'use strict';

var styleVendors = ['webkit', 'moz', 'ms', 'o'];
function setStyleVendor(element, property, value) {
	element.style[property] = value;
	property = property[0].toUpperCase() + property.substr(1);
	styleVendors.forEach(function(prefix) {
		element.style[prefix + property] = value;
	});
}

function AudioEngine() {
	var ctx;
	try {
		if (window.AudioContext)
			ctx = new AudioContext();
		else if (window.webkitAudioContext)
			ctx = new webkitAudioContext();
		else {
			console.warn('Web Audio API is not supported!');
			return;
		}
	} catch (err) {
		console.error(err);
		return;
	}
	
	this.ctx = ctx;
	
	var audio = new Audio();
	/** const */ this.EXTENSIONS = [];
	if (audio.canPlayType('audio/ogg'))
		this.EXTENSIONS.push('.ogg');
	if (audio.canPlayType('audio/mp4'))
		this.EXTENSIONS.push('.m4a');
	if (audio.canPlayType('audio/wav'))
		this.EXTENSIONS.push('.wav');

	this.buffers = {};
}

AudioEngine.prototype.loadAssets = function(callback) {
	var self = this;
	var ctx = this.ctx;
	if (!ctx) return callback();
	
	var filenames = ['noise'];
	var loadedFiles = 0;

	function loaded() {
		++loadedFiles;
		if (loadedFiles === filenames.length) return callback();
	}

	filenames.forEach(function(filename) {
		function load(extensionIndex) {
			if (extensionIndex >= self.EXTENSIONS.length) {
				console.error('Cannot decode audio file %s', filename);
				return loaded();
			}
			
			var url = filename + self.EXTENSIONS[extensionIndex];
			
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload = function() {
				if (request.status >= 400) {
					return load(extensionIndex + 1);
				}
				
				ctx.decodeAudioData(request.response, function(buffer) {
					if (!buffer) {
						console.error('Error while decoding %s', url);
						return load(extensionIndex + 1);
					}
					
					self.buffers[filename] = buffer;
					return loaded();
				}, function() {
					console.error('Error while decoding %s', url);
					return load(extensionIndex + 1);
				});
			};

			request.onerror = function(err) {
				console.error(err);
				load(extensionIndex + 1);
			};

			request.send();
		}
		load(0);
	});
};

AudioEngine.prototype.createSource = function(bufferName) {
	var buffer = this.buffers[bufferName];
	if (!buffer) return;

	var sourceNode = this.ctx.createBufferSource();
	sourceNode.buffer = buffer;

	var gainNode = this.ctx.createGain();

	sourceNode.connect(gainNode);
	gainNode.connect(this.ctx.destination);

	return {
		gainNode: gainNode,
		sourceNode: sourceNode,
		remove: function() {
			gainNode.disconnect();
		},
	};
};

var audioEngine = new AudioEngine();

var demoElement = document.getElementById('demo');
var tvElement = document.getElementById('tv');
var noiseElement = document.getElementById('noise');
var screenElement = document.getElementById('screen');
var infoWrapperElement = document.getElementById('info-wrapper');
var infoElement = document.getElementById('info');

var currentDemo = 0;

function getCurrentDemo() {
	return currentDemo;
}

function rankString(rank) {
	if (rank === 1) return '1st';
	if (rank === 2) return '2nd';
	if (rank === 3) return '3rd';
	return rank + 'th';
}

actions = new ActionLibrary(actions);

function exitfs(element) {
	if (element.cancelFullScreen) {
		element.cancelFullScreen();
	} else if (element.mozCancelFullScreen) {
		element.mozCancelFullScreen();
	} else if (element.webkitCancelFullScreen) {
		element.webkitCancelFullScreen();
	}

	var children = element.children;
	for (var i = 0, n = children.length; i < n; ++i)
		exitfs(children[i]);
}

var animationStart;
var windowHandler;
var timeoutIds = [];
function showDemo() {
	timeoutIds.forEach(function(timeoutId) {
		clearTimeout(timeoutId);
	});
	timeoutIds = [];

	if (windowHandler) {
		windowHandler.close();
		windowHandler = null;
	}

	infoWrapperElement.classList.remove('visible');
	infoWrapperElement.classList.remove('hidden');
	tvElement.classList.add('visible');
	setStyleVendor(tvElement, 'transform', 'scale(1.2)');
	noiseElement.style.opacity = 0;

	animationStart = Date.now();
	var thisAnimationStart = animationStart;

	var noiseSource = audioEngine.createSource('noise');
	if (noiseSource) {
		noiseSource.gainNode.gain.value = 0;
		noiseSource.sourceNode.start();
	}

	if (demoElement.children.length)
		exitfs(demoElement.children[0].contentDocument.body);

	function end() {
		if (demo.iframe)
			demoElement.innerHTML = '<iframe class="fullscreen" src="' + demo.iframe + '" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe>';
		else if (demo.window)
			windowHandler = window.open(demo.window);
		
		tvElement.classList.remove('visible');
		if (noiseSource)
			noiseSource.remove();
	}

	function update() {
		if (thisAnimationStart !== animationStart) return;

		var time = (Date.now() - thisAnimationStart) / 1000;
		if (time > 4.1)
			return end();

		var scale = actions['movement'].groups['location'][1].evaluate(time);
		var rotate = actions['movement'].groups['rotation_euler'][1].evaluate(time);
		setStyleVendor(tvElement, 'transform', 'translate3d(0,0,0) scale(' + scale + ') rotateZ(' + rotate + 'rad)');
		
		var noise = actions['noise'].groups['location'][0].evaluate(time);
		noiseElement.style.opacity = noise;

		if (noiseSource)
			noiseSource.gainNode.gain.value = noise * 0.05;

		requestAnimationFrame(update);
	}

	requestAnimationFrame(update);

	var demo = demos[currentDemo];

	timeoutIds.push(setTimeout(function() {
		demoElement.innerHTML = '';
	}, 1200));

	if (!demo.title) {
		infoWrapperElement.classList.add('hidden');
		return;
	}

	timeoutIds.push(setTimeout(function() {
		infoElement.innerHTML = '<div>' +
			'<span class="title">' + demo.title + '</span> by <span class="author">' + demo.author + '</span>' +
		'</div>' +
		'<div>' + 
			'<span class="rank">' + rankString(demo.rank) + '</span> in <span class="compo">' + demo.compo + '</span> at <span class="party">' + demo.party + '</span>' +
		'</div>';
		infoWrapperElement.classList.add('visible');
	}, 3000));

	timeoutIds.push(setTimeout(function() {
		infoWrapperElement.classList.remove('visible');
	}, 10000));

	timeoutIds.push(setTimeout(function() {
		infoWrapperElement.classList.add('hidden');
	}, 13000));
}

function previousDemo() {
	if (currentDemo <= 0) return;
	--currentDemo;
	return showDemo();
}

function nextDemo() {
	if (currentDemo >= demos.length - 1) return;
	++currentDemo;
	return showDemo();
}

function setDemo(i) {
	currentDemo = i;
	return showDemo();
}

function start() {
	function onWindowResize() {
		var scale = window.innerWidth / 854;

		screenElement.style.left = (window.innerWidth / 2 - 681 * scale) + 'px';
		screenElement.style.top = (window.innerHeight / 2 - 396 * scale) + 'px';
		screenElement.style.width = 1600 * scale + 'px';
		screenElement.style.height = 813 * scale + 'px';
	}
	
	window.addEventListener('resize', onWindowResize);
	onWindowResize();

	setStyleVendor(tvElement, 'transformOrigin', '0.425625 0.487465');

	audioEngine.loadAssets(function() {
		var controllerWindow = window.open('controller.html');

		addEventListener('unload', function() {
			controllerWindow.close();
		});

		showDemo();
	});
}

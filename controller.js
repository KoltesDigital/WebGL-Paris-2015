'use strict';

function start() {
	if (!window.opener) return alert('Do not open directly!');

	console.log('Total duration', demos.reduce(function(aggr, demo) { return aggr + (demo.duration || 0); }, 0) / 60);

	var demosElement = document.getElementById('demos');

	function refreshCurrentDemo() {
		document.getElementById('current-demo').textContent = 'Current demo: ' + window.opener.getCurrentDemo();
	}

	function previousDemo() {
		window.opener.previousDemo();
		return refreshCurrentDemo();
	}

	function nextDemo() {
		window.opener.nextDemo();
		return refreshCurrentDemo();
	}

	function setDemo(demo) {
		window.opener.setDemo(demo);
		return refreshCurrentDemo();
	}

	demos.forEach(function(demo, i) {
		var linkElement = document.createElement('button');
		linkElement.textContent = 'go';
		linkElement.addEventListener('click', function(event) {
			event.preventDefault();
			setDemo(i);
		});

		var element = document.createElement('li');
		element.innerHTML = demo.screen || (i + '. <strong>' + demo.title + '</strong> by <em>' + demo.author + '</em> (' + Math.floor(demo.duration / 60) + 'm' + (demo.duration % 60) + 's)');
		element.innerHTML += ' ';
		element.appendChild(linkElement);
		demosElement.appendChild(element);
	});

	document.getElementById('previous').addEventListener('click', previousDemo);
	document.getElementById('next').addEventListener('click', nextDemo);
	document.getElementById('refresh').addEventListener('click', refreshCurrentDemo);

	addEventListener('keydown', function(event) {
		switch (event.which) {
			case 37:
				return previousDemo();
			case 39:
				return nextDemo();
		}
	});

	refreshCurrentDemo();
}

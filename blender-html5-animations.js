/**
 * Blender HTML5 animations by Bloutiouf
 * MIT licence
 */

/* jshint camelcase: false */
/* globals glMatrix, mat4, vec3 */

'use strict';

var Easing = {
    AUTO: 0,
    EASE_IN: 1,
    EASE_OUT: 2,
    EASE_IN_OUT: 3,
}

var Extrapolation = {
	CONSTANT: 0,
	LINEAR: 1,
};

var Interpolation = {
	CONSTANT: 0,
	LINEAR: 1,
	BEZIER: 2,
	SINE: 3,
	QUAD: 4,
	CUBIC: 5,
	QUART: 6,
	QUINT: 7,
	EXPO: 8,
	CIRC: 9,
	BACK: 10,
	BOUNCE: 11,
	ELASTIC: 12,
};

var RotationMode = {
	XYZ: 0,
	XZY: 1,
	YXZ: 2,
	YZX: 3,
	ZXY: 4,
	ZYX: 5,
	AXIS: 6,
	QUATERNION: 7,
};

function bezier(t, A, B, C, D) {
	var T = 1 - t;
	return T*T*T*A + 3*T*T*t*B + 3*T*t*t*C + t*t*t*D;
}

function bounceEaseOut(time, begin, change, duration) {
	time /= duration;
	if (time < (1 / 2.75)) {
		return change * (7.5625 * time * time) + begin;
	}
	else if (time < (2 / 2.75)) {
		time -= (1.5 / 2.75);
		return change * ((7.5625 * time) * time + 0.75) + begin;
	}
	else if (time < (2.5 / 2.75)) {
		time -= (2.25 / 2.75);
		return change * ((7.5625 * time) * time + 0.9375) + begin;
	}
	else {
		time -= (2.625 / 2.75);
		return change * ((7.5625 * time) * time + 0.984375) + begin;
	}
}

function elasticBlend(time, change, duration, amplitude, s, f) {
	if (change) {
		var t = Math.abs(s);
		if (amplitude) {
			f *= amplitude / Math.abs(change);
		}
		else {
			f = 0;
		}

		var td = Math.abs(time * duration);
		if (td < t) {
			var l = td / t;
			f = (f * l) + (1 - l);
		}
	}

	return f;
}

function elasticEaseOut(time, begin, change, duration, amplitude, period) {
	var s;
	var f = 1;

	if (time == 0)
		return begin;
	if ((time / duration) >= 1)
		return begin + change;
	time = -time;
	if (!period)
		period = duration * 0.3;
	if (!amplitude || amplitude < Math.abs(change)) {
		s = period / 4;
		f = elasticBlend(time, change, duration, amplitude, s, f);
		amplitude = change;
	} else
		s = period / (2 * Math.PI) * Math.asin(change / amplitude);

	return (f * (amplitude * Math.pow(2, 10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / period))) + change + begin;
}

function FCurve(specs) {
	this.points = specs[0];
	this.extrapolation = specs[1];
	this.lastPointIndex = this.points.length - 1;
}

FCurve.prototype.evaluate = function(t) {
	var leftIndex = 0;
	var leftPoint = this.points[leftIndex];

	if (t <= leftPoint[0]) {
		switch (this.extrapolation) {
			case Extrapolation.CONSTANT:
				return leftPoint[1];
			case Extrapolation.LINEAR:
				return leftPoint[1] + (leftPoint[3] - leftPoint[1]) * (t - leftPoint[0]) / (leftPoint[2] - leftPoint[0]);
		}
	}

	var rightIndex = this.lastPointIndex;
	var rightPoint = this.points[rightIndex];
	if (t >= rightPoint[0]) {
		switch (this.extrapolation) {
			case Extrapolation.CONSTANT:
				return rightPoint[1];
			case Extrapolation.LINEAR:
				return rightPoint[1] + (rightPoint[5] - rightPoint[1]) * (t - rightPoint[0]) / (rightPoint[4] - rightPoint[0]);
		}
	}

	while (rightIndex - leftIndex > 1) {
		var index = ((leftIndex + rightIndex) / 2) | 0;
		if (this.points[index][0] >= t)
			rightIndex = index;
		else
			leftIndex = index;
	}

	leftPoint = this.points[leftIndex];
	rightPoint = this.points[rightIndex];
	
	var time = t - leftPoint[0];
	var duration = rightPoint[0] - leftPoint[0];
	var change = rightPoint[1] - leftPoint[1];
	
	switch (leftPoint[6]) {
		default:
			return leftPoint[1];
			
		case Interpolation.LINEAR:
			return leftPoint[1] + change * time / duration;
			
		case Interpolation.BEZIER:
			var uLeft = 0, uRight = 1;
			var u, T;
			do {
				u = (uLeft + uRight) / 2;
				T = bezier(u, leftPoint[0], leftPoint[4], rightPoint[2], rightPoint[0]);
				if (T > t)
					uRight = u;
				else
					uLeft = u;
			} while (Math.abs(T - t) > 0.01);
			return bezier(u, leftPoint[1], leftPoint[5], rightPoint[3], rightPoint[1]);
			
		case Interpolation.BOUNCE:
			switch (leftPoint[7]) {
				default:
					return bounceEaseOut(time, leftPoint[1], change, duration);
			}
			
		case Interpolation.ELASTIC:
			switch (leftPoint[7]) {
				default:
					return elasticEaseOut(time, leftPoint[1], change, duration, leftPoint[8], leftPoint[9]);
			}
	}
};

function FCurveArray(specs, evaluateMap) {
	var arr = specs.map(function(specs) {
		return specs && new FCurve(specs);
	});
	arr.evaluateMap = evaluateMap;
	arr.__proto__ = FCurveArray.prototype;
	return arr;
}

FCurveArray.prototype = [];

FCurveArray.prototype.evaluate = function(t) {
	return this.map(this.evaluateMap.bind(t));
};

function Marker(specs) {
	this.frame = specs[0];
	this.name = specs[1];
}

var FCurveArrayEvaluates = {
	location: function(channel) {
		return channel ? channel.evaluate(this) : 0;
	},
	rotation_euler: function(channel) {
		return channel ? channel.evaluate(this) : 0;
	},
	rotation_quaternion: function(channel, index) {
		return channel ? channel.evaluate(this) : (index === 3 ? 1 : 0);
	},
	scale: function(channel) {
		return channel ? channel.evaluate(this) : 1;
	},
};

function Action(specs) {
	this.groups = {};
	for (var groupName in specs[0]) {
		var evaluateMap = (groupName.lastIndexOf('delta_', 0) === 0 ? FCurveArrayEvaluates[groupName.substr(6)] : FCurveArrayEvaluates[groupName]);
		this.groups[groupName] = new FCurveArray(specs[0][groupName], evaluateMap);
	}

	this.markers = specs[1].map(function(specs) {
		return new Marker(specs);
	});

	this.frameStart = specs[2];
	this.frameEnd = specs[3];
}

var qmat = (typeof glMatrix !== 'undefined') && new glMatrix.ARRAY_TYPE(16);

Action.prototype.applyRotationEuler = function(applyCallback) {
	return self.reduceTransform([0, 0, 0], [this.rotation_euler, this.delta_rotation_euler], function(vec, group) {
		vec3.add(vec, vec, group.toWorld(t));
	}, applyCallback);
};

Action.prototype.applyTransform = function(groups, applyCallback) {
	return groups.forEach(function(group) {
		if (group)
			return applyCallback(group);
	});
};

Action.prototype.reduceTransform = function(vec, groups, reduceCallback, applyCallback) {
	if (!groups.some(function(group) {
		return group;
	}))
		return;

	groups.forEach(function(group) {
		return reduceCallback(vec, group);
	});

	return applyCallback(vec);
};

Action.prototype.toLocal = function(t, out, rotationMode) {
	mat4.identity(out);
	
	var self = this;
	function applyRotationEuler(applyCallback) {
		return self.reduceTransform([0, 0, 0], [this.groups.rotation_euler, this.groups.delta_rotation_euler], function(vec, group) {
			vec3.subtract(vec, vec, group.evaluate(t));
		}, applyCallback);
	}

	this.reduceTransform([0, 0, 0], [this.groups.location, this.groups.delta_location], function(vec, group) {
		vec3.subtract(vec, vec, group.evaluate(t));
	}, function(vec) {
		return mat4.translate(out, out, vec);
	});

	switch (rotationMode) {
		case RotationMode.AXIS:
			if (this.rotation_axis) {
				var vec = this.groups.rotation_axis.evaluate(t);
				mat4.rotate(out, out, -vec[3], vec);
			}
			break;

		case RotationMode.QUATERNION:
			this.applyTransform([this.groups.delta_rotation_quaternion, this.groups.rotation_quaternion], function(group) {
				var q = group.evaluate(t);
				q[3] = -q[3];
				mat4.fromQuat(qmat, q);
				mat4.multiply(out, out, qmat);
			});
			break;
	}

	this.reduceTransform([1, 1, 1], [this.groups.scale, this.groups.delta_scale], function(vec, group) {
		vec3.divide(vec, vec, group.evaluate(t));
	}, function(vec) {
		return mat4.scale(out, out, vec);
	});
};

Action.prototype.toWorld = function(t, out, rotationMode) {
	mat4.identity(out);
	
	var self = this;
	function applyRotationEuler(applyCallback) {
		return self.reduceTransform([0, 0, 0], [this.groups.rotation_euler, this.groups.delta_rotation_euler], function(vec, group) {
			vec3.add(vec, vec, group.evaluate(t));
		}, applyCallback);
	}

	this.reduceTransform([1, 1, 1], [this.groups.scale, this.groups.delta_scale], function(vec, group) {
		vec3.multiply(vec, vec, group.evaluate(t));
	}, function(vec) {
		return mat4.scale(out, out, vec);
	});

	switch (rotationMode) {
		case RotationMode.XYZ:
			applyRotationEuler(function(vec) {
				mat4.rotateX(out, out, vec[0]);
				mat4.rotateY(out, out, vec[1]);
				mat4.rotateZ(out, out, vec[2]);
			});
			break;

		case RotationMode.XZY:
			applyRotationEuler(function(vec) {
				mat4.rotateX(out, out, vec[0]);
				mat4.rotateZ(out, out, vec[2]);
				mat4.rotateY(out, out, vec[1]);
			});
			break;

		case RotationMode.AXIS:
			if (this.groups.rotation_axis) {
				var vec = this.groups.rotation_axis.evaluate(t);
				mat4.rotate(out, out, vec[3], vec);
			}
			break;

		case RotationMode.QUATERNION:
			this.applyTransform([this.groups.rotation_quaternion, this.groups.delta_rotation_quaternion], function(group) {
				mat4.fromQuat(qmat, group.evaluate(t));
				mat4.multiply(out, out, qmat);
			});
			break;
	}

	this.reduceTransform([0, 0, 0], [this.groups.location, this.groups.delta_location], function(vec, group) {
		vec3.add(vec, vec, group.evaluate(t));
	}, function(vec) {
		return mat4.translate(out, out, vec);
	});
};

function ActionLibrary(specs) {
	for (var actionName in specs) {
		this[actionName] = new Action(specs[actionName]);
	}
}

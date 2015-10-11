/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.BoxHitShader =
{
	attributes:{
		
	},
	
	uniforms:{
		zoom: {type:"f", value: 0.6},
		resolution: {type:"v2", value: new THREE.Vector2(8,8)},
		time: {type:"f", value: 164.0},
		color: {type:"v3", value: new THREE.Vector3(0,0,0)}
	},
	
	vertex: [
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		"void main() {",
			"vNormal = normal;",
			"vUv = uv;",
			"vec3 p = position;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
		"}"
	].join("\n"),
	
	fragment:[
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		"uniform vec2 resolution;",
		"uniform float time;",
		"uniform vec3 color;",
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = gl_FragCoord.xy;",
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",

			"vec2 uv4 = vUv;",
			'uv4.x += time*0.0;',
			'uv4.y += time*0.0;',
			'uv4.x = mod(floor(uv4.x*6.0),2.0);',
			'uv4.y = mod(floor(uv4.y*3.0),2.0);',
			'uv4.x += 0.07*rnd*sin(time);',
			
			"vec2 uv3 = vUv;",
			'uv3.x += time*0.5;',
			'uv3.x *=2.1;//+ time*0.1;',
			'uv3.y -= time*0.07;',
			'uv3.x = mod(floor(uv3.x*3.0),2.0);',
			'uv3.y = mod(floor(uv3.y*1.0),2.0);',
			'uv3.x += 0.07*rnd*sin(time);',
			
			"vec2 uv2 = vUv;",
			'uv2.x += time*0.04;',
			'uv2.y += time*0.3;',
			'uv2.x = mod(floor(uv2.x*4.0),2.0);',
			'uv2.y = mod(floor(uv2.y*6.0),2.0);',
			'uv2.x += 0.47*rnd*sin(time);',
			'float c =4.7* (uv2.x*uv2.x*0.1 + 0.1*uv2.y*uv2.x+uv3.x*0.1 + uv3.y*0.1+uv4.x*uv4.y*uv4.y*0.7)*rnd;',
			
			"gl_FragColor = (vUv.x >= 1.0-0.1) || (vUv.y >= 1.0-0.1) || (vUv.x < 0.0+0.1) || (vUv.y < 0.0+0.1) ? vec4(0.0,0.0, 0.0, 0.0) : vec4(c,c,c,1.0);// vec4(c+uv3.x*0.27*vUv.y, c+uv3.x*0.27*vUv.y,c,0);",
		"}"
	].join("\n")
}
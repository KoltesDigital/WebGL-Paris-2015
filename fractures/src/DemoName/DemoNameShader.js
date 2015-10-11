/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.DemoNameShader =
{
	create:function(){
		return {
	attributes:{
		
	},
	
	uniforms:{
		zoom: {type:"f", value: 0.6},
		resolution: {type:"v2", value: new THREE.Vector2(8,8)},
		time: {type:"f", value: 164.0},
		color: {type:"v3", value: new THREE.Vector3(0,0,0)},
		tex: {type:"t"},
	},
	
	vertex: [
		"//varying vec3 vNormal;",
		"varying vec2 vUv;",
		"void main() {",
			"//vNormal = normal;",
			"vUv = uv;",
			"//vec3 p = position;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),
	
	fragment:[
		"//varying vec3 vNormal;",
		"varying vec2 vUv;",
		"//uniform vec2 resolution;",
		"//uniform float time;",
		"//uniform vec3 color;",
		"uniform sampler2D tex;",

		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = gl_FragCoord.xy;",
			"//float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			
			"vec4 c = texture2D(tex, vUv);",
			
			"gl_FragColor = c;",
		"}"
	].join("\n")
		}
	}
}
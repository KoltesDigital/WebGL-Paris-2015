/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.NoiseShader =
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
		
		"void main() {",
			"vNormal = normal;",
			"vec3 p = position;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
		"}"
	].join("\n"),
	
	fragment:[
		"varying vec3 vNormal;",
	"uniform vec2 resolution;",
		"uniform float time;",
		"uniform vec3 color;",
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = gl_FragCoord.xy;",
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			
			"gl_FragColor = vec4(rnd*0.25+color.r,rnd*0.25+color.g,rnd*0.250+color.b,0);",
		"}"
	].join("\n")
}
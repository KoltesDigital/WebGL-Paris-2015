/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.CaveGroundShader =
{
	attributes:{
		
	},
	
	uniforms:{
		time: {type:"f", value: 164.0},
		"normal":	{ type: "t", value: null },
		"normalMap":	{ type: "t", value: null },
		"texture":	{ type: "t", value: null },
		"heightmap":	{ type: "t", value: null },
		/* fog */
		topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
		bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
		offset:      { type: "f", value: 33 },
		exponent:    { type: "f", value: 0.6 },
		fogColor:    { type: "c", value: new THREE.Color(0x719955) },
		fogNear:     { type: "f", value: 1 },
		fogFar:      { type: "f", value: 250 }
	},
	
	vertex: [
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		"varying vec3 vPosition;",
		"uniform sampler2D heightmap;",
		"varying float dep;",
		
		'float getDepth(){',
			'vec4 tex = texture2D(heightmap, vUv);',
			'return tex.r;',
		'}',
		
		"void main() {",
			'vUv = uv;',
			"vNormal = normal;",
			"vec3 p = position;",
			'dep = getDepth();',
			'float px = p.x;',
			'float py = p.y;',
			'p.z += dep*180.0;//*250.0;',
			"vPosition =p;",
			"p.z = p.z < 5.1 && p.z > 4.9 ? 4.9 : p.z;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
		"}"
	].join("\n"),
	
	fragment:[
		"#extension GL_OES_standard_derivatives : enable",
		"varying vec3 vPosition;",
		"varying vec2 vUv;",
		"varying vec3 vNormal;",
		"uniform vec3 uLight;",
		"uniform vec2 resolution;",
		"uniform float time;",
		"uniform sampler2D texture;",
		"uniform sampler2D normalMap;",
		"varying float dep;",
		
		"uniform vec3 topColor;",
		"uniform vec3 bottomColor;",
		"uniform float offset;",
		"uniform float exponent;",
		"uniform vec3 fogColor;",
		"uniform float fogNear;",
		"uniform float fogFar;",
		
		
		'vec3 getNormal() {',
			'// Differentiate the position vector',
			'vec3 dPositiondx = dFdx(vPosition);',
			'vec3 dPositiondy = dFdy(vPosition);',
			'float depth = texture2D(normalMap, vUv*10.0).r;',
			'float dDepthdx = dFdx(depth);',
			'float dDepthdy = dFdy(depth);',
			'dPositiondx -= 2.0 * dDepthdx * vNormal;',
			'dPositiondy -= 2.0 * dDepthdy * vNormal;',
			'//return vec3(0.0);',
			// The normal is the cross product of the differentials
			'return normalize(cross(dPositiondx, dPositiondy));',
		'}',
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = gl_FragCoord.xy;",
			'vec4 color = texture2D(texture, vUv*10.0)*0.6;',
			'vec4 dark = vec4(0, 0, 0, 1.0);',
			'vec3 normal = getNormal();',
			"float rnd = rand(vec2(time*0.01*uv.x, time*uv.y*0.01));",
			'//vec4 color = vec4(rnd*0.1+0.95, rnd*0.1+0.9, rnd*0.1+0.5, 1.0);',
			'// Mix in diffuse light',
			'color*=color*1.8;',
			'float diffuse = dot(normalize(uLight - vPosition), normal);',
			'diffuse = max(0.0, diffuse);',
			'color =  mix(dark, color, 0.5 + 0.25 * diffuse);',
			'color.a = 1.0;',
			'gl_FragColor = vec4(color);',
			
			
			//Fog
			'//#ifdef USE_LOGDEPTHBUF_EXT',
			'//float depth = gl_FragDepthEXT / gl_FragCoord.w;',
			'//#else',
			'//float depth = gl_FragCoord.z / gl_FragCoord.w;',
			'//#endif',
			'//float fogFactor = smoothstep( fogNear, fogFar, depth );',
			'//gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',
			
			
		"}"
	].join("\n")
}
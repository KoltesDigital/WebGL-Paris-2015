/**
 * ...
 * @author rimina
 */
wideload.DayAndNightShader =
{
	attributes:{
		
	},
	
	uniforms:{
		nightScene: {type:"t", value: undefined},
		dayScene: {type:"t", value: undefined},
    lightPosition: {type: "v3", value : undefined},
	
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
	"varying vec3 vPos;",
	
		
		"void main() {",
			"vNormal = normal;",
      "vUv = uv;",
	  'vPos = position;',
			"gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
		"}"
	].join("\n"),
	
	fragment:[
		"varying vec3 vNormal;",
    "varying vec2 vUv;",
    "varying vec3 vPos;",
    "uniform sampler2D nightScene;",
		"uniform sampler2D dayScene;",
    "uniform vec3 lightPosition;",
	
	/* Fog */
	"uniform vec3 topColor;",
		"uniform vec3 bottomColor;",
		"uniform float offset;",
		"uniform float exponent;",
		"uniform vec3 fogColor;",
		"uniform float fogNear;",
		"uniform float fogFar;",
		
	
    
		"void main() {",
      "float angle = dot(vNormal, lightPosition);",
      "vec4 night = texture2D(nightScene, vUv);",
      "vec4 day = texture2D(dayScene, vUv);",
      "gl_FragColor = mix(day, night, smoothstep(-0.25, 0.25, angle));",
      
	  //Fog
			'#ifdef USE_LOGDEPTHBUF_EXT',
			'float depth = gl_FragDepthEXT / gl_FragCoord.w;',
			'#else',
			'float depth = gl_FragCoord.z / gl_FragCoord.w;',
			'#endif',
			'float fogFactor = smoothstep( fogNear, fogFar, depth );',
			'fogFactor = max(0.0,fogFactor+ (fogNear < 10000.0? vPos.y*0.0004:0.0));',
			'gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );',
	  
		"}"
	].join("\n")
}
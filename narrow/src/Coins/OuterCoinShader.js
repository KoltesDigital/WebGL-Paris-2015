/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.OuterCoinShader =
{
	attributes:{
	},
	
	uniforms:{
		camerapos:{type:"f", value:0.0},
		time:{type:"f", value: 0.0},
		xo:{type:"f", value: 5.0},
		yo:{type:"f", value: 5.0},
		xs:{type:"f", value: 400.0},
		ys:{type:"f", value: 400.0},
		xm:{type:"f", value: 400.0},
		ym:{type:"f", value: 400.0},
		
	},
	
	vertex: [
		"uniform float camerapos;",
		"uniform float time;",
		"uniform float xo;",
		"uniform float yo;",
		"uniform float xs;",
		"uniform float ys;",
		"uniform float ym;",
		"uniform float xm;",
		
		
		"void main() {",
			'vec3 p = position;',
			
			"gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);",
		"}"
	].join("\n"),
	
	fragment:[
		
		"void main() {",
			'vec4 color = vec4(1.0,0.0,0.0,0.0);',
		
			'gl_FragColor = vec4(color);',
		"}"
	].join("\n")
}
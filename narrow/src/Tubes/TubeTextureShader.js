/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.TubeTextureShader =
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
		
		color:{type:"c", value: new THREE.Color(0x0)},
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
			'float po = p.x - camerapos;',
			'p.z = p.z + min(xm, po/xo+3.0)* sin(time/100.0+po/xs);',
			'p.y = p.y + min(ym, po/yo+3.0)*  cos(time/100.0+po/ys);',
			
			"gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);",
		"}"
	].join("\n"),
	
	fragment:[
		'uniform vec3 color;',
		"void main() {",
			'//vec4 color = vec4(0.0,0.0,0.0,0.0);',
		
			'gl_FragColor = vec4(color,0.0);',
		"}"
	].join("\n")
}
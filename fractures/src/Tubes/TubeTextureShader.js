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
	//	"varying vec2 vUv;",

		
		"void main() {",
			'vec3 p = position;',
			'float po = p.x - camerapos;',
			'p.z = p.z + min(xm, po/xo+3.0)* cos(time/100.0+po/xs)*po*0.02;',
			'p.y = p.y + min(ym, po/yo+3.0)*  0.25*(sin(time/100.0+po/ys)+cos(time/100.0+po/ys))*po*0.02;',
		//	"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);",
		"}"
	].join("\n"),
	
	fragment:[
		//"varying vec2 vUv;",
		"uniform vec2 resolution;",
		"uniform float time;",
		"uniform vec3 color;",
		"uniform float xm;",
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",

		"void main() {",
"vec2 uv = gl_FragCoord.xy*0.0005;",
'vec2 vUv = uv;',
"uv = vUv*0.75;",
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			
			"vec4 c = vec4(0.0,0.0,0.0,0.0);",
			'float sum1 = (sin((uv.x)*5.0+cos((uv.y)*1.0))+cos((uv.y)*5.0));',
			'uv+=vec2(time*0.02,time*0.02);',
			'float sum2 = (sin((uv.x)*10.0+cos((uv.y)*10.0))+cos((uv.y)*10.0));',
			'uv+=vec2(time*0.04,time*0.03);',
			'float sum3 = (sin((uv.x)*14.0)+cos((uv.y)*16.0));',
			'uv+=vec2(time*0.03,time*0.023);',
			'float sum4 = (sin((uv.x)*17.0)+cos((uv.y)*14.0));',
			'uv+=vec2(time*0.014,time*0.013);',
			'float sum5 = (sin((uv.x)*39.0+cos((uv.y)*10.0))*0.5+cos((uv.y)*156.0))*1.2;',
			'uv+=vec2(time*0.03,time*0.013);',
			'float sum6 = (sin((uv.x)*300.0)+cos((uv.y)*340.0))*0.5;',
			'c*=(sum1 + sum2 + sum3 + sum4 + sum5 + sum6);',
			'c/=2.0;',
			'float sum = (abs(sum1)+(sum2)+abs(sum3)+abs(sum4)+abs(sum5)+sum6)/6.0;',
			'sum*=sum;//*sum;',
			'c = vec4(sum*4.0+0.02, sum*0.75, sum*0.2,1.0)*(1.8+1.0-0.6);',
			'c*=0.5;',
			'//c.r*=color.r;',
			'//c.g*=color.g;',
			'//c.b*=color.b;',
			"gl_FragColor = c;",/*
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			//'vec2 vUv = uv;',
			"vec2 uv4 = vUv;",
			'uv4.x += time*0.0;',
			'uv4.y += time*0.0;',
			'uv4.x = mod(floor(uv4.x*0.006),2.0);',
			'uv4.y = mod(floor(uv4.y*0.01),2.0);',
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
			'float c =2.7* (uv2.x*uv2.x*0.1 + 0.1*uv2.y*uv2.x+uv3.x*0.1 + uv3.y*0.1+uv4.x*uv4.y*uv4.y*0.7)*rnd;',
			
			"gl_FragColor =  vec4(c,c,c,1.0);// vec4(c+uv3.x*0.27*vUv.y, c+uv3.x*0.27*vUv.y,c,0);",*/
			"}"
	].join("\n")
}
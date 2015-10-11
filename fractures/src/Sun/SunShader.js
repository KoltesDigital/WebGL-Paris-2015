/**
 * ...
 * @author Henri Sarasvirta
 */
wideload.SunShader = 
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
		"uniform float time;",
		"uniform vec3 color;",
		"uniform sampler2D tex;",

		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = vUv*0.75;",
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			
			"vec4 c = texture2D(tex, vUv);",
			'float sum1 = (sin((uv.x)*50.0+cos((uv.y)*10.0))+cos((uv.y)*50.0));',
			'uv+=vec2(time*0.02,time*0.02);',
			'float sum2 = (sin((uv.x)*100.0+cos((uv.y)*10.0))+cos((uv.y)*100.0));',
			'uv+=vec2(time*0.04,time*0.03);',
			'float sum3 = (sin((uv.x)*140.0)+cos((uv.y)*160.0));',
			'uv+=vec2(time*0.03,time*0.023);',
			'float sum4 = (sin((uv.x)*170.0)+cos((uv.y)*144.0));',
			'uv+=vec2(time*0.014,time*0.013);',
			'float sum5 = (sin((uv.x)*390.0+cos((uv.y)*10.0))*0.5+cos((uv.y)*156.0))*1.2;',
			'uv+=vec2(time*0.03,time*0.013);',
			'float sum6 = (sin((uv.x)*300.0)+cos((uv.y)*340.0))*0.5;',
			'c*=(sum1 + sum2 + sum3 + sum4 + sum5 + sum6);',
			'c/=2.0;',
			'float sum = (abs(sum1)+(sum2)+abs(sum3)+abs(sum4)+abs(sum5)+sum6)/6.0;',
			'sum*=sum;//*sum;',
			'c = vec4(sum*4.0+0.02, sum*0.75, sum*0.2,1.0)*(1.8+1.0-0.6);',
			'c*=1.5;',
			'//c.r*=color.r;',
			'//c.g*=color.g;',
			'//c.b*=color.b;',
			"gl_FragColor = c;",
		"}"
	].join("\n")
		}
	}
	
}	
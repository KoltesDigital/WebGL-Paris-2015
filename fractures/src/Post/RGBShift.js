/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var RGBShift = function(rshift, gshift, bshift)
	{
		this.uniforms = wideload.RGBShiftShader.uniforms;
		this.uniforms.rshift.value = rshift;
		this.uniforms.gshift.value = gshift;
		this.uniforms.bshift.value = bshift;
		
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: wideload.RGBShiftShader.vertex,
			fragmentShader: wideload.RGBShiftShader.fragment
		});
		
		this.enabled = true;
		this.renderToScreen = false;
		this.needsSwap = true;
	}
	
	var p = RGBShift.prototype;
	wideload.RGBShift = RGBShift;
	
	p.render = function(renderer, writeBuffer, readBuffer, delta){
		this.uniforms[ "tDiffuse" ].value = readBuffer;
	//	this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );
		THREE.EffectComposer.quad.material = this.material;
		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, false );

		}
	}
	
})();


wideload.RGBShiftShader =
{
	attributes:{
		
	},
	
	uniforms:{
		gshift: {type:"f", value: 0.6},
		rshift: {type:"f", value: 0.6},
		bshift: {type:"f", value: 0.6},
		zoom: {type:"f", value: 0.6},
		resolution: {type:"v2", value: new THREE.Vector2(1280,720)},
		time: {type:"f", value: 164.0},
		tear: {type:"f", value: 0.0},
		color: {type:"v3", value: new THREE.Vector3(0,0,0)},
		tDiffuse: {type:"t"},
		pixelate: {type:"v2", value: new THREE.Vector2(1280,720)},
		pixelsize: {type:"v2", value: new THREE.Vector2(1.2,1.1)},
		pixelcenter: {type:"v2", value: new THREE.Vector2(0.4,0.3)}
		
	},
	
	vertex: [
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		
		"void main() {",
			"vNormal = normal;",
			"vec3 p = position;",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
		"}"
	].join("\n"),
	
	fragment:[
		"varying vec3 vNormal;",
		"varying vec2 vUv;",
		"uniform vec2 resolution;",
		"uniform vec2 pixelate;",
		"uniform vec2 pixelsize;",
		"uniform vec2 pixelcenter;",
		"uniform float time;",
		"uniform float tear;",
		"uniform float rshift;",
		"uniform float gshift;",
		"uniform float bshift;",
		"uniform sampler2D tDiffuse;",
		"uniform vec3 color;",
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
		"void main() {",
			"vec2 uv = gl_FragCoord.xy;",
			"float rnd = rand(vec2(time*0.5*uv.x, time*uv.y*1.2));",
			'vec2 uv2 = vUv;',
			'uv2.x = abs(uv2.y-pixelcenter.x) > pixelsize.x ? uv2.x : floor(uv2.x*pixelate.x)/pixelate.x;',
			'uv2.y = abs(uv2.x-pixelcenter.y) > pixelsize.y ? uv2.y : floor(uv2.y*pixelate.y)/pixelate.y;',
			'uv2.x += tear*rnd*sin(time);',
			"vec4 c = texture2D(tDiffuse,uv2);",
			"vec4 ro = texture2D(tDiffuse,vec2(uv2.x-rshift, uv2.y));",
			"vec4 go = texture2D(tDiffuse,vec2(uv2.x-gshift, uv2.y));",
			"vec4 bo = texture2D(tDiffuse,vec2(uv2.x-bshift, uv2.y));",
			"c = vec4(ro.r, go.g, bo.b, c.w);",
			"gl_FragColor = c *1.0 + 0.12* vec4(rnd*0.25+color.r,rnd*0.25+color.g,rnd*0.250+color.b,0);",
		"}"
	].join("\n")
}
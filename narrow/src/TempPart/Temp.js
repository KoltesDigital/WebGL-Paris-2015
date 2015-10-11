/**
/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var TempPart = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = TempPart.prototype = new wideload.BasePart();
	wideload.TempPart = TempPart;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer)
	{
		this.superInitialize(renderer);
		
		
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: wideload.NoiseShader.uniforms,
			attributes: wideload.NoiseShader.attributes,
			vertexShader: wideload.NoiseShader.vertex,
			fragmentShader: wideload.NoiseShader.fragment,
			color: "red"
		});
		
		var planeGeom = new THREE.PlaneGeometry(1280, 720);
		var plane = new THREE.Mesh(planeGeom, this.shaderMaterial);
		this.scene.add(plane);
		
		this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, -10 );
		
	//	this.camera.position.z = 10;
		
		this.isActive = true;
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime,partial,bar, beat, tick)
	{
		//this.shaderMaterial.uniforms.resolution.value.x = $("#demo canvas").width()/2;
		//this.shaderMaterial.uniforms.resolution.value.y = $("#demo canvas").height()/2;
		this.shaderMaterial.uniforms.resolution.value.x = 1280;// this.main.resolution.width;// $("#demo canvas").width()/1;
		this.shaderMaterial.uniforms.resolution.value.y = 720;//this.main.resolution.height;//$("#demo canvas").height()/1;

		this.shaderMaterial.uniforms.color.value =new THREE.Vector3(0.1,0.4,0.2);
		
		this.shaderMaterial.needsUpdate = true;
		this.shaderMaterial.uniforms.time.value = elapsedtime*0.0002;
		this.renderer.render(this.scene, this.camera, this.renderTarget);
	}
	
	
})();


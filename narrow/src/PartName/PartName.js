/**
/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var PartName = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = PartName.prototype = new wideload.BasePart();
	wideload.PartName = PartName;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer)
	{
		this.superInitialize(renderer);
		
		var tex =new THREE.Texture( Asset.getAsset("parts"));
		tex.needsUpdate = true;
		this.sm = new THREE.MeshBasicMaterial({
			map: tex,
			color: "white",
				side: THREE.DoubleSide 
		});/*
		this.sm = new THREE.ShaderMaterial({
			uniforms: wideload.NoiseShader.uniforms,
			attributes: wideload.NoiseShader.attributes,
			vertexShader: wideload.NoiseShader.vertex,
			fragmentShader: wideload.NoiseShader.fragment,
			color: "white"
		});*/
		//this.renderTarget = new THREE.WebGLRenderTarget(this.main.width, this.main.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
		var planeGeom = new THREE.PlaneGeometry(1280, 720);
		var plane = new THREE.Mesh(planeGeom, this.sm);
	//	wideload.UVMapper.setUvMap(wideload.UVMapper.FULL, plane);
		plane.position.z = 1;
		this.scene.add(plane);
		
		this.camera = new THREE.OrthographicCamera( 1280/ - 2, 1280 / 2, 720/ 2, 720/ - 2, 1, 20 );
		this.camera.position.z = 10;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		
		wideload.ManualControl.attachCamera(this.camera);
		this.isActive = true;
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime,partial,bar, beat, tick)
	{
		//this.shaderMaterial.uniforms.resolution.value.x = $("#demo canvas").width()/2;
		//this.shaderMaterial.uniforms.resolution.value.y = $("#demo canvas").height()/2;
		//this.sm.uniforms.resolution.value.x = 1280;// this.main.resolution.width;// $("#demo canvas").width()/1;
		//this.sm.uniforms.resolution.value.y = 720;//this.main.resolution.height;//$("#demo canvas").height()/1;
///		this.renderer.autoClear = true;
//		this.sm.needsUpdate = true;
	
		//this.shaderMaterial.needsUpdate = true;
//		this.sm.uniforms.time.value = elapsedtime*0.0002;
		this.renderer.render(this.scene, this.camera, this.renderTarget);
	}
	
	
})();


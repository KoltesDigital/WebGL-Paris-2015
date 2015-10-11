/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var Sun = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = Sun.prototype = new wideload.BasePart();
	wideload.Sun = Sun;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		var s = wideload.SunShader.create();
		console.log(s.uniforms);
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: s.uniforms,
			attributes: s.attributes,
			vertexShader: s.vertex,
			fragmentShader: s.fragment,
			color: "white"
		});
		this.shaderMaterial.uniforms.color.value = new THREE.Color(0,0,1);
		//var mat = new THREE.MeshBasicMaterial({color:"red",transparent:false,side:THREE.DoubleSide });
		var geometry = new THREE.SphereGeometry(4, 32, 32);
		this.sphere = new THREE.Mesh(geometry, this.shaderMaterial);
		
		this.scene.add(this.sphere);
		/*
		s = new wideload.SunShader();
		this.shaderMaterial2 = new THREE.ShaderMaterial({
			uniforms: s.uniforms,
			attributes: s.attributes,
			vertexShader: s.vertex,
			fragmentShader: s.fragment,
			color: "white"
		});
		
		this.sphere2 = new THREE.Mesh(geometry, this.shaderMaterial2);
		
		this.scene.add(this.sphere2);
		this.sphere2.position.x = -5;
		*/
		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );
		this.camera.position.z = 10;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.scene.add(this.camera);
		
		this.isActive = true;
	}
		
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, timesig){
		
		/*this.group1[0].material.opacity = Math.sin(elapsedtime*0.001*Math.cos(elapsedtime*0.02)*0.25);
		this.group1[1].material.opacity = Math.sin((elapsedtime+600)*0.001*Math.cos(elapsedtime*0.02)*0.25);
		this.group1[2].material.opacity =Math.sin((elapsedtime+1200)*0.001*Math.cos(elapsedtime*0.02)*0.25);
		this.group1[3].material.opacity = Math.sin((elapsedtime+1800)*0.001*Math.cos(elapsedtime*0.02)*0.25);
		*/
		
	//	this.shaderMaterial.uniforms.time.value = elapsedtime*0.0002;
		
		this.sphere.rotation.x = 0.3;//elapsedtime*0.002;
		this.sphere.rotation.z = elapsedtime*0.0001;
		var ts = new wideload.TimeSig(20,0,0).toMilliseconds();
		
		this.sphere.position.z=Math.min((elapsedtime-ts)*0.0005, 4.5);
		
		var pre = this.renderer.autoClear;
		var bar = timesig.bar;
		this.renderer.setClearColor(0x0,0.0);
		this.renderer.autoClear = true;
	//	this.group1[0].material.uniforms.time.value = elapsedtime*0.0002;
	//	this.group1[1].material.uniforms.time.value = elapsedtime*0.0002;
	//	this.group1[2].material.uniforms.time.value = elapsedtime*0.0002;
	//	this.group1[3].material.uniforms.time.value = elapsedtime*0.0002;
	//	this.shaderMaterial.color = bar%10==0?"white": "black";
		this.renderer.render(this.scene, this.camera, this.renderTarget);
		this.renderer.autoClear = pre;
	}
	
	
})();


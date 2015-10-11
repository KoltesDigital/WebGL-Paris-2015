/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var DemoName = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = DemoName.prototype = new wideload.BasePart();
	wideload.DemoName = DemoName;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		
		
		this.group1 = [];
		this.group2 = [];
		this.group3 = [];
		this.group4 = [];
		this.group5 = [];
		this.group6 = [];
		this.group7 = [];
		this.group8 = [];
		
		this.group1.push(this.createPlane("wide", new THREE.Vector3(0,0,0)));
		
		this.group1.px = -1280/2+241;
		this.group1.py = 0;
		
		this.camera = new THREE.OrthographicCamera( this.main.width / - 2, this.main.width / 2, this.main.height / 2, this.main.height / - 2, 0, 20 );
		this.camera.position.z = 10;
		
		this.scene.add(this.camera);
		
		this.isActive = true;
	}
	
	p.createPlane = function(name, position)
	{
		var img = Asset.getAsset(name);
		var w = img.width;
		var h = img.height;
		var tex = new THREE.Texture(img);
		tex.needsUpdate = true;
		var plane = new THREE.PlaneGeometry(w,h,1,1);
		var shader = wideload.DemoNameShader.create();
		var mat =new THREE.ShaderMaterial({
			uniforms: shader.uniforms,
			attributes: shader.attributes,
			vertexShader: shader.vertex,
			fragmentShader: shader.fragment,
			color: "white",
//			map:tex,
			//side:THREE.DoubleSide
		});
		mat = new THREE.MeshBasicMaterial({color:"white",transparent:true, map:tex, side:THREE.DoubleSide });
		var mesh = new THREE.Mesh(plane, mat);
		//mat.uniforms.tex.value = tex;
		mesh.position.x = position.x;// + w/2;
		mesh.position.y = position.y;// + h/2;
		mesh.position.z = position.z;
		
		mesh.position.oy = position.y;
		
		//mesh.rotation.x = 0.4;
		//mesh.rotation.y = Math.PI/2;// 0.4;
	//	mesh.rotation.z = Math.random()*0.4-0.2;
		
		this.scene.add(mesh);
		return mesh;
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
		var beat = timesig.beat;
		var tick = timesig.tick;
		//this.group1[3].material.opacity =tick%8<=2 ? 0: 1.0;// Math.abs(Math.sin(Math.max(0,elapsedtime*0.001-Math.PI/4*3)*Math.cos(elapsedtime*0.002)))+0.0;
		
		//this.group1[3].rotation.z = Math.sin((0,elapsedtime*0.0001-Math.PI/8*3)*Math.cos(elapsedtime*0.0002))*0.4;
		
		
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


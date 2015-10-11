/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var Greets = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = Greets.prototype = new wideload.BasePart();
	wideload.Greets = Greets;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: wideload.GreetShader.uniforms,
			attributes: wideload.GreetShader.attributes,
			vertexShader: wideload.GreetShader.vertex,
			fragmentShader: wideload.GreetShader.fragment,
			color: "white"
		});
		var planeGeom = new THREE.PlaneGeometry(1280, 720);
		var plane = new THREE.Mesh(planeGeom, this.shaderMaterial);
		//this.scene.add(plane);
		
		this.group1 = [];
		this.group2 = [];
		this.group3 = [];
		this.group4 = [];
		this.group5 = [];
		this.group6 = [];
		this.group7 = [];
		this.group8 = [];
		
		this.group8.push(this.createPlane("jumalauta", new THREE.Vector3(175,247,0)));
		this.group7.push(this.createPlane("ananasmurska", new THREE.Vector3(119,-221,0)));
		this.group3.push(this.createPlane("alumni", new THREE.Vector3(-563,38,0)));
		this.group7.push(this.createPlane("api", new THREE.Vector3(185,-327,0)));
		this.group7.push(this.createPlane("asd", new THREE.Vector3(390,-330,0)));
		this.group7.push(this.createPlane("bombsquad", new THREE.Vector3(172,-102,0)));
		this.group1.push(this.createPlane("byterapers", new THREE.Vector3(-648,-99,0)));
		this.group4.push(this.createPlane("damones", new THREE.Vector3(-591,-312,0)));
		this.group5.push(this.createPlane("dekadence", new THREE.Vector3(188,75,0)));
		this.group1.push(this.createPlane("doo", new THREE.Vector3(-472,115,0)));
		this.group1.push(this.createPlane("elventhor", new THREE.Vector3(-608,7,0)));
		this.group2.push(this.createPlane("evoflash", new THREE.Vector3(-627,119,0)));
		this.group3.push(this.createPlane("fairlight", new THREE.Vector3(-578,238,0)));
		this.group4.push(this.createPlane("fgj", new THREE.Vector3(-520,-80,0)));
		this.group2.push(this.createPlane("hbc", new THREE.Vector3(-612,18,0)));
		this.group2.push(this.createPlane("hedelmae", new THREE.Vector3(-629,214,0)));
		this.group3.push(this.createPlane("kakut", new THREE.Vector3(-483,140,0)));
		this.group6.push(this.createPlane("kewlers", new THREE.Vector3(247,-330,0)));
		this.group5.push(this.createPlane("konvergence", new THREE.Vector3(160,-52,0)));
		this.group8.push(this.createPlane("mattcurrent", new THREE.Vector3(155,148,0)));
		this.group5.push(this.createPlane("mercury", new THREE.Vector3(230,-186,0)));
		this.group2.push(this.createPlane("npli", new THREE.Vector3(-416,19,0)));
		this.group6.push(this.createPlane("paraguay", new THREE.Vector3(250,-105,0)));
		this.group4.push(this.createPlane("pyrotech", new THREE.Vector3(-445,-204,0)));
		this.group6.push(this.createPlane("soleil", new THREE.Vector3(192,-225,0)));
		this.group1.push(this.createPlane("supadupa", new THREE.Vector3(-547,-202,0)));
		this.group8.push(this.createPlane("traction", new THREE.Vector3(226,44,0)));
		
		this.group1.px = -1280/2+241;
		this.group1.py = 0;
		
		this.group5.px = 1280/2-(1280-1035);
		this.group5.py = 0;
		
		this.group2.px = -1280/2+241;
		this.group2.py = 720/2 - (720-515);
		
		this.group6.px = 1280/2-(1280-1032);
		this.group6.py = -720/2 + 185;
		
		this.group3.px = -1280/2+250;
		this.group3.py = 720/2 - (720-588);
		
		this.group7.px = 1280/2 - (1280-1032);
		this.group7.py = -720/2 + 70;
		
		this.group4.px = -1280/2 + 270;
		this.group4.py = -720/2 + 200;
		
		this.group8.px = 1280/2 - (1280-1032);
		this.group8.py = 720/2 - (720-578);
		
		this.groups = [
			this.group1, this.group5, this.group2, this.group3, this.group7, this.group8, this.group4, this.group6
		];
		
		
		this.camera = new THREE.OrthographicCamera( this.main.width / - 2, this.main.width / 2, this.main.height / 2, this.main.height / - 2, 0, 20 );
		this.camera.position.z = 10;
		
		this.scene.add(this.camera);
		this.show = 0;
		
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
		var mat = new THREE.MeshBasicMaterial({color:"white",transparent:true, map:tex, side:THREE.DoubleSide });
		var mesh = new THREE.Mesh(plane, mat);
		
		mesh.position.x = position.x + w/2;
		mesh.position.y = position.y + h/2;
		mesh.position.z = position.z;
		
		//mesh.rotation.x = 0.4;
		//mesh.rotation.y = Math.PI/2;// 0.4;
		mesh.rotation.z = Math.random()*0.4-0.2;
		
		this.scene.add(mesh);
		return mesh;
		this.lastBar = -1;
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, timesig){
		
		var bar = timesig.bar;
		if(bar != this.lastBar && this.show < 9)
		{
			this.lastBar = bar;
			//bar *= timesig.beat % 2;
			for(var i = 0 ; i < 8; i++)
			{
				var g = this.groups[i];
				for(var j = 0; j < g.length; j++)
				{
					
					g[j].visible = this.show==(i);
				}
				if(this.show == (i))
				{
					//Coordinates for the config.
					this.px = g.px;
					this.py = g.py;
				}
			}
			this.show++;
		}
		this.shaderMaterial.uniforms.resolution.value.x = $("#demo canvas").width()/2;
		this.shaderMaterial.uniforms.resolution.value.y = $("#demo canvas").height()/2;
		this.shaderMaterial.uniforms.resolution.value.x = 1280;// this.main.resolution.width;// $("#demo canvas").width()/1;
		this.shaderMaterial.uniforms.resolution.value.y = 720;//this.main.resolution.height;//$("#demo canvas").height()/1;
		
		var pre = this.renderer.autoClear;
		var bar = timesig.bar;
		this.renderer.setClearColor(0xFFFFff,0.0);
		this.renderer.autoClear = true;
		this.shaderMaterial.uniforms.time.value = elapsedtime*0.0002;
	//	this.shaderMaterial.color = bar%10==0?"white": "black";
		this.renderer.render(this.scene, this.camera, this.renderTarget);
		this.renderer.autoClear = pre;
	}
	
	
})();


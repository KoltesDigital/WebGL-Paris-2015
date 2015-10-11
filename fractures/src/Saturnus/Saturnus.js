/**
 * ...
 * @author Petri Sarasvirta
 */

(function() {
	var Saturnus = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
		this.visibleTicker = 1;
		this.asteroids = [];

		this.belts = [];

		this.cameraMovements = [
			{position: new THREE.Vector3(5,0,-20), lookAt: new THREE.Vector3(5,0,-5), time:3000},
			{position: new THREE.Vector3(7,0,-15), lookAt: new THREE.Vector3(0,0,0), time:5000},
			{position: new THREE.Vector3(0,12,-4), lookAt: new THREE.Vector3(0,1,2), time:3000},
			{position: new THREE.Vector3(5,10,-10), lookAt: new THREE.Vector3(5,0,-5), time:3000},
			{position: new THREE.Vector3(5,4,5), lookAt: new THREE.Vector3(-2,0,0), time:3000},
			{position: new THREE.Vector3(-14,-2,1), lookAt: new THREE.Vector3(-3,1,2), time:3000},
			{position: new THREE.Vector3(5,0,-2), lookAt: new THREE.Vector3(5,0,-5), time:3000},
			{position: new THREE.Vector3(-5,-4,-4), lookAt: new THREE.Vector3(0,0,0), time:3000},
			{position: new THREE.Vector3(0,2,4), lookAt: new THREE.Vector3(0,1,2), time:3000}

		]

		this.camerapositionIndex = 0;
	}
	var p = Saturnus.prototype = new wideload.BasePart();
	wideload.Saturnus = Saturnus;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		
		this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );

		wideload.ManualControl.attachCamera(this.camera);
		
		this.camera.position.z = 10;
		this.camera.position.x = 20;
		this.camera.position.y = 10;

		this.camera.startPosition = this.camera.position.clone();
		this.camera.lookedAt = new THREE.Vector3(0,0,0);

		this.camera.lookAt(new THREE.Vector3(4,0,2));
		this.camera.rotateOnAxis(new THREE.Vector3(0,0,1),15*Math.PI/180);
		this.isActive = true;

		this.createSaturnus(new THREE.Vector3(0,0,0));

	}

	p.createSaturnus = function(pos){
		var geometry = new THREE.SphereGeometry(5,16,16);
		var saturnusTex = new THREE.Texture(Asset.getAsset("venus"));
		saturnusTex.needsUpdate = true;
		var material = new THREE.MeshBasicMaterial({color:0xaaeeaa,map:saturnusTex});
		var saturnus = new THREE.Mesh(geometry, material);
		saturnus.position.set(pos.x,pos.y,pos.z);
		this.scene.add(saturnus);


		//TODO: insert a lot better shaders
		var material1 = new THREE.MeshBasicMaterial({color:0xeaeaea, map:saturnusTex});
		var material2 = new THREE.MeshBasicMaterial({color:0x0a0a0a, map:saturnusTex});
		var material3 = new THREE.MeshBasicMaterial({color:0x686868, map:saturnusTex});
		var material4 = new THREE.MeshBasicMaterial({color:0x222222, map:saturnusTex});
		this.belts[0] = this.createBelt(pos,10,2, material1);
		this.belts[1] = this.createBelt(pos,11,2, material2);
		this.belts[2] = this.createBelt(pos,12,2, material3);
		this.belts[2] = this.createBelt(pos,13,2, material4);

		//this.createBelt(pos,10,2, new THREE.MeshShaderMate({color:"teal"}));
		//this.createBelt(pos,12,2, new THREE.MeshBasicMaterial({color:"grey"}));
		//this.createBelt(pos,14,2, new THREE.MeshBasicMaterial({color:"teal"}));
		this.saturnus = saturnus;
	}

	p.createBelt = function(pos,scale, scaley, material){
		var beltAsteroids = [];
		for(var x = 0; x < 360; ++x){
				var ypos = pos.y + scaley*wideload.Random.nextFloat();
				var xpos = pos.x + scale*Math.cos(x/180*Math.PI);
				var zpos = pos.z + scale*Math.sin(x/180*Math.PI);
				var mesh = this.createSingleAsteroid(new THREE.Vector3(xpos,ypos,zpos),material);
				mesh.startPosition = x;
				mesh.scaleTo = scale;
				this.asteroids.push(mesh);
				beltAsteroids.push(mesh);

				this.scene.add(mesh);
		}
		return beltAsteroids;
	}

	p.createSingleAsteroid = function(pos, material){
		var geometry = new THREE.IcosahedronGeometry(wideload.Random.nextFloat()+0.120);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.scale.set(wideload.Random.nextFloat()/10+0.15,wideload.Random.nextFloat()/10+0.15,wideload.Random.nextFloat()/10+0.15);
		mesh.position.set(pos.x,pos.y,pos.z);

		return mesh;
	}

	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, bar,beat,tick){
		if(this.firstFrame == null)
			this.firstFrame = elapsedtime;

		for(var i = 0; i < this.asteroids.length; ++i){
			var a = this.asteroids[i];
			a.position.x = a.scaleTo*Math.cos(a.startPosition+elapsedtime/4500);
			a.position.z =  a.scaleTo*Math.sin(a.startPosition+elapsedtime/4500);
		}

		for(var i = 0; i < this.belts.length; ++i){
			for(var j = 0; j < this.belts[i].length; ++j){
				var a = this.belts[i][j];
				a.position.x = a.scaleTo*Math.cos(a.startPosition+elapsedtime/(4500*(i-3)));
				a.position.z =  a.scaleTo*Math.sin(a.startPosition+elapsedtime/(4500*(i-3)));
			}
		}		
		var partTime = elapsedtime - this.firstFrame;

		this.camera.position = this.camera.position.lerp(this.cameraMovements[this.camerapositionIndex].position,partTime/this.cameraMovements[this.camerapositionIndex].time);

		this.camera.lookedAt = this.camera.lookedAt.lerp(this.cameraMovements[this.camerapositionIndex].lookAt,partTime/this.cameraMovements[this.camerapositionIndex].time);
		
		this.camera.position.x = Math.sin(elapsedtime*0.0001+0.1)*12.0;
		this.camera.position.y = Math.sin(elapsedtime*0.00013+0.1)*8.0;
		this.camera.position.z = Math.cos(elapsedtime*0.00015+0.1)*9.0;
		
		this.camera.lookAt( new THREE.Vector3(Math.sin(elapsedtime*0.0002+0.4)*4, 0.0, Math.cos(elapsedtime*0.0004+0.4)*10));
		
		if(partTime > this.cameraMovements[this.camerapositionIndex].time){
			this.camerapositionIndex++;
			this.firstFrame = elapsedtime;
		}
		if(this.cameraPositionIndex >= this.cameraMovements.length)
			this.cameraPositionIndex = this.cameraMovements.length-1;

		//this.camera.lookAt(new THREE.Vector3(0,0,-0));

		this.saturnus.rotateOnAxis(new THREE.Vector3(0,0.6,-0.05),0.01);

		var preClearSetting = this.renderer.autoclear;

		this.renderer.autoClear = true;

		this.renderer.setClearColor(0x000000,0.0);
		this.renderer.render(this.scene, this.camera, this.renderTarget);

		
//		this.renderer.render(this.scene,this.ovCamera,this.overlay);

		this.renderer.autoClear = preClearSetting;

	}
	
	
})();


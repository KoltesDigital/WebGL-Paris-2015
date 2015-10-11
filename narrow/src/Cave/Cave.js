/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var Cave = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
		this.direction = 1;
	}
	var p = Cave.prototype = new wideload.BasePart();
	wideload.Cave = Cave;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer)
	{
		this.superInitialize(renderer);
		
		this.groundMaterial = new THREE.ShaderMaterial({
			fragmentShader: wideload.CaveGroundShader.fragment,
			vertexShader: wideload.CaveGroundShader.vertex,
			uniforms: wideload.CaveGroundShader.uniforms
		});
		
		this.renderTargets = [
			this.renderTarget,
			this.renderTarget.clone(),
			this.renderTarget.clone()
		];
		this.overlay = new THREE.WebGLRenderTarget(1280, 720, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });
		
		
		var groundTexture = new THREE.Texture(Asset.getAsset("grass")); //TODO -replace with better graphic
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.needsUpdate = true;
		
		var hm = new THREE.Texture(Asset.getAsset("hm_ground")); //TODO -better heightmap
		hm.wrapS = hm.wrapT = THREE.RepeatWrapping;
		hm.needsUpdate = true;
		
		var normal = new THREE.Texture(Asset.getAsset("grass")); //TODO -better normals
		normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
		normal.needsUpdate = true;
		
		this.groundMaterial.uniforms.normal.value = normal;
		this.groundMaterial.uniforms.normalMap.value = normal;
		this.groundMaterial.uniforms.texture.value = groundTexture;
		this.groundMaterial.uniforms.heightmap.value = hm;
		
		this.groundMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(500,500,200,200),
			this.groundMaterial
		);
		this.groundMesh.rotation.x = - Math.PI * 0.5;
		this.scene.add(this.groundMesh);
		
		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );
		this.camera.position.z = -0;
		this.camera.position.x = 1000;
		this.camera.position.y = 100;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.isActive = true;
		
		
		this.ovCamera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 50  );
		
		
		this.camera1 = this.camera;
		this.camera2 = this.camera.clone();
		this.camera3 = this.camera.clone();
		
		this.skyContainer = new THREE.Object3D();
		
		this.day = new wideload.DayAndNight();
		this.day.container = this.skyContainer;
		this.day.initialize(this.scene, this.skyContainer);
		
		this.skyContainer.rotation.x = 0;
		this.skyContainer.rotation.y = Math.PI;
		this.scene.add(this.skyContainer);
		
		this.parameters = {
			width: 1000,
			height: 1000,
			widthSegments: 250,
			heightSegments: 250,
			depth: 1500,
			param: 4,
			filterparam: 1
		}
		
		var waterNormals;
		
		directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set(  0.3, 0.4,  1 );
		this.scene.add( directionalLight );
		
		waterNormals = new THREE.Texture(Asset.getAsset("waterNormals"));// new THREE.ImageUtils.loadTexture( 'assets/waternormals.jpg' );
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		waterNormals.needsUpdate = true;
		this.water = new THREE.Water( this.renderer, this.camera, this.scene, {
			textureWidth: 1024, 
			textureHeight: 1024,
			waterNormals: waterNormals,
			alpha: 	1,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0x996f6f,
			waterColor: 0x719955,
			distortionScale: 0.4,
		} );
		//this.water.material.uniforms.fogFar.value = 400000;
		
		//this.water.material.uniforms.fogNear.value = 400000;
		
		///this.day.material.uniforms.fogFar.value = 400000;
		//this.day.material.uniforms.fogNear.value = 400000;
		
		this.mirrorMesh = new THREE.Mesh(
			new THREE.PlaneGeometry( 5000 ,5000 , 10, 10 ), 
		//	new THREE.MeshBasicMaterial({color:"blue"})
			
			this.water.material
		);
		
		this.mirrorMesh.add( this.water );
		this.mirrorMesh.rotation.x = - Math.PI * 0.5;
		this.mirrorMesh.position.y = 5;
		this.scene.add( this.mirrorMesh );
		
		wideload.ManualControl.attachCamera(this.camera);
		wideload.ManualControl.attachCamera(this.camera2);
		wideload.ManualControl.attachCamera(this.camera3);
		
		this.camera.name = "Cave - cam 1";
		this.camera2.name = "Cave - cam 2";
		this.camera3.name = "Cave - cam 3";
		
		this.cameraControl1 = new wideload.CameraController();
		this.cameraControl1.attachCamera(this.camera);
		this.cameraControl1.initialize(
			//Positions
			
[new THREE.Vector3(51.0024564657678,30.01137704497408,-88.83624532280797), new THREE.Vector3(35.253900826118304,30.44200696394218,-76.5156299515626), new THREE.Vector3(19.50534518646881,30.87263688291028,-64.19501458031723), new THREE.Vector3(11.63106736664406,31.087951842394332,-58.03470689469455)]
,//Lookats
			
[new THREE.Vector3(58.87673428559255,29.79606208549003,-94.99655300843065), new THREE.Vector3(43.12817864594305,30.22669200445813,-82.67593763718529), new THREE.Vector3(27.379623006293556,30.65732192342623,-70.35532226593992), new THREE.Vector3(19.50534518646881,30.87263688291028,-64.19501458031723)]
,//mode
			wideload.CameraController.BEZIER
		);

		this.loadBoat();
		this.loadPalmTrees();
		
		this.cameraControl2 = new wideload.CameraController();
		this.cameraControl2.attachCamera(this.camera2);
		this.cameraControl2.initialize(
			
				[new THREE.Vector3(-35.19406605476329,30.347894098744227,32.374858041986286), new THREE.Vector3(-35.19406605476329,30.347894098744227,32.374858041986286), new THREE.Vector3(-81.17480728419497,26.006640619511128,-40.198724850624004), new THREE.Vector3(-81.68339431811856,22.19314272101185,-91.04357282814172), new THREE.Vector3(-102.86627719443527,18.81060758099419,-157.60070802928288), new THREE.Vector3(-120.92813708167067,30.190869320521287,-214.5591038105765), new THREE.Vector3(-141.41528704784469,11.051605604728678,-278.69930381966213), new THREE.Vector3(-150.490268752629,8.745481326059867,-307.2006458125246)]
				
			, 
			//Lookats
			
				[new THREE.Vector3(-37.22321787654558,28.58709582835982,22.742509830871718), new THREE.Vector3(-37.22321787654558,28.58709582835982,22.742509830871718), new THREE.Vector3(-83.23331823862296,25.23736961485431,-49.954274783707596), new THREE.Vector3(-84.70838821971333,21.424434628122246,-100.54402015909585), new THREE.Vector3(-105.8952338786067,19.04111024320937,-167.12815730246814), new THREE.Vector3(-123.9570937658421,30.421371982736467,-224.08655308376174), new THREE.Vector3(-144.3420227572981,8.317425073901163,-287.8621895352458), new THREE.Vector3(-153.51526265422376,7.976773233170264,-316.7010931434788)]
			,
			//mode
			wideload.CameraController.BEZIER
		);
		
		this.cameraControl3 = new wideload.CameraController();
		this.cameraControl3.attachCamera(this.camera3);
		this.cameraControl3.initialize(
			//Positions
			[new THREE.Vector3(-111.793226142729,119.09867932271888,-117.85517876415052), new THREE.Vector3(-112.60510343948107,118.7121777693333,-137.83495511778818), new THREE.Vector3(-114.0664825736348,118.01647497323924,-173.79855255433625), new THREE.Vector3(-115.81201876165176,117.18549663346023,-216.75507171465756), new THREE.Vector3(-117.80111813869433,116.23856782766555,-265.7055237810702)], 
			//Lookats
			[new THREE.Vector3(-111.7874937862127,118.09887833836223,-117.83607090945482), new THREE.Vector3(-112.59937108296478,117.71237678497664,-137.81584726309248), new THREE.Vector3(-114.06075021711851,117.01667398888259,-173.77944469964055), new THREE.Vector3(-115.80628640513547,116.18569564910358,-216.73596385996186), new THREE.Vector3(-117.79538578217804,115.2387668433089,-265.68641592637454)],
			//mode
			wideload.CameraController.BEZIER
		);
		
		this.cameraControl4 = new wideload.CameraController();
		this.cameraControl4.attachCamera(this.camera);
		this.cameraControl4.initialize(
			//Positions
[new THREE.Vector3(-116.24248014813153,19.008007297697766,-90.27172120354084), new THREE.Vector3(-116.75126825729077,16.067477898329035,-92.28484995720946), new THREE.Vector3(-105.74664373413444,24.952014172309475,-111.74981602828515), new THREE.Vector3(-115.73413922478719,28.94835922239104,-112.31816295598351), new THREE.Vector3(-115.22445674399816,16.889243571110697,-122.18589319009229), new THREE.Vector3(-114.19437601633243,20.766647419929726,-122.72798261045335)]			
,			//Lookats
			
[new THREE.Vector3(-115.7336920389723,20.948536697066498,-112.25859244987221), new THREE.Vector3(-116.24248014813153,17.008007297697766,-102.27172120354084), new THREE.Vector3(-105.2378556249752,23.892543571678207,-121.73668727461653), new THREE.Vector3(-115.22535111562794,29.88888862175977,-122.30503420231489), new THREE.Vector3(-114.71566863483892,16.82977297047943,-132.17276443642365), new THREE.Vector3(-114.68558790717319,22.707176819298457,-132.7148538567847)],
//mode
			//mode
			wideload.CameraController.BEZIER
		);
		
	}
	
	// Load the boat
	p.loadBoat = function(){
		var loader = new THREE.OfflineJSONLoader();
		var mesh = null;
		loader.load(Asset.getAsset("cave"), function(geo,materials){
  			//var materials = [];
			var mat = new THREE.ShaderMaterial(
			{fragmentShader: wideload.CaveShader.fragment,
			vertexShader: wideload.CaveShader.vertex,
			uniforms: wideload.CaveShader.uniforms}
			);
			var groundTexture = new THREE.Texture(Asset.getAsset("grass")); //TODO -replace with better graphic
			groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
			groundTexture.needsUpdate = true;
			
			var hm = new THREE.Texture(Asset.getAsset("hm_ground")); //TODO -better heightmap
			hm.wrapS = hm.wrapT = THREE.RepeatWrapping;
			hm.needsUpdate = true;
			
			var normal = new THREE.Texture(Asset.getAsset("grass")); //TODO -better normals
			normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
			normal.needsUpdate = true;
			
			mat.uniforms.normal.value = normal;
			mat.uniforms.normalMap.value = normal;
			mat.uniforms.texture.value = groundTexture;
			mat.uniforms.heightmap.value = hm;
			
			mat.needsUpdate = true;
			
//			mat = new THREE.MeshBasicMaterial({color:"white"});
  			mesh = new THREE.Mesh(geo,mat);
			wideload.UVMapper.setUvMap(wideload.UVMapper.FULL, mesh);
		//	mesh.position.x = -110;
			//mesh.position.z  = -180;
			
			mesh.rotation.y =-1;
			mesh.position.x = 86;
			mesh.position.y = 37;
			mesh.position.z = -100;
			mesh.scale.set(8,8,8);
			
  		})
  		this.scene.add(mesh);
  		this.boat = mesh;
  	}

  	p.loadPalmTrees = function(){
		
		var positions = [
			new THREE.Vector3(-137, 3, -102),
			new THREE.Vector3(-37, 3, -112),
			new THREE.Vector3(-27, 3, -48),
			new THREE.Vector3(-188, 3, 9),
			new THREE.Vector3(-151, 3, 42),
		/*	new THREE.Vector3(-137, 3, -102),
			new THREE.Vector3(-137, 3, -102),
			new THREE.Vector3(-137, 3, -102),
			new THREE.Vector3(-137, 3, -102),
			new THREE.Vector3(-137, 3, -102),
			*/
		];
		
  		var loader = new THREE.OfflineJSONLoader();
  		var palm = this.loadPalmTree(loader);
  		for(var i = 0 ; i < 5; ++i){
  			mesh = new THREE.Mesh(palm.geo, palm.material);
			var sizeAdd = wideload.Random.nextFloat();
  			mesh.scale.set(4+sizeAdd,4+sizeAdd,4+sizeAdd);
			mesh.position = positions[i];
  			mesh.position.x = -137;
  			mesh.position.y = 0;
  			mesh.position.z = i*Math.random()*200-100;
  			mesh.position.rotation = Math.random()*Math.PI*2 - Math.PI;
  			this.scene.add(mesh);
  		}
  	}
	
  	p.loadPalmTree = function(loader){
		var geo = null;
		var material = null;
		loader.load(Asset.getAsset("palmTree"), function(geo,materials){
  			geometry = geo;
  			material = new THREE.MeshFaceMaterial(materials);			
  		})
  		
  		return {geo:geometry, material:material};
  	}

	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime,partial,bar, beat, tick)
	{
		if(this.lastTick == null)
		{
			this.water.material.uniforms.fogFar.value = 400000;
		
			this.water.material.uniforms.fogNear.value = 400000;
		
			this.day.material.uniforms.fogFar.value = 400000;
			this.day.material.uniforms.fogNear.value = 400000;
		
			this.lastTick = elapsedtime;
		}
		//this.animation.update(delta);
		this.water.material.uniforms.time.value = elapsedtime / 9000.0;
		this.water.camera = this.camera1;
		this.water.render();
		
		this.boat.rotation.z = Math.sin(partial*Math.PI*5.1)*Math.PI/64;
		/*
		var easing = (Math.PI/30- Math.abs(this.boat.rotation.z))*(elapsedtime-this.lastTick)/80;
		if(this.direction == 1){
			if(this.boat.rotation.z > Math.PI/32){
				this.direction = -1;
			}
		}
		else{
			if(this.boat.rotation.z < -Math.PI/32){
				this.direction = 1;
			}
		}
		this.boat.rotation.z += easing*this.direction*Math.PI/80;
		*/
		this.lastTick = elapsedtime;
		
		var pre = this.renderer.autoClear;
		this.renderer.autoClear =true;
		this.renderer.setClearColor(0xFFFFFF,1);
		
		
		this.ovCamera.position.x = this.camera1.position.x;
		this.ovCamera.position.y = this.camera1.position.y;
		this.ovCamera.position.z = this.camera1.position.z;
		
		this.ovCamera.rotation.x = this.camera1.rotation.x;
		this.ovCamera.rotation.y = this.camera1.rotation.y;
		this.ovCamera.rotation.z = this.camera1.rotation.z;
		
		this.renderer.setClearColor(0xFFFFFF,0.0);
		var t = this.scene.fog;
	//	this.scene.fog = null;
		this.mirrorMesh.visible = false;
		this.groundMesh.visible = false;
		
		this.renderer.render(this.scene, this.ovCamera, this.overlay);
	//	this.renderer.setClearColor(0xFFFFFF,1);
	//	this.scene.fog = t;
		this.mirrorMesh.visible = true;
		this.groundMesh.visible = true;
		
		this.skyContainer.rotation.y =  elapsedtime* 0.00005+Math.PI*0.3 ;
		//this.camera.position.y = Math.sin(elapsedtime*0.0001)*200;
		if(bar < 8)
		{
			this.renderer.render(this.scene, this.camera1, this.renderTargets[0]);
			
			this.renderer.render(this.scene, this.camera2, this.renderTargets[1]);
			
			
			this.renderer.render(this.scene, this.camera3, this.renderTargets[2]);
			this.renderer.autoClear = false;
			
			this.cameraControl1.update(partial);
			this.cameraControl2.update(partial);
			this.cameraControl3.update(partial);
		}
		else
		{
			this.renderer.render(this.scene, this.camera1, this.renderTargets[0]);
			this.cameraControl4.update(partial);
		}
		this.renderer.autoClear =pre;
		
	}
})();


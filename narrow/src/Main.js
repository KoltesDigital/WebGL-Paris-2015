//Namespace
this.wideload = this.wideload || {};

(function(){
	
	var skipToTime = window.MUSIC_BEGIN;
	
	//Constructor
	var Main = function(){
		
		//we can start after the sound is loaded and we are in fullscreen
		Main.LOAD_COMPLETED = {sound: false, fullScreen: false};
		
		wideload.ManualControl.init();
		this.parts = {
			"PartName":new wideload.PartName(this,"PartName"),
			"TempPart":new wideload.TempPart(this, "TempPart"),
			"Desert":new wideload.Desert(this, "Desert"),
			"Tubes":new wideload.Tubes(this,"Tubes"),
			"Cave": new wideload.Cave(this, "Cave"),
			"Coins":new wideload.Coins(this, "Coins"),
		};
		
		//Add listeners for windowed & fullscreen
		document.getElementById("fullscreen").addEventListener('click', createjs.proxy(this.handleStart, this), false);
		document.getElementById("windowed").addEventListener('click', createjs.proxy(this.handleStart, this), false);
		
		//Add listener for bg music.
		createjs.Sound.addEventListener("fileload", createjs.proxy(this.soundLoaded, this));
		createjs.Sound.alternateExtensions=["mp3"];
		createjs.Sound.registerSound("bin/bg.ogg", "bg");
		
		this.clock = new THREE.Clock();	
	}
	
	//Prototype reference.
	var p = Main.prototype;
	
	p.handleFSStart = function(e)
	{
		//Check if target is fullscreen-button
		
		var element = this.renderer.domElement;
		var demoEl = document.getElementById("demo");
		if(this.fullscreen)
		{
			if (demoEl.requestFullscreen) {
				demoEl.requestFullscreen();
			} else if (demoEl.mozRequestFullScreen) {
				demoEl.mozRequestFullScreen();
			} else if (demoEl.webkitRequestFullscreen) {
				demoEl.webkitRequestFullscreen();
			} else{
				console.log("fullscreen failed");
			}
		}
		var s= this;
		setTimeout(function(){this.handleStart.call(s);}, 100);
	}
	
	/**
	* Mode selection handler.
	*/
	p.handleStart = function(e)
	{
		this.fullscreen = e.target == document.getElementById("fullscreen");
		
		this.initRenderer();
		//Set element states
		var element = this.renderer.domElement;
		var demoEl = document.getElementById("demo");
		if(this.fullscreen)
		{
			if (demoEl.requestFullscreen) {
				demoEl.requestFullscreen();
			} else if (demoEl.mozRequestFullScreen) {
				demoEl.mozRequestFullScreen();
			} else if (demoEl.webkitRequestFullscreen) {
				demoEl.webkitRequestFullscreen();
			} else{
				console.log("fail");
			}
		}
		document.getElementById("fullscreen").style.display = "none";
		document.getElementById("windowed").style.display = "none";
		Main.LOAD_COMPLETED.fullScreen = true;
		//Add delay if going to fullscreen.
		
		if(!this.fullscreen)
		{
			element.style.position="absolute";
			element.style.top = "50%";
			element.style.left = "50%";
			element.style.marginTop = "-360px";
			element.style.marginLeft= "-640px";
			
		}
		
		setTimeout(createjs.proxy(function(){
		//Initialize the program.
		this.initialize();
		
		
		if(e.target == document.getElementById("fullscreen"))
		{ 
			window.setTimeout( createjs.proxy(this.checkStart,this),5000);
		}
		else
		{
			
			this.checkStart();
		}
		},this),50);
	}
	
	/**
	* Sound loaded -handler
	*/
	p.soundLoaded = function(){
		Main.LOAD_COMPLETED.sound = true;
		this.checkStart();
	}
	
	p.initRenderer = function()
	{
		//because demo is in fullscreen mode setting width and height according to
		//screen property should work. 
		if(this.fullscreen)
		{
			var w = screen.width;
			var h = screen.height;
			//TODO - calculate the dimensions so that black borders can be applied
			this.width = w;
			this.height = h;
		}
		else
		{
			this.width = 1280;
			this.height = 720;
		}
		this.screenResolution = {width:this.width, height: this.height};
	    //Main render targets resolution. Parts can have different targets.
	    this.resolution = { width: 256, height: 256 };
		
		if(this.fullscreen)
		{
			var w = screen.width;
			var h = screen.height;
			//TODO - calculate the dimensions so that black borders can be applied
			this.width = w;
			this.height = h;
		}
		else
		{
			this.width = 1280;
			this.height = 720;
		}
		
		this.width = 1280;
		this.height = 720;
		//Build the renderer.
		this.renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
		this.renderer.setSize(this.width, this.height);
		
		this.renderer.setClearColor(0x000000,0);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		
		this.renderer.domElement.style.width = this.width;
		this.renderer.domElement.style.height = this.height;
		
		//Add the renderer element.
		document.getElementById("demo").appendChild( this.renderer.domElement );		
		if(this.fullscreen)
		{
		//	if(screen.width > 1280 || screen.height > 720)
			{
				var s = screen.width/1280;
				if(s > screen.height / 720)
					s = screen.height / 720;
				
				$("#demo").css("position", "absolute").css("left","0px").css("top", (screen.height - this.height*s)/2 + "px").css("right","0px").css("bottom","0px");
				//console.log("set scale");
				$(this.renderer.domElement).css("-webkit-transform-origin", "0px 0px").css("transform-origin", "0px 0px");
				$(this.renderer.domElement).css("-webkit-transform", "scale("+s+","+s+")").css("transform", "scale("+s+","+s+")")
				.css("left", "0px").css("top", "0px").css("position", "absolute");
			}

		}
		
		
	}

	/**
	* Check if the demo can be started.
	*/
	p.checkStart = function(){
		if(Main.LOAD_COMPLETED.sound && Main.LOAD_COMPLETED.fullScreen){
			
			//Additional 1s delay before starting to make sure everything is ok
			var ss = this;
			setTimeout(function(){
				if(!this.soundPlaying){
					ss.soundPlaying = true;
					ss.bgSound = createjs.Sound.play("bg");
					ss.bgSound.setPosition(skipToTime);
					ss.bgSound.setVolume(1);
				}
				//First frame shoul dhave no delta.
				ss.clock.getDelta();
				ss.mainLoop();
			},1000);
		}
	}
	
	/**
	* Initialize the main scene & other related stuff.
	*/
	p.initialize = function() {
		
		var w = this.width;
		var h = this.height;
		//Main rendertargets
		this.renderTarget1 = new THREE.WebGLRenderTarget( this.width/3, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );	
		this.renderTarget2 = new THREE.WebGLRenderTarget( this.width/3, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );	
		this.renderTarget3 = new THREE.WebGLRenderTarget( this.width/3, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );	
		
		this.rendertargets = [this.renderTarget1, this.renderTarget2, this.renderTarget3];
		
		this.currentPart = 0;
		this.frameCount = 0;
		this.timeCount = 0;
		
		this.initializeScene();		
		this.InitializeComposer();
		
		this.initializePoetry();
		
		// Creating containers for each part
		/*
		for (var partKey in this.parts) {
		    var part = this.parts[partKey];
			var object = new THREE.Object3D();
			part.preInitialize(object);	
		}
		*/
	    // Initializing configuration for master
		this.InitializeConfiguration();
		
		// Part initialization
		for (var partKey in this.parts) {
		    var part = this.parts[partKey];
		    part.width = this.width;
		    part.height = this.height;
			var object = new THREE.Object3D();
			part.initialize(this.renderer);	
		}
		
		
		//Render once with loaded stuff to override bug
		this.planes[0].material.map = this.parts["TempPart"].renderTarget;						
		wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[0]);
		this.planes[2].material.map = this.parts["TempPart"].renderTarget;						
		wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[2]);
		this.planes[1].material.map = this.parts["TempPart"].renderTarget;						
		wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[1]);
	}
	
	p.initializePoetry = function(){
		var poetry = ["modern", "day", "pirates", "have", "it", "easy", 
					"plundering", "on", "the", "tubes", "of", "the", "internets",
					"looking", "for", "their", "bottles", "of", "rum",
					"following", "the", "mistakes", "of", "their", "fathers"
		];
		
		var poss = [
			new THREE.Vector3(-370, 250,5), //Modern
			new THREE.Vector3(-150, 80,5),//Day
			new THREE.Vector3(280, 	-20,5),//pirates
			new THREE.Vector3(-440, -200,5),//have
			new THREE.Vector3(-200, -220,5),//it
			new THREE.Vector3(50, -240,5),//easy
			
			new THREE.Vector3(-350, 250,5),//plundering
			new THREE.Vector3(100, 200,5),//on
			new THREE.Vector3(400, 150,5),//the
			new THREE.Vector3(200, 30,5),//Tubes
			new THREE.Vector3(-50, -30,5),//of
			new THREE.Vector3(-350, -130,5),//the
			new THREE.Vector3(0, -250,5),//internets
			
			new THREE.Vector3(-370, 250,5), //looking
			new THREE.Vector3(-150, 80,5),//for
			new THREE.Vector3(280, 	-20,5),//their
			new THREE.Vector3(-440, -200,5),//bottles
			new THREE.Vector3(-160, -220,5),//of
			new THREE.Vector3(50, -240,5),//rum
			
			new THREE.Vector3(-350, 250,5),//following
			new THREE.Vector3(100, 200,5),//the
			new THREE.Vector3(400, 120,5),//mistakes
			new THREE.Vector3(0, 30,5),//of
			new THREE.Vector3(-270, -30,5),//their
			new THREE.Vector3(-0, -230,5),//fathers
			
		];
		
		var rot = [
			-0.1,//modern
			0.2,//day
			0.1,//pirates
			-0.3,//have
			-0.05,//it
			0,//easy
			-0.1,//plundering
			0.05,//on
			-0.2,//the
			-0.1,//tubes
			0,//of
			0.2,//the
			0//internets
			
			-0.15, //looking
			0.1,//for
			0.15,//their
			0,//bottles
			-0.1,//of
			0.1,//rum
			
			-0.1,//following
			0.05,//the
			0.01,//mistakes
			0.2,//of
			0,//their
			-0.2,//fathers
			-0
			
		];
		var ts = wideload.TimeSig;
		var spawns = [
			[new ts(40,1,0), new ts(45,1,0)],//modern
			[new ts(40,3,0), new ts(45,1,0)],//day
			[new ts(41,1,0), new ts(45,1,0)],//pirates
			[new ts(42,3,0), new ts(45,1,0)],//have
			[new ts(43,1,0), new ts(45,1,0)],//it
			[new ts(43,3,0), new ts(45,1,0)],//easy
			
			[new ts(48,1,0), new ts(52,1,0)],//plundering
			[new ts(48,3,0), new ts(52,1,0)],//on
			[new ts(49,1,0), new ts(52,1,0)],//the
			[new ts(49,3,0), new ts(52,1,0)],//tubes
			[new ts(50,1,0), new ts(52,1,0)],//of
			[new ts(50,3,0), new ts(52,1,0)],//the
			[new ts(51,1,0), new ts(52,1,0)],//internets

			[new ts(55,1,0), new ts(60,1,0)],//looking
			[new ts(55,3,0), new ts(60,1,0)],//for
			[new ts(56,1,0), new ts(60,1,0)],//their
			[new ts(56,3,0), new ts(60,1,0)],//bottles
			[new ts(57,1,0), new ts(60,1,0)],//of
			[new ts(57,3,0), new ts(60,1,0)],//rum
			
			[new ts(63,1,0), new ts(67,1,0)],//following
			[new ts(63,3,0), new ts(67,1,0)],//the
			[new ts(64,1,0), new ts(67,1,0)],//mistakes
			[new ts(64,3,0), new ts(67,1,0)],//of
			[new ts(65,1,0), new ts(67,1,0)],//their
			[new ts(65,3,0), new ts(67,1,0)],//fathers
			
		];
		this.poetry = [];
		for(var i = 0; i < poetry.length; i++)
		{
			var img = Asset.getAsset(poetry[i]);
			var w = img.width;
			var h = img.height;
			var tex = new THREE.Texture(img);
			tex.needsUpdate = true;
			var plane = new THREE.PlaneGeometry(w,h,1,1);
			var mat = new THREE.MeshBasicMaterial({color:"white",transparent:true, map: tex, side:THREE.DoubleSide });
			var mesh = new THREE.Mesh(plane, mat);
			mesh.position.z = poss[i].z;
			mesh.position.x = poss[i].x*this.width/1280;
			mesh.position.y = poss[i].y*this.height/720;
			mesh.rotation.z = rot[i];
			mesh.scale.set(this.width/1280, this.height/720,1);
			mesh.visible = false;
			mesh.begin = spawns[i][0];
			mesh.end = spawns[i][1]
//			mesh.position = poss[i];
//console.log(poetry[i]+","+ mesh.position + "," + mesh.rotation.z);
			this.poetry.push(mesh);
			this.ovScene.add(mesh);
		}
	}
	
	p.InitializeComposer = function(){
		this.effectBloom = new THREE.BloomPass( 1.15, 20, 18 , 512)
	    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
	    copyPass.renderToScreen = false;
		
		var renderModel = new THREE.RenderPass(this.scene, this.camera,null,0,0);
	    this.composer = new THREE.EffectComposer(this.renderer, this.edgeRT);
		
		this.composer.renderTarget1.format=THREE.RGBAFormat;
	    this.composer.renderTarget2.format=THREE.RGBAFormat;
		
	    this.composer.addPass(renderModel);
	    this.composer.addPass(this.effectBloom);
	//	this.composer.addPass(copyPass);
		
		this.rgbShift = new wideload.RGBShift(0.002,-0.002,0.00);
		this.composer.addPass(this.rgbShift);
		this.composer.addPass(copyPass);
		
		this.ovComposer = new THREE.EffectComposer(this.renderer, this.ovRT);
		renderModel = new THREE.RenderPass(this.ovScene, this.camera,null,0,0);
		copyPass = new THREE.ShaderPass(THREE.CopyShader);
		this.effectBloom2 = new THREE.BloomPass( 1.15, 20, 18 , 512)
		this.ovComposer.addPass(renderModel);
	    this.ovComposer.addPass(this.effectBloom2);
		this.ovComposer.addPass(this.rgbShift);
		this.ovComposer.addPass(copyPass);
//		 scene, camera, overrideMaterial, clearColor, clearAlpha 
	}
	
    p.InitializeConfiguration = function() {
		this.bar = 0;
		this.beat = 0;
		this.tick = 0;
        var configuration = new wideload.Configuration();
        this.configuration = configuration;
        configuration.init();
        this.soundPlaying = false;
        for(var i = 0; i < configuration.parts.length; ++i){
        	var partConfiguration = configuration.parts[i];
        	var part = this.parts[partConfiguration.part];
        	if(part == null){
        		console.log("Configuration error in part configuration by id: " + configuration.part);
				continue;
        	}
        	part.configuration = partConfiguration;
        	part.initConfig();
        }
    }
    
	p.initializeScene = function(){
		this.scene = new THREE.Scene();
	//	this.scene.fog = new THREE.Fog( 0x000000, 1, 50000 );
		this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 0, 20 );
		this.camera.position.z = 15;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.scene.autoUpdate = true;
		this.planematerials = [];
		this.planes = [];
		for(var i = 0; i< 3; i++)
		{
			var geometry = new THREE.PlaneGeometry(this.width/3,this.height,1,1);
			var material = new THREE.MeshBasicMaterial({ color:"black", side:THREE.DoubleSide });
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = i*this.width/3-this.width/3;
			
			this.scene.add(mesh);
			this.planematerials.push(material);
			this.planes.push(mesh);
		}
		
		
		this.edgeScene = new THREE.Scene();
		this.edgeScene.autoUpdate = true;
		this.edgeRT = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );	
	//	this.edgePlane = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height,1,1), new THREE.MeshBasicMaterial({color:"red", map:this.edgeRT}));
	//	this.edgeScene.add(this.edgePlane);
		this.ovRT = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );	
		
		this.overlay = new THREE.Mesh( 
				new THREE.PlaneGeometry(this.width, this.height,1,1),
				new THREE.MeshBasicMaterial({color:"white",transparent:true,opacity:1, side:THREE.DoubleSide, map:this.edgeRT}));
		this.overlay.position.x = 0;
		this.overlay.position.y = 0;
		this.overlay.position.z = 4;
		
		this.bottom = new THREE.Mesh( 
				new THREE.PlaneGeometry(this.width, this.height,1,1),
				new THREE.MeshBasicMaterial({color:"white",transparent:false,opacity:1, side:THREE.DoubleSide, map:this.edgeRT}));
		this.bottom.position.z = -2;
		this.edgeScene.add(this.bottom);
		this.edgeScene.add(this.overlay);
		
		this.ovScene = new THREE.Scene();
		this.ovScene.autoUpdate = true;
		this.overPrePlane = this.overlay.clone();
		
		this.overPrePlane.x = 0;
		
		this.ovScene.add(this.overPrePlane);
		
		var edgeMaterial = new THREE.MeshBasicMaterial({color: "black", transparent: true, side:THREE.DoubleSide });
	//	this.edgePlane.z = 2;
	var th = this.height;
	var tw = this.width;
		//Create edges
		
		var ms = 18;
		var topg = new THREE.PlaneGeometry(this.width, ms,1,1);
		var topmesh = new THREE.Mesh(topg, edgeMaterial);
		this.topmesh = topmesh;
		topmesh.position.y = this.height/2 - ms/2;
		topmesh.position.x = 0;
		topmesh.position.z = 3;
		
		var bottomMesh = new THREE.Mesh(topg, edgeMaterial);
		this.bottomMesh = bottomMesh;
		bottomMesh.position.y = -this.height/2 + ms/2;
		bottomMesh.position.x = 0;
		bottomMesh.position.z = 3;
		
		var leftg = new THREE.PlaneGeometry(ms, this.height,1,1);
		var leftMesh = new THREE.Mesh(leftg, edgeMaterial);
		this.leftMesh = leftMesh;
		leftMesh.position.y = 0;
		leftMesh.position.x = -this.width/2 + ms/2;
		leftMesh.position.z = 3;
		
		var middleMesh1 = new THREE.Mesh(leftg, edgeMaterial);
		this.middleMesh1 = middleMesh1;
		middleMesh1.position.y = 0;
		middleMesh1.position.x = -this.width/6;
		middleMesh1.position.z = 3;
		
		
		
		var middleMesh2 = new THREE.Mesh(leftg, edgeMaterial);
		this.middleMesh2 = middleMesh2;
		middleMesh2.position.y = 0;
		middleMesh2.position.x = this.width/6;
		middleMesh2.position.z = 3;
		
		var rightMesh = new THREE.Mesh(leftg, edgeMaterial);
		this.rightMesh = rightMesh;
		rightMesh.position.y = 0;
		rightMesh.position.x = this.width/2 - ms/2;
		rightMesh.position.z = 3;
		
		this.edgeScene.add(topmesh);
		this.edgeScene.add(bottomMesh);
		this.edgeScene.add(leftMesh);
		this.edgeScene.add(rightMesh);
		this.edgeScene.add(middleMesh1);
		this.edgeScene.add(middleMesh2);
		
		this.firstPartOpaFade = new wideload.TimeSig(35,0,0);
		this.firstPartOpaFadeOut = new wideload.TimeSig(35,3,0);
		var scope = this;
		this.ctrlDown = true;
		document.addEventListener('keydown',function(event){
		if(event.keyCode == "17")
		{
			scope.ctrlDown = false;
			document.addEventListener("keyup", function(event){
				if(event.keyCode == "17")
					scope.ctrlDown = true;
			});
		}
		
		if(event.keyCode == "109" || event.keyCode == "188"){
			// minus
			scope.bgSound.setPosition(scope.bgSound.getPosition()-5000);
		}
		if(event.keyCode == "107" || event.keyCode == "190"){
			// pluss
			scope.bgSound.setPosition(scope.bgSound.getPosition()+5000);
		}
		}, false);
		this.overlay.material.opacity = 0;
	}
	
	p.mainLoop = function(){
		if(!this.renderonceBegin)
		{
			this.renderonceBegin = true;
			
		}
		else if(!this.renderonceBeginDone)
		{
			this.renderonceBeginDone = true;
			this.planes[0].to= null;						
			this.planes[1].to= null;						
			this.planes[2].to= null;
			this.planes[0].material.map = null;						
			this.planes[0].material.needsUpdate=true;						
			wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[0]);
			this.planes[2].material.map = null;
			wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[2]);
			this.planes[1].material.map = null;
			wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[1]);
			this.currentConf = null;
			this.planes[1].material.needsUpdate=true;						
			this.planes[2].material.needsUpdate=true;
			this.planes[0].begin = null;
			this.planes[1].begin = null;
			this.planes[2].begin = null;
			
		}
		
		var time = 0;
		if(this.bgSound != null)
			time = this.bgSound.getPosition();
		
		if(this.stopCamera)
		{
			time = this.previous;
		}
		this.previous = time;
		
		//No updates after time ended.
		if(this.bgSound && time >= this.bgSound.length ||time ==0) 
			return;
		var frameTime = this.clock.getDelta();
		//update tweens
		createjs.Tween.tick(frameTime, false);

		//next frame requesr
		requestAnimationFrame( createjs.proxy(this.mainLoop, this) );
		++this.frameCount;
		
		var timeo = time - MUSIC_BEGIN;
		var timems = time-MUSIC_BEGIN;
		timeo /= 1000; //To seconds
		timeo /= 60; //To minutes
		if(timeo < 0)
			timeo = 0;
//		seconds = (bars * beatsperbar) / beatsperminute
		this.bar = Math.floor( timeo * 1/60 * 1/60 *BEATS_PER_MINUTE * 1/BEATS_PER_BAR);
		
		var totalBeats = BEATS_PER_MINUTE * timeo;
		var bar = Math.floor( totalBeats/BEATS_PER_BAR);
		var beat = Math.floor( totalBeats % BEATS_PER_BAR);
		var tick = Math.floor((totalBeats-Math.floor(totalBeats))* TICKS_PER_BEAT);
		
		var timesig = new wideload.TimeSig(bar, beat, tick);
		var useOver = false;
//		console.log(" " +bar + ":"+beat+ ":"+tick);
		for (var i = 0; i < this.configuration.parts.length; i++) {
			var partC = this.configuration.parts[i];
		    var part = this.parts[partC.part];
			var partial = 0;
			//	partial=0;
			//	if(partial!=0)
			//	console.log(partial);
			if(timesig.isInside(partC.begin, partC.end))
			{
				 partial = (timems - partC.begin.toMilliseconds())/(partC.end.toMilliseconds() - partC.begin.toMilliseconds());
			//	console.log("update p");
				part.update(time, partial, bar,beat,tick );
				if(part.overlay != null)
				{
					useOver = true;
					if(this.overlay.material.map != part.overlay)
					{
						this.overlay.material.opacity = 1;
						this.overlay.material.needsUpdate = true;
						this.overPrePlane.material.map = part.overlay;
						this.overPrePlane.material.needsUpdate = true;
					}
				}
				else if(!useOver)
				{
			//		this.overlay.material.opacity = 0.0;
				}
			//	this.overlay.material.needsUpdate = true;
			}
		    /*
			if(part.configuration != null)
		    {
		    	if(time >= part.configuration.startTime && !part.isActive){
		    		this.scene.add(part.container);
		    		part.start(time);
		    	}
		    	if(time >= part.configuration.endTime && part.isActive){
		    		part.stop();
		    	}
		    }*/
		}
		
		for(var i = 0; i < this.configuration.rendering.length; i++)
		{
			var conf = this.configuration.rendering[i];
			
			var to = conf.to;
			if(timesig.isInside(conf.begin, conf.end))
			{
				this.currentConf = conf;
				/*
				if(conf.hideBorders){
					this.topmesh.visible = false;
					this.bottomMesh.visible = false;
					this.leftMesh.visible = false;
					this.rightMesh.visible = false;
					this.middleMesh1.visible = false;
					this.middleMesh2.visible = false;
				}
				else{
					this.topmesh.visible = true;
					this.bottomMesh.visible = true;
					this.leftMesh.visible = true;
					this.rightMesh.visible = true;
					this.middleMesh1.visible = true;
					this.middleMesh2.visible = true;
				}*/
				//console.log(conf.part);
				for(var j = 0; j < to.length; j++)
				{
					var s = to[j];
					if(this.planes[s.s].to !== s)
					{
						if(this.planes[s.s].begin == null || this.planes[s.s].begin.isSmallerThan(conf.begin))
						{
							this.planes[s.s].begin = conf.begin;
						//	console.log("update screen "+s.s + " to "+conf.part);
							this.planes[s.s].to = s;
							if(s.rt != null)
							{
								this.planes[s.s].material.map = this.parts[conf.part].renderTargets[s.rt];
							}
							else
								this.planes[s.s].material.map = this.parts[conf.part].renderTarget;
							this.planes[s.s].material.needsUpdate =true;
							
							wideload.UVMapper.setUvMap(s.uv, this.planes[s.s]);
							//this.planes[s.s].material.needsUpdate = true;
													
							if(s.tint != null){
								this.planes[s.s].material.color.setHex(s.tint);		
							}
							else
								this.planes[s.s].material.color.setHex(0xffffff);
						}
					}
					
					//Outro - intro
					if(conf.outro != null && timesig.isInside(conf.outro.begin,conf.outro.end))
					{
					//	console.log("outro");
						conf.outro(timems, this.planes[s.s]);
					}
					if(conf.intro != null && timesig.isInside(conf.intro.begin,conf.intro.end))
					{
					//	console.log("intro");
						conf.intro(timems, this.planes[s.s]);
					}
					else if(conf.intro != null && timesig.isLargerThan(conf.intro.end) && (conf.outro == null || timesig.isSmallerThan(conf.outro.begin)))
					{
						if(s.tint != null){
							this.planes[s.s].material.color.setHex(s.tint);		
						}
						else
							this.planes[s.s].material.color.setHex(0xffffff);
					}
				}
				
				if(conf.override)
					break;
			}
			else if(timesig.isLargerThan( conf.end) && !conf.ended) //Remove old effects. These should be replaced immediatly so this is not an issue
			{
				
				conf.ended = true;
				for(var j = 0; j < to.length; j++)
				{
					var s = to[j];
					if(s.begin == conf.begin)
					{
				//	if(this.planes[s.s].material.map !== this.parts[conf.part].renderTarget)
				//	{
					//	console.log("remove screen");
						this.planes[s.s].material.map =null;
						this.planes[s.s].material.color.setHex(0x000000);		
						this.planes[s.s].material.needsUpdate = true;
				//	}
					}
					
					//Outro - intro
					if(conf.outro != null )
					{
						//console.log("last outro");
						conf.outro(conf.outro.end.toMilliseconds(), this.planes[s.s]);
					}
				}
			}
		}
		
		for(var i = 0; i < this.configuration.rgbShifts.length; i++)
		{
			var end = this.configuration.rgbShifts[i].clone();
			end.beat +=1;
			if(timesig.isInside(this.configuration.rgbShifts[i], end))
			{
				this.rgbShift.uniforms.rshift.value = 0.002+Math.random()*0.01;
				this.rgbShift.uniforms.bshift.value = -0.002+Math.random()*0.01;
				break;
			}
			else
			{
				this.rgbShift.uniforms.rshift.value = 0.00;
				this.rgbShift.uniforms.bshift.value = 0.00;
				this.rgbShift.uniforms.gshift.value = 0.00;
			}
		}
		for(var i = 0; i < this.configuration.screenOff.length; i++)
		{
			var end = this.configuration.screenOff[i].clone();
			end.tick +=32;
			if(timesig.isInside(this.configuration.screenOff[i], end))
			{
				if(bar >= 68)
					this.rgbShift.uniforms.tear.value = 0.02+Math.random()*0.03;
				else
					this.rgbShift.uniforms.tear.value = 0.05+Math.random()*0.1;
				break;
			}
			else
			{
				this.rgbShift.uniforms.tear.value = 0.00;
			}
			
		}
		this.rgbShift.uniforms.time.value = timems*0.00001;
	//	this.planematerials[0].map = this.parts["temp"].renderTarget;
	//	wideload.UVMapper.setUvMap(wideload.UVMapper.LEFT, this.planes[0]);
		//Brightness
		this.phaseCount = this.phaseCount || 1;
		
		this.renderer.autoClear =true;
		this.renderer.setClearColor(0x000000,1);
		this.renderer.autoClear = false;
		this.renderer.shadowMapEnabled = false;
		this.composer.render();	 // Composer finally adds postprocessing effects and renders the final image to screen.
		this.bottom.material.map = this.composer.renderTarget2;
		this.bottom.material.needsUpdate = true;
		if(this.overlay.material.opacity > 0.01)
		{
			this.renderer.setClearColor(0x000000,0);
			
			this.ovComposer.render();
			this.overlay.visible = true;
			this.overlay.material.map = this.ovComposer.renderTarget2;
			
		//	console.log("render ov");
		}
		else
		{
		//	console.log("dont render ov");
			this.overlay.visible = false;
		}
		
		if(timesig.isInside(this.firstPartOpaFade, this.firstPartOpaFadeOut))
		{
				this.overlay.material.opacity = 1-(timesig.toMilliseconds()-this.firstPartOpaFade.toMilliseconds())/(this.firstPartOpaFadeOut.toMilliseconds()-this.firstPartOpaFade.toMilliseconds());
				this.leftMesh.material.opacity = this.overlay.material.opacity;
		
		}
		else if(timesig.isLargerThan(this.firstPartOpaFadeOut))
		{
			if(bar >= 68)
			{
				this.overPrePlane.material.map = this.parts["Coins"].overlay;
				this.overlay.material.needsUpdate = true;
				this.overPrePlane.visible = true;
				this.renderer.setClearColor(0x000000,0);
				this.overlay.material.opacity = 1;
				this.ovComposer.render();
				this.overlay.material.map = this.ovComposer.renderTarget2;
				
				
				this.overlay.visible = true;
				
				
			}
			else if(bar >= 40)
			{
				this.renderer.setClearColor(0x000000,0);
				this.overlay.material.opacity = 1;
				this.ovComposer.render();
				this.overlay.material.map = this.ovComposer.renderTarget2;
				//this.overlay.material.needsUpdate = true;
				this.overlay.visible = true;
				this.overPrePlane.visible = false;
			}
			else{
				this.overlay.material.opacity = 0;
				this.leftMesh.material.opacity = this.overlay.material.opacity;
			}
		}
		this.edgeRT = this.ovComposer.renderTarget2;
		
		for(var i = 0; i < this.poetry.length; i++)
		{
			this.poetry[i].visible = timesig.isInside(this.poetry[i].begin, this.poetry[i].end);
		}
		
		this.renderer.setClearColor(0x000000,0);
		this.renderer.autoClear = true;
		this.renderer.render(this.edgeScene, this.camera);
		
		$("#timestamp").html(Math.round(time));
	};
	
	//Expose the class
	wideload.Main = Main;
}())

setTimeout(function(){
//var stats = new Stats();
//stats.setMode(0); // 0: fps, 1: ms

// Align top-left
//stats.domElement.style.position = 'absolute';
//stats.domElement.style.left = '0px';
//stats.domElement.style.top = '0px';

//document.body.appendChild( stats.domElement );

//setInterval( function () {

   // stats.begin();

    // your code goes here

 //   stats.end();

//}, 1000 / 60 );
},100);
//Namespace
this.wideload = this.wideload || {};

(function(){
	
	var skipToTime = window.MUSIC_BEGIN;
	
	//Constructor
	var Main = function(){
		
		//we can start after the sound is loaded and we are in fullscreen
		Main.LOAD_COMPLETED = {sound: false, fullScreen: false};
		
		Asset.init();
		
		wideload.ManualControl.init();
		this.parts = {
			"Noise":new wideload.Noise(this,"Noise"),
			"Tubes": new wideload.Tubes(this, "Tubes"),
			"Gear": new wideload.Gears(this, "Gears"),
			"Gears": new wideload.Gears(this, "Gears"),
			"Saturnus": new wideload.Saturnus(this,"Saturnus"),
			"Greets" : new wideload.Greets(this, "Greets"),
			"DemoName": new wideload.DemoName(this, "DemoName"),
			"Sun": new wideload.Sun(this, "Sun"),
			"BoxHit": new wideload.BoxHit(this, "BoxHit")
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
			console.log("Start delay - 1s");
			setTimeout(function(){
				if(!this.soundPlaying){
					console.log("Begin");
					ss.soundPlaying = true;
					ss.bgSound = createjs.Sound.play("bg");
					ss.bgSound.setPosition(skipToTime);
					ss.bgSound.setVolume(0.1);
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
		
		this.currentPart = 0;
		this.frameCount = 0;
		this.timeCount = 0;
		console.log("Initialize scene");
		this.initializeScene();		
		console.log("Initialize composer");
		this.InitializeComposer();
		console.log("InitializeConfiguration");
	    // Initializing configuration for master
		this.InitializeConfiguration();
		
		this.initializeDebugControl();
		
		console.log("Initialize parts");
		// Part initialization
		for (var partKey in this.parts) {
		    var part = this.parts[partKey];
		    part.width = this.width;
		    part.height = this.height;
			var object = new THREE.Object3D();
			part.initialize(this.renderer);	
		}
	}
	
	p.InitializeComposer = function(){
		this.composerRT = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );	
		
		this.effectBloom = new THREE.BloomPass( 1.85, 20, 18 , 512)
	    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
	    copyPass.renderToScreen = true;
		
		var renderModel = new THREE.RenderPass(this.scene, this.camera,null,0,0);
	    this.composer = new THREE.EffectComposer(this.renderer, this.composerRT);
		
		this.composer.renderTarget1.format=THREE.RGBAFormat;
	    this.composer.renderTarget2.format=THREE.RGBAFormat;
		
	    this.composer.addPass(renderModel);
	    this.composer.addPass(this.effectBloom);
		//this.composer.addPass(copyPass);
		
		this.rgbShift = new wideload.RGBShift(0.002,-0.002,0.00);
		this.composer.addPass(this.rgbShift);
		this.composer.addPass(copyPass);
		
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
		this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 0, 20 );
	//	this.camera = new THREE.PerspectiveCamera( 155, this.width / this.height, 0.5, 3000000  );
		this.camera.position.z = 10;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.scene.autoUpdate = true;
		this.scene.add(this.camera);
		this.voronoiGen = new wideload.VoronoiGen(this, this.scene);
	}
	
	p.initializeDebugControl = function(){
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
	}
	
	p.mainLoop = function(){
		var time = 0;
		if(this.bgSound != null)
			time = this.bgSound.getPosition();
		
		if(this.stopCamera)
		{
			time = this.previous;
		}
		this.previous = time;
		
		//No updates after time ended.
		if(this.bgSound && time >= this.bgSound.length || time ==0) 
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
		this.bar = Math.floor( timeo * 1/60 * 1/60 *BEATS_PER_MINUTE * 1/BEATS_PER_BAR);
		
		var totalBeats = BEATS_PER_MINUTE * timeo;
		var bar = Math.floor( totalBeats/BEATS_PER_BAR);
		var beat = Math.floor( totalBeats % BEATS_PER_BAR);
		var tick = Math.floor((totalBeats-Math.floor(totalBeats))* TICKS_PER_BEAT);
		
		var timesig = new wideload.TimeSig(bar, beat, tick);
		
		for (var i = 0; i < this.configuration.parts.length; i++) {
			var partC = this.configuration.parts[i];
		    var part = this.parts[partC.part];
			var partial = 0;
			if(timesig.isInside(partC.begin, partC.end))
			{
				 partial = (timems - partC.begin.toMilliseconds())/(partC.end.toMilliseconds() - partC.begin.toMilliseconds());
				part.update(time, partial, timesig );
			}
		}
		this.voronoiGen.update(time, partial, timesig);
		var planes = this.voronoiGen.sites;
		for(var i = 0; i < this.configuration.rendering.length; i++)
		{
			var conf = this.configuration.rendering[i];
			
			if(timesig.isInside(conf.begin, conf.end))
			{
				var to = conf.to;
				if(typeof to == "function")
				{
					to = to(timesig, planes, this.parts[conf.part] );
				}
				this.currentConf = conf;
				for(var j = 0; j < to.length; j++)
				{
					var s = to[j];
					var cell = planes[s.s];
					
					//Make sure not to swap twice to same.
					if( cell.to !== s)
					{
						//Check if current effect should actually change.
						if(cell.begin == null || cell.begin.isSmallerThan(conf.begin))
						{
						//	cell.begin = conf.begin;
							cell.to = s;
							
							//Apply rendertarget to map.
							if(s.rt != null)
							{
								//Multiple rendertargets on part
								cell.plane.material.map = this.parts[conf.part].renderTargets[s.rt];
							}
							else
							{
								//Single rendertarget
								cell.plane.material.map = this.parts[conf.part].renderTarget;
							}
							
							//Force the material to update
							cell.plane.material.needsUpdate = true;
							
							//Set the uv-mapping
					//		console.log("Set uv map");
							wideload.UVMapper.setUvMap(s.uv, cell.plane);
							
							//Tinting
							if(s.tint != null)
								cell.plane.material.color.setHex(s.tint);
							else
								cell.plane.material.color.setHex(0xFFFFFF);
						}
					}
					
					//Handle outro / intro.
					if(conf.outro != null && timesig.isInside(conf.outro.begin,conf.outro.end))
					{
						conf.outro(timems, cell.plane);
					}
					if(conf.intro != null && timesig.isInside(conf.intro.begin,conf.intro.end))
					{
						conf.intro(timems, cell.plane);
					}
					else if(conf.intro != null && timesig.isLargerThan(conf.intro.end) && (conf.outro == null || timesig.isSmallerThan(conf.outro.begin)))
					{
						if(s.tint != null){
							cell.plane.material.color.setHex(s.tint);		
						}
						else
							cell.plane.material.color.setHex(0xffffff);
					}
					
					/*
					TODO - rewrite with voronoiGen planes*/
					
				}
				
				if(conf.override)
					break;
			}
			/*else if(timesig.isLargerThan( conf.end) && !conf.ended) //Remove old effects. These should be replaced immediatly so this is not an issue
			{
				conf.ended = true;
				for(var j = 0; j < to.length; j++)
				{
					var s = to[j];
					var cell = planes[s.s];
					if(s.begin == conf.begin)
					{
						cell.plane.material.map =null;
						cell.plane.material.color.setHex(0x000000);		
						cell.plane.material.needsUpdate = true;
					}
					
					//Outro - intro
					if(conf.outro != null )
					{
						//console.log("last outro");
						conf.outro(conf.outro.end.toMilliseconds(), cell.plane);
					}
				}
			}*/
		}
		
		/**
		 Post processing effects below
		*/
		for(var i = 0; i < this.configuration.rgbShifts.length; i++)
		{
			var end = this.configuration.rgbShifts[i].clone();
			end.beat +=1;
			if(timesig.isInside(this.configuration.rgbShifts[i], end))
			{
				this.rgbShift.uniforms.rshift.value = 0.0002+Math.random()*0.001;
				this.rgbShift.uniforms.bshift.value = -0.0002+Math.random()*0.001;
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
		if(timesig.bar > 36)
		{
			var e = new wideload.TimeSig(40,0,0).toMilliseconds();
			var b = new wideload.TimeSig(36,0,0).toMilliseconds();
			var d = (e-b);
			var c = timesig.toMilliseconds()-b;
			
			//this.rgbShift.uniforms.pixelate.value = new THREE.Vector2(Math.max(1280/20,1280-1200*c/d),Math.max(720/20,720-640*c/d));
		}
		/**
		Rendering
		*/
		this.renderer.autoClear =false;
		this.renderer.setClearColor(0x0,1.0);
		//this.renderer.autoClear = false;
		//this.renderer.shadowMapEnabled = false;
		this.composer.render();	 // Composer finally adds postprocessing effects and renders the final image to screen.
		
		if(timesig.bar > 56)
		{
			var b = new wideload.TimeSig(56,0,0).toMilliseconds();
			var e = new wideload.TimeSig(60,0,0).toMilliseconds();
			var d = e-b;
			var o = timesig.toMilliseconds() - b;

			this.bloomEffect.strength = (1-o/d)*0.85+1;

		}
		
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
/**
 * ...
 * @author Petri Sarasvirta
 */

(function() {
	var Coins = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
		this.coins = [];
		this.coinNames = [
			"pyrotech",
			"mattcurrent",
			"alumni",
			"_soleil_",
			"api",
			"asd",
			"ananasmurska",
			"bombsquad",
			"byterapers",
			"damones",
			"dekadence",
			"doo",
			"elventhor",
			"evoflash",
			"fairlight",
			"fgj",
			"hbc",
			"hedelmae",
			"jumalauta",
			"kakut",
			"kewlers",
			"mercury",
			"konvergence",
			"npli",
			"paraguay",
			"supadupa",
			"traction",
		];

	}
	var p = Coins.prototype = new wideload.BasePart();
	wideload.Coins = Coins;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		/*
		var tubemat = new THREE.ShaderMaterial( {
			fragmentShader: wideload.TubeTextureShader.fragment,
			vertexShader: wideload.TubeTextureShader.vertex,
			attributes: wideload.TubeTextureShader.attributes,
			uniforms: wideload.TubeTextureShader.uniforms,
			depthWrite: false,
			side: THREE.DoubleSide 
		});
		this.tubemat = tubemat;
		*/
/*
		var grassMaterial = new THREE.MeshBasicMaterial({
			color: "black",
			side: THREE.DoubleSide 
		});		
		**/
			this.groundMaterial = new THREE.ShaderMaterial({
			fragmentShader: wideload.CaveGroundShader.fragment,
			vertexShader: wideload.CaveGroundShader.vertex,
			uniforms: wideload.CaveGroundShader.uniforms
		});
		
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
		
		
		this.scene.fog = new THREE.Fog( 0xefd1b5, 30,340 );

//		this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 1000 );
		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000  );
		//this.ovCamera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 50  );

		wideload.ManualControl.attachCamera(this.camera);
		
		this.camera.position.z = 0;
		this.camera.position.x = -120;
		this.camera.lookAt(new THREE.Vector3(100,0,0));
//		this.ovCamera.lookAt(new THREE.Vector3(100,0,0));
		this.overlay = new THREE.WebGLRenderTarget(1280, 720, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });
		this.ovCamera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5,25  );
		this.isActive = true;
		this.ovCamera.position.z = 0;
		this.ovCamera.position.x = -120;
		this.ovCamera.lookAt(new THREE.Vector3(100,0,0));
		var ambi = new THREE.AmbientLight(0xababab);
		this.scene.add(ambi);

		this.loadCoins();
		
		this.extraCoins = [];
		
		for(var i = 0; i < 80;++i){
			var coin = new THREE.Mesh(this.basicCoin.geometry, this.basicCoin.material);
			coin.position.x = Math.random()*200-90;
			coin.position.y = Math.random()*150-75;
			coin.position.z = Math.random()*100-50;
			if(coin.position.z > -6 && coin.position.z < 6 && coin.position.y > -8 && coin.position.y < 8)
			{
				coin.position.z = -10;
				coin.position.y = -10;
			}
			coin.position.oy = coin.position.y;
			coin.position.oz = coin.position.z;
			coin.position.ox = coin.position.x;
			coin.rotation.y = Math.random()*Math.PI;
			coin.rotation.z = Math.random()*Math.PI;
			coin.rotation.x = Math.random()*Math.PI;
			var rnd = Math.random()*7+4;
			coin.speed = Math.random()*2+1;
			coin.scale.set(rnd,rnd,rnd);
			this.scene.add(coin);
			this.extraCoins.push(coin);
		}
	}

	p.loadCoins = function(){
		loader = new THREE.OfflineJSONLoader();
		
		/*
		var outermaterial = new THREE.ShaderMaterial( {
			fragmentShader: wideload.OuterCoinShader.fragment,
			vertexShader: wideload.OuterCoinShader.vertex,
			attributes: wideload.OuterCoinShader.attributes,
			uniforms: wideload.OuterCoinShader.uniforms,
			//depthWrite: false,
			side: THREE.DoubleSide 
		});
*/
	/*	var innermaterial = new THREE.ShaderMaterial( {
			fragmentShader: wideload.InnerCoinShader.fragment,
			vertexShader: wideload.InnerCoinShader.vertex,
			attributes: wideload.InnerCoinShader.attributes,
			uniforms: wideload.InnerCoinShader.uniforms,
			//depthWrite: false,
			side: THREE.DoubleSide 
		});
		innermaterial = this.groundMaterial;
*/
		var innermaterial = new THREE.MeshBasicMaterial({color:"white", transparent:true, opacity:0.4});
		var outermaterial = new THREE.MeshBasicMaterial({color:"red"});
		

		this.basicCoin = this.loadCoin(loader, "basicCoin", outermaterial, innermaterial);

		for(var i = 0; i < this.coinNames.length;++i){
			var c = this.loadCoin(loader, this.coinNames[i], outermaterial, innermaterial);
			this.coins.push(c);
		}
	}

	p.loadCoin = function(loader,asset, outermaterial, innermaterial){
		var coin;
		loader.load(Asset.getAsset(asset), function(geo, materials){
			
			//this.meshMat = new THREE.MeshFaceMaterial(materials);
			materials[0] = outermaterial;
			materials[1] = innermaterial;
			materials[2] = outermaterial;
			

			materials[0].needsUpdate = true;
			materials[1].needsUpdate = true;
			materials[2].needsUpdate = true;

			coin = new THREE.Mesh(geo, new THREE.MeshFaceMaterial(materials));//new THREE.MeshBasicMaterial({color:"white"}))// this.groundMaterial);//new THREE.MeshFaceMaterial(materials));
			coin.scale.set(4,4,4);
			coin.position.x = 3;// Math.random()*1000;
			coin.position.z = 0;//Math.random()*1000;
			coin.position.y = 0;//Math.random()*1000;
			
		})
		return coin;
	}

	p.foo = function(c,s)
	{
		return function(){s.scene.add(c);};
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, bar,beat,tick){
		
		if(!this.first)
		{
			for(var i = 0; i < this.coins.length; i++)
			{
				var c = this.coins[i];
				var s = this;
				var left= i%2==0;
				var tx = c.rotation.x = Math.PI/2 +(left?0:Math.PI)+Math.random()*0.1;
				var ty = c.rotation.y = (left ? 0 :Math.PI)+Math.random()*0.2;
				var tz = c.rotation.z =(left ? 0.5 : -0.5)+Math.random()*0.2-0.1;;// Math.random()*0.4;// + (left? Math.PI:0);
				c.rotation.x +=Math.random()-0.5;
				c.rotation.y +=Math.random()-0.5;
				c.rotation.z += Math.random()-0.5;
			//	console.log("move coin");
	//			s.scene.add(c);
				var ytar = Math.random()*10-4;
				var ztar = (left?-6:6) + Math.random()*4-2;
				
				var target = new wideload.TimeSig(1+Math.floor(i/2),left?1:3,0);
				var tmt = new wideload.TimeSig(0,3,0);
				var tms = tmt.toMilliseconds()/1000;
				var begin = target.clone();
				begin.beat -=3;
				var mse = target.toMilliseconds()/1000;
				var msb = begin.toMilliseconds()/1000;
				setTimeout( this.foo(c,this), msb*1000);
				
				
				
				createjs.Tween.get(c.position).wait(msb).to({ x:-100, y:ytar*100/135, z:ztar*100/135 },tms, createjs.Ease.linearOut)
									.to({ x:-135, y:ytar, z:ztar },tms*3, createjs.Ease.linearOut);
				createjs.Tween.get(c.rotation).wait(msb).to({ x:tx, y:ty, z:tz },tms*4, createjs.Ease.linearOut);
			}
			this.first = true;
		}
		
		var preClearSetting = this.renderer.autoclear;
	

		this.renderer.autoClear =true;
		this.renderer.setClearColor(0xaeaeae,0);

		this.renderer.render(this.scene, this.camera, this.renderTarget);
		this.renderer.autoClear =true;
		this.renderer.setClearColor(0x0,0);
		this.renderer.render(this.scene, this.ovCamera, this.overlay);

		for(var i = 0; i < this.extraCoins.length; i++)
		{
			this.extraCoins[i].rotation.y = Math.abs(this.extraCoins[i].position.oy -this.extraCoins[i].speed*partial*500)%200*0.015;
			this.extraCoins[i].position.x = 200-(Math.abs(this.extraCoins[i].position.ox +this.extraCoins[i].speed*partial*500))%200-80;
			this.extraCoins[i].rotation.z = Math.abs(this.extraCoins[i].position.oz -this.extraCoins[i].speed*partial*500)%200*0.02;
			this.extraCoins[i].rotation.x = Math.abs(this.extraCoins[i].position.oz -this.extraCoins[i].speed*partial*500)%200*0.01;
		}
		
		this.renderer.setClearColor(0xFFFFFF,0.0);
//		this.renderer.render(this.scene,this.ovCamera,this.overlay);

		this.renderer.autoClear = true;

	}
	
	
})();


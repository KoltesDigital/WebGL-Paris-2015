/**
 * ...
 * @author Petri Sarasvirta
 */

(function() {
	var Gears = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
		this.visibleTicker = 1;
		this.meshes = [];
		this.binormal = new THREE.Vector3();
		this.normal = new THREE.Vector3();
	}
	var p = Gears.prototype = new wideload.BasePart();
	wideload.Gears = Gears;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		

		

	//	this.tubemat = material;
		this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );

		wideload.ManualControl.attachCamera(this.camera);
		
		this.camera.position.z = 10;
		this.camera.position.x = 10;
		this.camera.position.y = 10;
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		this.isActive = true;

		this.beatAdd = 0;
		this.loadGear();
	}

	p.createGeometry = function(){
		var curve = new THREE.Curves.DecoratedTorusKnot4b();
		// curve, extrusion segments, radius , radius segments, closed
		var tube = new THREE.TubeGeometry(curve, 300, 3, 3, true);
		return tube;
	}

	p.loadGear = function(){
		loader = new THREE.OfflineJSONLoader();
		
		var geo = this.createGeometry();
		//geo = new THREE.TorusKnotGeometry( 10, 3, 200, 50, 1, 3 );
		
		var tex = new THREE.Texture(Asset.getAsset("matblack"));
		tex.needsUpdate = true;
 		
 		var material = new THREE.ShaderMaterial( {
		    vertexShader: wideload.GearsTextureShader.vertex,
		    fragmentShader: wideload.GearsTextureShader.fragment,
		    shading: THREE.SmoothShading,
			uniforms: { 
    			tMatCap: { 
        			type: 't',
        			value: tex
        		},
        	},
    	} );

 		material.uniforms.tMatCap.value.wrapS = material.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;

		var mesh =new THREE.Mesh(geo,material); 
		this.scene.add(mesh);
		this.meshes.push(mesh);
		this.tube = geo;
		this.tubeMesh = mesh;

		mesh =new THREE.Mesh(geo,material); 
		mesh.scale.set(2,2,2);
		mesh.rotation.z = 90;
		mesh.rotation.y = 90;
		mesh.position.set(5,5,5);
		this.scene.add(mesh);
		this.meshes.push(mesh);

		mesh =new THREE.Mesh(geo,material); 
		mesh.scale.set(2,2,2);
		mesh.rotation.z = -45;
		mesh.rotation.y = 45;
		mesh.position.set(-5,-5,-5);
		this.scene.add(mesh);
		this.meshes.push(mesh);
		
	}

	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, bar,beat,tick){
		var preClearSetting = this.renderer.autoclear;
for(var i = 1; i < this.meshes.length; ++i){
			this.meshes[i].rotation.z = elapsedtime/4000;
		}

		//this.renderer.autoClear = preClearSetting;
	//	

// Try Animate Camera Along Spline
			
			var looptime = 80 * 1000;
			var t = ( elapsedtime % looptime ) / looptime;

			var pos = this.tube.parameters.path.getPointAt( t );

			// interpolation
			var segments = this.tube.tangents.length;
			var pickt = t * segments;
			var pick = Math.floor( pickt );
			var pickNext = ( pick + 1 ) % segments;

			this.binormal.subVectors( this.tube.binormals[ pickNext ], this.tube.binormals[ pick ] );
			this.binormal.multiplyScalar( pickt - pick ).add( this.tube.binormals[ pick ] );


			var dir = this.tube.parameters.path.getTangentAt( t );

			var offset = 15;

			this.normal.copy( this.binormal ).cross( dir );

			// We move on a offset on its binormal
			pos.add( this.normal.clone().multiplyScalar( offset ) );

			this.camera.position.copy( pos );
			//cameraEye.position.copy( pos );


			// Camera Orientation 1 - default look at
			// splineCamera.lookAt( lookAt );

			// Using arclength for stablization in look ahead.
			var lookAt = this.tube.parameters.path.getPointAt( ( t + 30 / this.tube.parameters.path.getLength() ) % 1 );

			// Camera Orientation 2 - up orientation via normal
			this.camera.matrix.lookAt(this.camera.position, lookAt, this.normal);
			this.camera.rotation.setFromRotationMatrix( this.camera.matrix, this.camera.rotation.order );




		this.renderer.autoClear =true;

		this.renderer.setClearColor(0xffffff,0.0);
		this.renderer.render(this.scene, this.camera, this.renderTarget);

		
//		this.renderer.render(this.scene,this.ovCamera,this.overlay);

		this.renderer.autoClear = preClearSetting;

	}
	
	
})();


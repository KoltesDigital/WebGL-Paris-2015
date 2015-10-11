/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var WMirror = function(main, id){
		this.Id = id;
		this.main = main;
	}
	var p = WMirror.prototype = new wideload.BasePart();
	wideload.WMirror = WMirror;
	
	p.superInitialize = p.initialize;

	p.initialize = function(scene,container, geom){
		this.superInitialize(scene,container);
		
		
		this.container.position.x = 0;
		this.container.position.y = 0;
		this.container.position.z = 0;
		
		
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

				directionalLight = new THREE.DirectionalLight( 0xffff55, 1 );
				directionalLight.position.set( - 1, 0.4, - 1 );
				scene.add( directionalLight );
				waterNormals = new THREE.Texture(Asset.getAsset("waterNormals"));// new THREE.ImageUtils.loadTexture( 'assets/waternormals.jpg' );
				waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
				waterNormals.needsUpdate = true;
				this.water = new THREE.WMirror( this.main.renderer, this.main.camera, scene, {
					textureWidth: 512, 
					textureHeight: 512,
					waterNormals: waterNormals,
					alpha: 	0.2,
					sunDirection: directionalLight.position.normalize(),
					sunColor: 0xffffff,
					waterColor: 0x001e0f,
					distortionScale: 10.0,
				} );
				if(!geom)
					geom = new THREE.PlaneGeometry( this.parameters.width*500 , this.parameters.height*500 , 50, 50 );
				mirrorMesh = new THREE.Mesh(
					geom,//new THREE.PlaneGeometry( this.parameters.width*500 , this.parameters.height*500 , 50, 50 ), 
					this.water.material
				);
				this.material = this.water.material;
				
				mirrorMesh.add( this.water );
				mirrorMesh.rotation.x = - Math.PI * 0.5;
				this.container.add( mirrorMesh );
				
	}
	
	p.internalUpdate = function(elapsedtime,renderTarget){
		//THREE.AnimationHandler.update( elapsedtime );
		var delta = this.main.clock.getDelta();
    	var theta = this.main.clock.getElapsedTime();
		//this.animation.update(delta);
		this.water.material.uniforms.time.value += 1.0 / 1000.0;
		this.water.render();
		//this.main.renderer.render( this.main.scene, this.main.camera );
		THREE.AnimationHandler.update( delta );
	}
	
	
	
})();

/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var TestPart = function(main, renderCacheAmount, partId){
		this.partId = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = TestPart.prototype = new wideload.BasePart();
	wideload.TestPart = TestPart;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);

				this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				this.camera.position.z = 400;


				var geometry = new THREE.BoxGeometry( 200, 200, 200 );


				var material = new THREE.MeshBasicMaterial( { color:'red',wireframe:true } );

				this.mesh = new THREE.Mesh( geometry, material );
				this.scene.add( this.mesh );
		this.isActive = true;
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalRender = function(elapsedtime,renderTarget){
		
		this.renderer.render(this.scene, this.camera, this.renderTarget);
	}
	
	
})();


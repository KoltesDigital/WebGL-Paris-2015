/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var Butterflies = function(main, id){
		this.Id = id;
		this.main = main;
	}
	var p = Butterflies.prototype = new wideload.BasePart();
	wideload.Butterflies = Butterflies;
	
	p.superInitialize = p.initialize;

	p.initialize = function(scene,container){
		this.superInitialize(scene,container);
		this.container = container;
		var tex = new THREE.Texture(Asset.getAsset("butterfly"))
		tex.needsUpdate = true;
		var bLeft = new THREE.MeshBasicMaterial({
			map: tex,
			transparent: true,
			side: THREE.DoubleSide ,
			depthWrite: false,
			depthTest: true 
		});
		bLeft.fog = false;
	//	this.container.position.x = 100;
		this.bfs = [];
		for(var i = 0; i < 5; i++)
		{
			var bf = new wideload.Butterfly();
			bf.init(bLeft);
			bf.object.position.z = 0;
			bf.object.position.x = 0;
			bf.object.position.y = 00;
			var size = 0.01*(wideload.Random.nextFloat()+0.2)
			bf.object.scale.set(size, size, size);
			this.container.add(bf.object);
			this.bfs.push(bf);
		}
	}
	
	p.internalUpdate = function(elapsedtime,renderTarget){
		//THREE.AnimationHandler.update( elapsedtime );
		//var delta = this.main.clock.getDelta();
    	//var theta = this.main.clock.getElapsedTime();
		//this.animation.update(delta);
		for(var i = 0; i < this.bfs.length; i++)
		{
			this.bfs[i].update(elapsedtime);
		}
		//THREE.AnimationHandler.update( delta );
	}

	
	
})();
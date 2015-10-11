//Namespace
this.wideload = this.wideload || {};

/**
* Main class for each part of the demo
*/

(function(){
	
	
	/**
	* Constructor
	* @param main Reference to main class
	*/
	var BasePart = function(main, partId){
		this.partId = partId;
		this.main = main;
		this.elapsedtime = 0;
		this.lastUpdate = 0;
	}
	//Expose the class.
	wideload.BasePart = BasePart;
	
	var p = BasePart.prototype;
	
	/**
	* Called when config is setup. Before initialize
	*/
	p.initConfig = function(){
		
	}
	
	/**
	* Initialize the part. This is called during page load.
	*/
	p.initialize = function(renderer){
		this.renderer = renderer;
		this.renderCacheAmount = 20;
	//	this.cache = new wideload.RenderBuffer(this.renderCacheAmount);
		this.scene = new THREE.Scene();
		this.scene.autoUpdate=true;
		this.renderTarget = new THREE.WebGLRenderTarget(1280, 720, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
//		this.renderTarget = new THREE.WebGLRenderTarget(this.main.screenResolution.width, this.main.screenResolution.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
		this.renderer = renderer;
		
		//TODO - build own scene & camera
//		this.scene = new THREE.scene;
		//if(container != undefined){
		//	this.container = container;	
		//}
		
	}
	
	p.start = function(elapsedTime){
		this.isActive = true;
	//	this.container.visible=true;
		this.startTime = elapsedTime;
	}
	
	p.stop = function () {
		this.isActive = false;
		this.container.visible = false;
	}
	
	/**
	* Main controller calls render function
	* @param elapsedtime The elapsed song time.
	* @param partial [0,1] value
	* @param beat
	* @param tick
	*/
	p.update = function(elapsedtime, partial, bar,beat, tick){
		if(this.isActive){
			this.elapsedtime = elapsedtime-this.lastUpdate;	
			this.internalUpdate(elapsedtime, partial, bar,beat,tick);
		}
	}
	
	
}())
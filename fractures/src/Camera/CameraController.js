/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var CameraController = function(){
		this.modes = [CameraController.STATIC,CameraController.LINEAR, CameraController.BEZIER, CameraController.FOLLOW];
	}
	
	
	CameraController.STATIC = "static";
	CameraController.LINEAR = "linear";
	CameraController.BEZIER = "bezier";
	CameraController.FOLLOW = "follow";
	
	var p = CameraController.prototype;
	wideload.CameraController = CameraController;
	
	wideload.CameraController.stopAllControl = function()
	{
		wideload.CameraController.HALT = true;
	}
	
	p.attachCamera = function(camera) 
	{
		this.camera = camera;
	}
	
	p.setMode = function(mode)
	{
		if(this.modes.indexOf(mode) == -1)
			mode = CameraController.STATIC;
		this.mode = mode;	
	}
	
	p.initialize = function(points, looks, mode)
	{
		this.setMode(mode);
		this.points = points;
		this.looks = looks;
		if(this.mode == CameraController.STATIC)
			this.initStatic();
		else if(this.mode == CameraController.LINEAR)
			this.initLinear();
		else if(this.mode == CameraController.FOLLOW)
			this.initFollow();
		else
			this.initBezier();
	}

	p.initStatic = function()
	{
		//nothing to do in static
	}
	
	p.initFollow = function()
	{
		//Swap to static if no follow target is given
		if(!this.follow)
			this.mode = STATIC;
		//Create default offsets
		if(!this.followOffset)
			this.followOffset = new THREE.Vector3(0,0,0);
		if(!this.followLookOffset)
			this.followLookOffset = new THREE.Vector3(0,0,0);
	}
	
	p.initLinear = function()
	{
		
	}
	
	p.initBezier = function()
	{
	//	console.log("BEZIER")
		this.path = new THREE.SplineCurve3(this.points);
		this.lookPath = new THREE.SplineCurve3(this.looks);
	}

	p.update = function(phase)
	{
		if(wideload.CameraController.HALT)
			return;
		if(this.mode == CameraController.STATIC)
		{
			this.camera.position.x = this.points[phase].x;
			this.camera.position.y = this.points[phase].y;
			this.camera.position.z = this.points[phase].z;
			this.camera.lookAt(this.points[phase].look);
		}
		else if(this.mode == CameraController.LINEAR)
		{

		}
		else if(this.mode == CameraController.FOLLOW)
		{
			this.camera.position.x = this.follow.position.x + this.followOffset.x;
			this.camera.position.y = this.follow.position.y + this.followOffset.y;
			this.camera.position.z = this.follow.position.z + this.followOffset.z;
			this.camera.lookAt(this.follow.position + this.followLookOffset);
		}
		else if(this.mode == CameraController.BEZIER)
		{
			if(phase <0)
				phase=0;
			else if(phase>1)
				phase=1;
			var p = this.path.getPoint(phase);
			this.camera.position.x = p.x;
			this.camera.position.y = p.y;
			this.camera.position.z = p.z;

			p = this.lookPath.getPoint(phase);
			this.camera.lookAt(p);
		}
	}

	



	
	
})();


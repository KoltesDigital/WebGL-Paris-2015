/**
 * ...
 * @author Henri Sarasvirta
 */
 

(function() {
	var BoxHit = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
	}
	var p = BoxHit.prototype = new wideload.BasePart();
	wideload.BoxHit = BoxHit;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		
		this.shaderMaterial = new THREE.ShaderMaterial({
			uniforms: wideload.BoxHitShader.uniforms,
			attributes: wideload.BoxHitShader.attributes,
			vertexShader: wideload.BoxHitShader.vertex,
			fragmentShader: wideload.BoxHitShader.fragment,
			color: "white"
		});
		
		var s = wideload.SunShader.create();
		this.shaderMaterial2 = new THREE.ShaderMaterial({
			uniforms: s.uniforms,
			attributes: s.attributes,
			vertexShader: s.vertex,
			fragmentShader: s.fragment,
			color: "white"
		});
		
		var planeGeom = new THREE.PlaneGeometry(1280, 720);
		var plane = new THREE.Mesh(planeGeom, this.shaderMaterial2);
this.plane = plane;
		
		this.gridsize = 27;
		
		this.isActive = true;
		
		var mat = this.shaderMaterial;// new THREE.MeshLambertMaterial({color:"blue",transparent:false,side:THREE.DoubleSide });
		this.cubes = [];
		this.cubeGrid = [];
		var dist = 5;
		var mid = Math.floor(this.gridsize/2);
		for(var x = 0; x < this.gridsize; x++)
		{
			this.cubeGrid.push([]);
			for(var y = 0; y < this.gridsize; y++)
			{
				this.cubeGrid[x].push([]);
				for(var z = 0; z < this.gridsize; z++)
				{
					var shape = new THREE.BoxGeometry(1,1,1);
					var mesh = new THREE.Mesh(shape,mat);
					mesh.position.x = dist*x-mid*dist;
					mesh.position.y = dist*y-mid*dist;
					mesh.position.z = dist*z-mid*dist;
					this.cubeGrid[x][y][z] = mesh;
					this.cubes.push(mesh);
					this.scene.add(mesh);
					mesh.visible = false;
					mesh.gx = x;
					mesh.gy = y;
					mesh.gz = z;
					mesh.position.tx = mesh.position.x;
					mesh.position.ty = mesh.position.y;
					mesh.position.tz = mesh.position.z;
					mesh.spawned = false;
				}
			}
		}
		
		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );
		this.camera.position.z = 1.5;
		this.camera.position.tz = this.camera.position.z;
		this.camera.position.tx = this.camera.position.x;
		this.camera.position.ty = this.camera.position.y;
		this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.scene.add(plane);
		plane.position.z = -15;
		this.lastBar = 0;
		this.curSpawn = [new THREE.Vector3(mid,mid,mid)];
		this.lastSpawn = [];
		this.cubeGrid[mid][mid][mid].visible = true
		this.cubeGrid[mid][mid][mid].spawned = true;
		this.camera.lookoffx = 0;
	}
		
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, timesig){
		
		
		if(timesig.bar != this.lastBar)
		{
			console.log("Last length " + this.lastSpawn.length);
			this.camera.lookoffx = this.camera.lookoffx > 0 ? 3 : -3;
			for(var i = 0; i < this.lastSpawn.length; i++)
			{
				//if(!this.lastSpawn[i].removed){
				//			this.scene.remove(this.lastSpawn[i]);//.visible = false;
							//this.lastSpawn[i].removed=  true;
							this.lastSpawn[i].visible=  false;
				//}
			}
			this.camera.position.tz +=1.3;
			//this.camera.position.ty +=1;
		//	this.camera.position.tx +=2.4;
//			this.camera.position.z +=1;
			this.camera.lookAt(new THREE.Vector3(0,0,0));	
			var tospawn = [];
			console.log("cur spawn length " + this.curSpawn.length);
			for(var i = 0; i < this.curSpawn.length; i++)
			{
				var spawnTo = this.curSpawn[i];
				var cube = this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z];
				//TODO - easing 
				cube.position.tx =cube.gx-Math.floor(this.gridsize/2);
				cube.position.ty =cube.gy-Math.floor(this.gridsize/2);
				cube.position.tz =cube.gz-Math.floor(this.gridsize/2);
				cube.visible = true;
				if(spawnTo.x > 0 && !this.cubeGrid[spawnTo.x-1][spawnTo.y][spawnTo.z].spawned)
				{
					this.cubeGrid[spawnTo.x-1][spawnTo.y][spawnTo.z].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x-1][spawnTo.y][spawnTo.z]);
				}
				if(spawnTo.x < this.gridsize-1 && !this.cubeGrid[spawnTo.x+1][spawnTo.y][spawnTo.z].spawned)
				{
					this.cubeGrid[spawnTo.x+1][spawnTo.y][spawnTo.z].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x+1][spawnTo.y][spawnTo.z]);
				}
				if(spawnTo.y > 0 && !this.cubeGrid[spawnTo.x][spawnTo.y-1][spawnTo.z].spawned)
				{
					this.cubeGrid[spawnTo.x][spawnTo.y-1][spawnTo.z].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x][spawnTo.y-1][spawnTo.z]);
				}
				if(spawnTo.y < this.gridsize-1 && !this.cubeGrid[spawnTo.x][spawnTo.y+1][spawnTo.z].spawned)
				{
					this.cubeGrid[spawnTo.x][spawnTo.y+1][spawnTo.z].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x][spawnTo.y+1][spawnTo.z]);
				}
				if(spawnTo.z > 0 && !this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z-1].spawned)
				{
					this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z-1].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z-1]);
				}
				if(spawnTo.z < this.gridsize-1 && !this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z+1].spawned)
				{
					this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z+1].spawned = true;
					tospawn.push(this.cubeGrid[spawnTo.x][spawnTo.y][spawnTo.z+1]);
				}
				this.lastSpawn.push(cube);
//				cube.x = spawnTo
			}
			
			this.curSpawn = [];
			for(var j = 0; j < tospawn.length; j++)
			{
					var c = tospawn[j];
					c.spawned = true;
					this.curSpawn.push(new THREE.Vector3(c.gx, c.gy, c.gz));
			}
			this.lastBar = timesig.bar;
			
		}
			this.camera.position.tx = Math.sin(elapsedtime*0.0001+(timesig.beat+1)%2*7.1)*Math.PI - this.camera.lookoffx;
			this.camera.position.ty = Math.sin(elapsedtime*0.0001+(timesig.beat+1)%2*7.1)*Math.PI - this.camera.lookoffx;
		
		for(var i = 0; i < this.cubes.length; i++)
		{
			var c = this.cubes[i];
			c.position.x += (c.position.tx - c.position.x)/1.5;
			c.position.y += (c.position.ty - c.position.y)/1.5;
			c.position.z += (c.position.tz - c.position.z)/1.5;
			
		}
		
		this.camera.position.x += (this.camera.position.tx - this.camera.position.x)/20;
		this.camera.position.y += (this.camera.position.ty - this.camera.position.y)/20;
		this.camera.position.z += (this.camera.position.tz - this.camera.position.z)/20;
		
		this.camera.lookAt(new THREE.Vector3(Math.sin(elapsedtime*0.001)*0.8+this.camera.lookoffx,0.5*+this.camera.lookoffx+ Math.cos(elapsedtime*0.003)*0.3, Math.sin(elapsedtime*0.005)*0.05));
		
	//	this.camera.lookAt(new THREE.Vector3(0,0,0));
		this.shaderMaterial.uniforms.time.value = elapsedtime*0.0002;
		this.shaderMaterial2.uniforms.time.value = elapsedtime*0.00005;
		
		this.plane.rotation.x = this.camera.rotation.x;
		this.plane.rotation.y = this.camera.rotation.y;
		this.plane.rotation.z = this.camera.rotation.z;
		
		var pre = this.renderer.autoClear;
		var bar = timesig.bar;
		this.renderer.setClearColor(0xdddd55,0.0);
		this.renderer.autoClear = true;
		this.renderer.render(this.scene, this.camera, this.renderTarget);
		this.renderer.autoClear = pre;
	}
	
	
})();


/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	
	var Butterfly = function(main, id){
		this.object = new THREE.Object3D()
	}
	var p = Butterfly.prototype;
	
	wideload.Butterfly = Butterfly;
	
	p.init = function(material){
		this.left = new THREE.Mesh(new THREE.PlaneGeometry(108,150), material);
		this.right = new THREE.Mesh(new THREE.PlaneGeometry(108,150), material);
		this.top = new THREE.Mesh(new THREE.PlaneGeometry(34,138), material);
		this.side = new THREE.Mesh(new THREE.PlaneGeometry(12,100), material);
		
		var lefts = [
			new THREE.Vector2( 142 / 256, 1-153 / 256), //Bottom left
			new THREE.Vector2( (142+114)/256, 1-153/256), //Bottom right
			new THREE.Vector2( (142+114) / 256, 1-0 / 256), //Top right
			new THREE.Vector2( 142/256,1- 0/256) //Top left
			
		];
		
		var rights = [
			new THREE.Vector2( 31 / 256, 1-156 / 256), //Bottom left
			new THREE.Vector2( (31+114)/256, 1-156/256), //Bottom right
			new THREE.Vector2( (31+114) / 256, 1-0 / 256), //Top right
			new THREE.Vector2( 31/256,1- 0/256) //Top left
			
		];
		
		var tops = [
			new THREE.Vector2( 0 / 256, 1-115 / 256), //Bottom left
			new THREE.Vector2( (0+30)/256, 1-115/256), //Bottom right
			new THREE.Vector2( (0+30) / 256, 1-0 / 256), //Top right
			new THREE.Vector2( 0/256,1- 0/256) //Top left
			
		];
		
		var sides = [
			new THREE.Vector2( 0 / 256, 1-(122+122) / 256), //Bottom left
			new THREE.Vector2( (0+30)/256, 1-(122+122)/256), //Bottom right
			new THREE.Vector2( (0+30) / 256, 1-122 / 256), //Top right
			new THREE.Vector2( 0/256,1- 122/256) //Top left
			
		];
		
		
		
		this.left.geometry.faceVertexUvs[0][0] = [ 
			lefts[0], lefts[3], lefts[1]
		];
		this.left.geometry.faceVertexUvs[0][1] = [ 
			lefts[3],lefts[2], lefts[1]
		];
		
		this.right.geometry.faceVertexUvs[0][0] = [ 
			rights[0], rights[3], rights[1]
		];
		this.right.geometry.faceVertexUvs[0][1] = [ 
			rights[3],rights[2], rights[1]
		];
		
		this.top.geometry.faceVertexUvs[0][0] = [ 
			tops[0], tops[3], tops[1]
		];
		this.top.geometry.faceVertexUvs[0][1] = [ 
			tops[3],tops[2], tops[1]
		];
		
		this.side.geometry.faceVertexUvs[0][0] = [ 
			sides[0], sides[3], sides[1]
		];
		this.side.geometry.faceVertexUvs[0][1] = [ 
			sides[3],sides[2], sides[1]
		];
		
		this.left.applyMatrix(new THREE.Matrix4().makeTranslation(-108/2, 0, 0));
		this.leftO = new THREE.Object3D();
		this.leftO.add(this.left);
		this.leftO.position.x = 0;
		
		this.right.applyMatrix(new THREE.Matrix4().makeTranslation(108/2, 0, 0));
		this.rightO = new THREE.Object3D();
		this.rightO.add(this.right);
		this.rightO.position.x = 0;
		
		
		this.top.position.x = -4;
		this.side.position.x = 0;
		this.side.position.y = 20;
		this.top.position.z = -0.05;
	//	this.side.position.z = -0.05;
		this.side.rotation.y = Math.PI/2;
		
		this.left.overdraw = true;
		this.right.overdraw = true;
		this.top.overdraw = true;
		this.side.overdraw = true;
		
		this.object.add(this.leftO);
		this.object.add(this.rightO);
		this.object.add(this.top);
		this.object.add(this.side);
		
	//	this.object.rotation.x = 0.1;
	//	this.leftO.rotation.y = 1.2;
	//	this.rightO.rotation.y = -1.2;
		
		this.begin = wideload.Random.next();
	//	this.object.rotation.x = Math.random()*Math.PI*2;
	//	this.object.rotation.y = Math.random()*Math.PI*2;
	//	this.object.rotation.z = Math.random()*Math.PI*2;
		
	}
	
	p.update = function(elapsedtime){
//		this.object.rotation.y += 0.02;
		this.leftO.rotation.y = Math.sin(this.begin+elapsedtime*0.001*3)*Math.PI/4+Math.PI/4-0.3;
		this.rightO.rotation.y = -this.leftO.rotation.y;
		this.object.rotation.z = Math.PI*2-0.1;
		this.object.rotation.y = 0;// Math.PI/2;
		this.object.rotation.x =Math.PI*3/2;
		this.object.position.x = Math.sin(elapsedtime*0.001+this.begin)*1.4;
		this.object.position.y = Math.cos(elapsedtime*0.001+this.begin*3)*1.5;
		this.object.position.z = Math.sin(elapsedtime*2*0.001+this.begin)*1;
		
	}
	
	p.setFlightTarget = function(point)
	{
		this.targetX = point[0];
		this.targetY = point[1];
		this.targetZ = point[2];
		
	}
	
	
})();
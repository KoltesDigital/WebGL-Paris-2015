/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var mc = {};
	wideload.ManualControl = mc;
	
	mc.init = function()
	{
		var scope = this;
		document.addEventListener('keydown',
			wideload.ManualControl.handleKeyDown, false);
		//Inverted ctrl
		mc.ctrlDown = true;
		mc.cameras = [];
		mc.storedPoints = {};
	}
	
	mc.attachCamera = function(camera)
	{
		mc.cameras.push(camera);
	}
	
	mc.handleKeyDown = function(event){
		if(event.keyCode == "17")
		{
			mc.ctrlDown = false;
			document.addEventListener("keyup", function(event){
				if(event.keyCode == "17")
					mc.ctrlDown = true;
			});
		}
		
		for(var i = 0; i < mc.cameras.length; i++)
		{
			var camera = mc.cameras[i];
			if(camera == null)
				continue;
			var camdir = new THREE.Vector3(0,0,-1*(mc.ctrlDown?10:1));
			var left = new THREE.Vector3(-1*(mc.ctrlDown?10:1),0,0);
			var right = new THREE.Vector3(1*(mc.ctrlDown?10:1),0,0);
			var up = new THREE.Vector3(0,1*(mc.ctrlDown?10:1),0);
			var down = new THREE.Vector3(0,-1*(mc.ctrlDown?10:1),0);
			var forward = new THREE.Vector3(0,0,-1*(mc.ctrlDown?10:1));
			var back = new THREE.Vector3(0,0,1*(mc.ctrlDown?10:1));
			
			var rotLeft = new THREE.Vector3(0,0,0.1*(mc.ctrlDown?10:1));
			var rotRight = new THREE.Vector3(0.1*(mc.ctrlDown?10:1),0,0);
			var rotUp = new THREE.Vector3(0,0.1*(mc.ctrlDown?10:1),0);
			var rotDown = new THREE.Vector3(0,-0.1*(mc.ctrlDown?10:1),0);
			camdir.applyQuaternion(camera.quaternion);
			left.applyQuaternion(camera.quaternion);
			right.applyQuaternion(camera.quaternion);
			up.applyQuaternion(camera.quaternion);
			down.applyQuaternion(camera.quaternion);
			forward.applyQuaternion(camera.quaternion);
			back.applyQuaternion(camera.quaternion);
			rotLeft.applyQuaternion(camera.quaternion);
			rotRight.applyQuaternion(camera.quaternion);
			rotUp.applyQuaternion(camera.quaternion);
			rotDown.applyQuaternion(camera.quaternion);
			
			if(event.keyCode == '37'){
				camera.position.add(left);
			}
			if(event.keyCode == '39'){
				camera.position.add(right);
			}
			if(event.keyCode == '38'){
				camera.position.add(up);
			}
			if(event.keyCode == '40'){
				camera.position.add(down);
			}
			if(event.keyCode == '79'){
				camera.position.add(forward);
			}
			if(event.keyCode == '76'){
				camera.position.add(back);
			}
			if(event.keyCode == '65')
			{
				camera.rotateOnAxis(new THREE.Vector3(0,1,0), 0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '68')
			{
				camera.rotateOnAxis(new THREE.Vector3(0,1,0), -0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '87')
			{
				camera.rotateOnAxis(new THREE.Vector3(1,0,0), 0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '83')
			{
				camera.rotateOnAxis(new THREE.Vector3(1,0,0), -0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '81')
			{
				camera.rotateOnAxis(new THREE.Vector3(0,0,1), 0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '69')
			{
				camera.rotateOnAxis(new THREE.Vector3(0,0,1), -0.01*(mc.ctrlDown?10:1));
			}
			if(event.keyCode == '80')
			{
				wideload.CameraController.stopAllControl();
			//	mc.stopCamera = true;
				console.log("--- "+ camera.name + " ---");
				console.log("Pos: x: " + camera.position.x + " y: " + camera.position.y + " z: " + camera.position.z );
				console.log("Dir: " + camdir.x + ", " +camdir.y + ", "+ camdir.z);
				console.log("Look at: ")
				var la = camera.position.clone().add(camdir)
				console.log( la.x + ", " + la.y + ", " +la.z);
				console.log("Camera rotations: x " + camera.rotation.x + " y " + camera.rotation.y + " z " + camera.rotation.z+ " Array ( " + camera.rotation.x + ","+camera.rotation.y+","+camera.rotation.z+ " )");
			}
			if(event.keyCode == '84')
			{
				if(mc.storedPoints[camera.name]== null)
				{
					mc.storedPoints[camera.name] = {pos:[], rot:[], look:[]};
				}
				var la = camera.position.clone().add(camdir)
				mc.storedPoints[camera.name].pos.push("new THREE.Vector3("+camera.position.x+","+camera.position.y+","+camera.position.z+")");
				mc.storedPoints[camera.name].rot.push("new THREE.Vector3("+camera.rotation.x+","+camera.rotation.y+","+camera.rotation.z+")");
				mc.storedPoints[camera.name].look.push("new THREE.Vector3("+la.x+","+la.y+","+la.z+")");
				
			}
			if(event.keyCode == '82')
			{
				for(point in mc.storedPoints)
				{
					console.log("--- " + point + " ---");
					console.log("positions: ");
					console.log(mc.storedPoints[point].pos);
					console.log("look ats: ");
					console.log(mc.storedPoints[point].look);
					console.log("rotations: ");
					console.log(mc.storedPoints[point].rot);
				}
				storedPoints = {};
			}
			
			
		}
	}
	
})();
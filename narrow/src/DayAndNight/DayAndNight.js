/**
 * ...
 * @author rimina
 */

(function() {
	
	var DayAndNight = function(main, id){
		this.Id = id;
		this.main = main;
	}
	var p = DayAndNight.prototype = new wideload.BasePart();
	wideload.DayAndNight = DayAndNight;
  p.superInitialize = p.initialize;
	
	p.initialize = function(scene, container){
  //  this.superInitialize(scene,container);
		
    THREE.ImageUtils.crossOrigin = true;
    var day = new THREE.Texture(Asset.getAsset("testiPaiva"));//  THREE.ImageUtils.loadTexture("assets/testiPaiva.jpg");
    day.needsUpdate = true;
    
    var night = new THREE.Texture(Asset.getAsset("testiYo"));// THREE.ImageUtils.loadTexture("assets/testiYo.jpg");
    night.needsUpdate = true;

    var material = new THREE.ShaderMaterial({uniforms: wideload.DayAndNightShader.uniforms,
      vertexShader: wideload.DayAndNightShader.vertex,
      fragmentShader: wideload.DayAndNightShader.fragment,
      side: THREE.BackSide,
    });
    wideload.DayAndNightShader.uniforms.nightScene.value = night;
    wideload.DayAndNightShader.uniforms.dayScene.value = day;
    wideload.DayAndNightShader.uniforms.lightPosition.value = new THREE.Vector3(0,1,0);
    this.night = false;
    
	this.material = material;
    this.skySphere = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 32), material);
    this.container.add(this.skySphere);
 	}
	
	p.internalUpdate = function(elapsedtime,renderTarget){
		//wideload.DayAndNightShader.uniforms.lightPosition.value = new THREE.Vector3(0,0,700);
    if(elapsedtime > barLength*9912+musicDreamEnd){
		this.skySphere.rotation.y = Math.PI;
      wideload.DayAndNightShader.uniforms.lightPosition.value.y -= 0.01;
      if(wideload.DayAndNightShader.uniforms.lightPosition.value.y <= -1.0){
		  wideload.DayAndNightShader.uniforms.lightPosition.value.y = -1.0
        this.night = true;
      }
    }
    else{
      wideload.DayAndNightShader.uniforms.lightPosition.value.y += 0.001;
      if(wideload.DayAndNightShader.uniforms.lightPosition.value.y >= 1.0){
        this.night = false;
		wideload.DayAndNightShader.uniforms.lightPosition.value.y = 1.0
      }
	  
   }
	}

	
	
})();
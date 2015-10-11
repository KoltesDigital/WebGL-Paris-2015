/**
 * ...
 * @author Petri Sarasvirta
 */

(function() {
	var Tubes = function(main, partId){
		this.Id = partId;
		this.main = main;
		this.renderer = null; //Renderer is given from outside.
		this.renderTarget = null; //Create render target on initialize.
		this.visibleTicker = 1;
		this.lineGroups = [];
	}
	var p = Tubes.prototype = new wideload.BasePart();
	wideload.Tubes = Tubes;
	
	p.superInitialize = p.initialize;
	p.initialize = function(renderer){
		this.superInitialize(renderer);
		

		var tubemat = new THREE.ShaderMaterial( {
			fragmentShader: wideload.TubeTextureShader.fragment,
			vertexShader: wideload.TubeTextureShader.vertex,
			attributes: wideload.TubeTextureShader.attributes,
			uniforms: wideload.TubeTextureShader.uniforms,
			depthWrite: false,
			side: THREE.DoubleSide 
		});
		this.tubemat = tubemat;
/*
		var grassMaterial = new THREE.MeshBasicMaterial({
			color: "black",
			side: THREE.DoubleSide 
		});		
*/
		var radius = 12;
		var step = 0.8;
		var df = Math.random()*1+3;

		for(var i = 0; i < 4; ++i){
			var line1 = this.createLine(12,2.0,df, tubemat);
			var line2 = this.createLine(14.5,1.6,df, tubemat);
			var line3 = this.createLine(10.0,1.2,df, tubemat);
			var line4 = this.createLine(15.5,0.18,df, tubemat);

			line1.position.y = Math.sin(i*Math.PI/2)*20;
			line2.position.y = Math.sin(i*Math.PI/2)*20;
			line3.position.y = Math.sin(i*Math.PI/2)*20;
			line4.position.y = Math.sin(i*Math.PI/2)*20;

			line1.position.z = Math.cos(i*Math.PI/2)*20;
			line2.position.z = Math.cos(i*Math.PI/2)*20;
			line3.position.z = Math.cos(i*Math.PI/2)*20;
			line4.position.z = Math.cos(i*Math.PI/2)*20;

			this.scene.add(line1);
			this.scene.add(line2);
			this.scene.add(line3);
			this.scene.add(line4);
			this.lineGroups[i] = {lines:[]};
			this.lineGroups[i].lines.push(line1);
			this.lineGroups[i].lines.push(line2);
			this.lineGroups[i].lines.push(line3);
			this.lineGroups[i].lines.push(line4);
		}
		
		this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );

//		this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 1000 );
		this.camera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 3000000  );
		//this.ovCamera = new THREE.PerspectiveCamera( 55, this.main.width / this.main.height, 0.5, 50  );

		wideload.ManualControl.attachCamera(this.camera);
		
		this.camera.position.z = 0;
		this.camera.position.x = 0;
		this.camera.lookAt(new THREE.Vector3(100,0,0));
//		this.ovCamera.lookAt(new THREE.Vector3(100,0,0));

		this.isActive = true;

		//this.overlay = new THREE.WebGLRenderTarget(1280, 720, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

/*
		this.lsystem = new LSYSTEM();
		this.lsystem.interpret(5, 20, "FuuFuulFuuFuulFuuFuulF","FlFlFlFlFuFlFlFlFluFlFlFlFlu", 2);

		var geom = new THREE.Geometry();
		geom.dynamic = true;
		var ln = 8
		var df = Math.random()*1+1;

		for(var k = 0; k < this.lsystem.path.length; ++k){

			var from = new THREE.Vector3(this.lsystem.path[k].fromx, this.lsystem.path[k].fromy, this.lsystem.path[k].fromz);
			var to = new THREE.Vector3(this.lsystem.path[k].tox, this.lsystem.path[k].toy, this.lsystem.path[k].toz);

			geom.vertices.push(from);
			geom.vertices.push(new THREE.Vector3(from.x+df, from.y, from.z));

			geom.vertices.push(to);
			geom.vertices.push(new THREE.Vector3(to.x+df, to.y, to.z));

			geom.faces.push(new THREE.Face3(k*4, k*4+2, k*4+1));
			geom.faces.push(new THREE.Face3(k*4+2, k*4+3, k*4+1));
		}

		geom.mergeVertices();
		geom.verticesNeedUpdate = true;
		geom.facesNeedUpdate = true;

    	//Generate random lines
    	var line = new THREE.Mesh(geom, this.material);
    	//var line = this.lsystem.createLine(new THREE.LineBasicMaterial({color:"blue"}));

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
	//	this.scene.add( cube );
    	this.scene.add(line);
		
*/	
		this.beatAdd = 0;
	}

	p.createLine = function(radius,step,df,material){
		var geom = new THREE.Geometry();
		geom.dynamic = true;
		for(var i = 0; i < 3500;++i){
			var from = new THREE.Vector3( i*step,radius*Math.sin(i*step),radius*Math.cos(i*step));
			var to = new THREE.Vector3(i*step+step,radius*Math.sin(i*step+step),radius*Math.cos(i*step+step));
			
			geom.vertices.push(from);
			geom.vertices.push(new THREE.Vector3(from.x+df, from.y, from.z));

			geom.vertices.push(to);
			geom.vertices.push(new THREE.Vector3(to.x+df, to.y, to.z));

			geom.faces.push(new THREE.Face3(i*2, i*2+2, i*2+1));
			geom.faces.push(new THREE.Face3(i*2+2, i*2+3, i*2+1));
		}
		
		geom.mergeVertices();
		geom.verticesNeedUpdate = true;
		geom.facesNeedUpdate = true;
		
		var line = new THREE.Mesh(geom, material);
		return line;
	}
	
	/*
	Overwrite and do render here
	*/
	p.internalUpdate = function(elapsedtime, partial, timesig){
		
		partial*=0.2;
		while(partial > 0.016)
			partial -= 0.016;
		//this.shaderMaterial.uniforms.resolution.value.x = $("#demo canvas").width()/2;
		//this.shaderMaterial.uniforms.resolution.value.y = $("#demo canvas").height()/2;
		//this.shaderMaterial.uniforms.resolution.value.x = 1280;// this.main.resolution.width;// $("#demo canvas").width()/1;
		//this.shaderMaterial.uniforms.resolution.value.y = 720;//this.main.resolution.height;//$("#demo canvas").height()/1;
		var bar = timesig.bar;
		var beat = timesig.beat;
		var tick = timesig.tick;
		
		//this.shaderMaterial.uniforms.time.value = elapsedtime*0.0002;
	//	this.shaderMaterial.color = bar%10==0?"white": "black";
		var preClearSetting = this.renderer.autoclear;
	
		this.renderer.autoClear =true;
		
		var timesig = new wideload.TimeSig(bar,beat,tick);
		for(var i = 0 ; i < this.main.configuration.invert.length; i++)
		{
			var end = this.main.configuration.invert[i].clone();
			end.tick+=32;
			if(timesig.isInside(this.main.configuration.invert[i], end))
			{
				
				this.renderer.setClearColor(0x0000,1);
				this.tubemat.uniforms.color.value = new THREE.Color(0xFFFFFF);
				break;
			}
			else
			{
				this.tubemat.uniforms.color.value = new THREE.Color(0x0);
				this.renderer.setClearColor(0xaeaeae,1);
			}
		}
		
		
		this.visibleTicker += tick;
		
		//this.tubemat.attributes.camerapos.value = this.camera.position.x;

		for(var i = 0; i < this.lineGroups.length;++i){
			for(var j = 0; j < this.lineGroups[i].lines.length;++j){
				this.lineGroups[i].lines[j].visible = false;
				this.lineGroups[i].lines[j].rotation.x += 0.005;
			}
			if(beat%4 == 0){
				this.lineGroups[i].lines[0].visible = true;
			}
			if(beat%4 == 1){
				this.lineGroups[i].lines[1].visible = true;
			}
			if(beat%4 == 2){
				this.lineGroups[i].lines[2].visible = true;
			}
			if(beat%4 == 3){
				this.lineGroups[i].lines[3].visible = true;
			}
		}


//		this.camera.position.z = Math.cos(elapsedtime*0.0005)*6;
		this.camera.position.y = Math.sin(elapsedtime*0.0005)*4;
		if(bar >= 42 ){
			this.camera.lookAt(new THREE.Vector3(-100,0,0));
		}
		if(bar >= 44 ){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar > 47){
			this.camera.lookAt(new THREE.Vector3(800,0,0));
		}
		if(bar >= 50){
			this.camera.lookAt(new THREE.Vector3(800,0,0));
		}
		if(bar >= 52 ){
			this.camera.lookAt(new THREE.Vector3(800,0,0));
		}
		if(bar >= 54 ){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar > 57){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar >= 60){
			this.camera.lookAt(new THREE.Vector3(-100,0,0));
		}
		
		if(bar >= 62 ){
			this.camera.lookAt(new THREE.Vector3(-100,0,0));
		}
		if(bar >= 64 ){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar > 67){
			this.camera.lookAt(new THREE.Vector3(-100,0,0));
		}
		 if(bar >= 68){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		
		if(bar >= 70 ){
			this.camera.lookAt(new THREE.Vector3(-100,0,0));
		}
		if(bar >= 74 ){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar > 77){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		if(bar >= 80){
			this.camera.lookAt(new THREE.Vector3(8000,0,0));
		}
		
		
		
		//this.camera.rotation.x += elapsedtime*0.000005;
		this.camera.position.x = 7000*partial*2;
		//if(partial > 0.5)
		//	this.camera.position.x = 7000*(1-partial)*2;
		if(bar >=68)
			this.camera.position.x /=4;
		
		if(bar > 80)
		{
			
			var temp = new wideload.TimeSig(83,0,0).toMilliseconds();
			var off = (elapsedtime - temp)*0.05;
			if(bar <= 83)
				off=  1;
			this.camera.position.x = 2500+ 3000*partial/off;
		}
		
			this.tubemat.uniforms.time.value = elapsedtime*0.0000002;
		var time = this.tubemat.uniforms.time.value = elapsedtime*0.001;
		this.tubemat.uniforms.camerapos.value = this.camera.position.x;
		this.beatAdd = beat%2 == 0 && tick < 10 ? 50 : Math.max(0,this.beatAdd-1);
		var xo = this.tubemat.uniforms.xo.value = 2;// Math.sin(elapsedtime*0.002)*4+5;
		var yo = this.tubemat.uniforms.yo.value = 2;//Math.sin(elapsedtime*0.001)*4+5;
		var xs = this.tubemat.uniforms.xs.value = 140+this.beatAdd;//Math.sin(elapsedtime*0.003)*150+400;
		var ys = this.tubemat.uniforms.ys.value = 140+this.beatAdd;//Math.sin(elapsedtime*0.003)*150+400;
		var xm = this.tubemat.uniforms.xm.value = 100+this.beatAdd;//Math.sin(elapsedtime*0.003+0.3)*100+200;
		var ym = this.tubemat.uniforms.ym.value = 100+this.beatAdd;//Math.sin(elapsedtime*0.003)*100+200;
		
		//			'p.z = p.z + min(xm, po/xo)* sin(time/100.0+po/xs);',
		//	'p.y = p.y + min(ym, po/yo)*  cos(time/100.0+po/ys);',
		var po = 10;
		var zt = Math.sin(time/100-Math.PI/2);
		var yt = Math.cos(time/100);
		
		if(bar > 67)
		{
		//	this.camera.position.z += tick/64*50;
		}
		
		/*this.camera.lookAt(new THREE.Vector3(this.camera.position.x +1000, 0, 0));//-zt/10, -yt/10);
		this.camera.position.y = Math.sin(elapsedtime*0.002)*10+ Math.cos(elapsedtime*0.001)*10;
		this.camera.position.z = Math.sin(elapsedtime*0.004)*40+ Math.cos(elapsedtime*0.002)*20;
		*/
		
		//this.camera.lookAt(new THREE.Vector3(0,0,0));
/*
		this.ovCamera.position.x = this.camera.position.x;
		this.ovCamera.position.y = this.camera.position.y;
		this.ovCamera.position.z = this.camera.position.z;
		
		this.ovCamera.rotation.x = this.camera.rotation.x;
		this.ovCamera.rotation.y = this.camera.rotation.y;

		this.ovCamera.rotation.z = this.camera.rotation.z;
*/
		this.renderer.setClearColor(0x000000,0.0);
		this.renderer.render(this.scene, this.camera, this.renderTarget);

		
//		this.renderer.render(this.scene,this.ovCamera,this.overlay);

		this.renderer.autoClear = preClearSetting;

	}
	
	
})();


function Particles(){



  var sim = shaders.simulationShaders.particles;

  this.size = 256;


  this.physics = new PhysicsRenderer( this.size , sim , renderer );

  this.physics.setUniform( 'dT' , G_UNIFORMS.dT );
  this.physics.setUniform( 'timer' , G_UNIFORMS.time );

  var geo = this.createGeometry();

  this.uniforms = {

    t_pos:{ type:"t" , value:null },
    t_oPos:{ type:"t" , value:null },
    t_audio:G_UNIFORMS.t_audio,
    t_sprite:{type:"t", value:THREE.ImageUtils.loadTexture('img/flare.png')}


  }
 
  var mat = new THREE.ShaderMaterial({

    uniforms: this.uniforms,
    vertexShader: shaders.vertexShaders.particles,
    fragmentShader: shaders.fragmentShaders.particles,
    transparent: true,
    //blending: THREE.AdditiveBlending,
   // depthWrite: false
  });
 
  this.three = new THREE.PointCloud( geo , mat );
  
  this.physics.addBoundTexture( this.three , 't_pos' , 'output' );
  this.physics.addBoundTexture( this.three , 't_oPos' , 'oOutput' );

  var mesh = new THREE.Mesh( new THREE.CubeGeometry( 3000,.1 , 3000, 100 , 1 , 100) );
  
  mesh.rotation.x = Math.PI / 2;
  var posTexture = ParticleUtils.createPositionsTexture( this.size , mesh );
  this.physics.reset( posTexture );

  var t_start = { type:"t" , value: posTexture };
  this.physics.setUniform( 't_start' , t_start );


}

Particles.prototype.debug = function( reducer ){

  var reducer = reducer || .1;
  this.physics.createDebugScene();

  this.physics.debugScene.scale.multiplyScalar( reducer );
  this.physics.addDebugScene( scene );


}

Particles.prototype.update = function(){

  this.physics.update();

}

Particles.prototype.createGeometry = function(){

  var geo = new THREE.BufferGeometry();
  var positions = new Float32Array( this.size * this.size * 3 );
  var pos = new THREE.BufferAttribute( positions , 3 );


  geo.addAttribute( 'position' , pos );

  var hSize = .5 / this.size;
  for( var i =0; i < this.size; i++ ){
    for( var j = 0; j < this.size; j++ ){

      var index = ((i * this.size ) + j) * 3;

      var x = (i / this.size) + hSize;
      var y = (j / this.size) + hSize;

      positions[ index + 0 ] = x;
      positions[ index + 1 ] = y;
      positions[ index + 2 ] = index / 3;


    }
  }


  return geo;

}


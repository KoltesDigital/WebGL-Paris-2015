function initRepelers(){

    var g = new THREE.IcosahedronGeometry( 4 , 4 );
    var m = new THREE.MeshBasicMaterial( { color: 0xffffff} );

    for( var i =0; i< 64; i++ ){

      var target   = new THREE.Vector3();//toCart( 12 , t , p );
      var velocity = new THREE.Vector3();
      var power    = new THREE.Vector3( 1 , 1 , 1);

      var uniforms = {

        t_audio: G_UNIFORMS.t_audio,
        velocity: { type:"v3", value: velocity },
        target: { type:"v3", value: target },
    t_sem: {type:"t",value:matcap3}
        

      }

      var m = new THREE.ShaderMaterial({
        vertexShader:   shaders.vertexShaders.bees,
        fragmentShader: shaders.fragmentShaders.bees,
        uniforms:       uniforms
      });


      var mesh = new THREE.Mesh( g , m );

      var t = Math.random() * 2 * Math.PI;
      var p = Math.random() * 2 * Math.PI;

      mesh.target   = target; 
      mesh.velocity = velocity;
      mesh.power    = power;



      //mesh.position.copy( mesh.target );
      REPELERS.push( mesh );

      scene.add( mesh );

    }

    Arrangements.randomSphere( 110 );


}

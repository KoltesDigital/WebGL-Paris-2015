function initBackground(){

  /*
   
     
     var g = new THREE.TetrahedronGeometry( 100 , 1 );
      var m = new THREE.ShaderMaterial({

        uniforms:{
          t_audio:G_UNIFORMS.t_audio,
          camPos:{type:"v3" , value:camera.position}
        },
        vertexShader:shaders.vertexShaders.crystal,
        fragmentShader:shaders.fragmentShaders.crystal,

        transparent:true,
        //blending:THREE.AdditiveBlending,
        depthWrite:false,
        shading: THREE.FlatShading
      });


   var geo = new THREE.Geometry();
    for( var i =0; i < 1000; i++ ){

      var me = new THREE.Mesh( g);

      var x = Math.random() < .5 ? 1 : -1;
      var y = Math.random() < .5 ? 1 : -1;
      var z = Math.random() < .5 ? 1 : -1;
      me.position.x = (x + (Math.random() - .5 ))* 1000;
      me.position.y = (y + (Math.random() - .5 ))* 1000;
      me.position.z = (z + (Math.random() - .5 ))* 1000;
      
      me.rotation.x = Math.random();
      me.rotation.y = Math.random();
      me.rotation.z = Math.random();
      me.scale.multiplyScalar( Math.random() *Math.random() * Math.random() * 3. + .5 )


      me.updateMatrix();


      var t = Math.random() * 2 * Math.PI;
      var p = Math.random() * 2 * Math.PI;
      me.position.copy( toCart( 3000 , t , p ) );

      //cubeMapSpheres.push( me );

      me.updateMatrix();

      geo.merge( g , me.matrix );

     // scene.add( me );
    }

    geo.computeFaceNormals();
    geo.computeVertexNormals();
    var mesh = new THREE.Mesh( geo , m );

    scene.add( mesh );


    */


    var path = "img/cubemap/skybox/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    cubeCamera = new THREE.CubeCamera( 10, 10000, 256 ); // parameters: near, far, resolution
    cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter; // mipmap filter
    cubeCamera.position.set( 0, 0, 0 );
    scene.add( cubeCamera );


    var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
    reflectionCube.format = THREE.RGBFormat;

    G_UNIFORMS.t_refl.value = reflectionCube;

    
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ] = G_UNIFORMS.t_refl;//reflectionCube;

    var material = new THREE.ShaderMaterial( {

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide

    } ),

    mesh = new THREE.Mesh( new THREE.BoxGeometry( 5000, 5000, 5000 ), material );
    scene.add( mesh );



}

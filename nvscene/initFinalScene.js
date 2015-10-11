function initFinalScene(){
  
  var fs = {}


//  fs.scene = new THREE.Object3D();




  fs.cloth = new Cloth();
  //fs.cloth.toggle();
 // var g = new THREE.Mesh( new THREE.TorusGeometry( 300 , 60 , 50 , 50 , 2 * Math.PI));

  var s = new Text( 'nv.scene.org' , 2 );

  s.scale.multiplyScalar( 50 );

  s.updateMatrix();
  fs.nvs = new RepelerMesh( 'NVS' , s , REPELERS , {
      
    vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,
    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 2500. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 300. , constraints:[00  , 10000] },
      dampening:     { type:"f" , value: 0.9 , constraints:[00  , 1] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      custom1:{type:"f" , value:.8 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
       t_sem: G_UNIFORMS.matcap     
    }

  });


  /*
   *
   * 
  var waterRender = { type:"f" ,value:0}

  
     
     
  var lT = THREE.ImageUtils.loadTexture;
  var m = THREE.UVMapping;
  var c = function(){ onLoad() };


  var waterNormal = lT( 'img/normals/water.png' , m , c );
  waterNormal.wrapS = THREE.RepeatWrapping; 
  waterNormal.wrapT = THREE.RepeatWrapping;


  
  var w = window.innerWidth ;
  var h = window.innerHeight;
  waterTexture = new THREE.WebGLRenderTarget( 2048 , 2048 );
  
  waterCam = camera.clone(); 
  waterCam.position.copy( camera.position );

  waterCam.position.y *= -1;

  waterCam.scale.y *= -1;
  waterCam.lookAt( new THREE.Vector3() );

  fs.scene.add( waterCam );
  

  w = window.innerWidth ;
  h = window.innerHeight;

  var dpr = devicePixelRatio || 1;
  waterUniforms = {
    t_scene:{ type:"t" , value: waterTexture },
    t_normal:{ type:"t" , value: waterNormal },
    t_audio: G_UNIFORMS.t_audio,
    lightPos:{type:"v3" , value: new THREE.Vector3( 0 , 300 , 0 ) },
    SS:{ type:"v2", value: new THREE.Vector2( w*dpr , h*dpr ) },
    timer:G_UNIFORMS.time,
    normalScale:{type:"f",value:100.}
  }

  var material = new THREE.ShaderMaterial({
    uniforms: waterUniforms,
    vertexShader: shaders.vertexShaders.water,
    fragmentShader: shaders.fragmentShaders.water,
    transparent:true
  });

  var wGeo = new THREE.PlaneGeometry( 30000 , 30000 );
  water = new THREE.Mesh(
    wGeo,
    material 
  );

  water.rotation.x = -Math.PI/2;

  fs.scene.add( water );

  var underWater = new THREE.Mesh( 
    new THREE.PlaneGeometry( 30000 , 30000 ),
    new THREE.MeshBasicMaterial({

      color:0x33aaff,
      opacity:.3,
      transparent:true

    })
  );

  underWater.rotation.x = Math.PI/2;
  fs.scene.add( underWater );


  var treeArray = [];
  var uniforms = {
      t_audio:G_UNIFORMS.t_audio,
      waterRender:waterRender

    }

    var attributes = {
      slice:{type:"f" , value:null}
    }

    var treeMat = new THREE.ShaderMaterial({

      uniforms:uniforms,
      attributes:attributes,
      vertexShader: shaders.vertexShaders.tree,
      fragmentShader: shaders.fragmentShaders.tree,
      transparent: true,
     // blending: THREE.AdditiveBlending,
      //depthWrite: false

    });

    var params = {
      radius:                 40,
      height:                400,
      sides:                    5,
      numOf:                   18, 
      randomness:             50,
      slices:                 200,
      startingChance:          4.,
      chanceReducer:           .9,
      randomnessReducer:       .5,
      sliceReducer:            .7,
      numOfReducer:            .8,
      progressionPower:        1.4,
      lengthReduction:         .5,
      maxIterations:            3,
      material:               treeMat, 
      createTree: function(){
        createTree();
      }
    }


    var trees = new THREE.Object3D();

    for( var i =0; i < 6; i++ ){

      params.randomness = 100 * (Math.random()+.5);
      params.slices = Math.floor(  50 * (Math.random()+.5) );
      var tree = new Tree( params );
      tree.rotation.z = (i / 6 ) * 2 * Math.PI;
      trees.add( tree );

      treeArray.push( tree );

     }

    trees.rotation.x = Math.PI / 2;
    trees.position.y = 00;
    fs.scene.add( trees );


    params.height = 600;
    params.radius = 80;
    params.sides = 8;
    params.randomness = 100;
    params.slices = 100;
    var t = new Tree( params );
    fs.scene.add( t );


    var uniforms = {

      waterRender: waterRender,
      t_audio: G_UNIFORMS.t_audio,

    }

    var mountainMat = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader:shaders.vertexShaders.mountain,
      fragmentShader:shaders.fragmentShaders.mountain,


    });


    var mountains = new Mountains({
     material:mountainMat 
    });
    fs.scene.add( mountains );

    particles = new Particles();
    fs.scene.add( particles.three );



    fs.update = function(){

     
    
      //console.log(waterCam);
      waterCam.position.copy( camera.position );
      waterCam.position.y *= -1;
      waterCam.lookAt( new THREE.Vector3() );

      waterRender.value = 1;
      water.visible = false;
      renderer.render( scene , waterCam  , waterTexture , true);
      particles.update();



    }*/

  return fs;

}

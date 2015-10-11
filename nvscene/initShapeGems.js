function initShapeGems(){

  var sg = {}

  var s = new Text( 'To Be' , 1 );


  var g = new THREE.Mesh( new THREE.IcosahedronGeometry( 100 , 6 ) );

  sg.sphere = new RepelerMesh( 'PShere' , g , REPELERS , {
      
    vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,


    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 500. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 1000. , constraints:[00  , 10000] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      audioDisplacement:{type:"f" , value:0 , constraints:[ 0 , 5 ]},
    t_sem: G_UNIFORMS.matcap, 
      time: G_UNIFORMS.time  
    }

  });
  sg.sphere.movementSpeed = .2;

  console.log( 'MARDSH');
  console.log( loadedMeshes.logo );
  var g = new THREE.Mesh( loadedMeshes.logo.geometry , new THREE.MeshBasicMaterial({color:0x000000}) );
  sg.sphere.body.add( g );

  var g = new THREE.Mesh( loadedMeshes.logo.geometry );
  g.scale.multiplyScalar( 20 );
  g.position.z = 150;
  g.updateMatrix();

  sg.logo = new RepelerMesh( 'Logo' , g , REPELERS , {
      
  //  vs: shaders.vertexShaders.cube,
    vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,



    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value:1500. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 1500. , constraints:[00  , 10000] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      time: G_UNIFORMS.time,    
     t_sem: G_UNIFORMS.matcap   
    }

  });



  var g = new THREE.Mesh( new THREE.CubeGeometry( 200 , 200 , 200 , 80 , 80, 80 ) );
  g.position.z = 100;
  g.rotation.x = Math.PI / 4;
  g.rotation.y = Math.PI / 4;
  g.rotation.z = Math.PI / 4;
  g.updateMatrix();
  sg.cube = new RepelerMesh( 'Plane' , g , REPELERS , {
      
  //  vs: shaders.vertexShaders.cube,
    vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,



    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 1000. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 2000. , constraints:[00  , 10000] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      time: G_UNIFORMS.time, 
    t_sem: G_UNIFORMS.matcap   
    }

  });


  
  //var g = new THREE.Mesh( new THREE.TorusGeometry( 300 , 60 , 50 , 50 , 2 * Math.PI));


  var g = new THREE.Mesh( new THREE.TorusGeometry( 300 , 60 , 50 , 200 , 2 * Math.PI));
  sg.torus1 = new RepelerMesh( 'Torus1' , g , REPELERS , {
      
    vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 10000. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 5000. , constraints:[00  , 10000] },
      dampening:     { type:"f" , value: 0.97 , constraints:[00  , 1] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      time: G_UNIFORMS.time, 
      t_sem: G_UNIFORMS.matcap   
    }

  });

  var g = new THREE.Mesh( new THREE.IcosahedronGeometry( 100 , 5 ) );
  
 // sg.torus1.movementSpeed = .5;


  sg.points1 = new RepelerMesh( 'Background' , g , REPELERS , {
      
   // vs: shaders.vertexShaders.cloud1,
  //  fs: shaders.fragmentShaders.cloud1,
  //
     vs: shaders.vertexShaders.sem,
    fs: shaders.fragmentShaders.sem,
    //type:'points',
    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      dampening:     { type:"f" , value: .98 , constraints:[0  , 1] },
      repulsionPower:     { type:"f" , value: 500. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 10000. , constraints:[00  , 10000] },


    },

    body:{
      t_audio:G_UNIFORMS.t_audio,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      audioDisplacement:{type:"f" , value:0 },
      time: G_UNIFORMS.time, 
      sprite:{ type:"t" , value: THREE.ImageUtils.loadTexture( 'img/flare.png' ) },
       t_sem:G_UNIFORMS.matcap   
    },

    //blending: THREE.AdditiveBlending,
    //transparent: true,
    //depthWrite: false

  });

  sg.points1.body.position.z = 100;





// window.setTimeout(function(){

 // var s = new Text( 'Dotter' , 1 );

 /* tg.dotter  = new RepelerMesh( 'Dotter' , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  });  } , 3000 );


    window.setTimeout(function(){

  var s = new Text( 'Audio' , 1 );

  tg.audio  = new RepelerMesh( 'Audio' , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  }); } , 6000 );



    window.setTimeout(function(){

  var s = new Text( 'Code' , 1 );

  tg.code = new RepelerMesh( 'Code' , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  }); } , 8000 );


    window.setTimeout(function(){


  var s = new Text( 'Cabbibo' , 1 );

  tg.cabbibo = new RepelerMesh( 'Cabbibo' , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  }); } , 10000 );


/*  var s = new Text( 'NVSCENE 2015' , 1 );

  tg.nvscene = new RepelerMesh( 'NVSCENE 2015'  , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  }); 

  var s = new Text( '4K 64K PC' , 1 );

  tg.compos = new RepelerMesh( 'Compos'  , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  });*/

/*

  var s = new Text( '32nd of Octember , 2015' , 3 );

  tg.date = new RepelerMesh( 'Date'  , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{

      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },


    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  }); 
*/

 /* var s = new Text( 'Fame & Fortune' , 1 );

  tg.prizes = new RepelerMesh( 'Prizes'  , s , REPELERS , {
      
    vs: shaders.vertexShaders.cube,
    fs: shaders.fragmentShaders.cube,

    soul:{
      noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
      repulsionPower:     { type:"f" , value: 100. , constraints:[0  , 2000] },
      repulsionRadius:     { type:"f" , value: 500. , constraints:[00  , 10000] },
    },

    body:{
      t_refl:G_UNIFORMS.t_refl,
      custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
      custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
      custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
    }

  });*/


  return sg;


}

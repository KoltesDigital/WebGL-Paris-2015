function initTextGems(){

  var tg = {}

  var s = new Text( 'To Be' , 1 );

  tg.toBe = new RepelerMesh( '#1' , s , REPELERS , {
      
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


  return tg;


}

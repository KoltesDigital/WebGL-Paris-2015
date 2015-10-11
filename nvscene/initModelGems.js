function initModelGems(){

  mg = {}

  mg.hand = new CurlMesh( 'hand1' , loadedMeshes.hand , {
      vs: shaders.vertexShaders.cube,
      fs: shaders.fragmentShaders.cube,
  
      soul:{

        noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
        

      },

      body:{
        t_refl:G_UNIFORMS.t_refl,
        custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
        custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
        custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
      } 
    });
  
  mg.hand.soul.reset( mg.hand.t_og.value );

  mg.hand.toggle();


  mg.orb = new RepelerMesh( 'orb' , loadedMeshes.orb , REPELERS , {
      
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


  mg.orb.toggle();


 mg.skull = new CurlMesh( 'skull' , loadedMeshes.skull , {
      vs: shaders.vertexShaders.cube,
      fs: shaders.fragmentShaders.cube,
  
      soul:{

        noiseSize:{type:"f" , value:.001 , constraints:[ .00001 , .04 ]},
        

      },

      body:{
        t_refl:G_UNIFORMS.t_refl,
        custom1:{type:"f" , value:.9 , constraints:[ .8 , 1 ]},
        custom2:{type:"f" , value:.5 , constraints:[ 0 , 1 ]},
        custom3:{type:"f" , value:3 , constraints:[ 0 , 5 ]},
      } 
    });
  
  mg.skull.soul.reset( mg.skull.t_og.value );

  mg.skull.toggle();
  
    //gem.body.material.blending = THREE.AdditiveBlending;
    //gem.body.material.transparent = true;
    //gem.body.material.depthWrite = false;

    //gem.body.materialNeedsUpdate = true;
    //
    //
  return mg;

}


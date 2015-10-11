function initSnowflakes(){

  var snowflakes = [];
 
  for( var i = 0; i < 1; i++ ){

    var attributes = {
      normal:{type:"v3" , value:null },
      fade: { type:"f" , value:null },
      edge: { type:"f" , value:null },
      id: { type:"f" , value:null }
    }
    var vs = shaders.vertexShaders.snow;
    var fs = shaders.fragmentShaders.snow;

    var uniforms = {

      matcap:G_UNIFORMS.matcap,
      filled:{ type:"f", value: 0 }

    }
    var material = new THREE.ShaderMaterial({

      attributes: attributes,
      uniforms:uniforms,
      vertexShader: vs,
      fragmentShader: fs,
     // side: THREE.DoubleSide,
      transparent: true,
    //  depthWrite: false

    });

    var geometry = new SnowflakeGeometry();
    console.log('asd');
    console.log( geometry );


    var checkLength = function( geo ){

      console.log( geo.attributes.position.array.length )
      if( geo.attributes.position.array.length/3 < 50000 ){

        console.log('WRONG');
          geo = checkLength( new SnowflakeGeometry() );

      }

      return geo;

    }

    geometry = checkLength( geometry );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.filled = uniforms.filled;

    mesh.addToScene = function( length ){

      var l = length || 1;
      scene.add( this );
      tweenValue( this.filled , 'value' , 14 , looper.loopLength * l * 1000);
    
    }

    mesh.removeFromScene = function( length ){

      var l = length || 1;
      scene.add( this );
      tweenValue( this.filled , 'value' , 0 , looper.loopLength * l * 1000 , function(){

        scene.remove( this );
        
      }.bind( this ));
      
    
    }

    snowflakes.push( mesh );

  }

  return snowflakes;

}

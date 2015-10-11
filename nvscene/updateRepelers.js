
var pullTowardsCamera = false;

function updateRepelers(){


    for( var i = 0; i < REPELERS.length; i++ ){



      tv1.set( 0 , 0 , 0 );

      //tv1.add( REPELERS[i].target );

        console.log( );

      tv2.copy( REPELERS[i].target );
     // tv3.copy( camera.position );
    //  tv3.z -= 300;

      tv2.sub( tv3 );
 // console.log( tv2 );

      tv2.normalize();
      tv2.multiplyScalar(  R_VALUES.centerForce );

      //console.log( tv2 );

      tv1.sub( tv2 );

      tv2.copy( R_VALUES.windDirection );
      tv2.multiplyScalar( R_VALUES.windForce );
      tv1.sub( tv2 );

      for ( var j = 0; j < REPELERS.length; j++ ){


        if( i != j ){

          tv2.copy( REPELERS[i].target );
          tv2.sub( REPELERS[j].target );

          var l = tv2.length();
          tv2.normalize();
          tv2.multiplyScalar( ( l - R_VALUES.springLength ) * R_VALUES.springForce );

          tv1.sub( tv2 );
          
        }




      }


      if( R_VALUES.update == true ){

        REPELERS[i].velocity.add( tv1 );

        REPELERS[i].target.add( REPELERS[i].velocity );

        REPELERS[i].velocity.multiplyScalar( R_VALUES.dampening );
      }

      //console.log( REPELERS[i].target );
      tv1.copy( REPELERS[i].target );
      tv1.sub( REPELERS[i].position );

      tv1.multiplyScalar( R_VALUES.targetForce );

      //console.log( tv1.x );
      REPELERS[i].position.add( tv1 );
       
      var ind = i / ( 2 * REPELERS.length); 
      var fI = Math.floor( ind * audioController.analyzer.array.length );
      var p = audioController.analyzer.array[ fI ];

      //console.log( p );
      REPELERS[i].power.x = p / 256;
      
    }





}

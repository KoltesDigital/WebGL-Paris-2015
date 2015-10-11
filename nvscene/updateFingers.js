function updateFingers( frame ){


  

    if( frame.hands[0] ){

      for( var i = 0; i < 25; i++ ){

        var r = REPELERS[i];

        r.power.x = 1;

        var bI =  i % 5 ;                     // Bone index
        var fI = Math.floor( i / 5 );     // finger index

        //console.log( fI , bI );
        //console.log( frame );

        var p = leapToScene( frame , frame.hands[0].fingers[fI].positions[bI] );

        p[0] *= 100;
        p[1] *= 100;
        p[2] *= 100;
        
          tv1.set( p[0] , p[1] , p[2] );


          r.position.copy( camera.position );

          tv1.applyQuaternion( camera.quaternion );

          r.position.add( tv1 );

          tv1.set( 0 , 0, -100 );
          r.position.add( tv1.applyQuaternion( camera.quaternion ));


      }

      if( frame.hands[1] ){

        for( var i = 0; i < 25; i++ ){

          var r = REPELERS[i+25];

           r.power.x = 1;

          var bI =  i % 5 ;                     // Bone index
          var fI = Math.floor( i / 5 );     // finger index

          //console.log( fI , bI );
          //console.log( frame );

          var p = leapToScene( frame , frame.hands[1].fingers[fI].positions[bI] );


          p[0] *= 100;
          p[1] *= 100;
          p[2] *= 100;

          tv1.set( p[0] , p[1] , p[2] );


          r.position.copy( camera.position );

          tv1.applyQuaternion( camera.quaternion );

          r.position.add( tv1 );

          tv1.set( 0 , 0, 100 );
          r.position.add( tv1.applyQuaternion( camera.quaternion ));

         // r.position.set( p[0] , p[1] , p[2] );


        }



      }else{

      
        for( var i = 0; i < 25; i++ ){

          r = REPELERS[ i + 25 ];
          r.power.x = 0;

        }

      }


      }else{

       for( var i = 0; i < 25; i++ ){

          r = REPELERS[ i ];
          r.power.x = 0;

        }


     /* for( var i = 0; i < REPELERS.length; i++ ){

        var r = REPELERS[i];
        var ogP = ogPositions[i];

        r.position.copy( ogP );


      }*/

    }


}




  function leapToScene( frame , position  ){


   // console.log( position );
    var p = frame.interactionBox.normalizePoint( position );

    p[0] -= .5;
    p[1] -= .5;
    p[2] -= .5;

    return p;

  }



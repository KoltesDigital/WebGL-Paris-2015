// 5
// 7
// 9
// 11 --> 13
// 13 --> 15
// 7 & 9 , pull in in seperate modles
function initChoreography(){

    looper.addHit( function(){ disturbRepelers( 100 )} );

    looper.addHit( function(){
      Arrangements.plane( 100 , 'z' , 0 );
      R_VALUES.update = !R_VALUES.update;
      if( t1 === false ){
        R_VALUES.targetForce = .1;
        t1 = !t1;
      }else{
        R_VALUES.targetForce = .01;
        t1 = !t1;
      }

    } , {
      measureFrequency: 4,
      measureOffset:0,
      percents:[ .4 , .8],
      duration:[ 0 , 13 ]
      //measureOffset: 1
    });

    looper.addHit( function(){
      Arrangements.circle( 100 , 'z' , 0 );
      R_VALUES.update = !R_VALUES.update;
      if( t1 === false ){
        R_VALUES.targetForce = .1;
        t1 = !t1;
      }else{
        R_VALUES.targetForce = .01;
        t1 = !t1;
      }

    } , {
      measureFrequency: 1,
      measureOffset:0,
      percents:[ .1 , .3],
      duration:[ 20 , 23 ]
      //measureOffset: 1
    });

    looper.onLoop( 0 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0,
        y: 0,
        z: -900.57315433686765
      }, looper.loopLength* 1000 );

      ShapeGems.sphere.toggle();
      ShapeGems.sphere.body.position.z = -500;

      
      tweenPosition(ShapeGems.sphere.body.position, {

        x: 0,
        y: 0,
        z: 500 

      }, looper.loopLength * 10000);


      ShapeGems.torus1.toggle();
     // ShapeGems.torus1.body.position.z = -500;


    });
    looper.onLoop( 1 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0,
        y: 0,
        z: -150.57315433686765
      }, looper.loopLength* 1000 );

      R_VALUES.centerForce = 1.
      R_VALUES.windForce = -.5

 

      //Shad
    });
    looper.onLoop( 2 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: -681.9967079052677,
        y: 46.99165457145572,
        z: -150.57315433686765
      }, looper.loopLength* 1000 );


    });


    looper.onLoop( 3 , function(){

      ShapeGems.points1.toggle();

      SH1 = ShapeGems.points1.body.clone();
      scene.add( SH1 );
      SH1.scale.multiplyScalar( 30 );
      ShapeGems.points1.body.visible = false;
  
      ShapeGems.points1.scaledBody = SH1;
       
          /* ShapeGems.points1.scaledBody.position.x = 100;
      ShapeGems.points1.scaledBody.position.y = 100;
      ShapeGems.points1.scaledBody.position.z = 100;*/

      R_VALUES.centerForce = 3.
      R_VALUES.windForce = -2

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: -581.9967079052677,
        y: 246.99165457145572,
        z: 300.57315433686765
      }, looper.loopLength* 1000 );

      tweenValue(ShapeGems.sphere.body.material.uniforms.audioDisplacement, 'value', 20 , looper.loopLength * 5000);
      
    });



    looper.onLoop( 4 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: -281.9967079052677,
        y: 246.99165457145572,
        z: 300.57315433686765
      }, looper.loopLength* 1000 );

        tweenValue(ShapeGems.points1.scaledBody.material.uniforms.audioDisplacement, 'value', 20 , looper.loopLength * 1000);

    });

    looper.onLoop( 5 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: 430.57315433686765
      }, looper.loopLength* 1000 );

      //Snowflakes[0].rotation.y = Math.PI;
      //Snowflakes[0].addToScene(1);

       tweenPosition( ShapeGems.sphere.body.scale , {

        x: 0.01,
        y: 0.01,
        z: 0.01 

      }, looper.loopLength * 2000);

       for(var i = 0; i < REPELERS.length; i++ ){


        tweenPosition(REPELERS[i].scale , {

          x: 0.3,
          y: 0.3,
          z: 0.3 

        }, looper.loopLength * 2000);

       // REPELERS[i].visible = false;

      }


    });

    looper.onLoop( 7 , function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: 830.57315433686765
      }, looper.loopLength* 1000 );

    //  Snowflakes[0].removeFromScene(1);
    //  Snowflakes[1].addToScene(2);

      ShapeGems.sphere.toggle();
      ShapeGems.cube.toggle();
           // ShapeGems.sphere.movementSpeed = 1.4;


    });

    looper.onLoop( 8, function(){

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: 1030.57315433686765
      }, looper.loopLength* 1000 );


    });


    looper.onLoop( 9, function(){

    //  Snowflakes[1].removeFromScene(2);
      R_VALUES.centerForce = 1.
      R_VALUES.windForce = -.5

      tweenPosition( ShapeGems.cube.body.scale , {

        x: 0.01,
        y: 0.01,
        z: 0.01 

      }, looper.loopLength * 500, function(){
        ShapeGems.cube.toggle();
      });
    ShapeGems.logo.toggle();



      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: 1330.57315433686765
      }, looper.loopLength* 1000 );

    });



    looper.onLoop( 11 , function(){

      ShapeGems.sphere.movementSpeed = 1.4;

      Snowflakes[0].rotation.y = Math.PI;
      Snowflakes[0].addToScene(6);
      Snowflakes[0].scale.multiplyScalar( 3 );

       tweenPosition( ShapeGems.logo.body.scale , {

        x: 0.01,
        y: 0.01,
        z: 0.01 

      }, looper.loopLength * 100);

      tweenPosition( ShapeGems.torus1.body.scale , {

        x: 10.01,
        y: 10.01,
        z: 10.01 

      }, looper.loopLength * 1000);

      R_VALUES.centerForce = 5.
      R_VALUES.windForce = -3.

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 700.9967079052677,
        y: 0.99165457145572,
        z: 0.57315433686765
      }, looper.loopLength* 1000 );

    });

    looper.onLoop( 12 , function(){

      ShapeGems.logo.toggle();
      ShapeGems.sphere.movementSpeed = 1.4;
     
       tweenPosition( ShapeGems.torus1.body.scale , {

        x: 100.01,
        y: 100.01,
        z: 100.01 

      }, looper.loopLength * 1000);

      R_VALUES.centerForce = 5.
      R_VALUES.windForce = -3.
      R_VALUES.dampening = .8;
      R_VALUES.springLength = 1000;
      R_VALUES.springForce  = .0001;

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 700.9967079052677,
        y: 0.99165457145572,
        z: -500.57315433686765
      }, looper.loopLength* 1000 );

    });

    looper.onLoop( 13 , function(){


      ShapeGems.sphere.movementSpeed = 1.4;
   
      tweenPosition( ShapeGems.torus1.body.scale , {

        x: 1000.01,
        y: 1000.01,
        z: 1000.01 

      }, looper.loopLength * 1000);
      
       R_VALUES.centerForce = 5.
      R_VALUES.windForce = 0;
      R_VALUES.springLength = 1000;
      R_VALUES.springForce  = .00003;

      R_VALUES.centerForce = 1.
      R_VALUES.windForce = -.1

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: -500.57315433686765
      }, looper.loopLength* 1000 );

       //ShapeGems.sphere.toggle();

    });

    looper.onLoop( 14 , function(){

      ShapeGems.torus1.toggle();

      R_VALUES.centerForce = 1.
      R_VALUES.windForce = 0;
      R_VALUES.springLength = 10000;

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 0.9967079052677,
        y: 0.99165457145572,
        z: -100.57315433686765
      }, looper.loopLength* 900 , function(){
     
        
       // ShapeGems.torus1.toggle();
        
        FinalScene.cloth.body.scale.multiplyScalar( 0.0001 );

        FinalScene.cloth.toggle();

        FinalScene.cloth.body.rotation.x = -Math.PI / 2;
        //FinalScene.cloth.body.rotation.z = Math.PI / 4;
        //scene.add( FinalScene.scene );

        FinalScene.cloth.body.position.y = -5000;

        tweenPosition( FinalScene.cloth.body.scale , {

          x: 300,
          y: 300,
          z: 300 

        }, looper.loopLength * 1100);


        tweenPosition( FinalScene.cloth.body.position, {

          x: 0,
          y: 0,
          z: 0 

        }, looper.loopLength * 1100);

       
        //FinalScene.cloth.active = false;

         FinalScene.cloth.active = true;
         FinalScene.cloth.update();
         FinalScene.cloth.active = false;

      
      
      });
      
    });




    looper.onLoop( 15 , function(){

      ShapeGems.sphere.movementSpeed = 4.4;

      Snowflakes[0].removeFromScene(.3);

      R_VALUES.centerForce = 10.
      R_VALUES.windForce = -3
      R_VALUES.windDirection.set( 0 , 10 , 0 );

      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x:1344.9818183941614, y: 600.943454544069, z: -1624.1276988800207

      }, looper.loopLength* 1000 );

      tweenPosition( ShapeGems.points1.scaledBody.position , {

        x: -600,
        y: 600,
        z:-800

      }, looper.loopLength * 1000);

      tweenPosition( ShapeGems.points1.scaledBody.scale , {

        x: 2,
        y: 2,
        z: 2 

      }, looper.loopLength * 1000);




     // ShapeGems.torus1.movementSpeed = 3.;

    });


    looper.onLoop( 16 , function(){


      var obj = FinalScene.cloth.body.material.uniforms.fadeOut
      tweenValue( obj , 'value' , 0, looper.loopLength * 4000);

    tweenCamera({
        x:244.9818183941614, y: 941.943454544069, z: 1624.1276988800207
      }, looper.loopLength* 1000 );
     

      //ShapeGems.sphere.toggle();

    });

   looper.onLoop( 17 , function(){
      FinalScene.cloth.active = true;
     
      tweenValue(FinalScene.cloth.body.material.uniforms.depthScale , 'value', 0 , looper.loopLength * 1000);
      tweenCamera({
        x:-244.9818183941614, y: 441.943454544069, z: 1624.1276988800207
      }, looper.loopLength* 1000 );

   });


   looper.onLoop( 18 , function(){



      tweenCamera({
        x: 0.9967079052677,
        y: -100.99165457145572,
        z: 1500.57315433686765
      }, looper.loopLength* 1000 );

   });


    looper.onLoop( 19 , function(){


     // FinalScene.nvs.body.scale.multiplyScalar( 0.0001 );
        FinalScene.nvs.body.position.y = 200;

      FinalScene.nvs.toggle();
      //scene.add( FinalScene.scene );
  
    

      //FinalScene.nvs.body.position.y = -5000;

      tweenPosition( FinalScene.nvs.body.scale , {

        x: 1,
        y: 1,
        z: 1 

      }, looper.loopLength * 1000);

      Arrangements.row( 1600 , 250 );
     
      R_VALUES.update = !R_VALUES.update;
      R_VALUES.targetForce = .1;

      for(var i = 0; i < REPELERS.length; i++ ){

        REPELERS[i].visible = false;

      }

    });

    looper.onLoop( 20 , function(){

      ShapeGems.sphere.movementSpeed = 1.4;

     // Arrangements.plane( 100 , 'z' , 0 );
     // R_VALUES.update = !R_VALUES.update;


      var percentTilEnd = 1 - looper.percentOfLoop;
      var timeTilEnd = percentTilEnd * looper.loopLength;
      tweenCamera({
        x: 3000.9967079052677,
        y: 0.99165457145572,
        z: 3000.57315433686765
      }, looper.loopLength * 1000 );

      ShapeGems.torus1.movementSpeed = 3.;

    });


    looper.onLoop( 21 , function(){


       DEMO_DONE = true;


    });




  //  Loop 11 ( oo oo oo eh )

}

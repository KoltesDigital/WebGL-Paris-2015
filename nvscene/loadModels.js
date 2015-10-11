function loadModels(){


  var objLoader  = new THREE.OBJLoader();
  
 /* objLoader.load( 'models/hand.obj' , function( obj ){

    
    loadedMeshes['hand'] = obj.children[0];

    loadedMeshes['hand'].scale.multiplyScalar( 200 );
    //loadedMeshes['hand'].position.z = -400;
    loadedMeshes['hand'].updateMatrix();

    var smooth = loadedMeshes['hand'].geometry;
    onLoad();

  });

  objLoader.load( 'models/skull1.obj' , function( obj ){

    var modifier = new THREE.SubdivisionModifier( 1 );

    loadedMeshes['skull'] = obj.children[0];

    loadedMeshes['skull'].scale.multiplyScalar( 2 );
    loadedMeshes['skull'].position.z = -200;
    loadedMeshes['skull'].position.y = 400;
    loadedMeshes['skull'].position.x = -70;
    loadedMeshes['skull'].updateMatrix();

    var smooth = loadedMeshes['skull'].geometry;
    
    smooth.mergeVertices();
    smooth.computeFaceNormals();
    smooth.computeVertexNormals();

    modifier.modify( smooth );
    console.log( smooth.vertices.length );

    onLoad();

  });*/

  objLoader.load( 'models/logo.obj' , function( obj ){

    var modifier = new THREE.SubdivisionModifier( 1 );
    
    loadedMeshes['logo'] = obj.children[0];

    loadedMeshes['logo'].scale.multiplyScalar( 50 );
    //loadedMeshes['logo'].position.z = -200;
    //loadedMeshes['logo'].position.y = -400;
    loadedMeshes['logo'].updateMatrix();

    var smooth = loadedMeshes['logo'].geometry;
    
    smooth.mergeVertices();
    smooth.computeFaceNormals();
    smooth.computeVertexNormals();

    modifier.modify( smooth );

    onLoad();

  });

 /* objLoader.load( 'models/orb.obj' , function( obj ){

    var modifier = new THREE.SubdivisionModifier( 1 );
    
    loadedMeshes['orb'] = obj.children[0];

    loadedMeshes['orb'].scale.multiplyScalar( 50 );
    //loadedMeshes['bieb'].position.z = -200;
    //loadedMeshes['bieb'].position.y = -400;
    loadedMeshes['orb'].updateMatrix();

    var smooth = loadedMeshes['orb'].geometry;
    
    smooth.mergeVertices();
    smooth.computeFaceNormals();
    smooth.computeVertexNormals();

    modifier.modify( smooth );

    onLoad();

  });*/



}

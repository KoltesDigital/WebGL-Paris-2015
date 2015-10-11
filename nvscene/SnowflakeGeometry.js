function SnowflakeGeometry(){


  // TODO:
  // vert normals, not face normals
  // flat top instead of spiked top
  // do uvs make sense?

 


  var edges = [];



  this.tv = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ]
  
  this.v = new THREE.Vector3();
  this.v1 = new THREE.Vector3();
  this.v2 = new THREE.Vector3();

  this.maxVerts      = 1000000;
  this.totalVerts    = 0;

  this.branchInfo    = [];
  this.branches      = [];


  var guide = {
      length: .8,
      width: .5,
      height: .7,
      angle: .3,
      position: .1,
      children:[]
    }

  this.createRecursionArray( guide , 0 );


  var startingInfo =  {
    id: 0,
    sPos: new THREE.Vector3(),
    length: 500,
    width:  0,
    height: 10,
    extraH: .1,
    vDepth: .05,
    angle: 0
  }
  for( var i =0; i < 8; i++ ){

    var info =  {
      id: 0,
      sPos: new THREE.Vector3(),
      length: 15,
      width:  10,
      height: 5,
      extraH: .1,
      vDepth: .05,
      angle: ( i / 8 ) * 2 * Math.PI
    }

   
    this.crystalize( 
      info.id, 
      info.sPos , 
      info.length , 
      info.width , 
      info.height, 
      info.extraH,
      info.vDepth,
      info.angle
    );
      

    this.createBranch( info , guide );

  }
 /* for( var i = 0; i < 6; i++ ){

    var a = ( i / 6 ) * 2 * Math.PI;
    var id = 0;
    var sPos = new THREE.Vector3();
    var l = 100;
    var w = 10;
    var h = 5;
    var eL = .1;
    var vD = .05;
    this.branch( id , sPos , l , w , h , eL , vD , a );

  }*/

  var g = this.createGeometry();
  console.log( g );
  return g;
  

}

SnowflakeGeometry.prototype.nv = function(){

  return new THREE.Vector3();

}

SnowflakeGeometry.prototype.createRecursionArray = function( object , depth  ){
 
  if( depth > 3 ) return;

  depth += 1;

  for( var i = 0; i < 5; i++ ){

    var c = Math.random();
    if( c < .5 ){

      var o ={ 
        length: .5 + Math.random(),//.6 + Math.random() *.4,
        width:  .5 + Math.random() ,//.9 + Math.random() *.2 ,
        height: .5 + Math.random() * .7,
        angle: .1 + Math.random() * .6*( depth+1) ,
        position: Math.random() * 3 ,
        children:[]
      }

      object.children.push( o );
      this.createRecursionArray( o , depth );

    }

  }

}


SnowflakeGeometry.prototype.createBranch = function( info , modifier ){
 
  var length = info.length * modifier.length;
  var width  = info.width  * modifier.width;
  var height = info.height * modifier.height;
  var id      = info.id + 1;

  for( var i = 0; i <2; i++ ){

    var p = (i === 0 ) ? 1 : -1;
    var angle = info.angle + p * modifier.angle;
    
    var basis = this.createBasis( info.angle );


    var pos = info.length * modifier.position;
    
    position = info.sPos.clone();
    this.v.set( basis.y[0] * pos , basis.y[1] * pos , 0 );
    position.add( this.v );

    
    var modifiedInfo = {
      id: id,
      sPos: position,
      length: length,//*( Math.random()*.1 + 1),
      width: width,//*( Math.random()*.1 + 1),
      height: height,//*( Math.random()*.1 + 1),
      extraH: info.extraH,
      vDepth: info.vDepth,
      angle: angle// +(Math.random() - .5 ) * .1
    }

    this.crystalize( 
      modifiedInfo.id, 
      modifiedInfo.sPos , 
      modifiedInfo.length         , 
      modifiedInfo.width          , 
      modifiedInfo.height         , 
      modifiedInfo.extraH         ,
      modifiedInfo.vDepth         ,
      modifiedInfo.angle   
      );

    if( modifier.children.length !== 0 ){
      for( var j = 0; j < modifier.children.length; j++ ){

        var m = modifier.children[j];
        this.createBranch( modifiedInfo , m );

      }
    }
   
  }

  
}
SnowflakeGeometry.prototype.branch = function( 
    id , 
    sPos , 
    length , 
    width , 
    height, 
    extraH,
    vDepth,
    angle
){

  if( this.totalVerts > this.maxVerts ) return;
  if( id > 3 ) return;

  this.totalVerts += 24;

  this.crystalize( 

    id , 
    sPos , 
    length , 
    width , 
    height, 
    extraH,
    vDepth,
    angle

  );

  var basis = this.createBasis( angle );
  var x = basis.x;
  var y = basis.y;
  
  for( var  i= 0; i < 10; i++ ){

    var c = Math.random();
    if( c < .5 ){

      var l = Math.random();
      l *= length;

      this.v.copy( sPos );
      this.v1.set( y[0] * l , y[1] * l , 0 );
      this.v.add( this.v1 );


      var angleV = Math.random() * .3 + .2;
      var a1 = angle + angleV;
      var a2 = angle - angleV;

      this.branch( id + 1 , this.v.clone() , length * .6 , width * .7 , height * .7 , extraH , vDepth , a1 );
      this.branch( id + 1 , this.v.clone() , length * .6 , width * .7 , height * .7 , extraH , vDepth , a2 );

      if( this.totalVerts > this.maxVerts ){

        console.log('bbis');
        return

      }


    }

  }
 
}

SnowflakeGeometry.prototype.makeNormal = function( p1 , p2 , p3 ){

  this.v1.copy( p3 );
  this.v2.copy( p1 );

  this.v1.sub( p2 );
  this.v2.sub( p2 );

  var n = new THREE.Vector3();
  n.crossVectors( this.v1 , this.v2 );
  n.normalize();

  return n.multiplyScalar( -1 );

}

SnowflakeGeometry.prototype.createGeometry = function(){
  
  var g = new THREE.BufferGeometry();

  console.log( this.totalVerts );

  var tv = this.totalVerts;

  var aPos  = new THREE.BufferAttribute(new Float32Array( tv * 3 ), 3 );
  var aNorm = new THREE.BufferAttribute(new Float32Array( tv * 3 ), 3 );
  var aID   = new THREE.BufferAttribute(new Float32Array( tv * 1 ), 1 );
  var aEdge = new THREE.BufferAttribute(new Float32Array( tv * 1 ), 1 );
  var aFade = new THREE.BufferAttribute(new Float32Array( tv * 1 ), 1 );

  g.addAttribute( 'position', aPos ); 
  g.addAttribute( 'normal', aNorm );
  g.addAttribute( 'id', aID );
  g.addAttribute( 'edge', aEdge );
  g.addAttribute( 'fade', aFade );

  var positions = g.getAttribute( 'position' ).array;
  var normals   = g.getAttribute( 'normal' ).array;
  var ids       = g.getAttribute( 'id' ).array;
  var edges     = g.getAttribute( 'edge' ).array;
  var fades     = g.getAttribute( 'fade' ).array;

  for( var i = 0; i < this.branches.length; i++ ){

    var vertStart = i * 24; // verts per branch

    var b = this.branches[i];
    for( var j = 0; j < 8; j++ ){

      var fID   = vertStart + 3 * j;
      var v3ID  = vertStart * 3 + 3 * 3 * j;

      var p = b.faces[j][0];
      positions[ v3ID + 0 ] = p.x; 
      positions[ v3ID + 1 ] = p.y; 
      positions[ v3ID + 2 ] = p.z;
       
      var p = b.faces[j][1];
      positions[ v3ID + 3 ] = p.x; 
      positions[ v3ID + 4 ] = p.y; 
      positions[ v3ID + 5 ] = p.z;
        
      var p = b.faces[j][2];
      positions[ v3ID + 6 ] = p.x; 
      positions[ v3ID + 7 ] = p.y; 
      positions[ v3ID + 8 ] = p.z;

      var p = b.norms[j][0];
      normals[ v3ID + 0 ] = p.x; 
      normals[ v3ID + 1 ] = p.y; 
      normals[ v3ID + 2 ] = p.z;
       
      var p = b.norms[j][1];
      normals[ v3ID + 3 ] = p.x; 
      normals[ v3ID + 4 ] = p.y; 
      normals[ v3ID + 5 ] = p.z;
        
      var p = b.norms[j][2];
      normals[ v3ID + 6 ] = p.x; 
      normals[ v3ID + 7 ] = p.y; 
      normals[ v3ID + 8 ] = p.z;

      ids[ fID + 0 ] = b.id;
      ids[ fID + 1 ] = b.id;
      ids[ fID + 2 ] = b.id;

      edges[ fID + 0 ] = b.edges[j][0];
      edges[ fID + 1 ] = b.edges[j][1];
      edges[ fID + 2 ] = b.edges[j][2];

      fades[ fID + 0 ] = b.fades[j][0];
      fades[ fID + 1 ] = b.fades[j][1];
      fades[ fID + 2 ] = b.fades[j][2];

    }


  }

  return g;


}

SnowflakeGeometry.prototype.crystalize = function(

    id , 
    sPos , 
    length , 
    width , 
    height, 
    extraH,
    vDepth,
    angle
    
){

  this.totalVerts += 24;
  
  var x = this.toCart( 1 , angle );
  var y = [ -x[1] , x[0] ];

  var v = vDepth;
  var h = extraH;
  // end point
  this.tv[0].copy( sPos );
  this.v.set( -h * length * y[0] ,  -h * length * y[1]  , 0 );
  this.tv[0].add( this.v );

  this.tv[1].copy( sPos );
  this.v.set( v * length * y[0] ,  v * length * y[1]  , height );
  this.tv[1].add( this.v );
   
  this.tv[2].copy( sPos );
  this.v.set( width * x[0] ,  width * x[1]  , 0 );
  this.tv[2].add( this.v );

  this.tv[3].copy( sPos );
  this.v.set( -width * x[0] ,  -width * x[1]  , 0 );
  this.tv[3].add( this.v );

  this.tv[4].copy( sPos );
  this.v.set( length * y[0] , length * y[1]  , 0 );
  this.tv[4].add( this.v );
  this.v.set( width * x[0] ,  width * x[1]  , 0 );
  this.tv[4].add( this.v );

  this.tv[5].copy( sPos );
  this.v.set( length * y[0] , length * y[1]  , 0 );
  this.tv[5].add( this.v );
  this.v.set( -width * x[0] ,  -width * x[1]  , 0 );
  this.tv[5].add( this.v );

  this.tv[6].copy( sPos );
  this.v.set( length * y[0] , length * y[1]  , 0 );
  this.tv[6].add( this.v );
  this.v.set( -v * length * y[0] ,  -v * length * y[1]  , height );
  this.tv[6].add( this.v );

  this.tv[7].copy( sPos );
  this.v.set( length * y[0] , length * y[1]  , 0 );
  this.tv[7].add( this.v );
  this.v.set( h * length * y[0] ,  h * length * y[1]  , 0);
  this.tv[7].add( this.v );

  var p = [
    this.tv[0].clone(),
    this.tv[1].clone(),
    this.tv[2].clone(),
    this.tv[3].clone(),
    this.tv[4].clone(),
    this.tv[5].clone(),
    this.tv[6].clone(),
    this.tv[7].clone()
  ]

  var faces   = [];
  var edges   = [];
  var fades   = [];
  var norms   = [];

  /*


                    Crystal

            3  *  *  *  *  *  *  *  5
         *   *                     *  *
       *      *                   *     *
     0 *  *  * 1  *  *  *  *  *  6  *  *  7
       *      *                   *     *
         *   *                     *  *
            2  *  *  *  *  *  *  *  4 


  */




  var n = this.makeNormal( p[2] , p[1] , p[0] );
  norms.push([ n , n , n ]); 
  faces.push([ p[2], p[1], p[0] ]);
  edges.push([ 1 , 0 , 1 ]);
  fades.push([  0 , v , -h ]);

  var n = this.makeNormal( p[0] , p[1] , p[3] );
  norms.push([ n    , n     , n     ]); 
  faces.push([ p[0] , p[1]  , p[3]  ]); 
  edges.push([ 1    , 0     , 1     ]);
  fades.push([ -h   , v     , 0     ]);
 
  var n = this.makeNormal( p[2] , p[6] , p[1] );
  norms.push([ n , n , n ]); 
  faces.push([ p[2], p[6], p[1] ]);
  edges.push([ 1 , 0 , 0 ]);
  fades.push([  0 , 1-v , v ]);

  var n = this.makeNormal( p[2] , p[4] , p[6] );
  norms.push([ n , n , n ]); 
  faces.push([ p[2], p[4], p[6] ]); 
  edges.push([ 1 , 1 , 0 ]);
  fades.push([ 0 , 1 ,  1-v ]);
 
  var n = this.makeNormal( p[3] , p[1] , p[6] );
  norms.push([ n , n , n ]); 
  faces.push([ p[3], p[1], p[6] ]); 
  edges.push([ 1 , 0 , 0 ]);
  fades.push([  0 , v , 1-v  ]);
  
  var n = this.makeNormal( p[3] , p[6] , p[5] );
  norms.push([ n , n , n ]); 
  faces.push([ p[3], p[6], p[5] ]); 
  edges.push([ 1 , 0 , 1 ]);
  fades.push([  0 , 1-v , 1  ]);
  
  var n = this.makeNormal( p[5] , p[6] , p[7] );
  norms.push([ n , n , n ]); 
  faces.push([ p[5], p[6], p[7] ]);
  edges.push([ 1 , 0 , 1 ]);
  fades.push([  1 , 1-v , 1+h  ]);

  var n = this.makeNormal( p[7] , p[6] , p[4] );
  norms.push([ n , n , n ]); 
  faces.push([ p[7], p[6], p[4] ]); 
  edges.push([ 1 , 0 , 1 ]);
  fades.push([  1+h , 1-v , 1  ]);

  var branch = {
  
    id:    id,
    faces: faces,
    edges: edges,
    fades: fades,
    norms: norms,

  }

  this.branches.push( branch );


}

SnowflakeGeometry.prototype.toCart = function( r , t ){

  var x = r * Math.sin( t );
  var y = r * Math.cos( t );

  return [ x , y ]

}

SnowflakeGeometry.prototype.createBasis = function( a ){

  var x = this.toCart( 1 , a );
  var y = [ -x[1] , x[0] ];
  return { x: x , y: y }

}

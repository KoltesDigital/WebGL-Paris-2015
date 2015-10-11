function RepelerMesh( title , mesh , repelers , extraParams ){

    
  

  var title = title || 'HELLO';
  var mesh = mesh || new THREE.Mesh( new THREE.BoxGeometry( 1000 , 1000 , 1000 , 80 , 80 , 80 ) );
  var geometry = new THREE.Geometry();


  if(!mesh.geometry.attributes ){
      
      geometry.merge( mesh.geometry , mesh.matrix );
  
  }else{
      geometry = mesh.geometry
  }
 // var geometry =  || new THREE.BoxGeometry( 1000 , 1000 , 1000 , 80 , 80 , 80 );
  

  var st = repelers.length;

  var s = shaders.setValue( shaders.simulationShaders.fire , 'SIZE' , st );
 
   
  var extraParams = extraParams || {};
  console.log( extraParams );
  var params =  {

    repelers: REPELERS,

    vs: extraParams.vs || shaders.vertexShaders.fire,
    fs: extraParams.fs || shaders.fragmentShaders.weird1,
    ss: s,

    geometry: geometry,


    dT: G_UNIFORMS.dT,
    time: G_UNIFORMS.time,

    soul:{
       
      dampening:          { type:"f" , value: .9 , constraints:[.8 , .999] },
      repulsionPower:     { type:"f" , value: 1. , constraints:[-100  , 100] },
      repulsionRadius:     { type:"f" , value: 1. , constraints:[-100  , 100] },
      
      maxVel:             { type:"f" , value: 30.   , constraints:[ 0 , 100 ] }, 
      t_audio:            G_UNIFORMS.t_audio,

      repelers:         { type:"v3v" , value:[] },
      radii:            { type:"v3v" , value:[] },
      velocities:       { type:"v3v" , value:[] },
      power:           { type:"v3v" , value:[] },

    },

    body:{
      
      audioDisplacement:{ type:"f" , value : 0.0 ,  constraints:[ 0 , 20 ]},
      
      custom1:{type:"f" , value: .04,  constraints:[ 0.00001 , 1]},
      custom2:{type:"f" , value: .31,  constraints:[ 0.00001 , 1]},
      custom3:{type:"f" , value: 1, constraints:[ 0.00001 , 1]},
      
      lightPos:{type:"v3" , value: new THREE.Vector3( 10 , 1 , 1 )},
      
      t_audio:   G_UNIFORMS.t_audio,

    },

  }


  var s = params.soul;
  for( var i = 0; i < repelers.length; i++ ){

    var r = repelers[i]
    s.repelers.value.push( r.position );
    s.radii.value.push( r.radus );
    s.velocities.value.push( r.velocity );
    s.power.value.push( r.power );

  }


  //Passing through extra params
 
  if( extraParams.soul ){
    var s = extraParams.soul;
    for( var propt in s ){
      params.soul[propt] = s[propt];
    }
  }

  if( extraParams.body ){
    var s = extraParams.body;
    for( var propt in s ){
      params.body[propt] = s[propt];
    }
  }

 
  if( extraParams.vs ) params.vs = extraParams.vs;
  if( extraParams.fs ) params.fs = extraParams.fs;
  if( extraParams.side ) params.side = extraParams.side;
  if( extraParams.type ) params.type = extraParams.type;
  if( extraParams.depthWrite ) params.depthWrite = extraParams.depthWrite;
  if( extraParams.depthWrite === false ) params.depthWrite = extraParams.depthWrite;
  if( extraParams.transparent ) params.transparent = extraParams.transparent;
  if( extraParams.transparent === false ) params.transparent = extraParams.transparent;
  if( extraParams.blending ) params.blending = extraParams.blending;

  var gem = new GEM( params );
 
  var gHolder = document.createElement('div');

  var tHolder = document.createElement('h1');

  tHolder.innerHTML =''+ title;

  gHolder.appendChild( tHolder );
  var guis = document.getElementById( 'GUI' );

  guis.appendChild( gHolder );

  $(tHolder).click(function(){
    this.toggle();
    if( this.active ){
      this.tHolder.className = "active";
    }else{
      this.tHolder.className = "";
    }
  }.bind( gem ));


  $(tHolder).hover(function(){
    this.gui.gui.open();
  }.bind( gem ));

  $(gHolder).hover(function(){},function(){
    this.gui.gui.close();
  }.bind(gem));

  gem.tHolder = tHolder;

  gem.gui = new GUI( params , {
   domElement: gHolder 
  });

  return gem;

}


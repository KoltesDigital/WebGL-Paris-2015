function loadShaders(){

   
  shaders = new ShaderLoader('shaders');

  shaders.load( 'ss-fire' , 'fire' , 'simulation' );
  shaders.load( 'ss-weird1' , 'weird1' , 'simulation' );
  shaders.load( 'ss-n2' , 'n2' , 'simulation' );
  
  shaders.load( 'vs-fire' , 'fire' , 'vertex' );
  shaders.load( 'fs-weird1' , 'weird1' , 'fragment' );
  shaders.load( 'fs-weird2' , 'weird2' , 'fragment' );
  shaders.load( 'fs-fire' , 'fire' , 'fragment' );
  
  
  shaders.load( 'fs-normal' , 'normal' , 'fragment' );
  
  
  shaders.load( 'vs-cube' , 'cube' , 'vertex' );
  shaders.load( 'fs-cube' , 'cube' , 'fragment' );
  shaders.load( 'vs-crystal' , 'crystal' , 'vertex' );
  shaders.load( 'fs-crystal' , 'crystal' , 'fragment' );

  shaders.load( 'vs-bees' , 'bees' , 'vertex' );
  shaders.load( 'fs-bees' , 'bees' , 'fragment' );
  shaders.load( 'vs-snow' , 'snow' , 'vertex' );
  shaders.load( 'fs-snow' , 'snow' , 'fragment' );

  shaders.load( 'vs-cloud1' , 'cloud1' , 'vertex' );
  shaders.load( 'fs-cloud1' , 'cloud1' , 'fragment' );

  shaders.load( 'treeScene/fs-water'     , 'water' , 'fragment' );
  shaders.load( 'treeScene/vs-water'     , 'water' , 'vertex' );
  shaders.load( 'treeScene/fs-tree'      , 'tree' , 'fragment' );
  shaders.load( 'treeScene/vs-tree'      , 'tree' , 'vertex' );
  shaders.load( 'treeScene/fs-mountain'  , 'mountain' , 'fragment' );
  shaders.load( 'treeScene/vs-mountain'  , 'mountain' , 'vertex' );
  shaders.load( 'treeScene/fs-particles' , 'particles' , 'fragment' );
  shaders.load( 'treeScene/vs-particles' , 'particles' , 'vertex' );
  shaders.load( 'treeScene/ss-particles' , 'particles' , 'simulation' );
  
  shaders.load( 'fs-cloth' , 'cloth' , 'fragment' );
  shaders.load( 'vs-cloth' , 'cloth' , 'vertex' );
  shaders.load( 'ss-cloth' , 'cloth' , 'simulation' );

  shaders.load( 'fs-sem' , 'sem' , 'fragment' );
  shaders.load( 'vs-sem' , 'sem' , 'vertex' );


  shaders.shaderSetLoaded = function(){
   onLoad();
  }




}

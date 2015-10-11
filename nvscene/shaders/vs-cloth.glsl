attribute vec3 tri1;
attribute vec3 tri2;

uniform sampler2D t_pos;
uniform sampler2D t_oPos;
uniform sampler2D t_audio;
uniform sampler2D t_og;
uniform sampler2D t_flag;
uniform sampler2D t_normal;

uniform float audioDisplacement;

varying vec2 vUv;
varying vec3 vVel;

varying vec3 vPos;
varying vec3 vMPos;

varying vec3 vLightDir;

varying float vLife;
varying vec4 vAudio;

varying vec3 vNorm;

varying vec3 vCamPos;
varying vec3 vCamVec;
varying vec3 vMNorm;

varying vec2 vSEM;
varying float vFR;

varying mat3 vNormMat;

varying vec3 vReflection;
uniform float texScale ;
uniform float normalScale;
uniform float depthScale;


const float size  = @SIZE;
const float iSize = @ISIZE;
const float hSize = @HSIZE;

const float smoothing = 1. / 32.;

vec3 getNormal( vec3 p , vec2 uv ){

  vec3 upX  = p;
  vec3 doX  = p;
  vec3 upY  = p;
  vec3 doY  = p;

  if( uv.x > iSize ){
    doX = texture2D( t_pos , uv - vec2( iSize , 0. ) ).xyz;
  }
   
  if( uv.x < 1.- iSize ){
    upX = texture2D( t_pos , uv + vec2( iSize , 0. ) ).xyz;
  }

  if( uv.y > iSize ){
    doY = texture2D( t_pos , uv - vec2( 0. , iSize ) ).xyz;
  }


  if( uv.y < 1. - iSize ){
    upY = texture2D( t_pos , uv + vec2( 0. , iSize ) ).xyz;
  }


  vec3 dX = upX - doX;
  vec3 dY = upY - doY;

  return normalize( cross( dX , dY ) );


}

void main(){

  vNormMat = normalMatrix;
  vUv = position.xy;
  //vec4 pos = texture2D( t_pos , vec2( vUv.x , (1. - (vUv.y + .125)) ) );
  vec4 pos = texture2D( t_pos , vUv );
//  vec4 v1 = texture2D( t_pos , tri1.xy );
//  vec4 v2 = texture2D( t_pos , tri2.xy );
  //vec4 oPos = texture2D( t_oPos , vUv );
  vec4 ogPos = texture2D( t_og , vUv );

  vec3 norm = getNormal( pos.xyz , vUv );

  vec3 nMap = abs( texture2D( t_normal , vUv * texScale).xyz * 2.0 - 1.0 );
  float d = nMap.z/ ( nMap.x + nMap.y + 1. );


  float f = texture2D( t_flag , vUv ).r;
  float distance = (1. - f);
  float lum = smoothstep( 0.1 - smoothing , 0.1 + smoothing , distance );
 
///  d -= distance * .8; //lum * .3;

  float depth = d * f +  .3* ( 1. - f );//; *  max( 0. , d );
  pos +=  vec4( norm * depth * depthScale, 0. );

//  vVel = pos.xyz - oPos.xyz;

 // vec3 a1 = pos.xyz - v1.xyz;
 // vec3 a2 = pos.xyz - v2.xyz;

  vNorm = norm;//normalize( cross( a1 , a2 ) );



  vLife = length( pos.xyz - ogPos.xyz );
    
    //vNorm = normalize( a1 );

  //vNorm = normalize( vec3( tri1.x , tri1.y , 0. ) );

  vMPos = ( modelMatrix * vec4( pos.xyz , 1. ) ).xyz;
  vMNorm = normalize(( modelMatrix * vec4( vNorm.xyz , 0. ) )).xyz;

  //vAudio = texture2D( t_audio , vec2( abs(vNorm.x) , 0. ) );

  pos.xyz += vNorm * length(vAudio )* audioDisplacement;//01;
  vLightDir = normalize( vMPos - vec3( 1000. , 0. , 0. ) );

  vCamVec = normalize( cameraPosition - vMPos);
  float lu = abs( dot( vCamVec , vNorm ));

  vAudio = texture2D( t_audio , vec2( lu , 0. ));

  pos.xyz += length( vAudio ) * vNorm * audioDisplacement;

  vec3 e = normalize( vec3( modelViewMatrix * vec4( pos.xyz , 1. ) ) );
  vec3 n = normalize( normalMatrix * vNorm );


  vCamVec = e;
  
  vec3 r = reflect( e, n );

  float m = 2. * sqrt( 
    pow( r.x, 2. ) + 
    pow( r.y, 2. ) + 
    pow( r.z + 1., 2. ) 
  );
  vSEM = r.xy / m + .5;

  float fr = 1. - abs(pow( dot( e , n ) , 4. )) ; 

  vReflection = r;
  vFR = fr;


  vPos = pos.xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}


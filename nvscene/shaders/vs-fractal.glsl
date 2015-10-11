attribute vec3 tri1;
attribute vec3 tri2;

uniform sampler2D t_pos;
uniform sampler2D t_oPos;
uniform sampler2D t_audio;
uniform sampler2D t_og;
uniform vec3 lightPos;

uniform float audioDisplacement;

varying vec2 vUv;
varying vec3 vVel;

varying vec3 vPos;
varying vec3 vMPos;

varying vec3 vLightDir;
varying float vLightDist;

varying float vLife;
varying vec4 vAudio;

varying vec3 vNorm;

varying vec3 vCenter;
varying vec3 vOGCenter;
varying vec3 vCenterDir;
varying float vCenterDist;

varying vec3 vCamPos;
varying vec3 vCamVec;
varying vec3 vMNorm;
varying vec3 vOGNorm;

varying vec3 vLightPos;

void main(){

  vUv = position.xy;
  //vec4 pos = texture2D( t_pos , vec2( vUv.x , (1. - (vUv.y + .125)) ) );
  vec4 pos = texture2D( t_pos , vUv );
  vec4 v1 = texture2D( t_pos , tri1.xy );
  vec4 v2 = texture2D( t_pos , tri2.xy );
  
  vec4 ogPos = texture2D( t_og , vUv );
  vec4 og1 = texture2D( t_og ,tri1.xy );
  vec4 og2 = texture2D( t_og , tri2.xy  );


  vCenter = (pos.xyz + v1.xyz + v2.xyz)/3.;
  vOGCenter= (ogPos.xyz + og1.xyz + og2.xyz)/3.;


  vec3 c = pos.xyz - vCenter;
  vec3 cOG = ogPos.xyz - vOGCenter;

  vCenterDir = ( modelMatrix * vec4( normalize( c ) ,1. ) ).xyz;
;

  vCenterDist = (length( c ) - length( cOG ) ) / length( cOG );


  vLife = position.z;

  vec3 a1 = pos.xyz - v1.xyz;
  vec3 a2 = pos.xyz - v2.xyz;

  vNorm = normalize( cross( a1 , a2 ) );

  a1 = ogPos.xyz - og1.xyz;
  a2 = ogPos.xyz - og2.xyz;

  vOGNorm = normalize( cross( a1 , a2 ) );

  //vNorm = normalize( a1 );

  //vNorm = normalize( vec3( tri1.x , tri1.y , 0. ) );

  vMPos = ( modelMatrix * vec4( pos.xyz , 1. ) ).xyz;
  vMNorm = ( modelMatrix * vec4( vNorm.xyz , 0. ) ).xyz;

  vAudio = texture2D( t_audio , vec2( abs(vNorm.x) , 0. ) );

  pos.xyz += vNorm * length(vAudio )* audioDisplacement;//01;
  vPos = pos.xyz;
  vLightDir = normalize( vMPos - lightPos );
  vLightDist = length( vMPos - lightPos );
  vCamVec = normalize( cameraPosition - vMPos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}


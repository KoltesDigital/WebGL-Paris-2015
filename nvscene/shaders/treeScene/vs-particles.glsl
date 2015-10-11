
uniform sampler2D t_pos;
uniform sampler2D t_oPos;
uniform sampler2D t_audio;

varying vec2 vUv;
varying vec3 vVel;

varying vec3 vMPos;

varying float forceSize;
varying vec4 vAudio;

void main(){

  vUv = position.xy;
  vec4 pos = texture2D( t_pos , vUv );
  vec4 oPos = texture2D( t_oPos , vUv );


  vVel = pos.xyz - oPos.xyz;

  forceSize = pos.w;

  vMPos = ( modelMatrix * vec4( pos.xyz , 1. ) ).xyz;

  vAudio = texture2D( t_audio , vec2( vUv.x , 0. ) );
  gl_PointSize = 1. * length( vAudio ) * length( vAudio );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}



uniform sampler2D t_normal;
uniform sampler2D t_audio;

uniform vec3 c_spec;
uniform vec3 c_lamb;
uniform vec3 c_audio;

uniform float custom1;
uniform float custom2;
uniform float custom3;

varying vec2 vUv;
varying vec3 vVel;
varying vec4 vAudio;
varying vec3 vMPos;
varying vec3 vPos;

varying vec3 vNorm;
varying vec3 vOGNorm;
varying vec3 vMNorm;
varying vec3 vCamPos;

varying vec3 vLightDir;
varying float vLife;

varying vec3 vCamVec;

varying vec3 vCenter;
varying vec3 vCenterDir;
varying float vCenterDist;

void main(){

  float d = dot( vOGNorm , vNorm );
  float l1 = dot( vOGNorm , vLightDir );
  float l2 = dot( vNorm , vLightDir );

  vec3 c1 = custom3 * c_spec * l1;
  vec3 c2 = (1.-custom3) * c_lamb * l2;


  vec3 c3 = abs(sin(d*custom2*custom2*20.)) * c_audio;

  vec3 aC = texture2D( t_audio , vec2(  abs(sin(d* custom1 * custom1 * 20.) ) , 0. ) ).xyz;
  gl_FragColor = vec4(   (c1 + c2+c3 ) , 1. );//d*c_audio+ ( vCenterDist * c_spec + (1.-vCenterDist ) * c_lamb) , 1. );



}

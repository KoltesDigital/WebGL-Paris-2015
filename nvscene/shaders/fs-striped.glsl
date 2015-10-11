
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
varying vec3 vMNorm;
varying vec3 vCamPos;

varying vec3 vLightDir;
varying float vLife;

varying vec3 vCamVec;

void main(){


   
  //float l =  100. / vMPos.y;

  float l2 = length(vMPos);

  float l = vLife;
  vec3 a = texture2D( t_audio , vec2( abs(cos(l*custom1*5.)) , 0.) ).xyz;
  vec3 c1 = c_spec *  abs( cos( l*custom2 ) );
  vec3 c2 = c_lamb * abs( sin(l2 *custom2));
  vec3 c3 = c_audio * max( 0. , dot( vLightDir , vMNorm ) );
  gl_FragColor = vec4( normalize((c1+c2+c3)) * ( custom3 + a * (1.-custom3) ) , 1. );



}

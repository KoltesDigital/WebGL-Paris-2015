
uniform sampler2D t_sem;

varying vec3 vPos;
varying float vVelMatch;
varying float vNormalMatch;
varying vec3 vDif;
varying vec4 vAudio;

varying vec2 vSEM;
varying float vFR;
varying vec3 vReflection;

varying vec3 vNormal;
varying vec3 vMNormal;
void main(){

  vec4 sem = texture2D( t_sem , vSEM );
  vec4 s2 = texture2D( t_sem , vec2(pow( vFR , 10. ),.5));

  gl_FragColor = s2*vAudio * vFR + vAudio * vAudio *vAudio *2.* vec4( 0.5 * normalize(vReflection ) + 0.7 , 1. ) *   sem;

 // gl_FragColor= vec4( normalize( vMNormal ) * normalize( vMNormal ) + vec3( .5 ) , 1. );// * vec4( vAudio.xyz , 1. ) *  vec4( 1. , vNormalMatch , 0. , 1. );

}

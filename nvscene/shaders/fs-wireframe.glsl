
uniform sampler2D t_normal;
uniform sampler2D t_audio;

uniform vec3 c_spec;
uniform vec3 c_lamb;
uniform vec3 c_audio;

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

 

   
  float l =  100. / vMPos.y;

  vec4 aC1 = texture2D( t_audio , vec2( abs(dot(vNorm , vec3( 1. , 0. , 0. ))), 0. ) );
 // aC *= texture2D( t_audio , vec2( vUv.x , 0. ) );
 // aC *= texture2D( t_audio , vec2( vUv.y , 0. ) );


  float lamb = max( 0. , dot( -vLightDir , vMNorm ));
  float refl = max( 0. , dot( reflect( vLightDir , vMNorm  )  , vCamVec ));
 // float refl = vMPos - lightPos
  float fr = max( 0. , dot( vCamVec , vMNorm ));
  float iFR = 1. - fr;

  vec3 a = texture2D( t_audio , vec2( abs(sin(dot( reflect( vLightDir , vMNorm  )  , vCamVec ))) , 0. ) ).xyz *iFR;
  vec4 a1 = texture2D( t_audio , vec2( abs(sin(dot( -vLightDir , vMNorm ))) , 0. )  );

  vec3 rC = c_spec * pow( refl , 30. );
  vec3 lC = c_lamb * pow( lamb , 1. );
  vec3 aC = c_audio * a  * a1.xyz;

  //gl_FragColor = vec4( vUv.x, vLife /10000., vUv.y, 1. ); //aC ; //* vec4(  1000. - vMPos.y , 100. / vMPos.y , .3, 1. );
 // gl_FragColor = vec4( vec3( .5 , .4 , .2 ) + vec3( 1. , 1. , .6 ) * aC.xyz * aC1.xyz , 1. ); //aC ; //* vec4(  1000. - vMPos.y , 100. / vMPos.y , .3, 1. );
  gl_FragColor = vec4( aC * iFR * iFR * iFR * 10. , 1. );




}

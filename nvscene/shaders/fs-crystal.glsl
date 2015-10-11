
varying vec3 vNorm;
varying vec3 vMNorm;
varying vec3 vMPos;
varying vec3 vCamVec;

varying float fR;
uniform sampler2D t_audio;

void main(){

  vec3 r = vec3( 1. , 0. , 0. );
  vec3 b = vec3( 0. , 0. , 1. );

 // vec3 c = mix( r , b , ( 1. - fR*fR ) );

  vec4 c = texture2D( t_audio , vec2( abs(sin(( 1. - fR )*10.)) , 0. ));
  gl_FragColor = vec4( c );


}


uniform sampler2D t_audio;
uniform sampler2D sprite;
varying vec3 vPos;
varying float vNoise;
$simplex
void main(){

  //float v = snoise( vPos  *.01 );
  vec4 c = vec4( texture2D( t_audio , vec2( abs( vNoise ), 0. ) ).xyz , 1. );
  vec4 s = texture2D( sprite , vec2( gl_PointCoord.x , 1.0 - gl_PointCoord.y) );
  //gl_FragColor =  s * c * c * c * vec4( 2.6 , .9 , .8 , 1. );
  gl_FragColor =  s * c * vec4( 1.2 , .8 , .5 , 1. );
}

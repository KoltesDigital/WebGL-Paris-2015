uniform sampler2D t_audio;

varying vec3 vPos;

varying float vNoise;


$simplex

void main(){


  vNoise = snoise( position.xyz * .01 );

  vPos = position * ( 1. - length(texture2D( t_audio , vec2(abs( vNoise) , 0.) )*.1));


  //vPos = vec3( 1. );

  gl_PointSize = 10.;
  gl_Position =  projectionMatrix * modelViewMatrix * vec4( vPos , 1. );

}

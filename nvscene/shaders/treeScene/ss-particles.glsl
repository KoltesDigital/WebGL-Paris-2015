uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_start;
uniform float dT;

varying vec2 vUv;


$simplex
$curl

void main(){


  
  vec4 oPos = texture2D( t_oPos , vUv );
  vec4 pos  = texture2D( t_pos , vUv );

  vec3 vel  = pos.xyz - oPos.xyz;
  vec3 p    = pos.xyz;

  float life = pos.w;
  
  vec3 f = vec3( 0. , 0. , 0. );
  life += dT * (abs(sin( vUv.x * 1000. * cos( vUv.y * 500. )))+.3) ;

  f += vec3( 0. , .5 , 0. );
 
  vec3 curl = curlNoise( pos.xyz * .001 );
  f+= curl* .5;

  vel += f;
  vel *= .99;//dampening;

  if( length(vel) > 1. ){

    vel = normalize( vel ) * 1.;

  }


  if( life > 10. ){

     p = texture2D( t_start , vUv ).xyz;
     vel *= 0.;
     
     life = 0.;

  }

  if( life == 0. ){

    vel *= 0.;

  }

  
  p += vel * 1.;//speed;



  gl_FragColor = vec4( p , life  );

}

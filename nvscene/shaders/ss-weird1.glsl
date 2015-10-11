uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_og;
uniform sampler2D t_audio;
uniform float dT;
uniform float timer;

uniform float noiseSize;
uniform float noiseVariation;
uniform float noiseChangeSpeed;
uniform float audioPower;
uniform float noisePower;
uniform float returnPower;
uniform float sampleNoiseSize;
uniform float audioVelMultiplier;
uniform float maxVel;

uniform float dampening;

varying vec2 vUv;


$simplex
$curl

void main(){


  
  vec4 oPos = texture2D( t_oPos , vUv );
  vec4 pos  = texture2D( t_pos , vUv );

  vec4 og   = texture2D( t_og , vUv );
  vec3 vel  = pos.xyz - oPos.xyz;
  vec3 p    = pos.xyz;

  float life = pos.w;
  
  vec3 f = vec3( 0. , 0. , 0. );
 
  vec3 dif = pos.xyz - og.xyz;

  
  float sample = snoise( p * sampleNoiseSize );


  vec2 lU =  vec2( abs(sample) , 0. );
  //vec2 lU =  vec2( abs(normalize( p ).x) , 0. );


  float i1 = cos( timer * .5123 * noiseChangeSpeed);
  float i2 = cos( timer * .01 * noiseChangeSpeed + i1 );

//  float sample = snoise( p * .001 );

  float a = (texture2D( t_audio , lU ).x) * audioPower + ( 1. - audioPower );
  float t = sin( timer  * noiseChangeSpeed) * i2 ;
  vec3 n = curlNoise( p  * ( noiseSize + t * noiseSize * noiseVariation ));
  f +=  a * a * a * noisePower * n;//pow( length( n ) , .5 ) * normalize( n );


  f -= dif * returnPower;


  vel += f*min( .1 , dT);
  vel *= dampening;

  if( length(vel) > maxVel ){

    vel = normalize( vel ) * maxVel;

  }
  p += vel * 1. * (a*audioVelMultiplier + (1. - audioVelMultiplier));//speed;*/



  //gl_FragColor = vec4( og.xyz + sin( timer ) * 1.* vec3( vUv.x , vUv.y , 0. ), 1.  );
  gl_FragColor = vec4( p , life );

}

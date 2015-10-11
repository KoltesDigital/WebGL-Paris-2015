uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_og;
uniform sampler2D t_audio;


uniform float dT;
uniform float timer;

uniform float maxVel;

uniform float returnPower;
uniform float noisePower;
uniform float noiseSize;
uniform float noiseVariation;
uniform float noiseChangeSpeed;
uniform float staticLength;


const float size  = @SIZE;
const float hSize = @HSIZE;

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

  vec2 leUV = vec2( abs( sin( length( pos.xyz ))) , 0. );
  vec4 a = texture2D( t_audio , vec2( abs(normalize(pos.xyz).x) , 0. ) );


  
  vec3 offset =  vec3( 
    sin( timer * .5 * noiseChangeSpeed ) , 
    sin( timer*.2154 * noiseChangeSpeed ) , 
    sin( timer* .41561* noiseChangeSpeed ) 
  );

  float nSize = noiseSize  +  (noiseVariation * sin( timer * noiseChangeSpeed ) )+noiseSize;


  for( float i = 0.; i < size; i++ ){
    for( float j = 0.; j < size; j++ ){

      vec2 leUV = vec2( ( i / size ) + hSize , ( j / size ) + hSize );
      vec4 pos1 = texture2D( t_pos , leUV );

      if( pos != pos1 ){

        vec3 difN = pos.xyz - pos1.xyz;

   
        float l = length( difN );
        vec3 n = normalize( difN );

        float snow = snoise( difN * nSize + offset ) * noisePower;

        float aPow = length( texture2D( t_audio  , vec2( abs(n.x) , 0. )));

        f -= ( l - staticLength ) * ( snow + 1. ) * difN * aPow ;

      }

    }
  }

 // f -= pos.xyz * pos.xyz *pos.xyz * .1;

  f -=  dif * dif * dif * returnPower ;
 
  vel +=  f*min( .1 , dT);
 // vel *= dampening;

  //vel *= (length( a )*length( a )*length( a ) )+.5;
  if( length(vel) > maxVel){

    vel = normalize( vel ) * maxVel;

  }
  p += vel ;//speed;*/



  //gl_FragColor = vec4( og.xyz + sin( timer ) * 1.* vec3( vUv.x , vUv.y , 0. ), 1.  );
  gl_FragColor = vec4( p , life );

}


uniform vec3 velocity;
uniform vec3 target;

uniform sampler2D t_audio;

varying vec3 vPos;
varying float vVelMatch;
varying float vNormalMatch;
varying vec3 vDif;
varying vec4 vAudio;

varying vec3 vMNormal;
varying vec3 vNormal;


varying vec2 vSEM;
varying float vFR;
varying vec3 vReflection;

void main(){


  vDif = position - target;
  vVelMatch = dot( normalize(velocity) , vec3( 0. , 0. , 1. ) );
  vNormalMatch = dot( normal, -normalize(vDif) );

  vNormal = normal;
  vMNormal = ( modelMatrix * vec4( normal , 0. )).xyz;

  vAudio = texture2D( t_audio , vec2( abs( vNormalMatch )  , 0. ) );
   
  vPos = position + 20. * length( vAudio ) * vNormalMatch * vNormalMatch* vNormalMatch * normal;

  vec3 e = normalize( vec3( modelViewMatrix * vec4( vPos.xyz , 1. ) ) );
  vec3 n = normalize( normalMatrix * vNormal );

  vec3 r = reflect( e, n );

  float m = 2. * sqrt( 
    pow( r.x, 2. ) + 
    pow( r.y, 2. ) + 
    pow( r.z + 1., 2. ) 
  );
  vSEM = r.xy / m + .5;

  float fr = 1. - abs(pow( dot( e , n ) , 4. )) ; 
  
  vReflection = r;
  vFR = fr;

  vAudio = texture2D( t_audio , vec2( abs(vNormal.x * vNormal.y * vNormal.z * 4.) , 0. ) );
  

  //float fr = 1. - abs(pow( dot( e , n ) , 4. )) ; 



   gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos , 1. );

}

uniform sampler2D t_audio;

uniform float custom1;

varying vec3 vNorm;
varying vec3 vMNorm;
varying vec3 vCamVec;
varying vec3 vMPos;


void main(){

  vec3 c = vec3( 
        abs( sin( vMNorm.x  * custom1 )) ,
        abs( sin( vMNorm.y  * custom1 )) ,
        abs( sin( vMNorm.z  * custom1 )) 
  );

  float m = abs(dot( vMNorm , normalize(vec3( 1. )) ));
  vec3 c2 =c * pow( m , 10. );

  float m2 = abs(dot( vMNorm , normalize(vCamVec) ));
  
  vec4 a = texture2D( t_audio , vec2( m , 0. ) );
  vec4 a2 = texture2D( t_audio , vec2( m2 , 0. ) );

        
  gl_FragColor = vec4(a.xyz * c * a2.xyz * (1.-m2) * 4. , 1. );


  
}

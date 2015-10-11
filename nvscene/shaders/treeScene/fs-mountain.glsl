
uniform float waterRender;

uniform sampler2D t_audio;
uniform vec3 camPos;

varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vMPos;
varying vec2 vUv;


void main(){


  if( waterRender > .5 ){

    if( vPos.y < 0. ){
      discard;
    }

  }

  vec3 c = vec3( 1. , 1. , 1. );
  float a = 1.;
  if( vPos.y < 0. ){

    c = vec3( .1 , .1 , .6 ) * (100. - abs( vMPos.y )) /100.;
    a = 3. - abs( vPos.y );

  }

  vec4 aC = texture2D( t_audio , vec2( abs( vNormal.x ) , 0. ) );
 
  vec4 multiColor = mix( vec4( 1. , .8 , .3 , 1. ) , vec4( 1. , .2 , 0. , 1.) , 150. / (vMPos.y-10.) );
  gl_FragColor = vec4( c * aC.xyz , a ) * multiColor;

    //gl_FragColor = vec4( vec3( vUv.x , vUv.y , 0. ) * a, a );

}

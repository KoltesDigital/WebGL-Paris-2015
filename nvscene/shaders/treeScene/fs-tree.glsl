uniform sampler2D t_audio;
uniform float waterRender;

varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vMPos;
varying vec2 vUv;

varying float vSlice;
varying vec4 vSliceAC;

void main(){


  if( waterRender > .5 ){

    if( vPos.y < 0. ){
      discard;
    }

  }

  vec3 c = vec3( 1. , 1. , 1. );
  float a = 1.;
  if( vMPos.y < 0. ){

    c = vec3( 2. , .8 , 1. ) * ((100. - abs( vMPos.y )) /100.)* ((100. - abs( vMPos.y )) /100.);
    a = 3. - abs( vMPos.y );

  }

  vec3 mColor = mix( vec3( .2 , .7 , .9 ) , vec3( .4, 0. , 1. ) , vSlice );

  vec4 aC = texture2D( t_audio , vec2( vSlice , 0. ) );
  gl_FragColor =vec4( c * aC.xyz * mColor , 1. );
}



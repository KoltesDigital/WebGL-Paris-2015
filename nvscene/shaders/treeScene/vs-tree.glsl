attribute float slice;

uniform sampler2D t_audio;

varying vec3 vNormal;
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vMPos;

varying float vSlice;
varying vec4 vSliceAC;

void main(){
  vNormal = normal;
  vPos = position;
  vSlice = slice;
  vUv = uv;
  vSliceAC = texture2D( t_audio , vec2( slice , 0. ) );
  vPos += 3. * slice * normal * length( vSliceAC ) * length( vSliceAC ) * length( vSliceAC ) * length( vSliceAC )  ;//vSliceAC.x;

  vMPos = ( modelMatrix * vec4( vPos , 1. )  ).xyz;


  gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPos , 1.0 );


}

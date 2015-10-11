
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vMPos;
varying vec2 vUv;

void main(){

  vNormal = normal;
  vPos = position;

  vMPos = ( modelMatrix  * vec4( vPos, 1. ) ).xyz;
  vUv = uv;
  gl_Position  = projectionMatrix * modelViewMatrix * vec4( position , 1.0 );


}


varying vec3 vNorm;
varying vec3 vMNorm;
varying vec3 vMPos;
varying vec3 vCamVec;

varying float fR;
uniform vec3 camPos;

void main(){

  vNorm = normal;

  vMPos = ( modelMatrix * vec4( position.xyz , 1. ) ).xyz;
  vMNorm = ( modelMatrix * vec4( vNorm.xyz , 0. ) ).xyz;

  vCamVec = camPos - position;

  fR = dot( normalize(-vCamVec) , vMNorm );

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );


}


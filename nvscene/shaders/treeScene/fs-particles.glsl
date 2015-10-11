
uniform sampler2D t_sprite;
uniform sampler2D t_audio;

varying vec2 vUv;
varying vec3 vVel;
varying vec4 vAudio;
varying vec3 vMPos;

void main(){

   
  vec4 s = texture2D( t_sprite , vec2( gl_PointCoord.x , 1.0 - gl_PointCoord.y) );
  
  gl_FragColor =  vec4(  1000. - vMPos.y , 100. / vMPos.y , .3, 1. );

}

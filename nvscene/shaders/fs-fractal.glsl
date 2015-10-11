
uniform sampler2D t_normal;
uniform sampler2D t_audio;

uniform vec3 c_spec;
uniform vec3 c_lamb;
uniform vec3 c_audio;
uniform float time;

uniform float custom1;
uniform float custom2;
uniform float custom3;

varying vec2 vUv;
varying vec3 vVel;
varying vec4 vAudio;
varying vec3 vMPos;
varying vec3 vPos;

varying vec3 vNorm;
varying vec3 vOGNorm;
varying vec3 vMNorm;
varying vec3 vCamPos;

varying vec3 vLightDir;
varying float vLightDist;
varying vec3 vLightPos;
varying float vLife;

varying vec3 vCamVec;

varying vec3 vCenter;
varying vec3 vCenterDir;
varying float vCenterDist;

void main(){

  float d = dot( vOGNorm , vNorm );
  float l1 = dot( vOGNorm , vLightDir );
  float l2 = dot( vNorm , vLightDir );

  vec3 c1 = custom3 * c_spec * l1;
  vec3 c2 = (1.-custom3) * c_lamb * l2;


  vec3 c3 = abs(sin(d*custom2*custom2*20.)) * c_audio;

  vec3 aC = texture2D( t_audio , vec2(  abs(sin(d* custom1 * custom1 * 20.) ) , 0. ) ).xyz;

  vec2 v =  abs(vec2( vNorm.x , vNorm.y ) );
      
  float pi2 = 3.1415926535 * 2.0;
  //0.7172701949860725
  //  float cx = @(sin(sin( 20. * (mouse.y / device.h)   )))
  //  float cy = @(sin( 10. * sin( (mouse.x / device.w)   )  ))
   
  float cx = -0.85 + .0002 * cos( 3. * time );
  float cy = -0.85 + .0005 * sin( 3. * time );

  //float z = 0.0;
  //float m = 0.0;

 /*for(int i = 0; i < 30; i ++){


    v.x = abs(v.x) ;
    v.y = abs(v.y);
    m = v.x * v.x + v.y * v.y;
    v.x = v.x / m + cx;
    v.y = v.y / m + cy;

  }*/

  gl_FragColor = vec4(  vCenterDist * vec3( 1. , .5 , .4 ) , 1. );//d*c_audio+ ( vCenterDist * c_spec + (1.-vCenterDist ) * c_lamb) , 1. );



}

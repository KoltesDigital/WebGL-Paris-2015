
#extension GL_OES_standard_derivatives : enable

uniform sampler2D t_audio;

uniform samplerCube t_refl;
uniform samplerCube t_refr;
uniform sampler2D t_flag;
uniform sampler2D t_normal;
uniform sampler2D t_iri;

uniform sampler2D t_sem;


uniform float time;
uniform float custom1;
uniform float custom2;
uniform float custom3;

uniform float fadeOut;

varying vec3 vNorm;
varying vec3 vMNorm;
varying vec3 vCamVec;
varying vec3 vMPos;
varying vec3 vLightDir;
varying vec3 vPos;
varying vec2 vUv;
varying vec4 vAudio;

varying vec2 vSEM;
varying float vFR;
varying vec3 vReflection;



const float smoothing = 1. / 32.;
uniform float texScale ;
uniform float normalScale;

$semLookup


void main(){

  vec2 tLookup = vec2( vUv );
  /*tLookup *= 1. / textureScale;
  tLookup -= (1. / textureScale)/2.;// / 2.;
  tLookup += textureScale;// / 2.;*/
  
  vec4 flag = texture2D( t_flag , tLookup );

  //float distance = 1.-title.r;
  //float lum = smoothstep( 0.6 - smoothing , 0.6 + smoothing , distance );

 // vec2 newNorm = vec2( 3. , 3. ) * lum;

  vec3 q0 = dFdx( vPos.xyz );
  vec3 q1 = dFdy( vPos.xyz );
  vec2 st0 = dFdx( vUv.st );
  vec2 st1 = dFdy( vUv.st );

  vec3 S = normalize(  q0 * st1.t - q1 * st0.t );
  vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
  vec3 N = normalize( vNorm );

//  vec2 offset = vec2(  timer * .000000442 , timer * .0000005345 );
  vec2 offset = vec2(  0. , 0. );


 
  vec3 mapN = normalize( (texture2D( t_normal,vUv*texScale).xyz * 2.0 - 1.0));


  mapN.xy = normalScale * (mapN.xy);// + newNorm);

  mat3 tsn = mat3( S, T, N );
  vec3 fNorm =  normalize( tsn * mapN ); 


  vec3 refl = reflect( vLightDir , fNorm );
  float reflFR = dot( -refl , normalize( vCamVec ) );

  vec3 a = texture2D( t_audio , vec2( abs(sin(dot( -vLightDir , fNorm )*1.)) , 0. ) ).xyz;

  //a *= abs(vec3( sin( a.x * 1. ) , sin( a.y * 1. ), sin( a.z * 1. ) )); 
  //a *= vec3( .6 , .9 , .8 ); 
  vec3 iri = texture2D( t_iri , vec2( abs(sin(reflFR*reflFR*10.)) , 0. ) ).xyz;

 /* vec3 refr = refract( normalize(-vCamVec) , vMNorm , custom1 );
  vec3 refl = reflect( normalize(-vCamVec) , vMNorm );

  vec4 l_refr = textureCube( t_refl , refr );
  vec4 l_refl = textureCube( t_refl , refl );


  vec4 l_cam = textureCube( t_refl , -vCamVec );
  float m = max( 0. , dot( normalize(vCamVec) , normalize(vMNorm) ));
  
  vec4 aC = texture2D( t_audio , vec2( m , 0. ) );
//  aC *= texture2D( t_audio , vec2( abs( refr.y ) , 0. ) );
//  aC *= texture2D( t_audio , vec2( abs( refr.z ) , 0. ) );


  vec4 r = vec4( 1. , 0. , 0. , 1. );
  vec4 b = vec4( 0. , 0. , 1. , 1. );

  vec4 c = mix( l_refr , l_refl , (1. -  m * m * m ));*/

  //vec4 c = mix( l_refr , l_refl , length( aC ) * (1. -m*m) / 2. );
 
  //float lu = max( 0. , dot( vCamVec , vMNorm ));
  float lu = abs(dot( vCamVec , vMNorm ));
  float luf = abs(dot( vCamVec , fNorm ));
  vec4 aC = texture2D( t_audio , vec2( luf , 0. ));
  vec4 aL = texture2D( t_audio , vec2( 1.-flag.r, 0. ));

  aL *= aL * aL;
  vec2 fSEM = semLookup( -vCamVec , fNorm );
 // vec4 c = mix( r , b , (1. -  m  ));
  //gl_FragColor = vec4( abs( vMNorm ) , 1. );//c + aC;// c * aC * custom3;
  //gl_FragColor = aC *(1.-lu*lu*lu); //* vec4(vUv.x , .1 , vUv.y , 1. );//c + aC;// c * aC * custom3;

  //vec3 iri = texture2D( t_iri , vec2( lu  , 0. ) ).xyz;
  
  //vec4 flag = texture2D( t_flag , vUv );
 // gl_FragColor =vec4( vec3(1.), 1. ) * lu * lu * lu; //* vec4(vUv.x , .1 , vUv.y , 1. );//c + aC;// c * aC * custom3;
  //gl_FragColor = aC * vec4( iri + vec3( 1.-flag.r), 1. ) * (1. - lu * lu * lu ); //* vec4(vUv.x , .1 , vUv.y , 1. );//c + aC;// c * aC * custom3;

  vec2 vDist = vec2( .5 , .5 ) - vUv;
/*  gl_FragColor =  (1. - fadeOut*length(vDist)) * aC * vec4( iri* (abs(vMNorm)+vec3(.7)) + vec3( 1.-flag.r), 1. ) * (1. - lu * lu * lu );
  */

   vec4 sem = texture2D( t_sem , fSEM );

  vec4 c = aC* vec4( fNorm * .5 + .5 , 1. ) + ( vec4( 1.-aC) )* sem * vec4( fNorm * .5 + .5 , 1. );
  gl_FragColor = (1. - fadeOut*length(vDist)) * c * flag.r + (1. - flag.r )*aL; //* vec4( fNorm , 1. );//* vec4( fNorm * .5 + .5 , 1. ));   
  
  /* (1. - fadeOut*length(vDist)) 
    * (pow( vFR, 30. ) * 1. * aC 
    + vec4( 0.5 * abs(normalize(fNorm)) + 0.7 , 1. ) 
    * sem 
    * vec4( vec3( 1.), 1. ) 
    +  vec4(1. - sem)
    * vec4( vec3( 1.-flag.r), 1. ));*/
  
  //gl_FragColor = vec4( 1. )* (1. - lu * lu * lu );
;
  
  
  
  //* vec4(vUv.x , .1 , vUv.y , 1. );//c + aC;// c * aC * custom3;
 // gl_FragColor = vec4( iri* (abs(vMNorm)+vec3(.7)) + vec3( 1.-flag.r), 1. ) * (1. - lu * lu * lu ); //* vec4(vUv.x , .1 , vUv.y , 1. );//c + aC;// c * aC * custom3;

 // gl_FragColor = vec4( flag.xyz , 1. )* (1. - lu * lu * lu );
  
}

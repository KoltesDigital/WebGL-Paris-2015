//==========================================================
//
//	メインルーチン
//
//==========================================================

//#define MIN_WIDTH 800

//#define MIN_HEIGHT 600

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function main( cScenes )
{
    document.getElementById("audiotag1").play();

    document.addEventListener("MSFullscreenError", function (evt) {
	  console.error("full screen error has occured " + evt.target);
	}, true);

	window.onresize = function() 
	{
	    renderer.setSize(window.innerWidth, window.innerHeight);
		
	    for( var i=0 ; i < cScenes.length ; i++ )
		{
			cScenes[i].camera.aspect = window.innerWidth / window.innerHeight;
			cScenes[i].camera.updateProjectionMatrix();
		}
	}

	 document.addEventListener("keydown", function(e) {
	  if (e.keyCode == 13) {
	    toggleFullScreen();	    
	  }
	}, false);

	toggleFullScreen();	   


    // レンダラの初期化
    var renderer = new THREE.WebGLRenderer({ antialias:true });
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

	// レンダリングが必要な初期化
    for( var i=0 ; i < cScenes.length ; i++ )
	{
		if( 'enter' in cScenes[i] )
		{
			cScenes[i].enter( renderer , cScenes[i].scene , cScenes[i].camera );
		}
	}

	// シーン取得
    var currentIx = -1;
    var current = null;
    var localBaseTime = +new Date;	
   
      function render() 
      {
        if( currentIx == -1 || ( +new Date - localBaseTime ) / 1000 >= current.duration )
        {
			if( currentIx < cScenes.length - 1 )
			{
				currentIx++;
             	current = cScenes[currentIx];
                localBaseTime = +new Date;
			}
        }

        requestAnimationFrame(render);
		var time = (+new Date - localBaseTime) / 1000;

		if( current.material.uniforms != null &&
			current.material.uniforms.time != null )
		{
	        current.material.uniforms.time.value = time;
		}

		if( 'calc' in current )
		{
			current.calc( current.scene, 
						  current.camera , 
						  time );
		}

		if( 'render' in current )
		{
			current.render( renderer , current.scene, current.camera , time );

		}
		else
		{
			renderer.render( current.scene, current.camera);
		}
      };
      render();

}

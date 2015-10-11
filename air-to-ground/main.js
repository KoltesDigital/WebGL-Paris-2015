(function(){
	$().ready(function(){
		if(demo.Config)
			kvg.Config = demo.Config;
		
		//init sound immediatly to trigger loading of sound.
   		kvg.sound.init();
		kvg.setup.init();
		kvg.debug.init();
		
	});
}());


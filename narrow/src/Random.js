//Namespace
this.wideload = this.wideload || {};


(function()
{
	var Random = function()
	{
		
	};
	
	var p = Random.prototype;
	
	Random.init = function(seed)
	{
		Random.seed = seed;
		Random.inited = true;
	}
	
	Random.next = function()
	{
		if(!Random.inited)
		{
			Random.init(1237);
		}
		var a    = 16807;      //ie 7**5
		var m    = 4294967295; //ie 2**31-1
		Random.seed = ((Random.seed * a))%m;
		return Random.seed;
	}

	Random.getRange = function(alku, loppu){
		//var rnd = Random.next();
		//return alku + rnd%(loppu-alku);
		var rnd = Random.nextFloat();
		return Math.floor(rnd*(loppu-alku));
	}

	Random.nextFloat = function()
	{
		if(!Random.inited)
		{
			Random.init(1237);
		}
		return Random.next()/4294967295;
	}
	//Expose
	wideload.Random = Random;
}())
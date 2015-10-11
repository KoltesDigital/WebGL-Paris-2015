// JavaScript source code

//Namespace
this.wideload = this.wideload || {};

(function(){

    var Configuration = function () { }
	
    var p = Configuration.prototype;
    
	//Music related configuration
	window.MUSIC_BEGIN = 500;
	
	window.BEATS_PER_MINUTE = 127;
	window.BEATS_PER_BAR = 4;
	window.TICKS_PER_BEAT = 12;
	
    //Expose
    wideload.Configuration = Configuration;
	
	var ts = wideload.TimeSig;
    
	//List of all parts. This list configures how the parts are inited & when are they running. They also get their total time ([0,1]) from difference between start & end.
	p.parts=[
		{
			part: "DemoName",
			begin: new ts(58,0,0),
			end: new ts(61,0,0)
		},
		
		{
			part: "BoxHit",
			begin: new ts(23,2,0),
			end: new ts(36,0,0)
		},
		
		
		{
			part: "Noise",
			begin: new ts(0,0,0),
			end: new ts(200,0,0)
		},

		{
			part: "Gears",
			begin: new ts(42,0,0),
			end: new ts(58,0,0)
		},
		{
			part: "Greets",
			begin: new ts(26,0,0),
			end: new ts(36,0,0)
		},
		{
			part: "Sun",
			begin: new ts(35,0,0),
			end: new ts(44,0,0)
		},
				{
			part: "Saturnus",
			begin: new ts(0,0,0),
			end: new ts(12,0,0)
		},
		{
			part: "Tubes",
			begin: new ts(11,0,0),
			end: new ts(24,0,0)
		},
		
		

/*
		{
			part: "Saturnus",
			begin: new ts(0,0,0),
			end: new ts(20,0,0)
		},*/
    ];
	
	//Configuration for how parts are rendered to three screens. Screens come from voronoi set. TODO - tool to map them
	p.rendering = [
		{	//Demo name
			begin: new ts(0,0,0), //in bars
			end: new ts(8,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(0,0,0), new ts(0,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [/* Full screen  */
				{s:0,uv: wideload.UVMapper.NATIVE},
				{s:1,uv: wideload.UVMapper.NATIVE},
				{s:2,uv: wideload.UVMapper.NATIVE},
				{s:3,uv: wideload.UVMapper.NATIVE},
				{s:4,uv: wideload.UVMapper.NATIVE},
				{s:5,uv: wideload.UVMapper.NATIVE},
				{s:6,uv: wideload.UVMapper.NATIVE},
				{s:7,uv: wideload.UVMapper.NATIVE},
				{s:8,uv: wideload.UVMapper.NATIVE},
				{s:9,uv: wideload.UVMapper.NATIVE},
				{s:10,uv: wideload.UVMapper.NATIVE},
				{s:11,uv: wideload.UVMapper.NATIVE},
				{s:12,uv: wideload.UVMapper.NATIVE},
				{s:13,uv: wideload.UVMapper.NATIVE},
				{s:14,uv: wideload.UVMapper.NATIVE},
				{s:15,uv: wideload.UVMapper.NATIVE},
				{s:16,uv: wideload.UVMapper.NATIVE},
				{s:17,uv: wideload.UVMapper.NATIVE},
				{s:18,uv: wideload.UVMapper.NATIVE},
				{s:19,uv: wideload.UVMapper.NATIVE},
				{s:20,uv: wideload.UVMapper.NATIVE},
				{s:21,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:23,uv: wideload.UVMapper.NATIVE},
				{s:24,uv: wideload.UVMapper.NATIVE},
				{s:25,uv: wideload.UVMapper.NATIVE},
				{s:26,uv: wideload.UVMapper.NATIVE},
				{s:27,uv: wideload.UVMapper.NATIVE},
				{s:28,uv: wideload.UVMapper.NATIVE},
				{s:29,uv: wideload.UVMapper.NATIVE},
				{s:30,uv: wideload.UVMapper.NATIVE},
				{s:31,uv: wideload.UVMapper.NATIVE},
				{s:32,uv: wideload.UVMapper.NATIVE},
				{s:33,uv: wideload.UVMapper.NATIVE},
				{s:34,uv: wideload.UVMapper.NATIVE},
				{s:35,uv: wideload.UVMapper.NATIVE},
				{s:36,uv: wideload.UVMapper.NATIVE},
				{s:37,uv: wideload.UVMapper.NATIVE},
				{s:38,uv: wideload.UVMapper.NATIVE},
				{s:39,uv: wideload.UVMapper.NATIVE},
				{s:40,uv: wideload.UVMapper.NATIVE},
				{s:41,uv: wideload.UVMapper.NATIVE},
				{s:42,uv: wideload.UVMapper.NATIVE},
				{s:43,uv: wideload.UVMapper.NATIVE},
				{s:44,uv: wideload.UVMapper.NATIVE},
				{s:45,uv: wideload.UVMapper.NATIVE},
				{s:46,uv: wideload.UVMapper.NATIVE},
				{s:47,uv: wideload.UVMapper.NATIVE},
				{s:48,uv: wideload.UVMapper.NATIVE},
				{s:49,uv: wideload.UVMapper.NATIVE}
				],
			part: "Saturnus" //Ref to id
		},
				{	//Box hit 30%
			begin: new ts(12,0,0), //in bars
			end: new ts(24,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [/* Full screen  */
				{s:0,uv: wideload.UVMapper.NATIVE},
				{s:1,uv: wideload.UVMapper.NATIVE},
				{s:2,uv: wideload.UVMapper.NATIVE},
				{s:3,uv: wideload.UVMapper.NATIVE},
				{s:4,uv: wideload.UVMapper.NATIVE},
				{s:5,uv: wideload.UVMapper.NATIVE},
				{s:6,uv: wideload.UVMapper.NATIVE},
				{s:7,uv: wideload.UVMapper.NATIVE},
				{s:8,uv: wideload.UVMapper.NATIVE},
				{s:9,uv: wideload.UVMapper.NATIVE},
				],
			part: "Tubes" //Ref to id
		},
		{	//box hit 60%	
			begin: new ts(11,2,0), //in bars
			end: new ts(24,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:10,uv: wideload.UVMapper.NATIVE},
				{s:11,uv: wideload.UVMapper.NATIVE},
				{s:12,uv: wideload.UVMapper.NATIVE},
				{s:13,uv: wideload.UVMapper.NATIVE},
				{s:14,uv: wideload.UVMapper.NATIVE},
				{s:15,uv: wideload.UVMapper.NATIVE},
				{s:16,uv: wideload.UVMapper.NATIVE},
				{s:17,uv: wideload.UVMapper.NATIVE},
				{s:18,uv: wideload.UVMapper.NATIVE},
				{s:19,uv: wideload.UVMapper.NATIVE},
				{s:20,uv: wideload.UVMapper.NATIVE},
				{s:21,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:23,uv: wideload.UVMapper.NATIVE},
				],
			part: "Tubes" //Ref to id
		},
		{	//box hit 100%	
			begin: new ts(11,0,0), //in bars
			end: new ts(24,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:24,uv: wideload.UVMapper.NATIVE},
				{s:25,uv: wideload.UVMapper.NATIVE},
				{s:26,uv: wideload.UVMapper.NATIVE},
				{s:27,uv: wideload.UVMapper.NATIVE},
				{s:28,uv: wideload.UVMapper.NATIVE},
				{s:29,uv: wideload.UVMapper.NATIVE},
				{s:30,uv: wideload.UVMapper.NATIVE},
				{s:31,uv: wideload.UVMapper.NATIVE},
				{s:32,uv: wideload.UVMapper.NATIVE},
				{s:33,uv: wideload.UVMapper.NATIVE},
				{s:34,uv: wideload.UVMapper.NATIVE},
				{s:35,uv: wideload.UVMapper.NATIVE},
				{s:36,uv: wideload.UVMapper.NATIVE},
				{s:37,uv: wideload.UVMapper.NATIVE},
				{s:38,uv: wideload.UVMapper.NATIVE},
				{s:39,uv: wideload.UVMapper.NATIVE},
				{s:40,uv: wideload.UVMapper.NATIVE},
				{s:41,uv: wideload.UVMapper.NATIVE},
				{s:42,uv: wideload.UVMapper.NATIVE},
				{s:43,uv: wideload.UVMapper.NATIVE},
				{s:44,uv: wideload.UVMapper.NATIVE},
				{s:45,uv: wideload.UVMapper.NATIVE},
				{s:46,uv: wideload.UVMapper.NATIVE},
				{s:47,uv: wideload.UVMapper.NATIVE},
				{s:48,uv: wideload.UVMapper.NATIVE},
				{s:49,uv: wideload.UVMapper.NATIVE}
				],
			part: "Tubes" //Ref to id
		},

		{	//Box hit 30%
			begin: new ts(23,0,0), //in bars
			end: new ts(36,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [/* Full screen  */
				{s:0,uv: wideload.UVMapper.NATIVE},
				{s:1,uv: wideload.UVMapper.NATIVE},
				{s:2,uv: wideload.UVMapper.NATIVE},
				{s:3,uv: wideload.UVMapper.NATIVE},
				{s:4,uv: wideload.UVMapper.NATIVE},
				{s:5,uv: wideload.UVMapper.NATIVE},
				{s:6,uv: wideload.UVMapper.NATIVE},
				{s:7,uv: wideload.UVMapper.NATIVE},
				{s:8,uv: wideload.UVMapper.NATIVE},
				{s:9,uv: wideload.UVMapper.NATIVE},
				],
			part: "BoxHit" //Ref to id
		},
		{	//box hit 60%	
			begin: new ts(23,2,0), //in bars
			end: new ts(36,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:10,uv: wideload.UVMapper.NATIVE},
				{s:11,uv: wideload.UVMapper.NATIVE},
				{s:12,uv: wideload.UVMapper.NATIVE},
				{s:13,uv: wideload.UVMapper.NATIVE},
				{s:14,uv: wideload.UVMapper.NATIVE},
				{s:15,uv: wideload.UVMapper.NATIVE},
				{s:16,uv: wideload.UVMapper.NATIVE},
				{s:17,uv: wideload.UVMapper.NATIVE},
				{s:18,uv: wideload.UVMapper.NATIVE},
				{s:19,uv: wideload.UVMapper.NATIVE},
				{s:20,uv: wideload.UVMapper.NATIVE},
				{s:21,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:23,uv: wideload.UVMapper.NATIVE},
				],
			part: "BoxHit" //Ref to id
		},
		{	//box hit 100%	
			begin: new ts(24,0,0), //in bars
			end: new ts(36,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:24,uv: wideload.UVMapper.NATIVE},
				{s:25,uv: wideload.UVMapper.NATIVE},
				{s:26,uv: wideload.UVMapper.NATIVE},
				{s:27,uv: wideload.UVMapper.NATIVE},
				{s:28,uv: wideload.UVMapper.NATIVE},
				{s:29,uv: wideload.UVMapper.NATIVE},
				{s:30,uv: wideload.UVMapper.NATIVE},
				{s:31,uv: wideload.UVMapper.NATIVE},
				{s:32,uv: wideload.UVMapper.NATIVE},
				{s:33,uv: wideload.UVMapper.NATIVE},
				{s:34,uv: wideload.UVMapper.NATIVE},
				{s:35,uv: wideload.UVMapper.NATIVE},
				{s:36,uv: wideload.UVMapper.NATIVE},
				{s:37,uv: wideload.UVMapper.NATIVE},
				{s:38,uv: wideload.UVMapper.NATIVE},
				{s:39,uv: wideload.UVMapper.NATIVE},
				{s:40,uv: wideload.UVMapper.NATIVE},
				{s:41,uv: wideload.UVMapper.NATIVE},
				{s:42,uv: wideload.UVMapper.NATIVE},
				{s:43,uv: wideload.UVMapper.NATIVE},
				{s:44,uv: wideload.UVMapper.NATIVE},
				{s:45,uv: wideload.UVMapper.NATIVE},
				{s:46,uv: wideload.UVMapper.NATIVE},
				{s:47,uv: wideload.UVMapper.NATIVE},
				{s:48,uv: wideload.UVMapper.NATIVE},
				{s:49,uv: wideload.UVMapper.NATIVE}
				],
			part: "BoxHit" //Ref to id
		},


		{	begin: new ts(26,0,1), //in bars
			end: new ts(36,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: function(timesig, sites, part){
				var to = [];
			//	if(this.last != timesig.bar)
				{
					var px = part.px;
					var py = part.py;
					
					this.last = timesig.bar;
					var clone = sites.slice(0);
					for(var i = 0; i < clone.length; i++)
					{
						var max = clone[i].plane.geometry.boundingBox.max;
						var min = clone[i].plane.geometry.boundingBox.min;
						var dx = Math.min( (max.x - px)*(max.x-px), (min.x-px)*(min.x-px));// Math.abs( sites[i].x - px);
						var dy = Math.min( (max.y - py)*(max.y-py), (min.y-py)*(min.y-py));
						
						var dist = Math.sqrt(dx+dy);
						if(dist < 250)
						{
							to.push({s:i, uv:wideload.UVMapper.NATIVE});
						}
					}
					this.old = to;
				}
				
				return this.old;
			},
			part: "Greets" //Ref to id
		},
		
		{	//sun	
			begin: new ts(35,2,0), //in bars
			end: new ts(44,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:10,uv: wideload.UVMapper.NATIVE},
				{s:11,uv: wideload.UVMapper.NATIVE},
				{s:12,uv: wideload.UVMapper.NATIVE},
				{s:13,uv: wideload.UVMapper.NATIVE},
				{s:14,uv: wideload.UVMapper.NATIVE},
				{s:15,uv: wideload.UVMapper.NATIVE},
				{s:16,uv: wideload.UVMapper.NATIVE},
				{s:17,uv: wideload.UVMapper.NATIVE},
				{s:18,uv: wideload.UVMapper.NATIVE},
				{s:19,uv: wideload.UVMapper.NATIVE},
				{s:20,uv: wideload.UVMapper.NATIVE},
				{s:21,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:23,uv: wideload.UVMapper.NATIVE},
				],
			part: "Sun" //Ref to id
		},
{	//sun	
			begin: new ts(35,3,0), //in bars
			end: new ts(44,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:0,uv: wideload.UVMapper.NATIVE},
				{s:1,uv: wideload.UVMapper.NATIVE},
				{s:2,uv: wideload.UVMapper.NATIVE},
				{s:3,uv: wideload.UVMapper.NATIVE},
				{s:4,uv: wideload.UVMapper.NATIVE},
				{s:5,uv: wideload.UVMapper.NATIVE},
				{s:6,uv: wideload.UVMapper.NATIVE},
				{s:7,uv: wideload.UVMapper.NATIVE},
				{s:8,uv: wideload.UVMapper.NATIVE},
				{s:9,uv: wideload.UVMapper.NATIVE},
				],
			part: "Sun" //Ref to id
		},
{	//sun	
			begin: new ts(36,0,0), //in bars
			end: new ts(44,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [
				{s:24,uv: wideload.UVMapper.NATIVE},
				{s:25,uv: wideload.UVMapper.NATIVE},
				{s:26,uv: wideload.UVMapper.NATIVE},
				{s:27,uv: wideload.UVMapper.NATIVE},
				{s:28,uv: wideload.UVMapper.NATIVE},
				{s:29,uv: wideload.UVMapper.NATIVE},
				{s:30,uv: wideload.UVMapper.NATIVE},
				{s:31,uv: wideload.UVMapper.NATIVE},
				{s:32,uv: wideload.UVMapper.NATIVE},
				{s:33,uv: wideload.UVMapper.NATIVE},
				{s:34,uv: wideload.UVMapper.NATIVE},
				{s:35,uv: wideload.UVMapper.NATIVE},
				{s:36,uv: wideload.UVMapper.NATIVE},
				{s:37,uv: wideload.UVMapper.NATIVE},
				{s:38,uv: wideload.UVMapper.NATIVE},
				{s:39,uv: wideload.UVMapper.NATIVE},
				{s:40,uv: wideload.UVMapper.NATIVE},
				{s:41,uv: wideload.UVMapper.NATIVE},
				{s:42,uv: wideload.UVMapper.NATIVE},
				{s:43,uv: wideload.UVMapper.NATIVE},
				{s:44,uv: wideload.UVMapper.NATIVE},
				{s:45,uv: wideload.UVMapper.NATIVE},
				{s:46,uv: wideload.UVMapper.NATIVE},
				{s:47,uv: wideload.UVMapper.NATIVE},
				{s:48,uv: wideload.UVMapper.NATIVE},
				{s:49,uv: wideload.UVMapper.NATIVE}
				],
			part: "Sun" //Ref to id
		},

				{	begin: new ts(42,0,0), //in bars
			end: new ts(58,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: function(timesig, sites, part){
				var to = [];
			//	if(this.last != timesig.bar)
				{
					var px = -1280/2;
					var py = 0;
					var b = new ts(42,0,0).toMilliseconds();
					var e = new ts(44,0,0).toMilliseconds();
					this.last = timesig.bar;
					var clone = sites.slice(0);
					var d = e-b;
					var t = (timesig.toMilliseconds()-b)/d;
					for(var i = 0; i < clone.length; i++)
					{
						if(sites[i].x+1280/2 < t*1280 && (timesig.beat%2 == 0 || clone[i].ingears))
						{
							clone[i].ingears = true;
							to.push({s:i, uv:wideload.UVMapper.NATIVE});
						}
					}
					this.old = to;
				}
				
				return this.old;
			},
			part: "Gears" //Ref to id
		},

		{	//Demo name
			begin: new ts(58,0,0), //in bars
			end: new ts(62,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(58,0,0), new ts(58,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(59,0,0), new ts(60,0,0), 0xffffff), //As above but out
			to: [/* Full screen  */
				{s:0,uv: wideload.UVMapper.NATIVE},
				{s:1,uv: wideload.UVMapper.NATIVE},
				{s:2,uv: wideload.UVMapper.NATIVE},
				{s:3,uv: wideload.UVMapper.NATIVE},
				{s:4,uv: wideload.UVMapper.NATIVE},
				{s:5,uv: wideload.UVMapper.NATIVE},
				{s:6,uv: wideload.UVMapper.NATIVE},
				{s:7,uv: wideload.UVMapper.NATIVE},
				{s:8,uv: wideload.UVMapper.NATIVE},
				{s:9,uv: wideload.UVMapper.NATIVE},
				{s:10,uv: wideload.UVMapper.NATIVE},
				{s:11,uv: wideload.UVMapper.NATIVE},
				{s:12,uv: wideload.UVMapper.NATIVE},
				{s:13,uv: wideload.UVMapper.NATIVE},
				{s:14,uv: wideload.UVMapper.NATIVE},
				{s:15,uv: wideload.UVMapper.NATIVE},
				{s:16,uv: wideload.UVMapper.NATIVE},
				{s:17,uv: wideload.UVMapper.NATIVE},
				{s:18,uv: wideload.UVMapper.NATIVE},
				{s:19,uv: wideload.UVMapper.NATIVE},
				{s:20,uv: wideload.UVMapper.NATIVE},
				{s:21,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:22,uv: wideload.UVMapper.NATIVE},
				{s:23,uv: wideload.UVMapper.NATIVE},
				{s:24,uv: wideload.UVMapper.NATIVE},
				{s:25,uv: wideload.UVMapper.NATIVE},
				{s:26,uv: wideload.UVMapper.NATIVE},
				{s:27,uv: wideload.UVMapper.NATIVE},
				{s:28,uv: wideload.UVMapper.NATIVE},
				{s:29,uv: wideload.UVMapper.NATIVE},
				{s:30,uv: wideload.UVMapper.NATIVE},
				{s:31,uv: wideload.UVMapper.NATIVE},
				{s:32,uv: wideload.UVMapper.NATIVE},
				{s:33,uv: wideload.UVMapper.NATIVE},
				{s:34,uv: wideload.UVMapper.NATIVE},
				{s:35,uv: wideload.UVMapper.NATIVE},
				{s:36,uv: wideload.UVMapper.NATIVE},
				{s:37,uv: wideload.UVMapper.NATIVE},
				{s:38,uv: wideload.UVMapper.NATIVE},
				{s:39,uv: wideload.UVMapper.NATIVE},
				{s:40,uv: wideload.UVMapper.NATIVE},
				{s:41,uv: wideload.UVMapper.NATIVE},
				{s:42,uv: wideload.UVMapper.NATIVE},
				{s:43,uv: wideload.UVMapper.NATIVE},
				{s:44,uv: wideload.UVMapper.NATIVE},
				{s:45,uv: wideload.UVMapper.NATIVE},
				{s:46,uv: wideload.UVMapper.NATIVE},
				{s:47,uv: wideload.UVMapper.NATIVE},
				{s:48,uv: wideload.UVMapper.NATIVE},
				{s:49,uv: wideload.UVMapper.NATIVE}
				],
			part: "DemoName" //Ref to id
		},
				


	]
	
	/**-------------------------------------
	-- POST PROCESSING SYNC POINTS BELOW ---
	--------------------------------------*/
	
	p.rgbShifts = [
		new ts(5,1,0),
		new ts(6,1,0),
		new ts(7,1,0),
		new ts(8,1,0),
		new ts(9,1,0),
		new ts(10,1,0),
		new ts(11,1,0),
		new ts(12,1,0),
		new ts(13,1,0),
		new ts(14,1,0),
		new ts(15,1,0),
		new ts(16,1,0),
		new ts(17,1,0),
		new ts(18,1,0),
		new ts(19,1,0),
		new ts(20,1,0),
		new ts(21,1,0),
		new ts(22,1,0),
		new ts(23,1,0),
		new ts(24,1,0),
		new ts(25,1,0),
		new ts(26,1,0),
		new ts(27,1,0),
		new ts(28,1,0),
		new ts(29,1,0),
		new ts(30,1,0),
		new ts(31,1,0),
		new ts(32,1,0),
		new ts(33,1,0),
		new ts(34,1,0),
		new ts(35,1,0),
		new ts(36,1,0),
		new ts(36,3,0),
		new ts(37,1,0),
		new ts(37,3,0),
		new ts(38,1,0),
		new ts(38,3,0),
		new ts(39,1,0),
		new ts(39,3,0),
		new ts(40,1,0),
		new ts(40,3,0),
		new ts(41,1,0),
		new ts(41,3,0),
		new ts(42,1,0),
		new ts(42,3,0),
		new ts(43,1,0),
		new ts(43,3,0),
		new ts(44,1,0),
		new ts(44,3,0),
		new ts(45,1,0),
		new ts(45,3,0),
		new ts(46,1,0),
		new ts(46,3,0),
		new ts(47,1,0),
		new ts(47,3,0),
		new ts(48,1,0),
		new ts(48,3,0),
		new ts(49,1,0),
		new ts(49,3,0),
		new ts(50,1,0),
		new ts(50,3,0),
		new ts(51,1,0),
		new ts(51,3,0),
		new ts(52,1,0),
		new ts(52,3,0),
		new ts(53,1,0),
		new ts(53,3,0),
		new ts(54,1,0),
		new ts(54,3,0),
		new ts(55,1,0),
		new ts(55,3,0),
		new ts(56,1,0),
		new ts(56,3,0),
		new ts(57,1,0),
		new ts(57,3,0),
		new ts(58,1,0),
		new ts(58,3,0),
		new ts(59,1,0),
		new ts(59,3,0),
		new ts(60,1,0),
		new ts(60,3,0),
		new ts(61,1,0),
		new ts(61,3,0),
		new ts(62,1,0),
		new ts(62,3,0),
		new ts(63,1,0),
		new ts(63,3,0),
		new ts(64,1,0),
		new ts(64,3,0),
		new ts(65,1,0),
		new ts(65,3,0),
		new ts(66,1,0),
		new ts(66,3,0),
		new ts(67,1,0),
		new ts(67,3,0),
		new ts(68,1,0),
		new ts(68,3,0),
		new ts(69,1,0),
		new ts(69,3,0),
		new ts(70,1,0),
		new ts(70,3,0),
		new ts(71,1,0),
		new ts(71,3,0),
		new ts(72,1,0),
		new ts(72,3,0),
		new ts(73,1,0),
		new ts(73,3,0),
		new ts(74,1,0),
		new ts(74,3,0),
		new ts(75,1,0),
		new ts(75,3,0),
		new ts(76,1,0),
		new ts(76,3,0),
		new ts(77,1,0),
		new ts(77,3,0),
		new ts(78,1,0),
		new ts(78,3,0),
		new ts(79,1,0),
		new ts(79,3,0),
		new ts(80,1,0),
		new ts(80,3,0),
		new ts(81,1,0),
		new ts(81,3,0),
		new ts(82,1,0),
		new ts(82,3,0),
		new ts(83,1,0),
		new ts(83,3,0),
		new ts(84,1,0),
		new ts(84,3,0),
		new ts(85,1,0),
		new ts(85,3,0),
	];

	p.invert = [
		new ts(52,0,0),
		new ts(52,2,32),
		new ts(53,0,0),
		new ts(54,0,0),
		new ts(54,2,32),
		new ts(55,0,0),
		new ts(68,0,0),
		new ts(68,2,32),
		new ts(69,0,0),
		new ts(70,0,0),
		new ts(70,2,32),
		new ts(71,0,0),
		new ts(72,0,0),
		new ts(74,0,0),
		new ts(75,2,32),
		new ts(76,0,0),
		new ts(78,0,0),
		new ts(79,2,32),
		new ts(80,0,0),
	];
	
	p.screenOff = [

	];
	
	p.pixelate = [
		
	];
	
	p.init = function()
	{
		//preprocessing
		for(var i = 0; i < this.rendering.length; i++)
		{
			var conf = this.rendering[i];
			for(var j = 0; j < conf.to.length; j++)
			{
				var to = conf.to[j];
				//TODO - calculate translate matrix.
				//var matrix = 
					
			}
		
		}
	}
    
}());

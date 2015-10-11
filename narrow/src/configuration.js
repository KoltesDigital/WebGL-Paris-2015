// JavaScript source code

//Namespace
this.wideload = this.wideload || {};

(function(){

    var Configuration = function () { }

    var p = Configuration.prototype;
    
	//Music related configuration
	window.MUSIC_BEGIN = 500;
	
	window.BEATS_PER_MINUTE = 162;
	window.BEATS_PER_BAR = 4;
	window.TICKS_PER_BEAT = 64;
	
    //Expose
    wideload.Configuration = Configuration;
	
	var wps = musicDreamEnd; // WalkingMan part start (44100)
    var dreampart = 6500;
	p.charSpeed = 20;

	var ts = wideload.TimeSig;
    
	//List of all parts. This list configures how the parts are inited & when are they running. They also get their total time ([0,1]) from difference between start & end.
	p.parts=[
		{
			part: "PartName",
			begin: new ts(0,0,0),
			end: new ts(4,0,0)
		},
    	{	part: "Desert", //Part id
			begin: new ts(4,0,0), //Start time in bars
			end: new ts(20,0,0) //End time in bars
		},
		{	part: "Desert", //Part id
			begin: new ts(20,0,0), //Start time in bars
			end: new ts(36,0,0) //End time in bars
		},
		{	part: "Tubes", //Part id
			begin: new ts(34,0,0), //Start time in bars
			end: new ts(68,0,0) //End time in bars
		},
		{	part: "Tubes", //Part id
			begin: new ts(68,0,0), //Start time in bars
			end: new ts(86,0,0) //End time in bars
		},

		{	part: "TempPart", //Part id
			begin: new ts(1,0,0), //Start time in bars
			end: new ts(1600,0,0) //End time in bars
		},
		{	part: "Coins", //Part id
			begin: new ts(68,0,0), //Start time in bars
			end: new ts(86,0,0) //End time in bars
		},
		
		
    ];
	
	//Configuration for how parts are rendered to three "screens". Screens are 1,2,3 in order from left to right.
	p.rendering = [
	/*	{	begin: new ts(0,0,0), //in bars
			end: new ts(54,0,0), //in bars
			override:true,
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(0,0,0), new ts(0,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(113,2,0), new ts(4,0,0), 0xFFFFFF), //As above but out
			to: [
			//	{s:0,uv: wideload.UVMapper.LEFT},
				{s:1,uv: wideload.UVMapper.MIDDLE},
			//	{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Coins" //Ref to id
		},*/
		//READY PARTS - no touchies, test above
		{	begin: new ts(0,0,0), //in bars
			end: new ts(4,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(0,0,0), new ts(0,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(3,2,0), new ts(4,0,0), 0xFFFFFF), //As above but out
			to: [
				{s:1,uv: wideload.UVMapper.MIDDLE}
			],
			part: "PartName" //Ref to id
		},
		{	begin: new ts(4,0,0), //in bars
			end: new ts(20,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(4,0,0), new ts(4,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(19,2,0), new ts(20,0,0), 0xFFFFFF), //As above but out
			to: [	
					{s:1,uv: wideload.UVMapper.MIDDLE, rt:0},
					//{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id
		},
		{	begin: new ts(17,0,0), //in bars
			end: new ts(20,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(17,0,0), new ts(17,4,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(19,2,0), new ts(20,0,0), 0xFFFFFF), //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.MIDDLE, rt:1},
					//{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id
		},
		{	begin: new ts(12,0,0), //in bars
			end: new ts(20,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(10,0,0), new ts(10,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(19,2,0), new ts(20,0,0), 0xFFFFFF), //As above but out
			to: [	
					{s:2,uv: wideload.UVMapper.MIDDLE, rt:2},
					//{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id
		},
		
		{	begin: new ts(20,0,0), //in bars
			end: new ts(36,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(20,0,0), new ts(20,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(35,2,0), new ts(36,0,0), 0xFFFFFF), //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id
		},
		{	begin: new ts(24,0,0), //in bars
			end: new ts(32,2,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(24,0,0), new ts(24,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(32,0,0), new ts(32,2,0), 0xFFFFFF), //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					//{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "PartName" //Ref to id
		},
		{	begin: new ts(25,0,0), //in bars
			end: new ts(33,2,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(25,0,0), new ts(25,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0, new ts(33,0,0), new ts(33,2,0), 0xFFFFFF), //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					//{s21,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "PartName" //Ref to id
		},
		{	begin: new ts(34,0,0), //in bars
			end: new ts(52,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(34,0,0), new ts(34,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					//{s21,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(35,0,0), //in bars
			end: new ts(52,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(35,0,0), new ts(35,2,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					//{s21,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(36,0,0), //in bars
			end: new ts(52,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(36,0,0), new ts(36,1,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
		//	hideBorders:true,
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					//{s21,uv: wideload.UVMapper.MIDDLE},
					{s:1,uv: wideload.UVMapper.MIDDLE}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(38,0,0), //in bars
			end: new ts(42,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(39,0,0), //in bars
			end: new ts(40,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(40,0,0), //in bars
			end: new ts(42,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(42,0,0), //in bars
			end: new ts(44,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},

		{	begin: new ts(44,0,0), //in bars
			end: new ts(52,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(46,0,0), //in bars
			end: new ts(47,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		
		
		
		//EXCAN Tubes
		{	begin: new ts(47,0,0), //in bars
			end: new ts(48,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.MIDDLE},
					{s:1,uv: wideload.UVMapper.LEFT},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(48,0,0), //in bars
			end: new ts(50,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(50,0,0), //in bars
			end: new ts(52,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.LEFT},
					{s:2,uv: wideload.UVMapper.MIDDLE}
			],
			part: "Tubes" //Ref to id
		},

		{	begin: new ts(52,0,0), //in bars
			end: new ts(54,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(54,0,0), //in bars
			end: new ts(56,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(56,0,0), //in bars
			end: new ts(58,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.LEFT},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(58,0,0), //in bars
			end: new ts(62,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(62,0,0), //in bars
			end: new ts(64,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.RIGHT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(64,0,0), //in bars
			end: new ts(65,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.MIDDLE},
					{s:1,uv: wideload.UVMapper.RIGHT},
					{s:2,uv: wideload.UVMapper.LEFT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(65,0,0), //in bars
			end: new ts(66,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.MIDDLE},
					{s:1,uv: wideload.UVMapper.RIGHT},
					{s:2,uv: wideload.UVMapper.MIDDLE}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(66,0,0), //in bars
			end: new ts(67,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.MIDDLE},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.MIDDLE}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(67,0,0), //in bars
			end: new ts(68,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
				//	{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(67,0,0), //in bars
			end: new ts(68,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0xFFFFFF, new ts(67,2,0), new ts(68,0,0), 0xFFFFFF), //As above but out
			hideBorders:true,
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
				//	{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(67,0,0), //in bars
			end: new ts(68,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0xFFFFFF, new ts(67,2,0), new ts(68,0,0), 0xFFFFFF), //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(67,0,0), //in bars
			end: new ts(68,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.RIGHT,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(67,0,0), //in bars
			end: new ts(68,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(68,0,0), //in bars
			end: new ts(72,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.MIDDLE,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(68,0,0), //in bars
			end: new ts(72,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.LEFT,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		
		{	begin: new ts(72,0,0), //in bars
			end: new ts(76,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.LEFT,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(72,0,0), //in bars
			end: new ts(76,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.MIDDLE,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(76,0,0), //in bars
			end: new ts(80,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.LEFT,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(76,0,0), //in bars
			end: new ts(80,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.MIDDLE,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(80,0,0), //in bars
			end: new ts(86,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(84,0,0), new ts(85,2,0), 0xFFFFFF), //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:0,uv: wideload.UVMapper.MIDDLE,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		{	begin: new ts(80,0,0), //in bars
			end: new ts(86,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(84,0,0), new ts(85,2,0), 0xFFFFFF), //As above but out
			hideBorders:true,
			to: [	
				//	{s:0,uv: wideload.UVMapper.LEFT},
				//	{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.MIDDLE,tint:0xFFFFFF}
			],
			part: "Tubes" //Ref to id
		},
		
		
		
		
		{	begin: new ts(68,0,0), //in bars
			end: new ts(86,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: wideload.intros.FadeToColor(0x0, new ts(84,0,0), new ts(85,2,0), 0xFFFFFF), //As above but out
			to: [
			//	{s:0,uv: wideload.UVMapper.LEFT},
				{s:1,uv: wideload.UVMapper.MIDDLE},
			//	{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Coins" //Ref to id
		},
		
		{	begin: new ts(86,0,0), //in bars
			end: new ts(95,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(86,0,0), new ts(86,1,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:0,uv: wideload.UVMapper.LEFT}
			],
			part: "PartName" //Ref to id
		},
		
		
		
		
		/*
		
		
		
		{	begin: new ts(1,0,0), //in bars
			end: new ts(4,0,0), //in bars
			intro: wideload.intros.FadeToColor(0xFFFFFF, new ts(1,0,0), new ts(1,1,0), 0x0), //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id
		},
		{	begin: new ts(4,0,0), //in bars
			end: new ts(12,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Desert" //Ref to id			
		},
		{	begin: new ts(12,0,0), //in bars
			end: new ts(13,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},	
					{s:1,uv: wideload.UVMapper.MIDDLE},
					//{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "PartName" //Ref to id			
		},
		{	begin: new ts(13,0,0), //in bars
			end: new ts(16,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},	
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id			
		},
		{	begin: new ts(16,0,0), //in bars
			end: new ts(24,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},	
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "Tubes" //Ref to id			
		},
		{	begin: new ts(24,0,0), //in bars
			end: new ts(25,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					//{s:0,uv: wideload.UVMapper.LEFT},	
					//{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "PartName" //Ref to id			
		},
		{	begin: new ts(25,0,0), //in bars
			end: new ts(36,0,0), //in bars
			intro: null, //function to handle screen appearing (for example alpha 0->1)
			outro: null, //As above but out
			to: [	
					{s:0,uv: wideload.UVMapper.LEFT},	
					{s:1,uv: wideload.UVMapper.MIDDLE},
					{s:2,uv: wideload.UVMapper.RIGHT}
			],
			part: "TempPart" //Ref to id			
		},


*/
	]
	
	
	p.rgbShifts = [
	//	new ts(1,1,0),
	//	new ts(2,1,0),
	//	new ts(3,1,0),
	//	new ts(4,1,0),
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
		new ts(39,3,0),
		new ts(39,3,32),

		new ts(40,0,32),
		new ts(40,1,32),
		new ts(41,0,32),
		new ts(41,1,32),
		new ts(42,0,32),
		new ts(42,1,32),
		new ts(43,1,0),
		new ts(43,2,0),
		new ts(43,3,0),
		new ts(43,3,32),

		new ts(44,0,32),
		new ts(44,1,32),
		new ts(45,0,32),
		new ts(45,1,32),
		new ts(46,0,32),
		new ts(46,1,32),
		new ts(47,1,0),
		new ts(47,2,0),
		new ts(47,3,0),
		new ts(47,3,32),

		new ts(48,0,32),
		new ts(48,1,32),
		new ts(49,0,32),
		new ts(49,1,32),
		new ts(50,0,32),
		new ts(50,1,32),
		new ts(51,1,0),
		new ts(51,2,0),
		new ts(51,3,0),
		new ts(51,3,32),
		
		new ts(52,0,32),
		new ts(52,1,32),
		new ts(53,0,32),
		new ts(53,1,32),
		new ts(54,0,32),
		new ts(54,1,32),
		new ts(55,1,0),
		new ts(55,2,0),
		new ts(55,3,0),
		new ts(55,3,32),

		new ts(56,0,32),
		new ts(56,1,32),
		new ts(57,0,32),
		new ts(57,1,32),
		new ts(58,0,32),
		new ts(58,1,32),
		new ts(59,1,0),
		new ts(59,2,0),
		new ts(59,3,0),
		new ts(59,3,32),

		new ts(60,0,32),
		new ts(60,1,32),
		new ts(61,0,32),
		new ts(61,1,32),
		new ts(62,0,32),
		new ts(62,1,32),
		new ts(63,1,0),
		new ts(63,2,0),
		new ts(63,3,0),
		new ts(63,3,32),
		
		new ts(64,0,32),
		new ts(64,1,32),
		new ts(65,0,32),
		new ts(65,1,32),
		new ts(66,0,32),
		new ts(66,1,32),
		new ts(67,1,0),
		new ts(67,2,0),
		new ts(67,3,0),
		new ts(67,3,32),


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

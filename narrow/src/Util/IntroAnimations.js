/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	wideload.intros = {}
	
	wideload.intros.FadeToColor = function(color, start, end, tint){
	//	console.log(color);
		var f = function(time, panel){
			var startMS = start.toMilliseconds();
			var endMS = end.toMilliseconds();
			var phase = (time-startMS) / (endMS-startMS);
			var cr = (color & 0xFF0000)	>> 16;
			var cg = (color & 0x00FF00)	>> 8;
			var cb = (color & 0xFF);
			
			var tr = (tint & 0xFF0000)	>> 16;
			var tg = (tint & 0x00FF00)	>> 8;
			var tb = (tint & 0xFF);
			
			var colorr = tr * (1-phase) + cr* (phase);
			var colorg = tg * (1-phase) + cg* (phase);
			var colorb = tb * (1-phase) + cb* (phase);
			var col = ((~~colorr) << 16) + ((~~colorg) << 8) + (~~colorb);
		//	console.log(col);
			if(time > endMS)
				panel.material.color.setHex( tint);
			else
				panel.material.color.setHex( col);
		}
		
		f.begin = start;
		f.end = end;
		return f;
	}
})();
/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var TimeSig = function(bar, beat, tick){
		this.bar = bar;
		this.beat = beat;
		this.tick = tick;
	}


	var p = TimeSig.prototype;
	wideload.TimeSig = TimeSig;
	
	p.fromTime = function(time)
	{
		var totalBeats = BEATS_PER_MINUTE * time;
		this.bar = Math.floor( totalBeats/BEATS_PER_BAR);
		this.beat = Math.floor( totalBeats % BEATS_PER_BAR);
		this.tick = Math.floor((totalBeats-Math.floor(totalBeats))* TICKS_PER_BEAT);
		
		return this;
	}

	p.isInside = function(begin,end){
		return (this.isSmallerThan(end) && this.isLargerThan(begin));
	}

	p.isSmallerThan = function(other)
	{
		var ticks = this.bar * BEATS_PER_BAR * TICKS_PER_BEAT + this.beat * TICKS_PER_BEAT + this.tick;
		var tickso = other.bar * BEATS_PER_BAR * TICKS_PER_BEAT + other.beat * TICKS_PER_BEAT + other.tick;
		return ticks < tickso;
	}

	p.isLargerThan = function(other)
	{
		var ticks = this.bar * BEATS_PER_BAR * TICKS_PER_BEAT + this.beat * TICKS_PER_BEAT + this.tick;
		var tickso = other.bar * BEATS_PER_BAR * TICKS_PER_BEAT + other.beat * TICKS_PER_BEAT + other.tick;
		return ticks >= tickso;	
	}

	p.toMilliseconds = function()
	{
		return (this.bar * BEATS_PER_BAR / BEATS_PER_MINUTE + this.beat/BEATS_PER_MINUTE + this.tick/TICKS_PER_BEAT / BEATS_PER_MINUTE)*60*1000;
	}
	
	p.equals = function(other){
		var ticks = this.bar * BEATS_PER_BAR * TICKS_PER_BEAT + this.beat * TICKS_PER_BEAT + this.tick;
		var tickso = other.bar * BEATS_PER_BAR * TICKS_PER_BEAT + other.beat * TICKS_PER_BEAT + other.tick;
		return ticks == tickso;
	}
	
	p.clone = function()
	{
		return new TimeSig(this.bar, this.beat, this.tick);
	}
	
})();


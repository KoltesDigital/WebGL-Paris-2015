/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var UVMapper = {}
	wideload.UVMapper = UVMapper;
	
	UVMapper.setUvMap = function(map, mesh)
	{
		var calc = false;
		if(map == UVMapper.NATIVE || map == UVMapper.NATIVE_FULL)
		{
			calc = true;
			map = map(mesh.geometry);
			mesh.geometry.faceVertexUvs[0] = map;
		}
		else if(map == null)
		{
			map = UVMapper.FULL;
		}
		if(!calc)
		{
			mesh.geometry.faceVertexUvs[0][0] = [
				map[0], map[3], map[1]
			];
			mesh.geometry.faceVertexUvs[0][1] = [ 
					map[3], map[2],map[1]
			];
		}
		mesh.geometry.uvsNeedUpdate = true;
		//mesh.geometry.needsUpdate = true;
	}
	UVMapper.NATIVE_FULL = function(geometry){
		
		//TODO - code that calculates the mapping from given geometry.
		geometry.computeBoundingBox();
		var max = geometry.boundingBox.max,
			min = geometry.boundingBox.min;
		
		var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
		var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
		var uv = [];
		var faces = geometry.faces;
		//console.log(max.x + ","+max.y+" -- " + min.x+","+min.y);
		for (i = 0; i < faces.length ; i++) {
			
			var v1 = geometry.vertices[faces[i].a], v2 = geometry.vertices[faces[i].b], v3 = geometry.vertices[faces[i].c];
			
			uv.push(
				[
					new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
					new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
					new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
				
				]);
			
		}
		return uv;
	}
	UVMapper.NATIVE = function(geometry){
		
		//TODO - code that calculates the mapping from given geometry.
		geometry.computeBoundingBox();
		var max = geometry.boundingBox.max,
			min = geometry.boundingBox.min;
		
		var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
		offset.x = 1280/2;
		offset.y = 720/2;
		var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
		range.x = 1280;
		range.y = 720;
		var uv = [];
		var faces = geometry.faces;
		//console.log(max.x + ","+max.y+" -- " + min.x+","+min.y);
		for (i = 0; i < faces.length ; i++) {
			
			var v1 = geometry.vertices[faces[i].a], v2 = geometry.vertices[faces[i].b], v3 = geometry.vertices[faces[i].c];
			
			uv.push(
				[
					new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
					new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
					new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
				
				]);
			
		}
		return uv;
	}
	
	UVMapper.LEFT = [
			new THREE.Vector2( 0, 1), //Bottom left
			new THREE.Vector2( 0.3333333333, 1), //Bottom right
			new THREE.Vector2( 0.3333333333, 0), //Top right
			new THREE.Vector2( 0,0) //Top left
	];
	UVMapper.RIGHT = [
			new THREE.Vector2( 0.6666666666, 1), //Bottom left
			new THREE.Vector2( 1, 1), //Bottom right
			new THREE.Vector2( 1, 0), //Top right
			new THREE.Vector2( 0.6666666666,0) //Top left
	];
	UVMapper.MIDDLE = [
			new THREE.Vector2( 0.3333333333, 1), //Bottom left
			new THREE.Vector2( 0.666666666, 1), //Bottom right
			new THREE.Vector2( 0.6666666666, 0), //Top right
			new THREE.Vector2( 0.333333333,0) //Top left
	];
	
	UVMapper.LEFT10 = [
			new THREE.Vector2( 0.05, 1), //Bottom left
			new THREE.Vector2( 0.38, 1), //Bottom right
			new THREE.Vector2( 0.38, 0), //Top right
			new THREE.Vector2( 0.05,0) //Top left
	];
	UVMapper.RIGHT10 = [
			new THREE.Vector2( 0.61, 1), //Bottom left
			new THREE.Vector2( 0.95, 1), //Bottom right
			new THREE.Vector2( 0.95, 0), //Top right
			new THREE.Vector2( 0.61,0) //Top left
	];
	UVMapper.FULL = [
				new THREE.Vector2( 0.0, 1), //Bottom left
				new THREE.Vector2( 1, 1), //Bottom right
				new THREE.Vector2( 1, 0), //Top right
				new THREE.Vector2( 0,0) //Top left
		];

	UVMapper.customPosition = function(xBegin, yBegin, xEnd, yEnd)
	{
		//TODO - extend to support any polygons, currently only squares supported
		return [
			new THREE.Vector2( xBegin, yEnd), //Bottom left
			new THREE.Vector2( xEnd, yEnd), //Bottom right
			new THREE.Vector2( xEnd, yBegin), //Top right
			new THREE.Vector2( xBegin,yBegin) //Top left
		];
	}
	
})();


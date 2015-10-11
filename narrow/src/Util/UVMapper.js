/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var UVMapper = {}
	wideload.UVMapper = UVMapper;
	
	UVMapper.setUvMap = function(map, mesh)
	{
		mesh.geometry.faceVertexUvs[0][0] = [
			map[0], map[3], map[1]
//			lefts[0], lefts[3], lefts[1]
		];
		mesh.geometry.faceVertexUvs[0][1] = [ 
				map[3], map[2],map[1]
//		lefts[3],lefts[2], lefts[1]
		];
		mesh.geometry.uvsNeedUpdate = true;
		//mesh.geometry.needsUpdate = true;
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
		return [
			new THREE.Vector2( xBegin, yEnd), //Bottom left
			new THREE.Vector2( xEnd, yEnd), //Bottom right
			new THREE.Vector2( xEnd, yBegin), //Top right
			new THREE.Vector2( xBegin,yBegin) //Top left
		];
	}
	
})();


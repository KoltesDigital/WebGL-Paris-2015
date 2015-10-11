function getTunnel(){
    
    var SEGMENTS = 5,
        _segmentSpace = (Math.PI / SEGMENTS) / 10, //(Math.PI / SEGMENTS) is the maxWidth of a segment
        _segmentWidth = (Math.PI - ((SEGMENTS - 1) * _segmentSpace)) / SEGMENTS;
    
    var _tunnel = [];
    
    var _innerCenterX = 0,
        _outerCenterX = _innerCenterX,
        
        _innerCenterY = 0,
        _outerCenterY = _innerCenterY;
    
    var _outerRadius = 1,
        _innerRadius = .95;
    
    var _angleOffset = 0;
    
    for(var i = 0; i < SEGMENTS; i += 1){
    
        var segmentPoints = [];
        
        var spaceOffset = i * _segmentSpace;
        
        segmentPoints.push(
            {
                "x": (Math.cos(i * _segmentWidth + spaceOffset) * _innerRadius) + _innerCenterX,
                "y": (Math.sin(i * _segmentWidth + spaceOffset) * _innerRadius) + _innerCenterY
            }
        );
        
        //inner next
        segmentPoints.push(
            {
                "x": (Math.cos((i + 1) * _segmentWidth + spaceOffset) * _innerRadius) + _innerCenterX,
                "y": (Math.sin((i + 1) * _segmentWidth + spaceOffset) * _innerRadius) + _innerCenterY
            }
        );
        
        //outer next
        segmentPoints.push(
            {
                "x": (Math.cos((i + 1) * _segmentWidth + spaceOffset) * _outerRadius) + _outerCenterX,
                "y": (Math.sin((i + 1) * _segmentWidth + spaceOffset) * _outerRadius) + _outerCenterY
            }
        );
        
        //innerStart
        segmentPoints.push(
            {
                "x": (Math.cos(i * _segmentWidth + spaceOffset) * _outerRadius) + _outerCenterX,
                "y": (Math.sin(i * _segmentWidth + spaceOffset) * _outerRadius) + _outerCenterY
            }
        );
        
        //back to first
        segmentPoints.push(
            {
                "x": segmentPoints[0].x,
                "y": segmentPoints[0].y
            }
        );

        _tunnel.push({
            name:"segment_" + i,
            points: segmentPoints
        });
    }
    
    return fixDrawOrder(_tunnel);
}

function fixDrawOrder(t){
    //we wanna draw the middle one as last element
    
    var _sorted = [];
    
    while(t.length > 0){
        
        var idx = Math.floor(t.length / 2);
        
        _sorted.push(t.splice(idx, 1)[0]);
    }

    return _sorted;//.reverse();
}

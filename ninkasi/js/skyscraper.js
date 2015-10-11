var Skyscraper = (function(){
    
    function create(){
        
        var MAXHEIGHT = 4,
            SEGMENTS = 34//,
            //_segmentSpace = , 
            //_segmentWidth = ;
        
        var _skyscraper = [];
        
        var block1Height = (MAXHEIGHT / SEGMENTS) / 5,
            block1Width = .6,
            
            block2Height = (MAXHEIGHT - ((SEGMENTS - 1) * block1Height)) / SEGMENTS,
            block2Width = .5;
        
        var _yOffset = MAXHEIGHT/2;//MAXHEIGHT/2;
        var _tower = [];
        console.log("h1", block1Height, "h2", block2Height);
        for(var i = 0; i < SEGMENTS; i += 1){
        
            var segmentPoints = [];
            
            var blockWidth = i % 2 ? block1Width : block2Width,
                blockHeight = i % 2 ? block1Height : block2Height;

            //bottom right
            segmentPoints.push(
                {
                    "x": 1,
                    "y": MAXHEIGHT - _yOffset - blockHeight
                }
            );
            
            //top right
            segmentPoints.push(
                {
                    "x" : 1,
                    "y":  MAXHEIGHT - _yOffset
                }
            );
            
            //top left
            segmentPoints.push(
                {
                    "x" : 1 - blockWidth,
                    "y":  MAXHEIGHT - _yOffset
                }
            );
            
            //bottom left
            segmentPoints.push(
                {
                    "x" : 1 - blockWidth,
                    "y":  MAXHEIGHT - _yOffset -  blockHeight
                }
            );
            
            //back to first
            segmentPoints.push(
                {
                    "x": segmentPoints[0].x,
                    "y": segmentPoints[0].y
                }
            );
    
            _yOffset += blockHeight;

            _tower.push({
                name:"segment_" + i,
                points: segmentPoints
            });
        }
        
        return _tower;
    }
    
    return {
        create:create
    };
}());
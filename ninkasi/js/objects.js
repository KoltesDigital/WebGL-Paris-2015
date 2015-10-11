var objects = {

    "bumper":{
        parts:[
            {
                name:"left",
                points:[
                    {x: -.9, y: .2},
                    {x: -1,  y: .2},
                    {x: -1,  y: 0},
                    {x: -.8, y: 0},
                    
                    {x: -.9, y: .2}
                ],
                hollow:false
            },
            {   
                name:"right",
                points:[
                    {x: .9, y: .2},
                    {x: 1,  y: .2},
                    {x: 1,  y:0},
                    {x: .8, y:0},
                    
                    {x: .9, y: .2}
                ],
                hollow:false
            }
        ]
    },
    
    "stilts":{
        parts:[
            {
                name:"left",
                points:[
                    {x: -1, y: 0},
                    {x: -1, y: .6},
                    {x: -1.1, y: .8},
                    {x: -1.05, y: .85},
                    {x: -.7, y: .7},
                    {x: -.95, y: .6},
                    {x: -.95, y: 0},
                    {x: -1, y: 0}
                ]
            },
            {
                name:"right",
                points:[
                    {x: 1, y: 0},
                    {x: 1, y: .6},
                    {x: 1.1, y: .8},
                    {x: 1.05, y: .85},
                    {x: .7, y: .7},
                    {x: .95, y: .6},
                    {x: .95, y: 0},
                    {x: 1, y: 0}
//--
                ],
                hollow:false
            }
        ]
    }, 

    "tunnel":{
        parts:[
            {
                name: "inside",
                points:[
                    //lower left inside
                    {x: -1, y: 0},
                    {x: -1.1, y: 0},
                    {x: -1.1, y: 1.1},
                    {x: 1.1,  y: 1.1},
                    {x: 1.1,  y: 0},
                    {x: 1,  y: 0},
                    
                    //inside part
                    {x: 1, y: .9},
                    {x: .9, y: 1},
                    {x: -.9, y: 1},
                    {x: -1, y: .9},

                    {x: -1, y: 0}
                ],
                hollow:false
            }
        ]
    }
};


objects['segmentTunnel'] = {
    parts: getTunnel()
};

objects['skyscraper'] = {
    parts: Skyscraper.create()
};


//in math -1,-1 should be in the lower left
//manipulate y coords to be like that
for(var objName in objects){

    for(var partIndex = 0; partIndex < objects[objName].parts.length; partIndex++){
        
        for(var pointIndex = 0; pointIndex < objects[objName].parts[partIndex].points.length; pointIndex++){
            
            objects[objName].parts[partIndex].points[pointIndex].y -= .1
            
            objects[objName].parts[partIndex].points[pointIndex].y *= -1;
        }
    }
}
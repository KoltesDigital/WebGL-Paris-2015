
//L-system interpreter by rimina

//Use of L-systems
// Alphabet: 
//  F = move forward and draw a line
//  f = move forward without drawing
//  r = turn facing right
//  l = turn facing left
//  u = turn facing down
//  t = turn facing up
//  d = push
//  b = pop
//
//example of use:
// lsystem = new LSYSTEM();
// lsystem.interpret(10, 90, "FrFrFrF","FrFlFlFFrFrFlF", 1);
// lsystem.moveCenter();
// lsystem.createLine(new THREE.LineBasicMaterial());
//
// creating unconnected lines
// lsystem.interpret(5, 16, "F", "FFldlFrFrFbrdrFlFlFb, 4);
// lsystem.moveCenter();
// lsystem.createUnconnectedLines(new THREE.LineBasicMaterial());
//
var LSYSTEM = function(){

  var lsystem = this;

  lsystem.stack = [];
  lsystem.pushState = function(state){
    lsystem.stack.push(state)
  };
  lsystem.popState = function(){
    var state = lsystem.stack.splice(lsystem.stack.length-1, 1);
    return state[0];
  };
  
  lsystem.points = [];
  lsystem.path = [];
  lsystem.baseStep = 0;
  lsystem.angle = 0;
  lsystem.rule = "";
  lsystem.axiom = "";
  lsystem.depth = 0;
  lsystem.instructions = "";
  lsystem.center = 0;
  lsystem.limits = {};
  
  
  lsystem.toDegrees = function(angle){
    return angle * (180 / Math.PI);
  };

  lsystem.toRadians = function(angle){
    return angle * (Math.PI / 180);
  };
  
  lsystem.interpret = function(baseStep, angle, axiom, rule, depth){
    lsystem.baseStep = baseStep;
    lsystem.angle = angle;
    lsystem.rule = rule;
    lsystem.axiom = axiom;
    lsystem.depth = depth;

    var rep = new RegExp('F', 'g');
    lsystem.instructions = new String(lsystem.axiom);
    
    for(var i = 0; i < lsystem.depth; ++i){
      lsystem.instructions = lsystem.instructions.replace(rep, lsystem.rule);
    }
    
    lsystem.formPath();
  };
  
  lsystem.findCenter = function(){
    var x = (lsystem.limits.max.x + lsystem.limits.min.x)/2;
    var y = (lsystem.limits.max.y + lsystem.limits.min.y)/2;
    var z = (lsystem.limits.max.z + lsystem.limits.min.z)/2;
    
    return {x: x, y: y, z: z};
  };
    
  lsystem.findLimits = function(currentState){
    
    if(currentState.x > lsystem.limits.max.x){
      lsystem.limits.max.x = currentState.x;
    }
    if(currentState.y > lsystem.limits.max.y){
      lsystem.limits.max.y = currentState.y;
    }
    if(currentState.z > lsystem.limits.max.z){
      lsystem.limits.max.z = currentState.z;
    }
    if(currentState.x < lsystem.limits.min.x){
      lsystem.limits.min.x = currentState.x;
    }
    if(currentState.y < lsystem.limits.min.y){
      lsystem.limits.min.y = currentState.y;
    }
    if(currentState.z < lsystem.limits.min.z){
      lsystem.limits.min.z = currentState.z;
    }
  };
  
  lsystem.moveForward = function(currentState){
    var posX = lsystem.baseStep * Math.sin(lsystem.toRadians(currentState.angleZ)) * Math.cos(lsystem.toRadians(currentState.angleX));
    var posY = lsystem.baseStep * Math.cos(lsystem.toRadians(currentState.angleZ)) * Math.cos(lsystem.toRadians(currentState.angleX));
    var posZ = lsystem.baseStep * Math.sin(lsystem.toRadians(currentState.angleX)) * Math.cos(lsystem.toRadians(currentState.angleZ));
    currentState.x -=posX;
    currentState.y += posY;
    currentState.z +=posZ;
    
    return currentState;
  };
  
  lsystem.formPath = function(){
    var currentState = {x: 0, y: 0, z: 0, angleZ: 0.0, angleX: 0.0};
    var baseStep = lsystem.baseStep;
    
    lsystem.limits = {
      max: { x: currentState.x, y: currentState.y, z: currentState.z},
      min: { x: currentState.x, y: currentState.y, z: currentState.z}
    };
    
    lsystem.points.push({x:0, y:0, z:0});
    
    //forming the path to draw from instructions
    for(var i = 0; i < lsystem.instructions.length; ++i){
      var letter = lsystem.instructions[i];
      switch(letter){
        case 'd':
          lsystem.pushState({
            x: currentState.x,
            y: currentState.y,
            z: currentState.z,
            angleZ: currentState.angleZ,
            angleX: currentState.angleX
          });
          break;
          
        case 'b':
          currentState = lsystem.popState();
          break;
          
        case 'l':
          currentState.angleZ += lsystem.angle;
          break;
          
        case 'r':
          currentState.angleZ -= lsystem.angle;
          break;
          
        case 'u':
          currentState.angleX += lsystem.angle;
          break;
          
        case 't':
          currentState.angleX -= lsystem.angle;
          break;
          
        case 'f':
          currentState = lsystem.moveForward(currentState);
          lsystem.findLimits(currentState);
          break;
          
        case 'F':
          var fromx = currentState.x;
          var fromy = currentState.y;
          var fromz = currentState.z;
          
          currentState = lsystem.moveForward(currentState);
          
          lsystem.points.push({
            x: currentState.x,
            y: currentState.y,
            z: currentState.z,
          });
          
          lsystem.path.push({
            fromx : fromx,
            fromy : fromy,
            fromz : fromz,
            tox: currentState.x,
            toy: currentState.y,
            toz: currentState.z
          });
          
          lsystem.findLimits(currentState);
          break;
      }
    }
    lsystem.center = lsystem.findCenter();
    return lsystem.points.slice(0);
  };
  
  lsystem.moveToCenter = function(){
    for(var i = 0; i < lsystem.points.length; ++i){
      var point = lsystem.points[i];
      
      point.x -=lsystem.center.x;
      point.y -=lsystem.center.y;
      point.z -=lsystem.center.z;
      
    }
    return lsystem.points.slice(0);
  };
  
  //Creates three.js line geometry from the points
  //Creates one connected line. Does not take command f, push or pop into account
  //to consider those commands use createUnconnectedLines method
  lsystem.createLine = function(lineMaterial){ 
    var geometry = new THREE.Geometry();
    geometry.dynamic = true;
    lsystem.line = new THREE.Line( geometry, lineMaterial );
    
    for(var k = 0; k < lsystem.points.length; ++k){
      var point = lsystem.points[k];
      geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
    }
    geometry.verticesNeedUpdate = true;
    lsystem.line.updateMatrix();
    return lsystem.line;
  };
  
  //Creates Object3D with to many lines....
  //There has to be better vay to do this, but I'm not quite sure how..
  lsystem.createUnconnectedLines = function(lineMaterial){
    lsystem.lines = new THREE.Object3D();
    
    for(var k = 0; k < lsystem.path.length; ++k){
      var geometry = new THREE.Geometry();
      var path = lsystem.path[k];
      
      geometry.vertices.push(new THREE.Vector3(path.fromx, path.fromy, path.fromz));
      geometry.vertices.push(new THREE.Vector3(path.tox, path.toy, path.toz));
      
      var line = new THREE.Line(geometry, lineMaterial);
      line.updateMatrix();
      lsystem.lines.add(line);
    }
    return lsystem.lines;
  };
  
  return lsystem;
}
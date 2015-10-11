/* @const */ var config = {
/* @const */ EDITOR : false ,
/* @const */ CLEAR_ENABLED : true ,
/* @const */ DEPTH_TEST_ENABLED : true ,
/* @const */ BLENDING_ENABLED : true ,
/* @const */ RENDER_TO_TEXTURE_ENABLED : true ,
/* @const */ TEXTURE_INPUTS_ENABLED : true ,
/* @const */ TEXTURE_FLOAT_ENABLED : true ,
/* @const */ DEPTH_TEXTURE_ENABLED : true ,
/* @const */ CAM_UNIFORMS_ENABLED : true ,
/* @const */ UNIFORM_INTERPOLATION_ENABLED : true ,
/* @const */ SCENES_ENABLED : true ,
/* @const */ TEXT_ENABLED : true ,
/* @const */ IMG_TEXTURE_ENABLED : false ,
/* @const */ GL_DEBUG : false ,
/* @const */ GL_DEBUG_TRACE : false ,
/* @const */EXPORT: true
}
function animate(keyframes, time)
{
  var last = keyframes.length - 1;
  if (time <= keyframes[0][0]) return keyframes[0][1];
  if (time >= keyframes[last][0]) return keyframes[last][1];

  // we must have at least 2 keyframes, or it will crash
  var prev = [], next = [];
  for (var i = 0; i < keyframes[1][1].length; i++) {
    prev.push(2 * keyframes[0][1][i] - keyframes[1][1][i]);
    next.push(2 * keyframes[last][1][i] - keyframes[last-1][1][i]);
  }

  keyframes.push([2 * keyframes[last][0] - keyframes[last-1][0], next]);
  keyframes.unshift([keyframes[0][0] - keyframes[1][0], prev]);

  var i = 1;
  while ((i <= last) && (keyframes[i][0] < time)) i++;

  var k0 = keyframes[i - 2];
  var k1 = keyframes[i - 1];
  var k2 = keyframes[i];
  var k3 = keyframes[i + 1];

  var t = (time - k1[0]) / (k2[0] - k1[0]);

  var h1 = 2 * t * t * t - 3 * t * t + 1;     // calculate basis function 1
  var h2 = -2 * t * t * t + 3 * t * t;        // calculate basis function 2
  var h3 = t * t * t - 2 * t * t + t;         // calculate basis function 3
  var h4 = t * t * t - t * t;

  var out = [];
  for (var i = 0; i < k1[1].length; i++) {
    var t1 = (k2[1][i] - k0[1][i]) / 4;
    var t2 = (k3[1][i] - k1[1][i]) / 4;
    out.push(h1 * k1[1][i] + h2 * k2[1][i] + h3 * t1 + h4 * t2);
  }
  return out;
}
if (config.EDITOR) {
  var sequence = [];
  var render_passes = [];
  var snd;
  var renderHooks = [];
}

if (config.EDITOR) {
  var symbolMap = {}
}

function minify_context(ctx)
{
  Object.keys(ctx).sort().forEach(function(name) {
    if (config.EDITOR) {
      var shader = false
      if (name.match(/^shader_/))
      {
        shader = true;
        name = name.substr(7);
      }
    }
      
    var m, newName = "";  
    var re = (name.match(/[a-z]/) ? /(^[a-z]|[A-Z0-9])[a-z]*/g : /([A-Z0-9])[A-Z]*_?/g);
    while (m = re.exec(name)) newName += m[1];
    
    // add an underscore to shader variables, to avoid conflict with glsl-unit minification
    if (config.EDITOR) {
      if (shader)
        newName = "_" + newName;
    }
    
    if (newName in ctx)
    {
      var index = 2;
      while ((newName + index) in ctx) index++;
      newName = newName + index;
    }
    
    ctx[newName] = ctx[name];
    
    if (config.EDITOR) {
      // don't minify properties that are neither objects nor constants (or that map to strings)
      var preservedNames = ["canvas", "currentTime", "destination", "font", "fillStyle", "globalCompositeOperation", "lineWidth"]
      if (preservedNames.indexOf(name) !== -1)
        return;
      
      if (name in symbolMap)
      {
        if (symbolMap[name] != newName)
        {
          alert("Symbol " + name + " packed differently for multiple contexts (" + symbolMap[name] + ", " + newName + ")");
        }
      }
      symbolMap[name] = newName;
    }
  })
}

// export for minifcation tools
function dump_symbol_map()
{
  if (!config.EDITOR)
    return;
  
  console.log(symbolMap);
  $(document.body).text(JSON.stringify(symbolMap));
}

var engine = {};

function engine_render(current_time)
{
  if (config.EDITOR) {
    if (document.__gfx_init == undefined) {
      return;
    }
    window.renderHooks.forEach(function(f) { f() });
  }
  render_frame(current_time);
  if (config.EDITOR) {
    canvas_overlay_text.update();
  }
}

function main_loop() {
  var current_time = snd.t();
  engine_render(current_time);
  requestAnimationFrame(main_loop);
}

function main() {
  var body = document.body;
  body.innerHTML = "";
  canvas = document.createElement("canvas");
  body.appendChild(canvas);
  body.style.margin = 0;

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  gl_init();
  text_init();

  load_shaders();
  load_geometries();
  load_scenes();
  load_textures();
  if (this.load_render_graph)
    load_render_graph();

  gfx_init();

  snd_init();
  snd.p();

  main_loop();
}

function editor_main() {
  canvas = document.getElementById("engine-view")
  gl_init();
  text_init();
}

// for convenience in the timline
function sin(x) { return Math.sin(x); }
function cos(x) { return Math.cos(x); }
function abs(x) { return Math.abs(x); }
var Pi = 3.1416;

// general naming rule: things that have offset in the name are offsets in
// an array, while things with index in the name are indices that should be
// multiplied by a stride to obtain the offset.

// ring: [[x,y,z]]
// geom: {vbo, ibo, v_stride, v_cursor, i_cursor}
// v_cursor is an index (in vertex, not an offset in the array).
// Use v_cursor * v_stride for an offset in the array.

var SEED = 1;
function seedable_random() {
    return (SEED = (69069 * SEED + 1) & 0x7FFFFFFF) / 0x80000000;
}

function mid_point(a, b) {
    return [
        (a[0]+b[0])/2,
        (a[1]+b[1])/2,
        (a[2]+b[2])/2
    ];
}

function get_vec3(buffer, offset) {
    return [
        buffer[offset],
        buffer[offset+1],
        buffer[offset+2]
    ];
}

//      c
//     / \
//    /   \
//  ac --- bc
//  / \   / \
// /   \ /   \
//a-----ab----b

function subdivide(prev_buffer) {
    var output = [];
    for (var i=0; i<prev_buffer.length; i+=9) {
        var a = get_vec3(prev_buffer, i);
        var b = get_vec3(prev_buffer, i+3);
        var c = get_vec3(prev_buffer, i+6);
        var ab = mid_point(a, b);
        var bc = mid_point(b, c);
        var ac = mid_point(a, c);
        pack_vertices(output,[
            a,  ab, ac,
            ac, ab, bc,
            bc, ab, b,
            ac, bc, c
        ]);
    }
    return output;
}

// TODO: There has to be a clever and compact way to express this:
function make_cube() {
    return [
         0, 0, 0,   1, 1, 0,   1, 0, 0,    0, 0, 0,   0, 1, 0,   1, 1, 0,  //0x4c32
         0, 0, 0,   0, 1, 1,   0, 1, 0,    0, 0, 0,   0, 0, 1,   0, 1, 1,  //0x2619
         0, 0, 0,   1, 0, 1,   0, 0, 1,    0, 0, 0,   1, 0, 0,   1, 0, 1,  //0x6700
         1, 1, 1,   0, 0, 1,   1, 0, 1,    1, 1, 1,   0, 1, 1,   0, 0, 1,  //0x3d3cb
         1, 1, 1,   1, 0, 0,   1, 1, 0,    1, 1, 1,   1, 0, 1,   1, 0, 0,  //0x3e9e5
         1, 1, 1,   0, 1, 0,   0, 1, 1,    1, 1, 1,   1, 1, 0,   0, 1, 0,  //0x3d5b6
    ];
}

function apply_op_range(buf, op, param, from, to) {
    var stride = param.length;
    for (var i = from; i < to; i += stride) {
        for (var p = 0; p < stride; ++p) {
            buf[i+p] = op(buf[i+p],param[p]);
        }
    }
}

function apply_op(buf, op, param) {
    apply_op_range(buf, op, param, 0, buf.length);
}

function op_add(a, b) { return a + b }
function op_mul(a, b) { return a * b }
function op_set(a, b) { return b }

function apply_scale(buf, s) { apply_op(buf, op_mul, s) }
function apply_translation(buf, s) { apply_op(buf, op_add, s) }

//  a          b          c           d
// (1, 1, 1), (1,-1,-1), (-1, 1,-1), (-1,-1, 1)
function make_tetrahedron() {
    return [
         1, 1, 1,   1,-1,-1,  -1, 1,-1,  // abc
        -1,-1, 1,   1,-1,-1,   1, 1, 1,  // dba
        -1,-1, 1,  -1, 1,-1,   1,-1,-1,  // dcb
        -1,-1, 1,   1, 1, 1,  -1, 1,-1,  // dac
    ];
}

function make_sphere(radius, num_subdivs) {
    var buffer = make_tetrahedron();
    while (num_subdivs-- > 0) {
        buffer = subdivide(buffer);
    }
    for (var i = 0; i < buffer.length; i+=3) {
        var len = vec3.length([buffer[i], buffer[i+1], buffer[i+2]]);
        buffer[i] *= radius/len;
        buffer[i+1] *= radius/len;
        buffer[i+2] *= radius/len;
    }
    return buffer;
}

function make_grid( num_subdivs ) {
    var buffer =  [
      -1, -1, 0,  -1,  1, 0,   1, -1, 0,
      -1,  1, 0,   1, -1, 0,   1,  1, 0  ];
    while (--num_subdivs > 0) {
        buffer = subdivide(buffer);
    }

    console.log('make_grid generated a grid with that many triangles : ' + (buffer.length / 9));
    return buffer;
}

function make_disc(center, radius, n_points) {
    var vertices = [];
    var step = (2.0*3.14)/ n_points;
    for (var i=0; i < n_points; ++i) {
        var a1 = i * step;
        var a2 = (i+1) + step;
        pack_vertices(vertices, [
            center,
            [center[0]+cos(a1)*radius, center[1]+sin(a1)*radius, center[2]],
            [center[0]+cos(a2)*radius, center[1]+sin(a2)*radius, center[2]],
        ]);
    }
}

// TODO: it's sorta convenient to have this for prototyping but I assume we'll
// have to not use this in the shipping demos and always generate from unpacked
// geometry rather than packing and unpacking to re-pack afterwards like
// map_triangles does.
// turns [a, b, c, d, e, f, g, h, i] into [[a, b, c], [d, e, f], [g, h, i]]
function unpack_vertices(vertices, offset, num_vertices) {
    var output = [];
    for(var i = offset; i < offset+num_vertices*3; i+=3) {
        output.push([vertices[i], vertices[i+1], vertices[i+2]]);
    }
    return output;
}

function map_triangles(positions, fn) {
    var output = [];
    for (var i = 0; i < positions.length; i+=9) {
        pack_vertices(output, fn(unpack_vertices(positions, i, 3), i));
    }
    return output;
}

// triangle: unpacked vertices [[x, y, z], [x, y, z], [x, y, z]]
function flat_normal(triangle) {
    var a = triangle[0];
    var b = triangle[1];
    var c = triangle[2];
    var ab = vec3.create();
    var ac = vec3.create();
    var normal = vec3.create();
    vec3.sub(ab, b, a);
    vec3.sub(ac, c, a);
    vec3.cross(normal, ab, ac);
    vec3.normalize(normal, normal);
    return [normal, normal, normal];
}

function triangle_index(triangle, i) {
    return [[i],[i],[i]];
}

function op_translate(dx, dy, dz) {
    var identity = mat4.create();
    return mat4.translate(identity, identity, [dx, dy, dz]);
}
function op_rotate_x(angle) {
    var identity = mat4.create();
    return mat4.rotate(identity, identity, angle, [1, 0, 0]);
}
function op_rotate_y(angle) {
    var identity = mat4.create();
    return mat4.rotate(identity, identity, angle, [0, 1, 0]);
}
function op_rotate_z(angle) {
    var identity = mat4.create();
    return mat4.rotate(identity, identity, angle, [0, 0, 1]);
}
function op_scale(sx, sy, sz) {
    var identity = mat4.create();
    return mat4.scale(identity, identity, [sx, sy, sz]);
}

function matrix_str(mat) {
    return "[ " + mat[0] + " "
                + mat[1] + " "
                + mat[2] + " "
                + mat[3] + " | "
                + mat[4] + " "
                + mat[5] + " "
                + mat[6] + " "
                + mat[7] + " | "
                + mat[8] + " "
                + mat[9] + " "
                + mat[10] + " "
                + mat[11] + " | "
                + mat[12] + " "
                + mat[13] + " "
                + mat[14] + " "
                + mat[15] + "]";
}

function vector_str(vec) {
    var vec_3 = vec[3]||"";
    return "[ " + vec[0] + " "
                + vec[1] + " "
                + vec[2] + " "
                + vec_3 + " ]";
}

function extrude_geom(geom, cmd_list) {
    var base_paths;
    var transform = mat4.create();
    var previous_paths;
    for (var i = 0; i < cmd_list.length; ++i) {
        var item = cmd_list[i];
        if (item.transform) {
            mat4.multiply(transform, transform, item.transform);
        }
        if (item.apply) {
            var transformed_paths = transform_paths(base_paths, transform);
            if (previous_paths) {
                item.apply(geom, previous_paths, transformed_paths);
            }
            previous_paths = transformed_paths;
        }
        if (item.set_path) {
            base_paths = item.set_path(base_paths);
        }
        if (item.jump) {
            i = item.jump(i);
        }
    }
}

function create_geom_from_cmd_list(commands) {
    var geom = {}

    if (asset.positions) { geom.positions = []; }
    if (asset.normals) { geom.normals = []; }
    if (asset.uvs) { geom.uvs = []; }

    extrude_geom(geom, commands);

    var buffers = [];
    if (asset.positions) { buffers.push(make_vbo(POS, geom.positions)); }
    if (asset.normals) { buffers.push(make_vbo(NORMAL, geom.normals)); }
    if (asset.uvs) { buffers.push(make_vbo(UV, geom.uvs)); }

    geometries[name] = {
      buffers: buffers,
      mode: gl.TRIANGLES,
      vertex_count: geom.positions.length / 3
    };
}

// XXX - apply_extrusion
function apply_fn(geom, previous_rings, new_rings, triangle_fn, quad_fn) {
  previous_rings.forEach(
      function(prev_item, i) {
          //console.log(new_rings);
          join_rings(
            geom,
            prev_item,
            new_rings[i],
            triangle_fn,
            quad_fn
          );
      }
  );
}

function apply_fill(geom, ring) {
  var normal = [0, 1, 0];
  for (var i = 1; i < ring.length - 1; i++) {
      pack_vertices(geom.positions, [ring[0], ring[i], ring[i + 1]]);
      //pack_vertices(geom.normals, [normal, normal, normal]);
  }
}


function jump_if(pc, cond) {
    return function(i) { if (cond(i)) { return pc; } };
}

function transform_paths(path_array, transform) {
    var out_array = [];
    for (var i = 0; i < path_array.length; ++i) {
        var path = path_array[i];
        var new_path = [];
        for (var v = 0; v < path.length; ++v) {
            var vertex = vec3.fromValues(
                path[v][0],
                path[v][1],
                path[v][2]
            );
            vec3.transformMat4(vertex, vertex, transform);
            new_path.push(vertex);
        }
        out_array.push(new_path);
    }
    return out_array;
}

function uv_buffer(u1, v1, u2, v2) {
  return [[
    u1, v1,
    u2, v1,
    u2, v2,
    u2, v2,
    u1, v2,
    u1, v1
  ]];
}

// For a continuous ring of 4 points the indices are:
//    0    1
//  7 A----B 2
//    |    |
//    |    |
//  6 D----C 3
//    5    4
//
// The slice of the vbo for this ring looks like:
// [A, B, B, C, C, D, D, A]
//
// Continuous rings are what the city generator outputs, but join_rings
// takes discontinuous rings as inputs:
//
// For a discontinuous ring of 4 points the indices are:
//    0    1
//    A----B
//
//
//    C----D
//    3    2
//
// The slice of the vbo for this ring looks like:
// [A, B, C, D]

function is_path_convex(path) {
    var path_length = path.length;
    var c = vec3.create();
    var v1 = vec2.create();
    var v2 = vec2.create();
    for (var i = 0; i < path_length; ++i) {
        vec2.subtract(v1, path[(i+1)%path_length], path[i]);
        vec2.subtract(v2, path[(i+2)%path_length], path[(i+1)%path_length]);
        vec2.cross(c, v1, v2);
        if (c[2] > 0) {
            return false;
        }
    }
    return true;
}

function make_ring(path, y) {
  return path.map(function(point)
  {
    return [point[0], y, -point[1]]
  })
}

function pack_vertices(to, v) {
    for (var i = 0; i<v.length; ++i) {
        to.push.apply(to, v[i]);
    }
}

function join_rings(geom, r1, r2, triangle_fn, quad_fn) {
    if (config.EDITOR) {
        if (r1.length != r2.length) {
            //console.log(r1);
            //console.log(r2);
            alert("rings of incompatible sizes: "+r1.length+" "+r2.length);
        }
    }

    var e1 = vec3.create()
    var e2 = vec3.create()
    var normal = [0,0,0]
    for (var i = 0; i < r1.length; i++)
    {
      var next = (i + 1) % r1.length;
      pack_vertices(geom.positions, [r1[i], r1[next], r2[next], r2[next], r2[i], r1[i]]);

      var t1 = [r1[i], r1[next], r2[next]];
      var t2 = [r2[next], r2[i], r1[i]];
      if (geom.normals) {
        pack_vertices(geom.normals, flat_normal(t1));
        pack_vertices(geom.normals, flat_normal(t2));
      }
      if (triangle_fn) {
        triangle_fn(t1);
        triangle_fn(t2);
      } 
      if (quad_fn) {
        quad_fn([r2[i], r2[next], r1[next], r1[i]]);
      }
    }
}

function rand_int(max) {
    return Math.floor(seedable_random() * max);
}

function mod(a, m) {
  return (a%m+m)%m;
}

// Yeah. I know.
function deep_clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function _vector_2d(a,b) { return vec2.subtract([], b, a) }
function _vec2_scale(v, f) { return [v[0]*f, v[1]*f] }

function tangent(v) {
    var l = vec2.length(v);
    return [-v[1]/l, v[0]/l]
}

function lines_intersection_2d(a1, a2, b1, b2) {
    var det = (a1[0]-a2[0])*(b1[1]-b2[1]) - (a1[1]-a2[1])*(b1[0]-b2[0]);
    if (det*det < 0.0001) { return null }
    var a = (a1[0]*a2[1]- a1[1]*a2[0]);
    var b = (b1[0]*b2[1]- b1[1]*b2[0]);
    return [
        (a * (b1[0] - b2[0]) - b * (a1[0] - a2[0])) / det,
        (a * (b1[1] - b2[1]) - b * (a1[1] - a2[1])) / det
    ];
}

function shrink_path(path, amount, z, use_subdiv, disp) {
    var new_path = [];
    var path_length = path.length;
    var pna = vec2.create();
    var pnxa = vec2.create();
    var pnb = vec2.create();
    var pnxb = vec2.create();
    for (var i = 0; i < path_length; ++i) {
        var pa = path[mod(i-1, path_length)];
        var px = path[mod(i,   path_length)];
        var pb = path[mod(i+1, path_length)];
        use_subdiv = use_subdiv || 0;
        var displacement;
        //if(disp)
        //  console.log("on a disp=" + disp);
        displacement = disp || [0,0];
        // avoid shrinking too much
        if (vec2.distance(pa, pb) < amount*(1+pa.subdiv*use_subdiv*2)) {
            return deep_clone(path);
        }
        var pa_sub = pa.subdiv || 0;
        var px_sub = px.subdiv || 0;
        var na = _vec2_scale(tangent(_vector_2d(pa, px)), amount * (1+pa_sub*use_subdiv));
        var nb = _vec2_scale(tangent(_vector_2d(px, pb)), amount * (1+px_sub*use_subdiv));

        vec2.add(pna, pa, na);
        vec2.add(pnb, pb, nb);
        vec2.add(pnxa, px, na);
        vec2.add(pnxb, px, nb);

        var inter = lines_intersection_2d(pna, pnxa, pnxb, pnb );

        // If inter is null (pa, px and pb are aligned)
        inter = inter || [pnxa[0], pnxa[1]];
        inter = vec2.add(inter, inter, displacement);
        inter.subdiv = path[i].subdiv;
        new_path.push(inter);
    }

    var old_segment = vec2.create();
    var new_segment = vec2.create();
    for (var i = 0; i < path_length; ++i) {
        vec2.subtract(old_segment, path[(i+1)%path_length], path[i]);
        vec2.subtract(new_segment, new_path[(i+1)%path_length], new_path[i]);

        if (vec2.dot(old_segment, new_segment) < 0) {
            return null;
        }
    }
    return new_path;
}

//  Example:
//
//  fill_convex_ring(ctx, ring, (triangle) => {
//      pack_vertices(ctx.uv, top_uv);
//  });
//
// fn takes a triangle as parameter and must output an array of 3 attributes
// ex: [[u,v], [u,v], [u,v]]
function fill_convex_ring(geom, ring, fn) {
  for (var i = 1; i < ring.length - 1; i++) {
      var triangle = [ring[0], ring[i], ring[i + 1]];
      pack_vertices(geom.positions, triangle);
      if (geom.normals) {
        pack_vertices(geom.normals, flat_normal(triangle));
      }
      fn && fn(triangle, i);
  }
}

function circle_path(center, radius, n_points) {
    var path = []
    for (i = 0; i < n_points; ++i) {
        path.push([
            center[0] + -Math.cos(i/n_points * 2 * Math.PI) * radius,
            center[1] + Math.sin(i/n_points * 2 * Math.PI) * radius
        ]);
    }
    return path;
}

function circle_path_vec3(center, radius, n_points) {
    var path = [] 
    for (i = 0; i < n_points; ++i) {
        path.push([
            center[0] + -Math.cos(i/n_points * 2 * Math.PI) * radius,
            center[1],
            center[2] + Math.sin(i/n_points * 2 * Math.PI) * radius
        ]);
    }
    return path;
}



// The placeholders code has multiline strings that closure don't like
// so we can't enable it in the export for now.

var gl
var canvas
var textures = {}
var uniforms = {}
var geometries = {}
var scenes = {}
var programs = {}
var fragment_shaders = {}
var vertex_shaders = {}
var ctx_2d
var render_passes = [];

var gl_ext_half_float;
var blendings = {};

if (config.EDITOR) {
  var uniform_editor_overrides = {};
}

function gl_init() {
  if (config.EDITOR) {
    console.log("gl_init");
  }

  gl = canvas.getContext("webgl", {alpha: false, antialias: false});
  //minify_context(gl);

  if (config.GL_DEBUG) {
    function logGLCall(functionName, args) {
      if (config.GL_DEBUG_TRACE) {
        console.log("gl." + functionName + "(" + WebGLDebugUtils["glFunctionArgsToString"](functionName, args) + ")");
      }
    }
    gl = WebGLDebugUtils["makeDebugContext"](gl, undefined, logGLCall);
  }

  if (config.DEPTH_TEXTURE_ENABLED) {
    var depthTextureExtension = gl.getExtension("WEBGL_depth_texture");
    if (config.GL_DEBUG) {
      if (!depthTextureExtension) {
        alert("Failed to load WEBGL_depth_texture");
      }
    }
  }

  if (config.TEXTURE_FLOAT_ENABLED) {
    gl_ext_half_float = gl.getExtension("OES_texture_half_float");
    gl.getExtension("OES_texture_half_float_linear");
    gl.getExtension("EXT_color_buffer_half_float");
    //minify_context(gl_ext_half_float);
  }

  gl.depthFunc(gl.LEQUAL);
  gl.viewport(0, 0, canvas.width, canvas.height);

  // TODO: would be nice to not use strings here...
  blendings["alpha"] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
  blendings["add"] = [gl.ONE, gl.ONE];
  blendings["sub"] = [gl.ZERO, gl.ONE_MINUS_SRC_COLOR];
}

var _locations = [
  "a_position",
  "a_uv",
  "a_normal",
  "a_color",
  "a_triangle_id"
];

var POS = 0;
var UV = 1;
var NORMAL = 2;
var COLOR = 3;
var TRIANGLE_ID = 4;

function gfx_init() {
  if (config.EDITOR) {
    console.log("gfx_init");
  }

  if (config.CAM_UNIFORMS_ENABLED) {
    uniforms["u_cam_pos"] = [0, 1, 0]
    uniforms["u_cam_target"] = [0, 0, 0]
    uniforms["u_cam_fov"] = [75]
    uniforms["u_cam_tilt"] = [0]
  }

  // hack to make the export toolchain minify attribute and uniform names
  if (config.EDITOR) {
    var _uniforms = [
      "u_cam_pos",
      "u_cam_target",
      "world_mat",
      "u_view_proj_mat",
      "u_view_proj_mat_inv",
      "u_resolution",
      "focus",
      "light",
      /*"u_texture_0",
      "u_texture_1",
      "u_texture_2",
      "u_texture_3",
      "u_texture_4",*/
      "mask",
      "cam_fov",
      "glitch"
    ];

    var fakeContext = {}
    for (var i in _locations) fakeContext["shader_" + _locations[i]] = 42;
    for (var i in _uniforms) fakeContext["shader_" + _uniforms[i]] = 42;
    //minify_context(fakeContext);
  }

  if (config.EDITOR) {
    init_placeholders();
    // TODO: the editor tries to render each time something is loaded, before gfx_init
    // this is a quick workaround but we should do something better.
    document.__gfx_init = true;
  }
}

function make_vbo(location, buffer) {
  var vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
  return {location: location, vbo: vbo, length: buffer.length};
}

// editor only (will be stripped)
function destroy_geom(geom) {
  for (var i in geom.buffers) {
    var buffer = geom.buffers[i];
    gl.deleteBuffer(buffer.vbo);
  }
}

// actually renders
function draw_geoms(geoms, instance_id_location) {
  for (var i = 0; i < geoms.length; ++i) {
    var geom = geoms[i];
    for (var i in geom.buffers) {
      var buffer = geom.buffers[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
      gl.enableVertexAttribArray(buffer.location);
      gl.vertexAttribPointer(buffer.location, buffer.length / geom.vertex_count, gl.FLOAT, false, 0, 0);
    }

    send_uniforms({"u_object_id": [i]});
    gl.drawArrays(geom.mode, 0, geom.vertex_count);
  }
}

function draw_geom_instanced(data, instance_count, instance_id_location) {
  for (var i in data.buffers) {
    var buffer = data.buffers[i];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vbo);
    gl.enableVertexAttribArray(buffer.location);
    gl.vertexAttribPointer(buffer.location, buffer.length / data.vertex_count, gl.FLOAT, false, 0, 0);
  }

  instance_count = instance_count || 1;
  for (var i = 0; i < instance_count; i++) {
    gl.uniform1f(instance_id_location, i);
    gl.drawArrays(data.mode, 0, data.vertex_count);
  }
}

// type: gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
function compile_shader(txt_src, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, txt_src);
  gl.compileShader(shader);
  if (config.GL_DEBUG) {
    if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader), txt_src);
    }
  }
  return shader;
}

function load_shader_program(vs_entry_point, fs_entry_point) {
  var vs = vs_shader_source.replace(vs_entry_point + "()", "main()");
  var fs = fs_shader_source.replace(fs_entry_point + "()", "main()");
  var program = gl.createProgram();
  gl.attachShader(program, compile_shader(vs, gl.VERTEX_SHADER));
  gl.attachShader(program, compile_shader(fs, gl.FRAGMENT_SHADER));

  for (var i in _locations) {
    gl.bindAttribLocation(program, i, _locations[i]);
  }

  gl.linkProgram(program);
  if (config.GL_DEBUG) {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program), "Program link error");
    }
  }
  return { handle: program };
}

// editor support
function load_program_from_source(vs_source, fs_source)
{
  var program = gl.createProgram();
  gl.attachShader(program, compile_shader(vs_source, gl.VERTEX_SHADER));
  gl.attachShader(program, compile_shader(fs_source, gl.FRAGMENT_SHADER));

  for (var i in _locations) {
    gl.bindAttribLocation(program, i, _locations[i]);
  }

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program), "Program link error");
  }

  return { handle: program };
}

// editor support
function destroy_shader_program(name)
{
  var program = programs[name]
  if (program) {
    gl.deleteProgram(program.handle)
    delete programs[name]
  }
  if (!config.EDITOR) {
    console.log("function destroy_shader_program should not be exported!");
  }
}

function send_uniforms(program, uniform_list) {
  if (!uniform_list || !program) {
    return;
  }

  for (var uniform_name in uniform_list) {
    var location = gl.getUniformLocation(program, uniform_name);

    if (!location) {
      continue;
    }

    var val = uniform_list[uniform_name];

    switch (val.length) {
      case 1: gl.uniform1fv(location, val); break;
      case 2: gl.uniform2fv(location, val); break;
      case 3: gl.uniform3fv(location, val); break;
      case 4: gl.uniform4fv(location, val); break;
      case 9: gl.uniformMatrix3fv(location, 0, val); break;
      case 16: gl.uniformMatrix4fv(location, 0, val); break;
    }
  }
}

function prepare_builtin_uniforms() {

  // allow the editor to override uniforms for debug
  if (config.EDITOR) {
    for (var uniform_name in uniforms) {
      uniforms[uniform_name] = uniform_editor_overrides.hasOwnProperty(uniform_name) ? uniform_editor_overrides[uniform_name]
                                                                                     : uniforms[uniform_name]
    }
  }

  if (config.CAM_UNIFORMS_ENABLED) {
    var ratio = canvas.width/canvas.height;
    var viewMatrix = mat4.create()
    var projectionMatrix = mat4.create0() // careful: 0 here
    var viewProjectionMatrix = mat4.create0()
    var viewProjectionMatrixInv = mat4.create()
    // derive camera matrices from simpler parameters
    //mat4.lookAt(viewMatrix, uniforms["u_cam_pos"], uniforms["u_cam_target"], [0.0, 1.0, 0.0]);
    mat4.lookAtTilt(viewMatrix, uniforms["u_cam_pos"], uniforms["u_cam_target"], uniforms["u_cam_tilt"]);
    mat4.perspective(projectionMatrix, uniforms["u_cam_fov"] * Math.PI / 180.0, ratio, 2.0, 10000.0)
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);
    mat4.invert(viewProjectionMatrixInv, viewProjectionMatrix);
    uniforms["u_view_proj_mat"] = viewProjectionMatrix;
    uniforms["u_view_proj_mat_inv"] = viewProjectionMatrixInv;
  }
}

function editor_assert_valid_uniform(val) {
  if (config.EDITOR) {
    if (val == undefined || val == 0 || val == 1) {
      // undefined/0 means inactive track
      return;
    }

    if (val.length == undefined) {
      console.log("Warning! expected uniform to be an array, got", val, "of type", typeof val);
    }
  }
}

function ease_linear(t) { return t; }
function ease_square(t) { return t*t; }
function ease_cubic(t) { return t*t*t; }
function ease_inv_square(t) { return 1.0 - ease_square(1.0-t); }
function ease_inv_cubic(t) { return 1.0 - ease_square(1.0-t); }

function resolve_animation_clip(clip, clip_time) {
  var anim = clip.animation;
  // Careful here: if anim is set to zero, it'll mean that the tract is
  // inactive which may not be the intension. use [0] if you want to inline
  // constants.
  // TODO: perhaps we should just have EVERY unform passed as an array or
  // a function returning an array. This would save some checks and simplify
  // things a bit.
  if (!anim && !clip.evaluate) {
    // no anim means the meaningful animation is that the track is active
    // in which case it's value is 1.
    return 1;
  }

  var easing = clip.easing || ease_linear;
  var t = easing(clip_time/clip.duration) * clip.duration;

  if (clip.evaluate) {
    return clip.evaluate(t);
  }

  if (anim.length == 0) {
    var zeros = []
    for (var i = 0; i < clip.components; i++)
      zeros.push(0)
    return zeros;
  }

  if (config.UNIFORM_INTERPOLATION_ENABLED) {
    //console.log("animate with clip time", clip_time);
    return animate(deep_clone(anim), t);
  } else {
    // TODO we should just do linear interpolation if we want to save space.
    // I don't think that only having constants here is useful.
    return anim;
  }
}

function resolve_animation_track(track, time) {
  for (var c in track) {
    var clip = track[c];

    var clip_time = time - clip.start;
    is_active = (clip_time >= 0 && clip_time <= clip.duration);

    if (is_active) {
      var val = resolve_animation_clip(clip, clip_time)
      editor_assert_valid_uniform(val);
      if (val) {
        return val;
      }
    }
  }
  // Inactive track (resolve_animation_clip returned undefined for all clips)
  return 0;
}

function resolve_animations(time) {
  for (var track in sequence) {
    uniforms[track] = resolve_animation_track(sequence[track], time);
  }
}

function render_to(dest) {
  var resolution;
  if (config.RENDER_TO_TEXTURE_ENABLED) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fbo);

    var target = dest.color ? dest.color : canvas;
    resolution = [target.width, target.height]
  } else {
    resolution = [canvas.width, canvas.height];
  }
  gl.viewport(0, 0, resolution[0], resolution[1]);
  uniforms["u_resolution"] = resolution;
}

function clear(color) {
  gl.clearColor(color[0], color[1], color[2], color[3]);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function use_shader(shader_program, texture_inputs, extra_uniforms) {
  gl.useProgram(shader_program);

  send_uniforms(shader_program, uniforms);
  send_uniforms(shader_program, extra_uniforms);

  prepare_texture_inputs(shader_program, texture_inputs);
}

function render_pass(pass, time) {
  if (pass.enabled) {
    if (!uniforms[pass.enabled]) {
      //console.log(" -- pass disabled");
      return;
    } else {
      //console.log(" -- pass enabled");
    }
  }

  if (config.GL_DEBUG && config.GL_DEBUG_TRACE) {
    console.log("== PASS ==", pass);
  }

  // actual render

  var resolution = prepare_render_to_texture(pass);
  gl.viewport(0, 0, resolution[0], resolution[1]);
  uniforms["u_resolution"] = resolution;

  prepare_clear(pass);

  var shader_program = get_shader_program(pass);

  if (!shader_program) {
    return;
  }

  var local_uniforms = {};
  if (pass.uniforms) {
    for (var u in pass.uniforms) {
      var item = pass.uniforms[u]
      local_uniforms[item.name] = item.track ? uniforms[item.track] : item.value;
    }
  }

  use_shader(shader_program, pass.texture_inputs, local_uniforms);

  set_blending(pass.blend);

  set_depth_test(pass.depth_test);

  render_geometries(pass, shader_program);

  cleanup_texture_inputs(pass);
}

// TODO, let's make it global for now for simplicity but this is tied to a specific
// render graph.
var rg_targets = {};

function init_rg(render_graph) {
  for (var tex_name in render_graph.textures) {
    var tex_desc = render_graph.textures[tex_name];
    // TODO
    textures[tex_name] = create_texture(
      0, 0,
      eval(tex_desc.format || "undefined"),
      null, // no data
      0,
      eval(tex_desc.linear_filtering || "undefined"),
      0,
      eval(tex_desc.float_texture || "undefined"),
      tex_desc.downscale
    );
  }
  var targets = render_graph.render_targets;
  for (var target_name in targets) {
    var target = targets[target_name];
    for (var tex_type in target) {
      target[tex_type] = textures[target[tex_type]];
    }
    create_render_target(target);
  }
  rg_targets = render_graph.render_targets;
}

function render_rg(time) {
  render_passes.map(function(pass) {
    render_pass(pass, time)
  });
}

function render_frame(time) {
  if (config.GL_DEBUG && config.GL_DEBUG_TRACE) {
    console.log("== FRAME START ==");
  }

  resolve_animations(time);

  prepare_builtin_uniforms();

  render_rg(time);

  if (config.GL_DEBUG && config.GL_DEBUG_TRACE) {
    console.log("== FRAME END ==");
  }
}

function set_depth_test(cond) {
  if (config.DEPTH_TEST_ENABLED) {
    if (cond) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
  }
}

function set_blending(blend) {
  if (config.BLENDING_ENABLED) {
    gl.disable(gl.BLEND);
    if (blend) {
      gl.enable(gl.BLEND);
      var blend_param = blendings[blend];
      gl.blendFunc(blend_param[0],blend_param[1]);
    }
  }
}


function prepare_clear(pass) {
  if (config.CLEAR_ENABLED) {
    if (pass.clear) {
      clear(pass.clear);
    }
  }
}

function create_render_target(target) {
  target.fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);

  if (target.color) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.color.tex, 0);
  if (target.depth) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, target.depth.tex, 0);

  if (config.GL_DEBUG) {
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      console.error("Incomplete framebuffer", WebGLDebugUtils["glEnumToString"](status));
    }
  }

  return target;
}

function prepare_render_to_texture(pass) {
  if (config.RENDER_TO_TEXTURE_ENABLED) {
    var target = pass.render_to ? rg_targets[pass.render_to] : null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);

    var size = target ? target.color : canvas;
    return [size.width, size.height]
  } else {
    return [canvas.width, canvas.height];
  }
}

function get_geometry(geometry_descriptor) {
  if (config.EDITOR) {
    if (!geometry_descriptor || !geometry_descriptor[0] || !geometries[geometry_descriptor[0]]) {
      console.log("Missing geometry");
      return geometry_placeholder
    }
    return geometries[geometry_descriptor[0]];
  }

  // exported geometry is passed by ref instead of name to reduce the number of strings.
  return geometry_descriptor[0];
}

function get_shader_program(pass) {
  if (config.EDITOR) {

    var name;
    if (pass.select_program) {
      var track = uniforms[pass.select_program];
      if (!track) {
        console.log("Missing animation track",pass.select_program,"to select the shader program");
        return placeholder_program.handle;
      }
      name = pass.programs[uniforms[pass.select_program][0]|0];
    } else {
      name = pass.program;
    }

    if (!name) {
      return null;
    }

    var shader_program = programs[name]

    if (!shader_program) {
      console.log("Missing program "+name+" (using placeholder)");
      shader_program = placeholder_program;
    }
    return shader_program.handle;
  } else {
    var program = pass.select_program ? pass.programs[uniforms[pass.select_program][0]|0]
                                      : pass.program;
    return program ? program.handle : null;
  }
}

function render_geometries(pass, shader_program) {
  // Let's put scene assets asside for now until we have decided their format and usefulness
  // A scene can be inlined in the sequence...
  // if (typeof scene == "string") {
  //   // ...or in its own asset
  //   scene = scenes[scene];
  // }

  for (var g = 0; g < pass.geometry.length; ++g) {
    // descriptor[0] is the geometry and descriptor[1] the (optional) instance count
    var descriptor = pass.geometry[g];
    var geometry = get_geometry(descriptor);

    // This is optional, but can be a convenient info to have in the shader.
    send_uniforms(shader_program, {"u_object_id": [g]});

    var instance_id_location = gl.getUniformLocation(shader_program, "u_instance_id");
    draw_geom_instanced(geometry, descriptor[1], instance_id_location);
  }
}

function init_placeholders() {
  geometry_placeholder = {
    buffers: [
      make_vbo(POS, [
        -100, 0, -100,
        -100, 0, 100,
        100, 0, 100,
        100, 0, 100,
        100, 0, -100,
        -100, 0, -100
      ]),
      make_vbo(NORMAL, [
        0, 1, 0,
        1, 1, 0,
        0, 1, 0,
        0, 0, 0,
        0, 1, 0,
        0, 1, 1
      ]),
      make_vbo(UV, [
        0, 0,
        0, 1,
        1, 1,
        1, 1,
        1, 0,
        0, 0
      ])
    ],
    mode: gl.TRIANGLES,
    vertex_count: 6
  }

  var vs_placeholder = "" +
    "precision lowp float;" +
    "uniform mat4 view_proj_mat;" +
    "attribute vec3 a_position;" +
    "varying vec3 v_position;" +
    "" +
    "void main()" +
    "{" +
      "gl_Position = view_proj_mat * vec4(a_position, 1.0);" +
      "v_position = a_position;" +
    "}" +
    "";
  var fs_placeholder = "" +
    "precision lowp float;" +
    "varying vec3 v_position;" +
    "" +
    "void main()" +
    "{" +
      "vec3 pos = v_position * 0.1;" +
      "gl_FragColor = vec4(" +
        "mod(floor(pos.x), 2.0) * 0.4 + 0.3," +
        "mod(floor(pos.y), 2.0) * 0.3 + 0.3," +
        "mod(floor(pos.z), 2.0) * 0.5 + 0.3," +
        "1.0" +
      ");" +
    "}" +
  "";

  placeholder_program = load_program_from_source(vs_placeholder, fs_placeholder);
}
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.1
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

var GLMAT_EPSILON = 0.000001;
var GLMAT_ARRAY_TYPE = Float32Array;
var GLMAT_RANDOM = Math.random;

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = function(a, stride, offset, count, fn, arg) {
  var vec = vec2.create();
  var i, l;
  if(!stride) {
      stride = 2;
  }

  if(!offset) {
      offset = 0;
  }
  
  if(count) {
      l = Math.min((count * stride) + offset, a.length);
  } else {
      l = a.length;
  }

  for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1];
  }
  
  return a;
};

/**
 * Returns a string representation of a vector
 *
 * param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function (out, scale) {
    scale = scale || 1.0;

    var r = GLMAT_RANDOM() * 2.0 * Math.PI;
    var z = (GLMAT_RANDOM() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
* Rotate a 3D vector around the x-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateX = function(out, a, b, c){
   var p = [], r=[];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0];
    r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
    r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
* Rotate a 3D vector around the y-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateY = function(out, a, b, c){
    var p = [], r=[];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
  
    //perform rotation
    r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
    r[1] = p[1];
    r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
  
    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
  
    return out;
};

/**
* Rotate a 3D vector around the z-axis
* @param {vec3} out The receiving vec3
* @param {vec3} a The vec3 point to rotate
* @param {vec3} b The origin of the rotation
* @param {Number} c The angle of rotation
* @returns {vec3} out
*/
vec3.rotateZ = function(out, a, b, c){
    var p = [], r=[];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];
  
    //perform rotation
    r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
    r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
    r[2] = p[2];
  
    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
  
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = function(a, stride, offset, count, fn, arg) {
  var vec = vec3.create();
  var i, l;
  if(!stride) {
      stride = 3;
  }

  if(!offset) {
      offset = 0;
  }
  
  if(count) {
      l = Math.min((count * stride) + offset, a.length);
  } else {
      l = a.length;
  }

  for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
  }
  
  return a;
};

/**
 * Returns a string representation of a vector
 *
 * param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = GLMAT_RANDOM();
    out[1] = GLMAT_RANDOM();
    out[2] = GLMAT_RANDOM();
    out[3] = GLMAT_RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = function(a, stride, offset, count, fn, arg) {
  var vec = vec4.create();
  var i, l;
  if(!stride) {
      stride = 4;
  }

  if(!offset) {
      offset = 0;
  }
  
  if(count) {
      l = Math.min((count * stride) + offset, a.length);
  } else {
      l = a.length;
  }

  for(i = offset; i < l; i += stride) {
      vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
      fn(vec, vec, arg);
      a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
  }
  
  return a;
};

/**
 * Returns a string representation of a vector
 *
 * param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
}; 

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
}; 

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
};


/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
};

/**
 * Creates a new zero-filles mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create0 = function() {
    return new GLMAT_ARRAY_TYPE(16);
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[1] = yx + wz;
    out[2] = zx - wy;
    out[3] = 0;

    out[4] = yx - wz;
    out[5] = 1 - xx - zz;
    out[6] = zy + wx;
    out[7] = 0;

    out[8] = zx + wy;
    out[9] = zy - wx;
    out[10] = 1 - xx - yy;
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
 // IMPORTANT: size optims assume out was created with mat4.create0() !
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    /*out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;*/
    out[5] = f;
    /*out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;*/
    out[10] = (far + near) * nf;
    out[11] = -1;
    /*out[12] = 0;
    out[13] = 0;*/
    out[14] = (2 * far * near) * nf;
    /*out[15] = 0;*/
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x = [0,0,0];
    var y = [0,0,0];
    var z = [0,0,0];
    
    vec3.subtract(z, eye, center);
    vec3.normalize(z, z);
    vec3.cross(x, up, z);
    vec3.normalize(x, x);
    vec3.cross(y, z, x);

    out[0] = x[0];
    out[1] = y[0];
    out[2] = z[0];
    out[3] = 0;
    out[4] = x[1];
    out[5] = y[1];
    out[6] = z[1];
    out[7] = 0;
    out[8] = x[2];
    out[9] = y[2];
    out[10] = z[2];
    out[11] = 0;
    out[12] = -vec3.dot(x, eye);
    out[13] = -vec3.dot(y, eye);
    out[14] = -vec3.dot(z, eye);
    out[15] = 1;

    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and tilt
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} tilt Tilt angle (radians)
 * @returns {mat4} out
 */
mat4.lookAtTilt = function (out, eye, center, tilt) {
    var x = [0,0,0];
    var y = [0,0,0];
    var z = [0,0,0];
    
    vec3.subtract(z, eye, center);
    vec3.normalize(z, z);
    vec3.cross(x, [0,1,0], z);
    vec3.normalize(x, x);
    vec3.cross(y, z, x);
    vec3.scale(y, y, Math.cos(tilt))
    vec3.scaleAndAdd(y, y, x, Math.sin(tilt));
    vec3.cross(x, y, z);

    out[0] = x[0];
    out[1] = y[0];
    out[2] = z[0];
    out[3] = 0;
    out[4] = x[1];
    out[5] = y[1];
    out[6] = z[1];
    out[7] = 0;
    out[8] = x[2];
    out[9] = y[2];
    out[10] = z[2];
    out[11] = 0;
    out[12] = -vec3.dot(x, eye);
    out[13] = -vec3.dot(y, eye);
    out[14] = -vec3.dot(z, eye);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
};


/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = function(out, a, b) {
  var tmpvec3 = vec3.create();
  var dot = vec3.dot(a, b);
  if (dot < -0.999999) {
      vec3.cross(tmpvec3, [1,0,0], a);
      if (vec3.length(tmpvec3) < 0.000001)
          vec3.cross(tmpvec3, [0,1,0], a);
      vec3.normalize(tmpvec3, tmpvec3);
      quat.setAxisAngle(out, tmpvec3, Math.PI);
      return out;
  } else if (dot > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
  } else {
      vec3.cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot;
      return quat.normalize(out, out);
  }
}

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = function(out, view, right, up) {
    var matr = mat3.create();
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];

    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];

    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];

    return quat.normalize(out, quat.fromMat3(out, matr));
};

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if ( fTrace > 0.0 ) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5/fRoot;  // 1/(4w)
        out[0] = (m[7]-m[5])*fRoot;
        out[1] = (m[2]-m[6])*fRoot;
        out[2] = (m[3]-m[1])*fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if ( m[4] > m[0] )
          i = 1;
        if ( m[8] > m[i*3+i] )
          i = 2;
        var j = (i+1)%3;
        var k = (i+2)%3;
        
        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }
    
    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

var img_textures_data = {};


function img_texture_init() {
  if (!config.IMG_TEXTURE_ENABLED)
    return;
  

}



function handle_img_texture_loaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);


}


function create_img_texture(filename, callback) {

  
  var imgTexture = gl.createTexture();

  img_textures_data[filename] = {
    tex: imgTexture,
    width: 0,
    height: 0
  };


  var image = new Image();
  image.onload = function() { 
    //retrieve width and height of the texture
    img_textures_data[filename].width = image.width;
    img_textures_data[filename].height = image.height;

    handle_img_texture_loaded(image, imgTexture); 
    callback(); //cf enginedriver callback
  }

  image.src = filename;
  
  return img_textures_data[filename];//we return something where width and height have not been set yet as loading texture is asynchronous
}

function paris_subdivision_rec(paths, num_subdivs, sub_id) {
    if (sub_id < 0) { sub_id = 0; }
    var sub_paths = [];
    for (var i in paths) {
        var sub = city_subdivision(paths[i], sub_id)
        if (!sub) {
            sub_paths.push(paths[i]);
        }
        else {
            sub_paths.push(sub[0], sub[1]);
        }
    }
    if (num_subdivs == 1) {
        return sub_paths;
    }
    return paris_subdivision_rec(sub_paths, num_subdivs - 1, sub_id - 1);
}


// TODO make this show in the editor: it defines how the min size of city blocks
var MIN_PERIMETER = 260;

function paris_subdivision(path, sub_id) {
    var path_length = path.length;

    // a1 is the index of the point starting the first edge we'll cut.
    // b1 is the index of the point starting the second edge we'll cut.
    var a1;
    var maxd = 0;
    var perimeter = 0;
    var i; // loop index, taken out to win a few bytes
    // pick the longest segment
    for (i = 0; i < path_length; ++i) {
        var d = vec2.distance(path[i], path[(i+1)%path_length]);
        if (d > maxd) {
            maxd = d;
            a1 = i;
        }
        perimeter += d;
    }

    if (perimeter < MIN_PERIMETER) { return null; }

    var a2 = (a1+1) % path_length;
    var b1, b2;

    do {
        b1 = rand_int(path_length);
        if (a1 == b1 || a1 == b1 + 1) { continue; }

        b2 = (b1+1) % path_length;

        var f1 = 0.5 + (0.5 - Math.abs(seedable_random() - 0.5)) * 0.2;
        var f2 = 0.5 + (0.5 - Math.abs(seedable_random() - 0.5)) * 0.2;

        var p_a3_1 = { '0': path[a1][0]*f1 + path[a2][0]*(1.0-f1), '1': path[a1][1]*f1 + path[a2][1]*(1-f1), subdiv: sub_id};
        var p_a3_2 = { '0': path[a1][0]*f1 + path[a2][0]*(1.0-f1), '1': path[a1][1]*f1 + path[a2][1]*(1-f1), subdiv: path[a1].subdiv};
        var p_b3_1 = { '0': path[b1][0]*f2 + path[b2][0]*(1.0-f2), '1': path[b1][1]*f2 + path[b2][1]*(1-f2), subdiv: sub_id};
        var p_b3_2 = { '0': path[b1][0]*f2 + path[b2][0]*(1.0-f2), '1': path[b1][1]*f2 + path[b2][1]*(1-f2), subdiv: path[b1].subdiv};

        break;
    } while (1);

    var path1 = [p_a3_1, p_b3_2]
    for (i = b2; i != a2; i = mod((i+1), path_length)) {
        path1.push(path[i]);
    }

    var path2 = [p_b3_1, p_a3_2]
    for (i = a2; i != b2; i = mod((i+1), path_length)) {
        path2.push(path[i]);
    }

    return [path1, path2];
}

function plazza(path, pos, rad) {
    for (p=0; p<path.length; ++p) {
      if (vec2.distance(path[p], pos) < rad) {
        return true;
      }
    }
    return false;
}


var ctx_2d = {};

function text_init() {
  if (!config.TEXT_ENABLED)
    return;
  
  canvas_2d = document.createElement("canvas");
  canvas_2d.width = canvas_2d.height = 2048;
  ctx_2d = canvas_2d.getContext("2d");
  //minify_context(ctx_2d);
  ctx_2d.textAlign = "center";
  ctx_2d.fillStyle = "#fff";
}

function clear_texture_canvas() {
  ctx_2d.clearRect(0, 0, 2048, 2048);
}

function texture_fill_rect(x, y, w, h, style) {
  var sz = 2048;
  ctx_2d.fillStyle = style;
  ctx_2d.fillRect(x*sz, y*sz, w*sz, h*sz);
}

function create_text_texture(fontSize, text) {
  clear_texture_canvas();
  
  fontSize *= 100;
  ctx_2d.font = fontSize + "px Arial";

  var measure = ctx_2d.measureText(text);
  var width = 3 + measure.width|0,
    height = fontSize * 1.5;
  ctx_2d.fillText(text, width / 2, fontSize);
  
  return create_texture(
    width, height, gl.RGBA,
    ctx_2d.getImageData(0, 0, width, height).data,
    false, true
  );
}

function create_vertical_text_texture(fontSize, text) {
  clear_texture_canvas();
  
  fontSize *= 100;
  ctx_2d.font = fontSize + "px Calibri";

  var width = fontSize,
    height = fontSize;
	
  for (var i = 0; i < text.length; ++i) {
	ctx_2d.fillText(text[i], width / 2, height);
	height += fontSize * 0.7;
  }
  
  height += fontSize * 0.3;
  
  return create_texture(
    width, height, gl.RGBA,
    ctx_2d.getImageData(0, 0, width, height).data,
    false, true
  );
}function create_texture(width, height, format, data, allow_repeat, linear_filtering, mipmaps, float_tex, downscale) {
  if (config.EDITOR) {
    if (float_tex && data) {
      // wouldn't be hard to add, but we haven't needed it yet.
      console.log("!!! We don't support uploading data to float textures, something may be busted.");
    }

    if ((format == gl.DEPTH_COMPONENT) && (linear_filtering || mipmaps || float_tex)) {
      // bug somewhere
      console.log("!!! Creating a depth texture with broken parameters, it won't work.");
    }
  }

  var format = format || gl.RGBA;
  var width = width || canvas.width;
  var height = height || canvas.height;
  var downscale = downscale || 0;

  width = Math.floor(width * Math.pow(0.5, downscale));
  height = Math.floor(height * Math.pow(0.5, downscale));

  var wrap = allow_repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  var min_filtering = linear_filtering
                    ? mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
                    : gl.NEAREST;
  var mag_filtering = linear_filtering ? gl.LINEAR : gl.NEAREST;

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min_filtering);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mag_filtering);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0,
                format,
                (config.TEXTURE_FLOAT_ENABLED && float_tex) ? gl_ext_half_float.HALF_FLOAT_OES
                          : (format == gl.DEPTH_COMPONENT) ? gl.UNSIGNED_SHORT
                                                           : gl.UNSIGNED_BYTE,
                data ? new Uint8Array(data, 0, 0) : null);

  gl.bindTexture(gl.TEXTURE_2D, null);

  return {
    tex: texture,
    width: width,
    height: height
  };
}

function destroy_texture(texture) {
  gl.deleteTexture(texture.tex);
}

function texture_unit(i) { return gl.TEXTURE0+i; }

function prepare_texture_inputs(shader_program, texture_inputs) {
  if (config.TEXTURE_INPUTS_ENABLED) {
    texture_inputs = texture_inputs || [];

    for (var i=0; i<texture_inputs.length; ++i) {
      var texture = texture_inputs[i];
      if (config.EDITOR) {
        if (typeof(texture) != "string") {
          console.log("Texture should be passed by name in the editor");
        }
        texture = textures[texture];
        if (!texture) {
          // TODO: should use a placeholder texture or something.
          // This can happen in the editor if a frame is rendered
          // while a texture is not loaded yet.
          console.log("render: missing texture");
          return;
        }
      }
      var tex = texture.tex;
      gl.activeTexture(texture_unit(i));
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(gl.getUniformLocation(shader_program,"u_texture_"+i), i);
    }
  }
}

function cleanup_texture_inputs(pass) {
  if (config.TEXTURE_INPUTS_ENABLED) {
    // we may be able to remove this loop to loose a few bytes
    if (!pass.texture_inputs) { return; }
    for (var i=0; i<pass.texture_inputs.length; ++i) {
      gl.activeTexture(texture_unit(i));
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}
  // change that to true to log
  function log() {
    // console.log.apply(console, arguments);
  }
  function editing() { return false; }
  function n2f(n) {
    return Math.pow(2, (n - 69) / 12) * 440;
  }

  AudioNode.prototype.c = AudioNode.prototype.connect;

  ac = new AudioContext();
  master = ac.createGain();
  master.c(ac.destination);
  //minify_context(ac);

  /** @constructor */
  function SND(data) {
    log('SND.constr', this);
    this.playing = false;
    SONG = data ? data.SONG : SONG;
    instruments = data.instruments;
    sends = data.sends;
  };
  
  SND.AD = function(p/*aram*/, l/*start*/, u/*end*/, t/*startTime*/, a/*attack*/, d/*decay*/) {
    p.setValueAtTime(l, t);
    p.linearRampToValueAtTime(u, t + a);
    // XXX change that to setTargetAtTime
    p.linearRampToValueAtTime(l, t + d);
  };
  SND.D = function(p, t, v, k) {
    p.value = v;
    p.setValueAtTime(v, t);
    p.setTargetAtTime(0, t, k);
  }
  SND.DCA = function(i, v, t, a, d) {
    var g = ac.createGain();
    i.c(g);
    SND.AD(g.gain, 0, v, t, a, d);
    return g;
  };
  function NoiseBuffer() {
    var i,l;
    if (!SND._noisebuffer) {
      SND._noisebuffer = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate / 2);
      var cdata = SND._noisebuffer.getChannelData(0);
      for(i=0,l=cdata.length;i<l;i++) {
        cdata[i] = Math.random() * 2.0 - 1.0;
      }
    }
    return SND._noisebuffer;
  }
  SND.ReverbBuffer = function(opts) {
    var i,l;
    var len = ac.sampleRate * opts.l
    var buffer = ac.createBuffer(2, len, ac.sampleRate)
    for(i=0,l=buffer.length;i<l;i++) {
      var s =  Math.pow(1 - i / len, opts.d);
      buffer.getChannelData(0)[i] = (Math.random() * 2 - 1)*2;
      buffer.getChannelData(1)[i] = (Math.random() * 2 - 1)*2;
    }
    return buffer;
  }

  SND.DistCurve = function(k) {
    var c = new Float32Array(ac.sampleRate);
    var deg = Math.PI / 180;
    for (var i = 0; i < c.length; i++) {
      var x = i * 2 / c.length - 1;
      c[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return c;
  }
  SND.setSends = function(sendGains, out) {
    sends.forEach(function(send, i) {
      var amp = ac.createGain();
      amp.gain.value = sendGains[i] || 0.0;
      out.c(amp);
      amp.c(send);
    });
  };

  // In fractional beat
  SND.prototype.t = function() {
    return (ac.currentTime - this.startTime) * (125/ 60);
  }

  SND.prototype.seek = function(beat)
  {
    // todo
  }

  SND.prototype.mute = function()
  {
    master.gain.setTargetAtTime(0.0, ac.currentTime, 0.03);
  }

  SND.prototype.unmute = function()
  {
    master.gain.setTargetAtTime(1.0, ac.currentTime, 0.03);
  }


  SND.prototype.p = function() {
    if (this.playing == true) return;
    if (!this.startTime) this.startTime = ac.currentTime;
    var stepTime = 15 / 125,
        patternTime = stepTime * 64,
        currentTime = ac.currentTime;

    this.currentPos = 0;
    if (editing()) {
      // the patter to loop, or -1 to just play the track
      this.loop = this.loop != undefined ? this.loop : -1;
      // start at the loop if specified, beginning otherwise
      this.currentPos = this.loop != -1 ? this.loop : 0;
    }

    this.playing = true;

    var patternScheduler = (function() {
      if (this.playing == false) return;
      if (currentTime - ac.currentTime < (patternTime / 4)) {
        SND.st = [];
        for(i=0;i<64;i++) { SND.st[i] = currentTime + (stepTime * i); }
        if (SONG.playlist.length == this.currentPos) {
          return;
        }
        var cP = SONG.playlist[this.currentPos];
        log(cP);
        for (var instrId in cP) {
          if (cP.hasOwnProperty(instrId)) {
            log("scheduling", cP[instrId], "for", instrId)
            var data = SONG.patterns[cP[instrId]];
            SND.playPattern(instruments[instrId], SND.st, stepTime, data); 
          }
        }
        if (editing()) {
          if (this.loop == -1) {
            this.currentPos = (this.currentPos + 1) % SONG.playlist.length;
          } else {
            this.currentPos = this.loop;
          }
        } else{
          this.currentPos++;
        }
        currentTime += patternTime;
      }
      setTimeout(patternScheduler, 1000);
    }).bind(this);
    patternScheduler();
  };
  SND.prototype.s = function() {
    this.playing = false;
  }
  
  // SEND EFFECTS
  
  /** @constructor */
  SND.DEL = function() {
    var opts = {t: 0.36, fb: 0.4, m: 0.6, f: 800, q: 2};
    var delay = ac.createDelay();
    delay.delayTime.value = opts.t;
    var fb = ac.createGain();
    var flt = ac.createBiquadFilter();
    flt.type = 'highpass';
    flt.frequency.value = opts.f;
    flt.Q.value = opts.q;
    fb.gain.value = opts.fb;
    var mix = ac.createGain();
    mix.gain.value = opts.m;
    delay.c(mix);
    delay.c(flt);
    flt.c(fb);
    fb.c(delay);
    mix.c(master);
    return delay;
  }
  
  /** @constructor */
  SND.REV = function() {
    var opts = {d: 0.05, m: 1};
    var cnv = ac.createConvolver();
    var mix = ac.createGain();
    cnv.buffer = SND.ReverbBuffer({l: 2, d: opts.d});
    mix.gain.value = opts.m;
    cnv.c(mix);
    mix.c(master);
    return cnv;
  }

  /** @constructor */
  SND.DIST = function() {
    var ws = ac.createWaveShaper();
    mix = ac.createGain();
    ws.curve = SND.DistCurve(50);
    mix.gain.value = 0.5;
    ws.c(mix);
    mix.c(master);
    return ws;
  }
  
  // INSTRUMENTS
  
  SND.playPattern = function(instrument, times, stepTime, data) {
    times.forEach(function(t, i) {
      note = data[i];
      if (typeof(note) !== 'object') {
        note = [note, {}]
      }
      if (note[0] != 0) {
        instrument(t, stepTime, note);
      }
    });
  };
  
  var noise = NoiseBuffer();
  SND.Noise = function(t) {
    var smp = ac.createBufferSource();
    var flt = ac.createBiquadFilter();
    smp.c(flt);
    var amp = SND.DCA(flt, 0.1, t, 0.001, 0.06);
    flt.frequency.value = 8000;
    flt.type = "highpass";
    flt.Q.value = 8;
    smp.buffer = noise;
    smp.c(amp);
    SND.setSends([0.3], amp);
    amp.c(master);
    smp.start(t);smp.stop(t + 0.06);
  }
  
  SND.Drum = function(t) {
    var osc = ac.createOscillator();
    var click = ac.createOscillator();
    click.type = "square";
    click.frequency.value = 40;

    // SND.AD(osc.frequency, opts.en, opts.st, t, 0, opts.k * 8);
    osc.frequency.value = 90;
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.setTargetAtTime(50, t+0.001, 0.03)

    function d(o, e){
      var amp = ac.createGain();
      o.c(amp);
      SND.D(amp.gain, t, 1.3, e);
      amp.c(master);
    }

    d(osc, 0.03)
    d(click, 0.005)

    osc.start(t);osc.stop(t + 0.2);
    click.start(t);click.stop(t + 0.009);
  }

  SND.Snare = function(t) {
    var f = [111 + 175, 111 + 224];
    var o = [];

    // filter for noise and osc
    var fl = ac.createBiquadFilter();
    // fl.type = "lowpass" // default
    fl.frequency.value = 3000;

    // amp for oscillator
    var amposc = ac.createGain();
    SND.D(amposc.gain, t, 0.4, 0.015);

    // two osc
    f.forEach(function(e, i) {
      o[i] = ac.createOscillator();
      o[i].type = "triangle";
      o[i].frequency.value = f[i];
      o[i].c(amposc);
      o[i].start(t); o[i].stop(t + 0.4);
    })

    // noise
    var smp = ac.createBufferSource();
    smp.buffer = noise;
    var ampnoise = ac.createGain();
    smp.c(ampnoise);
    SND.D(ampnoise.gain, t, 0.24, 0.045);
    smp.start(t);smp.stop(t + 0.1);

    ampnoise.c(fl);
    amposc.c(fl);

    SND.setSends([0.3, 0.2], fl);
    fl.c(master);
  }
  
  SND.Synth = function(t, stepTime, data) {
    var osc = ac.createOscillator();
    var flt = ac.createBiquadFilter();
    flt.Q.value = 2;
    osc.frequency.value = n2f(data[0]);
    osc.type = "square"
    len = stepTime * (data[1].l || 1);
    osc.c(flt);
    var amp = SND.DCA(flt, data[1].v || 0.1, t, 0.01, len);
    SND.setSends([0.5, 0.6], amp);
    amp.c(master);
    SND.AD(flt.frequency, 200, 2000, t, 0.01, len / 2);
    osc.start(t);osc.stop(t + len);
  }

  SND.Sub = function(t, stepTime, data) {
    var osc = ac.createOscillator();
    osc.frequency.value = n2f(data[0]);
    len = stepTime * data[1].l;
    // len = stepTime * (data[1].l || 1);
    var amp = SND.DCA(osc, 0.6, t, 0.05, len);
    amp.c(master);
    osc.start(t);osc.stop(t + len);
  }

  SND.Reese = function(t, stepTime, data) {
    var note = data[0];
    var len = stepTime * data[1].l;

    var flt = ac.createBiquadFilter();
    var o = ac.createOscillator();
    o.frequency.value = data[1].f * (125 / 120); // fetch tempo here.
    var s = ac.createGain();
    s.gain.value = 8000;
    o.c(s);
    s.c(flt.frequency);
    o.start(t); o.stop(t + 10); // long tail
    amp = SND.DCA(flt, data[1].v, t, 0, len);
    for (var i = 0; i < 2; i++) {
      o = ac.createOscillator();
      o.frequency.value = n2f(note);
      o.type = "square";
      o.detune.value = i * 50;
      o.c(flt);
      o.start(t);o.stop(t+len);
    }
    amp.c(master)
    SND.setSends([0,0.4,1], amp);
  }

  SND.Glitch = function(t, stepTime, data) {
    var len = (data[1].l || 1) * stepTime;
    var source = ac.createBufferSource();
    var end = t + len;
    var sources = [];
    var i = 0;
    var sink = ac.createGain();
    sink.gain.value = 0.05;
    while (t < end) {
      sources[i] = ac.createBufferSource();
      sources[i].buffer = noise;
      sources[i].loop = true;
      sources[i].loopStart = 0;
      sources[i].loopEnd = Math.random() * 0.05;
      sources[i].start(t);
      t += Math.random() * 0.5;
      t = Math.min(t, end);
      sources[i].stop(t);
      sources[i].c(sink);
      i++;
    }
    sink.c(master);
    SND.setSends([0.3, 0.8], sink);
  }





////////////////// Audio tag implementation

/** @constructor */
function SNDStreaming(path, bpm)
{
   var element = new Audio(path);

  // uncomment this line if you are debuggin the exported code and don't want
  // to be bothered with the music.
  //this.element.volume = 0;

  this.p = function()
  {
    element.play();
  }

  this.s = function()
  {
    element.pause();
  }

  this.t = function()
  {
    return element.currentTime * (bpm / 60);
  }

  this.seek = function(beat)
  {
    element.currentTime = beat * 60 / bpm;
  }

  this.mute = function()
  {
    element.volume = 0
  }

  this.unmute = function()
  {
    element.volume = 1
  }

  return this;
}
/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

// Various functions for helping debug WebGL apps.

if (config.GL_DEBUG) {

WebGLDebugUtils = function() {

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Wrapped error logging function.
 * @param {string} msg Message to log.
 */
var error = function(msg) {
  if (window.console && window.console.error) {
    window.console.error(msg);
  } else {
    log(msg);
  }
};


/**
 * Which arguments are enums based on the number of arguments to the function.
 * So
 *    'texImage2D': {
 *       9: { 0:true, 2:true, 6:true, 7:true },
 *       6: { 0:true, 2:true, 3:true, 4:true },
 *    },
 *
 * means if there are 9 arguments then 6 and 7 are enums, if there are 6
 * arguments 3 and 4 are enums
 *
 * @type {!Object.<number, !Object.<number, string>}
 */
var glValidEnumContexts = {
  // Generic setters and getters

  'enable': {1: { 0:true }},
  'disable': {1: { 0:true }},
  'getParameter': {1: { 0:true }},

  // Rendering

  'drawArrays': {3:{ 0:true }},
  'drawElements': {4:{ 0:true, 2:true }},

  // Shaders

  'createShader': {1: { 0:true }},
  'getShaderParameter': {2: { 1:true }},
  'getProgramParameter': {2: { 1:true }},
  'getShaderPrecisionFormat': {2: { 0: true, 1:true }},

  // Vertex attributes

  'getVertexAttrib': {2: { 1:true }},
  'vertexAttribPointer': {6: { 2:true }},

  // Textures

  'bindTexture': {2: { 0:true }},
  'activeTexture': {1: { 0:true }},
  'getTexParameter': {2: { 0:true, 1:true }},
  'texParameterf': {3: { 0:true, 1:true }},
  'texParameteri': {3: { 0:true, 1:true, 2:true }},
  'texImage2D': {
     9: { 0:true, 2:true, 6:true, 7:true },
     6: { 0:true, 2:true, 3:true, 4:true }
  },
  'texSubImage2D': {
    9: { 0:true, 6:true, 7:true },
    7: { 0:true, 4:true, 5:true }
  },
  'copyTexImage2D': {8: { 0:true, 2:true }},
  'copyTexSubImage2D': {8: { 0:true }},
  'generateMipmap': {1: { 0:true }},
  'compressedTexImage2D': {7: { 0: true, 2:true }},
  'compressedTexSubImage2D': {8: { 0: true, 6:true }},

  // Buffer objects

  'bindBuffer': {2: { 0:true }},
  'bufferData': {3: { 0:true, 2:true }},
  'bufferSubData': {3: { 0:true }},
  'getBufferParameter': {2: { 0:true, 1:true }},

  // Renderbuffers and framebuffers

  'pixelStorei': {2: { 0:true, 1:true }},
  'readPixels': {7: { 4:true, 5:true }},
  'bindRenderbuffer': {2: { 0:true }},
  'bindFramebuffer': {2: { 0:true }},
  'checkFramebufferStatus': {1: { 0:true }},
  'framebufferRenderbuffer': {4: { 0:true, 1:true, 2:true }},
  'framebufferTexture2D': {5: { 0:true, 1:true, 2:true }},
  'getFramebufferAttachmentParameter': {3: { 0:true, 1:true, 2:true }},
  'getRenderbufferParameter': {2: { 0:true, 1:true }},
  'renderbufferStorage': {4: { 0:true, 1:true }},

  // Frame buffer operations (clear, blend, depth test, stencil)

  'clear': {1: { 0: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }}},
  'depthFunc': {1: { 0:true }},
  'blendFunc': {2: { 0:true, 1:true }},
  'blendFuncSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},
  'blendEquation': {1: { 0:true }},
  'blendEquationSeparate': {2: { 0:true, 1:true }},
  'stencilFunc': {3: { 0:true }},
  'stencilFuncSeparate': {4: { 0:true, 1:true }},
  'stencilMaskSeparate': {2: { 0:true }},
  'stencilOp': {3: { 0:true, 1:true, 2:true }},
  'stencilOpSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},

  // Culling

  'cullFace': {1: { 0:true }},
  'frontFace': {1: { 0:true }},

  // ANGLE_instanced_arrays extension

  'drawArraysInstancedANGLE': {4: { 0:true }},
  'drawElementsInstancedANGLE': {5: { 0:true, 2:true }},

  // EXT_blend_minmax extension

  'blendEquationEXT': {1: { 0:true }}
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Map of names to numbers.
 * @type {Object}
 */
var enumStringToValue = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    enumStringToValue = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
        enumStringToValue[propertyName] = ctx[propertyName];
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? ("gl." + name) :
      ("/*UNKNOWN WebGL ENUM*/ 0x" + value.toString(16) + "");
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param {string} functionName the name of the WebGL function.
 * @param {number} numArgs the number of arguments passed to the function.
 * @param {number} argumentIndex the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {
  var funcInfo = glValidEnumContexts[functionName];
  if (funcInfo !== undefined) {
    var funcInfo = funcInfo[numArgs];
    if (funcInfo !== undefined) {
      if (funcInfo[argumentIndex]) {
        if (typeof funcInfo[argumentIndex] === 'object' &&
            funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined) {
          var enums = funcInfo[argumentIndex]['enumBitwiseOr'];
          var orResult = 0;
          var orEnums = [];
          for (var i = 0; i < enums.length; ++i) {
            var enumValue = enumStringToValue[enums[i]];
            if ((value & enumValue) !== 0) {
              orResult |= enumValue;
              orEnums.push(glEnumToString(enumValue));
            }
          }
          if (orResult === value) {
            return orEnums.join(' | ');
          } else {
            return glEnumToString(value);
          }
        } else {
          return glEnumToString(value);
        }
      }
    }
  }
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else {
    return value.toString();
  }
}

/**
 * Converts the arguments of a WebGL function to a string.
 * Attempts to convert enum arguments to strings.
 *
 * @param {string} functionName the name of the WebGL function.
 * @param {number} args The arguments.
 * @return {string} The arguments as a string.
 */
function glFunctionArgsToString(functionName, args) {
  // apparently we can't do args.join(",");
  var argStr = "";
  var numArgs = args.length;
  for (var ii = 0; ii < numArgs; ++ii) {
    argStr += ((ii == 0) ? '' : ', ') +
        glFunctionArgToString(functionName, numArgs, ii, args[ii]);
  }
  return argStr;
};


function makePropertyWrapper(wrapper, original, propertyName) {
  //log("wrap prop: " + propertyName);
  wrapper.__defineGetter__(propertyName, function() {
    return original[propertyName];
  });
  // TODO(gmane): this needs to handle properties that take more than
  // one value?
  wrapper.__defineSetter__(propertyName, function(value) {
    //log("set: " + propertyName);
    original[propertyName] = value;
  });
}

// Makes a function that calls a function on another object.
function makeFunctionWrapper(original, functionName) {
  //log("wrap fn: " + functionName);
  var f = original[functionName];
  return function() {
    //log("call: " + functionName);
    var result = f.apply(original, arguments);
    return result;
  };
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 * @param {!function(funcName, args): void} opt_onFunc The
 *        function to call when each webgl function is called.
 *        You can use this to log all calls for example.
 * @param {!WebGLRenderingContext} opt_err_ctx The webgl context
 *        to call getError on if different than ctx.
 */
function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx) {
  opt_err_ctx = opt_err_ctx || ctx;
  init(ctx);
  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        var numArgs = args.length;
        for (var ii = 0; ii < numArgs; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              glFunctionArgToString(functionName, numArgs, ii, args[ii]);
        }
        error("WebGL error "+ glEnumToString(err) + " in "+ functionName +
              "(" + argStr + ")");
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      if (opt_onFunc) {
        opt_onFunc(functionName, arguments);
      }
      var result = ctx[functionName].apply(ctx, arguments);
      var err = opt_err_ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
      if (propertyName != 'getExtension') {
        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
      } else {
        var wrapped = makeErrorWrapper(ctx, propertyName);
        wrapper[propertyName] = function () {
          var result = wrapped.apply(ctx, arguments);
          return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
        };
      }
    } else {
      makePropertyWrapper(wrapper, ctx, propertyName);
    }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow.hasOwnProperty(err)) {
        if (glErrorShadow[err]) {
          glErrorShadow[err] = false;
          return err;
        }
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

function resetToInitialState(ctx) {
  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
  var tmp = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
  for (var ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii);
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
    ctx.vertexAttrib1f(ii, 0);
  }
  ctx.deleteBuffer(tmp);

  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
  for (var ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
  }

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.useProgram(null);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
  ctx.disable(ctx.BLEND);
  ctx.disable(ctx.CULL_FACE);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.disable(ctx.DITHER);
  ctx.disable(ctx.SCISSOR_TEST);
  ctx.blendColor(0, 0, 0, 0);
  ctx.blendEquation(ctx.FUNC_ADD);
  ctx.blendFunc(ctx.ONE, ctx.ZERO);
  ctx.clearColor(0, 0, 0, 0);
  ctx.clearDepth(1);
  ctx.clearStencil(-1);
  ctx.colorMask(true, true, true, true);
  ctx.cullFace(ctx.BACK);
  ctx.depthFunc(ctx.LESS);
  ctx.depthMask(true);
  ctx.depthRange(0, 1);
  ctx.frontFace(ctx.CCW);
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
  ctx.lineWidth(1);
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  // TODO: Delete this IF.
  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
  }
  ctx.polygonOffset(0, 0);
  ctx.sampleCoverage(1, false);
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
  ctx.stencilMask(0xFFFFFFFF);
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while(ctx.getError()) {}
}

function makeLostContextSimulatingCanvas(canvas) {
  var unwrappedContext_;
  var wrappedContext_;
  var onLost_ = [];
  var onRestored_ = [];
  var wrappedContext_ = {};
  var contextId_ = 1;
  var contextLost_ = false;
  var resourceId_ = 0;
  var resourceDb_ = [];
  var numCallsToLoseContext_ = 0;
  var numCalls_ = 0;
  var canRestore_ = false;
  var restoreTimeout_ = 0;

  // Holds booleans for each GL error so can simulate errors.
  var glErrorShadow_ = { };

  canvas.getContext = function(f) {
    return function() {
      var ctx = f.apply(canvas, arguments);
      // Did we get a context and is it a WebGL context?
      if (ctx instanceof WebGLRenderingContext) {
        if (ctx != unwrappedContext_) {
          if (unwrappedContext_) {
            throw "got different context"
          }
          unwrappedContext_ = ctx;
          wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
        }
        return wrappedContext_;
      }
      return ctx;
    }
  }(canvas.getContext);

  function wrapEvent(listener) {
    if (typeof(listener) == "function") {
      return listener;
    } else {
      return function(info) {
        listener.handleEvent(info);
      }
    }
  }

  var addOnContextLostListener = function(listener) {
    onLost_.push(wrapEvent(listener));
  };

  var addOnContextRestoredListener = function(listener) {
    onRestored_.push(wrapEvent(listener));
  };


  function wrapAddEventListener(canvas) {
    var f = canvas.addEventListener;
    canvas.addEventListener = function(type, listener, bubble) {
      switch (type) {
        case 'webglcontextlost':
          addOnContextLostListener(listener);
          break;
        case 'webglcontextrestored':
          addOnContextRestoredListener(listener);
          break;
        default:
          f.apply(canvas, arguments);
      }
    };
  }

  wrapAddEventListener(canvas);

  canvas.loseContext = function() {
    if (!contextLost_) {
      contextLost_ = true;
      numCallsToLoseContext_ = 0;
      ++contextId_;
      while (unwrappedContext_.getError()) {}
      clearErrors();
      glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
      var event = makeWebGLContextEvent("context lost");
      var callbacks = onLost_.slice();
      setTimeout(function() {
          //log("numCallbacks:" + callbacks.length);
          for (var ii = 0; ii < callbacks.length; ++ii) {
            //log("calling callback:" + ii);
            callbacks[ii](event);
          }
          if (restoreTimeout_ >= 0) {
            setTimeout(function() {
                canvas.restoreContext();
              }, restoreTimeout_);
          }
        }, 0);
    }
  };

  canvas.restoreContext = function() {
    if (contextLost_) {
      if (onRestored_.length) {
        setTimeout(function() {
            if (!canRestore_) {
              throw "can not restore. webglcontestlost listener did not call event.preventDefault";
            }
            freeResources();
            resetToInitialState(unwrappedContext_);
            contextLost_ = false;
            numCalls_ = 0;
            canRestore_ = false;
            var callbacks = onRestored_.slice();
            var event = makeWebGLContextEvent("context restored");
            for (var ii = 0; ii < callbacks.length; ++ii) {
              callbacks[ii](event);
            }
          }, 0);
      }
    }
  };

  canvas.loseContextInNCalls = function(numCalls) {
    if (contextLost_) {
      throw "You can not ask a lost contet to be lost";
    }
    numCallsToLoseContext_ = numCalls_ + numCalls;
  };

  canvas.getNumCalls = function() {
    return numCalls_;
  };

  canvas.setRestoreTimeout = function(timeout) {
    restoreTimeout_ = timeout;
  };

  function isWebGLObject(obj) {
    //return false;
    return (obj instanceof WebGLBuffer ||
            obj instanceof WebGLFramebuffer ||
            obj instanceof WebGLProgram ||
            obj instanceof WebGLRenderbuffer ||
            obj instanceof WebGLShader ||
            obj instanceof WebGLTexture);
  }

  function checkResources(args) {
    for (var ii = 0; ii < args.length; ++ii) {
      var arg = args[ii];
      if (isWebGLObject(arg)) {
        return arg.__webglDebugContextLostId__ == contextId_;
      }
    }
    return true;
  }

  function clearErrors() {
    var k = Object.keys(glErrorShadow_);
    for (var ii = 0; ii < k.length; ++ii) {
      delete glErrorShadow_[k];
    }
  }

  function loseContextIfTime() {
    ++numCalls_;
    if (!contextLost_) {
      if (numCallsToLoseContext_ == numCalls_) {
        canvas.loseContext();
      }
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextFunctionWrapper(ctx, functionName) {
    var f = ctx[functionName];
    return function() {
      // log("calling:" + functionName);
      // Only call the functions if the context is not lost.
      loseContextIfTime();
      if (!contextLost_) {
        //if (!checkResources(arguments)) {
        //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
        //  return;
        //}
        var result = f.apply(ctx, arguments);
        return result;
      }
    };
  }

  function freeResources() {
    for (var ii = 0; ii < resourceDb_.length; ++ii) {
      var resource = resourceDb_[ii];
      if (resource instanceof WebGLBuffer) {
        unwrappedContext_.deleteBuffer(resource);
      } else if (resource instanceof WebGLFramebuffer) {
        unwrappedContext_.deleteFramebuffer(resource);
      } else if (resource instanceof WebGLProgram) {
        unwrappedContext_.deleteProgram(resource);
      } else if (resource instanceof WebGLRenderbuffer) {
        unwrappedContext_.deleteRenderbuffer(resource);
      } else if (resource instanceof WebGLShader) {
        unwrappedContext_.deleteShader(resource);
      } else if (resource instanceof WebGLTexture) {
        unwrappedContext_.deleteTexture(resource);
      }
    }
  }

  function makeWebGLContextEvent(statusMessage) {
    return {
      statusMessage: statusMessage,
      preventDefault: function() {
          canRestore_ = true;
        }
    };
  }

  return canvas;

  function makeLostContextSimulatingContext(ctx) {
    // copy all functions and properties to wrapper
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
         wrappedContext_[propertyName] = makeLostContextFunctionWrapper(
             ctx, propertyName);
       } else {
         makePropertyWrapper(wrappedContext_, ctx, propertyName);
       }
    }

    // Wrap a few functions specially.
    wrappedContext_.getError = function() {
      loseContextIfTime();
      if (!contextLost_) {
        var err;
        while (err = unwrappedContext_.getError()) {
          glErrorShadow_[err] = true;
        }
      }
      for (var err in glErrorShadow_) {
        if (glErrorShadow_[err]) {
          delete glErrorShadow_[err];
          return err;
        }
      }
      return wrappedContext_.NO_ERROR;
    };

    var creationFunctions = [
      "createBuffer",
      "createFramebuffer",
      "createProgram",
      "createRenderbuffer",
      "createShader",
      "createTexture"
    ];
    for (var ii = 0; ii < creationFunctions.length; ++ii) {
      var functionName = creationFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          var obj = f.apply(ctx, arguments);
          obj.__webglDebugContextLostId__ = contextId_;
          resourceDb_.push(obj);
          return obj;
        };
      }(ctx[functionName]);
    }

    var functionsThatShouldReturnNull = [
      "getActiveAttrib",
      "getActiveUniform",
      "getBufferParameter",
      "getContextAttributes",
      "getAttachedShaders",
      "getFramebufferAttachmentParameter",
      "getParameter",
      "getProgramParameter",
      "getProgramInfoLog",
      "getRenderbufferParameter",
      "getShaderParameter",
      "getShaderInfoLog",
      "getShaderSource",
      "getTexParameter",
      "getUniform",
      "getUniformLocation",
      "getVertexAttrib"
    ];
    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
      var functionName = functionsThatShouldReturnNull[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    var isFunctions = [
      "isBuffer",
      "isEnabled",
      "isFramebuffer",
      "isProgram",
      "isRenderbuffer",
      "isShader",
      "isTexture"
    ];
    for (var ii = 0; ii < isFunctions.length; ++ii) {
      var functionName = isFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return false;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    wrappedContext_.checkFramebufferStatus = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.checkFramebufferStatus);

    wrappedContext_.getAttribLocation = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return -1;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getAttribLocation);

    wrappedContext_.getVertexAttribOffset = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return 0;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getVertexAttribOffset);

    wrappedContext_.isContextLost = function() {
      return contextLost_;
    };

    return wrappedContext_;
  }
}

return {
  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);
   *
   * would return 'TEXTURE_2D'
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} numArgs The number of arguments
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  'glFunctionArgToString': glFunctionArgToString,

  /**
   * Converts the arguments of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} args The arguments.
   * @return {string} The arguments as a string.
   */
  'glFunctionArgsToString': glFunctionArgsToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) +
   *            " was caused by call to " + funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   * @param {!function(funcName, args): void} opt_onFunc The
   *     function to call when each webgl function is called. You
   *     can use this to log all calls for example.
   */
  'makeDebugContext': makeDebugContext,

  /**
   * Given a canvas element returns a wrapped canvas element that will
   * simulate lost context. The canvas returned adds the following functions.
   *
   * loseContext:
   *   simulates a lost context event.
   *
   * restoreContext:
   *   simulates the context being restored.
   *
   * lostContextInNCalls:
   *   loses the context after N gl calls.
   *
   * getNumCalls:
   *   tells you how many gl calls there have been so far.
   *
   * setRestoreTimeout:
   *   sets the number of milliseconds until the context is restored
   *   after it has been lost. Defaults to 0. Pass -1 to prevent
   *   automatic restoring.
   *
   * @param {!Canvas} canvas The canvas element to wrap.
   */
  'makeLostContextSimulatingCanvas': makeLostContextSimulatingCanvas,

  /**
   * Resets a context to the initial state.
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *     reset.
   */
  'resetToInitialState': resetToInitialState
};

}();

} // config.GL_DEBUG
var vs_shader_source='precision lowp float;uniform float u_global_time,u_object_id,u_instance_id,u_line_threshold,u_demojs_explosion,u_twist,u_flatness,u_square_sphere,u_particles_distance,u_particles_pos,u_particles_size,u_glitch;uniform vec3 u_cam_pos,u_scale,u_cookie_scale0,u_cookie_scale1,u_cookie_translation0,u_cookie_translation1,u_position;uniform mat4 u_view_proj_mat,u_view_proj_mat_inv;uniform vec2 u_resolution,u_rotations,u_sizes,u_repetitions,u_distances,u_num_faces;uniform vec4 u_color,u_bg_color1,u_bg_color2,u_fg_color1,u_fg_color2;uniform sampler2D u_texture_0,u_texture_1,u_texture_2,u_texture_3,u_texture_4;varying vec3 a,b,c;varying vec2 d,f,g,h,i,j;varying float e;attribute vec3 a_position,a_normal,a_color;attribute vec2 a_uv;attribute float a_triangle_id;void x(){gl_Position=vec4(a_position,1);d=a_position.xy*.5+.5;}void y(){gl_Position=vec4(a_position,1);d=a_position.xy*.5+.5;}float k=3.1415;float l=2.*k;void z(){gl_Position=vec4(a_position,1);d=a_position.xy*.5+.5;}void A(){gl_Position=vec4(a_position,1);d=a_position.xy;}void B(){float m,n,o,q,r,v;m=u_global_time;n=u_resolution.x/u_resolution.y;o=(a_position.z+1.)*.6283*(1.-u_demojs_explosion)*.01;vec2 p,t,u,w;p=vec2(cos(o),sin(o));q=mod(a_position.z,2.)*2.-1.;r=q*o*m;mat2 s=mat2(cos(r),-sin(r),sin(r),cos(r));t=s*a_position.xy;u=t+p*m;v=u_scale.x;w=s*a_position.xy*v+a_uv.xy*u_demojs_explosion+p*u_demojs_explosion;w.y*=n;gl_Position=vec4(u.x*v,u.y*v*n,0,1);gl_Position=vec4(w,0,1);}void C(){float m,n,r,s,t;m=a_uv.x;n=u_particles_distance;vec3 o,p,q,u;o=normalize(vec3(sin(m*13.),cos(m*7.),sin(cos(m))))*n;p=normalize(vec3(sin(m*20.),cos(m*2.),sin(exp(m+2.))))*n;q=o*u_particles_pos+p*(1.-u_particles_pos);r=a_uv.y;s=u_square_sphere;t=r*s+(1.-r)*(1.-s);u=a_position*u_scale*t*u_particles_size+q;gl_Position=u_view_proj_mat*vec4(u,1);a=a_position;c=u_color.rgb;}void D(){vec3 m=a_position*u_cookie_scale0+u_cookie_translation0;gl_Position=u_view_proj_mat*vec4(m*u_scale,1);a=a_position;b=a_normal;}void E(){vec3 m;if(a_triangle_id<.5)m=a_position*u_cookie_scale0+u_cookie_translation0;else m=a_position*u_cookie_scale1+u_cookie_translation1+u_cookie_translation0;gl_Position=u_view_proj_mat*vec4(m*u_scale,1);a=a_position;b=a_normal;c=a_color;}void F(){float m,n,o;m=u_resolution.x/u_resolution.y;n=.003;o=a_uv.x;vec3 p,q;p=a_position*u_cookie_scale1+u_cookie_translation1;q=p+a_normal*u_cookie_scale1;vec4 r,s;r=u_view_proj_mat*vec4(p,1);s=u_view_proj_mat*vec4(q,1);vec2 t,u,v,w;t=r.xy/r.w;u=s.xy/s.w;t.x/=m;u.x/=m;v=normalize(u.xy-t.xy);w=vec2(-v.y,v.x);w*=o*r.w;w*=n;gl_Position=r+vec4(w,0,0);e=a_uv.y;}void G(){gl_Position=vec4(a_position*u_scale+u_position,1);d=a_position.xy*.5+.5;d.y=1.-d.y;}void H(){gl_Position=vec4(a_position,1);d=a_position.xy*.5+.5;d+=vec2(.5)/u_resolution;}void I(){gl_Position=vec4(a_position.xy,0,1);d=a_position.xy*.5+.5;}void J(){gl_Position=vec4(a_position.xy,0,1);d=a_position.xy*.5+.5;}void K(){gl_Position=vec4(a_position.xy,0,1);d=a_position.xy*.5+.5;}void L(vec2 m,vec2 n){vec2 o=1./n.xy;f=(m+vec2(-1.))*o;g=(m+vec2(1,-1.))*o;h=(m+vec2(-1.,1))*o;i=(m+vec2(1))*o;j=vec2(m*o);}void M(){gl_Position=vec4(a_position,1);d=a_position.xy*.5+.5;L(d*u_resolution,u_resolution);}\n#ifndef FXAA_REDUCE_MIN\n#define FXAA_REDUCE_MIN (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n#define FXAA_REDUCE_MUL (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n#define FXAA_SPAN_MAX 8.0\n#endif\nvoid N(){gl_Position=vec4(a_position.xy,0,1);d=a_position.xy*.5+.5;}'
var fs_shader_source='precision lowp float;uniform float u_global_time,u_object_id,u_instance_id,u_line_threshold,u_demojs_explosion,u_twist,u_flatness,u_square_sphere,u_particles_distance,u_particles_pos,u_particles_size,u_glitch;uniform vec3 u_cam_pos,u_scale,u_cookie_scale0,u_cookie_scale1,u_cookie_translation0,u_cookie_translation1,u_position;uniform mat4 u_view_proj_mat,u_view_proj_mat_inv;uniform vec2 u_resolution,u_rotations,u_sizes,u_repetitions,u_distances,u_num_faces;uniform vec4 u_color,u_bg_color1,u_bg_color2,u_fg_color1,u_fg_color2;uniform sampler2D u_texture_0,u_texture_1,u_texture_2,u_texture_3,u_texture_4;varying vec3 a,b,c;varying vec2 d,f,g,h,i,j;varying float e;void U(){gl_FragColor=u_bg_color1;}float k=3.1415;float l=2.*k;vec2 V(vec2 m){float n,o;n=sqrt(m.x*m.x+m.y*m.y);o=atan(m.y,m.x);return vec2(n,o);}vec2 W(vec2 m){return vec2(m.x*cos(m.y),m.x*sin(m.y));}float X(float m){float n,o;n=mod(m,1.);o=m-n;return o+n*n*n*n;}float Y(float m,float n){return (1.-m)*n+(1.-n)*m;}float Z(vec2 m,float n,float o,vec2 p){vec2 q=p-m;float r,s;r=atan(q.x,q.y)+.2;s=6.28319/o;return smoothstep(n,n+.01,cos(floor(.5+r/s)*s-r)*length(q.xy));}float aa(vec2 m,float n,float o,float p,float q,float r){vec2 s,v;s=V(m);float t,u;t=l/p;u=n;s.y+=u;s.y=mod(s.y+t*.5,t)-t*.5;m=W(s);v=vec2(q,0);return Z(v,o,r,m);}void ba(){vec2 m=d-vec2(.5);float n,o,p,q,r,s,t,u,v,w,x,y,z,A;n=u_resolution.x/u_resolution.y;m.y/=n;o=u_rotations.x;p=u_rotations.y;q=u_sizes.x*.1;r=u_sizes.y*.1;s=u_distances.x;t=u_distances.y;u=floor(u_repetitions.x+.5);v=floor(u_repetitions.y+.5);w=floor(u_num_faces.x+.5);x=floor(u_num_faces.y+.5);y=aa(m,o,q,u,s,w);z=aa(m,p,r,v,t,x);A=1.-Y(y,z);gl_FragColor=vec4(mix(u_bg_color1.rgb,u_bg_color2.rgb,A),1);}void ca(){float m,o,q,r;m=u_resolution.x/u_resolution.y;vec2 n,p;n=d-vec2(.5);o=X(u_repetitions.x);n.y/=m;n=vec2(n.y,-n.x);p=V(n);p.x=sin(p.x*20.+u_repetitions.y)+cos(p.y*u_repetitions.x);n=W(p);q=length(n);r=.2;q=smoothstep(r,r+.015,q);gl_FragColor=vec4(mix(u_bg_color1.rgb,u_bg_color2.rgb,q),1);}float da(vec3 m,float n){return m.y-n;}float ea(vec3 m,vec3 n,float o){return length(max(abs(m)-n,0.))-o;}vec2 fa(vec2 m,vec2 n){return mod(m+n*.5,n)-n*.5;}vec2 ga(vec2 m,float n){float o,p;o=cos(n);p=sin(n);return mat2(o,p,-p,o)*m;}vec3 ha(vec3 m,float n){m.xz=ga(m.xz,m.y*n);return m;}float ia(float m,float n){return min(m,n);}float ja(vec3 m){float n,o;n=da(m,0.);m=ha(m,sin(u_twist*.1)*.2);o=ea(m,u_sizes.xyx,1.);return ia(o,n);}vec3 ka(vec3 m){vec2 n=vec2(.01,0);return normalize(vec3(ja(m+n.xyy)-ja(m-n.xyy),ja(m+n.yxy)-ja(m-n.yxy),ja(m+n.yyx)-ja(m-n.yyx)));}bool la(out vec3 m,vec3 n){for(int o=0;o<100;o++){float p=ja(m);if(p<.01)return true;m+=n*p;}return false;}vec3 ma(vec3 m){vec3 n=u_color.rgb;return mix(vec3(1),n,smoothstep(.1,.11,m.y));}vec3 na(vec3 m,vec3 n){float o,p;o=atan(n.z,n.x);p=Z(vec2(0),.04,u_num_faces.x,ga(fa(vec2(o,n.y),vec2(.3)),u_rotations.x));return vec3(p*.5+.5);}void oa(){vec3 m,n,o,q,r;m=u_cam_pos;n=normalize((u_view_proj_mat_inv*vec4(d,1,1)).xyz);o=vec3(1);float p=0.;if(la(m,n)){o*=ma(m);vec3 q,r;q=ka(m);n=reflect(q,n);r=m+n*.1;if(la(r,n))o*=mix(ma(r),vec3(1),u_flatness);p+=(1.-u_flatness)*exp(-distance(m,r)*2.5);p+=(1.-u_flatness)*exp(-distance(u_cam_pos,m)*2.05);}else p=1.-u_flatness;q=na(u_cam_pos,n);r=o;r=mix(r,q,p);gl_FragColor=vec4(r,1);}void pa(){gl_FragColor=u_color;}void qa(){gl_FragColor=vec4(c,1);}void ra(){gl_FragColor=u_color;}void sa(){if(u_color.a>.1)gl_FragColor=u_color;else gl_FragColor=vec4(c,1);}void ta(){float m=smoothstep(e-.1,e+.1,u_line_threshold);gl_FragColor=vec4(5,5,5,m);}void ua(){gl_FragColor=vec4(u_color.rgb,texture2D(u_texture_0,d).r*u_color.a);}void va(){vec3 m=texture2D(u_texture_0,d).rgb;float n,o;n=dot(m,vec3(.3,.6,.1));o=smoothstep(.9,1.1,n);gl_FragColor=vec4(o*m,1);}vec4 wa(sampler2D m,vec2 n,vec2 o){vec4 p=vec4(0);float q[6];q[0]=.16;q[1]=.15;q[2]=.12;q[3]=.09;q[4]=.05;q[5]=.01;for(int r=-5;r<=5;++r)p+=texture2D(m,n+float(r)*o)*q[r>0?r:-r];return p;}void xa(){gl_FragColor=wa(u_texture_0,d,vec2(5./1920.,0));}void ya(){gl_FragColor=wa(u_texture_0,d,vec2(0,5./1080.));}void za(){vec3 m=texture2D(u_texture_0,d).rgb+.2*texture2D(u_texture_1,d).rgb;gl_FragColor=vec4(m,1);}\n#ifndef FXAA_REDUCE_MIN\n#define FXAA_REDUCE_MIN (1.0/ 128.0)\n#endif\n#ifndef FXAA_REDUCE_MUL\n#define FXAA_REDUCE_MUL (1.0 / 8.0)\n#endif\n#ifndef FXAA_SPAN_MAX\n#define FXAA_SPAN_MAX 8.0\n#endif\nvec4 Aa(sampler2D m,vec2 n,vec2 o,vec2 f,vec2 g,vec2 h,vec2 i,vec2 j){vec4 p,v;mediump vec2 q,F;q=vec2(1./o.x,1./o.y);vec3 r,s,t,u,w,x,I,J;r=texture2D(m,f).xyz;s=texture2D(m,g).xyz;t=texture2D(m,h).xyz;u=texture2D(m,i).xyz;v=texture2D(m,j);w=v.xyz;x=vec3(.299,.587,.114);float y,z,A,B,C,D,E,G,H,K;y=dot(r,x);z=dot(s,x);A=dot(t,x);B=dot(u,x);C=dot(w,x);D=min(C,min(min(y,z),min(A,B)));E=max(C,max(max(y,z),max(A,B)));F.x=-(y+z-(A+B));F.y=y+A-(z+B);G=max((y+z+A+B)*.25*FXAA_REDUCE_MUL,FXAA_REDUCE_MIN);H=1./(min(abs(F.x),abs(F.y))+G);F=min(vec2(FXAA_SPAN_MAX),max(vec2(-FXAA_SPAN_MAX),F*H))*q;I=.5*(texture2D(m,n*q+F*(1./3.-.5)).xyz+texture2D(m,n*q+F*(2./3.-.5)).xyz);J=I*.5+.25*(texture2D(m,n*q+F*-.5).xyz+texture2D(m,n*q+F*.5).xyz);K=dot(J,x);if(K<D||K>E)p=vec4(I,v.a);else p=vec4(J,v.a);return p;}void Ba(){gl_FragColor=Aa(u_texture_0,d*u_resolution,u_resolution,f,g,h,i,j);}vec3 Ca(vec3 m){return m-floor(m*(1./289.))*289.;}vec4 Ca(vec4 m){return m-floor(m*(1./289.))*289.;}vec4 Da(vec4 m){return Ca((m*34.+1.)*m);}vec4 Ea(vec4 m){return 1.79284291400159-.85373472095314*m;}float Fa(vec3 m){const vec2 n=vec2(1./6.,1./3.);const vec4 o=vec4(0,.5,1,2);vec3 p,q,r,s,t,u,v,w,x,A,O,P,Q,R;p=floor(m+dot(m,n.yyy));q=m-p+dot(p,n.xxx);r=step(q.yzx,q.xyz);s=1.-r;t=min(r.xyz,s.zxy);u=max(r.xyz,s.zxy);v=q-t+n.xxx;w=q-u+n.yyy;x=q-o.yyy;p=Ca(p);vec4 y,B,C,D,E,F,G,H,I,J,K,L,M,N,S,T;y=Da(Da(Da(p.z+vec4(0,t.z,u.z,1))+p.y+vec4(0,t.y,u.y,1))+p.x+vec4(0,t.x,u.x,1));float z=.142857142857;A=z*o.wyz-o.xzx;B=y-49.*floor(y*A.z*A.z);C=floor(B*A.z);D=floor(B-7.*C);E=C*A.x+A.yyyy;F=D*A.x+A.yyyy;G=1.-abs(E)-abs(F);H=vec4(E.xy,F.xy);I=vec4(E.zw,F.zw);J=floor(H)*2.+1.;K=floor(I)*2.+1.;L=-step(G,vec4(0));M=H.xzyw+J.xzyw*L.xxyy;N=I.xzyw+K.xzyw*L.zzww;O=vec3(M.xy,G.x);P=vec3(M.zw,G.y);Q=vec3(N.xy,G.z);R=vec3(N.zw,G.w);S=Ea(vec4(dot(O,O),dot(P,P),dot(Q,Q),dot(R,R)));O*=S.x;P*=S.y;Q*=S.z;R*=S.w;T=max(.6-vec4(dot(q,q),dot(v,v),dot(w,w),dot(x,x)),0.);T=T*T;return 42.*dot(T*T,vec4(dot(O,q),dot(P,v),dot(Q,w),dot(R,x)));}vec3 Ga(sampler2D m,vec2 n){vec2 o=n-.5;vec3 p=vec3(texture2D(m,n).r,0,0);n=o*.99+.5;p+=vec3(0,texture2D(m,n).gb);p*=smoothstep(.75,.3,length(o));return p;}vec3 Ha(vec3 m){m*=vec3(Fa(vec3(gl_FragCoord.xy*.8,u_global_time*10.)))*.1+.9;return m;}vec3 Ia(vec3 m){return pow(m,vec3(.45));}void Ja(){vec2 m=d;vec3 n=Ga(u_texture_0,m);n=Ha(n);n=Ia(n);gl_FragColor=vec4(n,1);}'
function load_shaders()
{
{ handle: programs.background0 = load_shader_program("x", "U") };
{ handle: programs.background1 = load_shader_program("y", "ba") };
{ handle: programs.background2 = load_shader_program("z", "ca") };
{ handle: programs.plop = load_shader_program("A", "oa") };
{ handle: programs.demojs = load_shader_program("B", "pa") };
{ handle: programs.particles = load_shader_program("C", "qa") };
{ handle: programs.solid_color = load_shader_program("D", "ra") };
{ handle: programs.logo = load_shader_program("E", "sa") };
{ handle: programs.logo_lines = load_shader_program("F", "ta") };
{ handle: programs.text = load_shader_program("G", "ua") };
{ handle: programs.prepare_bloom = load_shader_program("H", "va") };
{ handle: programs.blur_h = load_shader_program("I", "xa") };
{ handle: programs.blur_v = load_shader_program("J", "ya") };
{ handle: programs.bloom = load_shader_program("K", "za") };
{ handle: programs.antialias = load_shader_program("M", "Ba") };
{ handle: programs.posteffect = load_shader_program("N", "Ja") };
}
function load_textures() {
textures.is = create_text_texture(2, "is");
textures.dead = create_text_texture(2, "dead");
textures.long = create_text_texture(2, "long");
textures.live = create_text_texture(2, "live...");
textures.lnx = create_text_texture(2, "LNX");
textures.popsy = create_text_texture(2, "PoPsY TeAm");
textures.xmen = create_text_texture(2, "X-Men");
textures.cocoon = create_text_texture(2, "Cocoon");
textures.flush = create_text_texture(2, "flush");
textures.trbl = create_text_texture(2, "trbl");
textures.staytuned = create_text_texture(2, "Stay tuned!");
textures.url = create_text_texture(2, "http://cookie.paris");
} // load_textures
function load_geometries() {
geometries.cookie_logo = function () {
    var positions = make_cube();
    var vertex_per_cube = positions.length/3;
    var colors = [];
    var cube_ids = [];

    // main cube
    for (var i = 0; i < vertex_per_cube; ++i) {
        colors.push(0);
        colors.push(0);
        colors.push(0);
        cube_ids.push(0);
    }
    colors[63] = 0.3;
    colors[64] = 0.3;
    colors[65] = 0.3;
    colors[54] = 0.3;
    colors[55] = 0.3;
    colors[56] = 0.3;

    var white = [10,10,10];
    var meh = [1,0,1];

    var scale = 1.0;
    var scale2 = 1.0;

    // "chocolate"
    var offsets_scales_color = [
        [[0,   1,   0.3],  scale2 * 0.09,   white],
        [[0.60, 1.16, 1],  scale2 * 0.12,   white],
        [[0.8, 0,   0.8],  scale2 * 0.1,    white],
        [[0.8, 1,   0.2],  scale2 * 0.14,   white],
        [[1,   1,   0.7],  scale2 * 0.1,    white],
        [[-0.1, 0,  0.7],  scale2 * 0.11,   white],
        [[0.6, 0.5, 0.9],  scale2 * 0.09,   white],
        [[1,   0.7, 0.8],  scale2 * 0.06,   white],
        [[1,  0.55, 0.2],  scale2 * 0.07,   white],
        [[1,  0.35, 0.4],  scale2 * 0.08,   white],
    ];

    for (var i = 0; i < offsets_scales_color.length; ++i) {
        positions = positions.concat(make_cube());
    }

    apply_translation(positions, [-0.5, -0.5, -0.5]);

/*
    apply_op_range(
        positions, op_mul, [scale, scale, scale],
        0, vertex_per_cube*3
    );
*/
    for (var i = 0; i < offsets_scales_color.length; ++i) {
        var from = (i+1)*vertex_per_cube*3;
        var to = (i+2)*vertex_per_cube*3
        // scale
        apply_op_range(
            positions, op_mul, [
                offsets_scales_color[i][1],
                offsets_scales_color[i][1],
                offsets_scales_color[i][1],
            ],
            from, to
        );

        // translate
        apply_op_range(
            positions, op_add, offsets_scales_color[i][0],
            from, to
        );
        // color 
        for (var j = from; j < to; j+=3) {
            colors.push(offsets_scales_color[i][2][0]);
            colors.push(offsets_scales_color[i][2][1]);
            colors.push(offsets_scales_color[i][2][2]);
            cube_ids.push(i+1);
        }
    }
    
    var normals = map_triangles(positions, flat_normal);
    return {
      buffers: [
        make_vbo(POS, positions),
        make_vbo(NORMAL, normals),
        make_vbo(COLOR, colors),
        make_vbo(TRIANGLE_ID, cube_ids),
    ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.cookie_title = function () {

    var points = [];
    var advanceY = 1;
    var advanceX = advanceY / Math.sqrt(3) / 2
    
    for (var x = 0; x < 40; ++x)
        for (var y = 0; y < 2; ++y)
            for (var z = -1; z < 2; ++z)
                points.push([(x + 2 * z) * advanceX, y * advanceY, (2 * z - x) * advanceX])

    var lines = [
        [4 + 4 * 6, 3 + 2 * 6, 4 + 0 * 6, 1 + 0 * 6, 2 + 2 * 6, 1 + 4 * 6],
        [1 + 5 * 6, 2 + 7 * 6, 1 + 9 * 6, 0 + 7 * 6, 1 + 5 * 6],
        [1 + 9 * 6, 1 + 12 * 6],
        [4 + 5 * 6, 4 + 8 * 6, 5 + 10 * 6, 4 + 12 * 6, 3 + 10 * 6, 4 + 8 * 6],
        [3 + 11 * 6, 4 + 13 * 6, 1 + 13 * 6, 2 + 15 * 6],
        [1 + 13 * 6, 0 + 15 * 6],
        [2 + 18 * 6, 1 + 16 * 6, 4 + 16 * 6, 3 + 14 * 6],
        [1 + 21 * 6, 2 + 19 * 6, 1 + 17 * 6, 4 + 17 * 6, 3 + 19 * 6, 4 + 21 * 6, 5 + 19 * 6, 4 + 17 * 6]
    ];

    var positions = [];
    var uvs = [];
    var normals = [];
    //var sides = [];

    var d = [];
    for (var i = 0; i < lines.length; ++i) {
      var step = 1/lines[i].length;
      for (var j = 0; j < lines[i].length-1; ++j) {
          var norm_j = j*step;
          var p1 = points[lines[i][j]];
          var p2 = points[lines[i][j+1]];
          vec3.subtract(d, p2, p1);
          var t1 = i * 0.1 + j * 0.1;
          var t2 = i * 0.1 + (j+1) * 0.1;
          pack_vertices(positions, [p1, p1, p2, p1, p2, p2]);
          pack_vertices(normals, [d, d, d, d, d, d]);
          uvs.push(
             1, t1,
            -1, t1,
             1, t2,
            -1, t1,
             1, t2,
            -1, t2);
      }
    }

    return {
      buffers: [
        make_vbo(POS, positions),
        make_vbo(UV, uvs),
        make_vbo(NORMAL, normals),
        //make_vbo(TRIANGLE_ID, sides),
      ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.cube = function () {
    var positions = make_cube();
    apply_translation(positions, [-0.5, -0.5, -0.5]);
    var normals = map_triangles(positions, flat_normal);
    return {
      buffers: [
        make_vbo(POS, positions),
        make_vbo(NORMAL, normals),
    ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.demojs = function () {

        var positions = [];
        var offsets = [];

        var pattern = [
            '444333',
            '4',
            '6',
            '6',
            '5',
            '......2',
            '......2',
            '4444442..5553332..333344222..4332211',
            '1.....2..4........6...4...2..4.....0',
            '1.....5..4333300..6...4...9..5.....0',
            '6.....5..4........8...3...9..5.....9',
            '6666665..6777777..8...0...9..6677889',
            '',
            '',
            '..........................8..0002221',
            '..........................8..0',
            '..........................8..0000333',
            '..........................9........3',
            '..........................8..7776666',
            '.....................566777',
        ];

        var step = 1/35;
        for (var l = 0; l < pattern.length; ++l) {
            var line = pattern[l];
            for (var c = 0; c < line.length; ++c) {
                var cell = line.charAt(c);
                if (cell != '.') {
                    var y = -(l - 13) * step;
                    var x = (c - 52) * step;
                    var z = parseInt(cell);

                    offsets.push(
                        x,y, x,y, x,y,
                        x,y, x,y, x,y
                    );
                    positions.push(
                        0,0,z,  0,step,z,   step,step,z,
                        0,0,z,  step,step,z,   step,0,z
                    );
                }
            }
        }
        apply_translation(positions, [-0.5*step, -0.5*step, 0]);

        return {
          buffers: [
            make_vbo(POS, positions),
            make_vbo(UV, offsets),
          ],
          mode: gl.TRIANGLES,
          vertex_count: positions.length / 3
        };
    }();
geometries.disc = function () {
    var positions = make_cube();
    apply_translation(positions, [-0.5, -0.5, -0.5]);
    var normals = map_triangles(positions, flat_normal);
    return {
      buffers: [
        make_vbo(POS, positions),
        make_vbo(NORMAL, normals),
    ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.logo_lines = function () {

    var points = [
        [0,   1,   0.3],
        [0.60, 1.16, 1],
        [0.8, 0,   0.8],
        [0.8, 1,   0.2],
        [1,   1,   0.7],
        [-0.1, 0,  0.7],
        [0.6, 0.5, 0.9],
        [1,   0.7, 0.8],
        [1,  0.55, 0.2],
        [1,  0.35, 0.4],
    ];

    var lines = [
        [1, 3],
        [1, 9],
        [1, 4],
        [8, 7],
        [4, 6],
        [6, 5],
    ];

    var positions = [];
    var uvs = [];
    var normals = [];

    var d = [];
    for (var i = 0; i < lines.length; ++i) {
      var step = 1/lines[i].length;
      for (var j = 0; j < lines[i].length-1; ++j) {
          var norm_j = j*step;
          var p1 = points[lines[i][j]];
          var p2 = points[lines[i][j+1]];
          vec3.subtract(d, p2, p1);
          pack_vertices(positions, [p1, p1, p2, p1, p2, p2]);
          pack_vertices(normals, [d, d, d, d, d, d]);
          uvs.push(
             1, 0,
            -1, 0,
             1, 0,
            -1, 0,
             1, 0,
            -1, 0);
      }
    }

    return {
      buffers: [
        make_vbo(POS, positions),
        make_vbo(UV, uvs),
        make_vbo(NORMAL, normals),
    ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.particles = function () {
    var positions = [];
    var vertex_per_cube = make_cube().length/3;
    var vertex_per_sphere = make_sphere(1.0, 4).length/3;
    var particle_ids = [];

    var num_particles = 32;

    for (var i = 0; i < num_particles; ++i) {
        positions = positions.concat(make_cube());
        for (var j = 0; j < vertex_per_cube; ++j) {
            particle_ids.push(i, 0);
        }
    }
    apply_translation(positions, [-0.5, -0.5, -0.5]);

    for (var i = 0; i < num_particles; ++i) {
        positions = positions.concat(make_sphere(1.0, 4));
        for (var j = 0; j < vertex_per_sphere; ++j) {
            particle_ids.push(i, 1);
        }
    }
    
    return {
      buffers: [
        make_vbo(POS, positions),
        //make_vbo(NORMAL, normals),
        //make_vbo(COLOR, colors),
        make_vbo(UV, particle_ids),
      ],
      mode: gl.TRIANGLES,
      vertex_count: positions.length / 3
    };
  }();
geometries.quad = {
  buffers: [
     make_vbo(POS, [-1,-1,-1,1,1,-1,1,1] )
  ],
  mode: gl.TRIANGLE_STRIP ,
  vertex_count: 4
};
}
function load_scenes() {
}
var sequence = {
'u_global_time': [
{
start:  0 ,
duration:  160 ,
evaluate: function(t) { return [t]},
},
],
'show_logo': [
{
start:  96 ,
duration:  64 ,
},
{
start:  224 ,
duration:  24 ,
animation: [
],
},
],
'show_particles': [
{
start:  22 ,
duration:  138 ,
},
],
'show_demojs': [
{
start:  0 ,
duration:  33 ,
},
],
'show_cookie_title': [
{
start:  144 ,
duration:  16 ,
},
],
'u_demojs_explosion': [
{
start:  0 ,
duration:  32 ,
components: 1,
animation: [
[ 0 , [
1,
]],
[ 14.546492942075853 , [
0.9849246612631798,
]],
[ 14.943992245894728 , [
1.2614157387688822,
]],
[ 15.899356725668538 , [
3.9590036227470202,
]],
[ 22.90533995629653 , [
3.9330825842308603,
]],
[ 23.638823134194944 , [
-0.015075338736820203,
]],
],
},
],
'u_bg_color1': [
{
start:  0 ,
duration:  160 ,
components: 4,
animation: [
[ 16.287034256183983 , [
0.2688836104513063,
0.2688836104513063,
0.2688836104513063,
1,
]],
[ 134.1836093956497 , [
0.34756488670393965,
0.3477868411414375,
0.3477868411414375,
0.9418714646999112,
]],
[ 139.79963117078617 , [
0.8157317840026161,
0.8157317840026161,
0.8157317840026161,
0.8157317840026161,
]],
[ 160.42574750856042 , [
1.0126909280674827,
1.0048094615553802,
1.0048094615553802,
1.0048094615553802,
]],
[ 208 , [
0.5,
0.5,
0.7,
1,
]],
],
},
{
start:  224 ,
duration:  24 ,
components: 4,
animation: [
[ 0.03021198644071399 , [
0.8881191545447074,
0.8881191545447074,
0.8881191545447074,
0.8881191545447074,
]],
[ 24.062951787278894 , [
-0.051725787493507466,
-0.051725787493507466,
-0.051725787493507466,
-0.051725787493507466,
]],
],
},
],
'u_bg_color2': [
{
start:  0 ,
duration:  160 ,
components: 4,
animation: [
[ 0.10895718681069194 , [
0.004750593824227922,
-1.222980050563649e-16,
-1.222980050563649e-16,
-1.222980050563649e-16,
]],
[ 8.534436385667338 , [
0.3200458862288956,
0.32026467759713284,
0.32026467759713284,
0.32026467759713284,
]],
[ 14.369015784054028 , [
0.34668946193981576,
0.3469553562969614,
0.3469553562969614,
0.3469553562969614,
]],
[ 14.680041729604595 , [
1.6866514497004061,
1.6798394850550995,
1.6798394850550995,
1.6798394850550995,
]],
[ 15.050753746951788 , [
0.366072699189431,
0.36968124123942103,
0.36968124123942103,
0.36968124123942103,
]],
[ 17.823540959169435 , [
0.988493260640353,
0.9921878232130467,
0.9921878232130467,
0.9921878232130467,
]],
[ 77.56566249599891 , [
0.9390920136109016,
0.9411600070757704,
0.9411600070757704,
0.9411600070757704,
]],
[ 135.5446382578951 , [
0.9597501421158782,
0.9604901623620767,
0.9604901623620767,
0.9604901623620767,
]],
[ 136.97667383730763 , [
-0.010415355407528144,
-0.013356190344583359,
-0.019237860218693566,
-0.02806036502985921,
]],
],
},
],
'u_fg_color1': [
{
start:  0 ,
duration:  160 ,
components: 4,
animation: [
[ 0 , [
0,
0,
0,
1,
]],
[ 208 , [
0,
0,
0,
1,
]],
],
},
],
'u_fg_color2': [
{
start:  0 ,
duration:  160 ,
components: 4,
animation: [
[ 0 , [
1,
1,
1,
1,
]],
[ 208 , [
1,
1,
1,
1,
]],
],
},
],
'u_rotations': [
{
start:  0 ,
duration:  160 ,
components: 2,
animation: [
[ 0 , [
0,
0,
]],
[ 208 , [
100,
-50,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 2,
animation: [
[ 0 , [
0.2,
-38.71372294034646,
]],
[ 34.61806550994777 , [
0.2,
-38.71372294034646,
]],
[ 35.71546478617694 , [
0.2,
-38.71372294034646,
]],
[ 38.54228271861533 , [
-2.985440879734842,
-38.71372294034646,
]],
[ 53.312858699106584 , [
-2.985440879734842,
-38.71372294034646,
]],
[ 61.178084495016265 , [
-0.3098493265325777,
-38.71372294034646,
]],
[ 64.28588084299857 , [
9.831821311271314,
-38.71372294034646,
]],
],
},
],
'u_sizes': [
{
start:  0 ,
duration:  32 ,
components: 2,
animation: [
[ 0.04 , [
0.035380047505938254,
0.06938004750593826,
]],
[ 13.82928633133072 , [
0.03789808754429762,
0.06387820567994196,
]],
[ 14.156032626553875 , [
0.08047938713933607,
0.03551704105071916,
]],
[ 14.482778921777026 , [
0.22601745700339343,
0.03425148460645084,
]],
[ 20.88642419362141 , [
0.1942699953113287,
1.7998850879836223,
]],
[ 26.278087725698175 , [
0.1401391481101979,
3.1985384409216024,
]],
[ 32 , [
0,
0,
]],
],
},
{
start:  32 ,
duration:  128 ,
components: 2,
animation: [
[ 0 , [
0.5,
1,
]],
[ 10.986079742448567 , [
0.5,
0.9489008483643183,
]],
[ 12.668896582299112 , [
-0.060004295113564844,
0.17791851672335693,
]],
[ 26.9410011842306 , [
0.8255247150722314,
0.08709502849917267,
]],
[ 94.80425521540654 , [
0.2810838168581093,
-0.09276376141004089,
]],
[ 124.28399445672042 , [
0.26324547683653704,
-0.09643896750102737,
]],
[ 128.5155517004199 , [
0.28108381685810907,
5.031872121234757,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 2,
animation: [
[ 0.29127605874944534 , [
3,
-0.05880545156766814,
]],
[ 13.139005968905707 , [
3,
20,
]],
],
},
],
'u_distances': [
{
start:  0 ,
duration:  160 ,
components: 2,
animation: [
[ 0.3213505162386313 , [
0.3690481849400915,
0.36809905830580547,
]],
[ 14.47337206073437 , [
0.3690481849400915,
0.36809905830580547,
]],
[ 15.331280236138397 , [
0.4345058438697667,
0.12053801578179979,
]],
[ 22.796656878010488 , [
0.4345058438697667,
0.12053801578179979,
]],
[ 23.450149468456786 , [
0.08745508941160479,
0.12053801578179979,
]],
[ 59.5496324545164 , [
0.08745508941160479,
0.12053801578179979,
]],
[ 60.12491775377371 , [
0.08745508941160479,
0.2573798809600774,
]],
[ 62.25942029814315 , [
0.08745508941160479,
0.261501623887134,
]],
[ 62.8456086829304 , [
0.0025471851142397778,
0.0018318194825709538,
]],
[ 127.9171351461266 , [
0.2808337157872507,
0.0018318194825709538,
]],
[ 141.7397114203788 , [
0.2822608490536787,
0.0018318194825709538,
]],
[ 142.49054060049255 , [
0.2828337157872507,
0.0018318194825709538,
]],
[ 143.54769140424577 , [
0.2838337157872507,
0.0018318194825709538,
]],
[ 145.86617780128103 , [
0.7145150020893702,
0.0018318194825709538,
]],
[ 156.6476964961958 , [
0.7145150020893702,
0.0018318194825709538,
]],
],
},
],
'u_repetitions': [
{
start:  0 ,
duration:  128 ,
components: 2,
animation: [
[ -0.29151289546277726 , [
15.93824228028502,
462.77720959362466,
]],
[ 25.218346549037722 , [
16.54511016557896,
443.71197160395076,
]],
[ 42.32658687112703 , [
16.794966278414773,
372.58446487700564,
]],
[ 51.40003065109729 , [
16.573486898464324,
44.354893784090386,
]],
[ 54.8464181862343 , [
16.569609612632878,
20.82246260716471,
]],
[ 55.230030651097294 , [
16.56525604419416,
20.45280611102018,
]],
[ 55.49963216366872 , [
16.56902637330363,
19.31841876520719,
]],
[ 56.50860104122178 , [
16.71244886539276,
16.588694980210647,
]],
[ 61.46296194596562 , [
16.747313614085947,
16.551494697329854,
]],
[ 127.9927463315042 , [
169.4237575486737,
15.918451211767762,
]],
[ 208 , [
20,
15,
]],
],
},
{
start:  128 ,
duration:  16 ,
components: 2,
animation: [
[ 0.675203275617561 , [
-0.0002665131702901391,
-0.9363182246474484,
]],
[ 2.3058251330815325 , [
6.943378778404279,
5.72916291809978,
]],
[ 3.849192577849682 , [
7.027585192216523,
4.952603229417122,
]],
[ 4.822185097377417 , [
7.043916861255814,
2.5165520443829763,
]],
[ 5.76162615071456 , [
8.546305048386495,
14.17923749108191,
]],
[ 7.4727509264357534 , [
10.144960302747755,
2.3095134347588138,
]],
[ 9.452287431681846 , [
12.711950923151935,
11.041465977421668,
]],
[ 12.57257378740876 , [
12.370380910956227,
5.951229981801985,
]],
[ 15.116909141170074 , [
0.8934582200070321,
0.7454743465842442,
]],
[ 16.011985070858668 , [
-0.03950976917645166,
-0.9940536896207005,
]],
],
},
],
'u_num_faces': [
{
start:  0 ,
duration:  160 ,
components: 2,
animation: [
[ -4.440449438202247 , [
19.923990498812366,
19.900237529691196,
]],
[ 19.190566847620254 , [
19.929524124497068,
3.9904134998217184,
]],
[ 60.62296194596562 , [
6.609155679501857,
6.09684248400343,
]],
[ 62.594124268682236 , [
4.397604214492652,
6.110610743876134,
]],
[ 126.99682628725469 , [
9.92932732926388,
6.066898418193201,
]],
[ 127.31235786689146 , [
20.878903013738142,
6.062160701764921,
]],
[ 208 , [
20,
6,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 2,
animation: [
[ 0.28683956115435194 , [
2,
0,
]],
[ 36.08421866538289 , [
2,
0.3466900561822071,
]],
[ 40.35232921841802 , [
3.0187494679480764,
0.3466900561822071,
]],
[ 45.75110941919452 , [
5.013800255434478,
0.24939747249066643,
]],
[ 52.62747570344734 , [
7.247720115513292,
0.11784838605300338,
]],
[ 61.215916197632495 , [
3.047293086933909,
0,
]],
],
},
],
'u_square_sphere': [
{
start:  0 ,
duration:  160 ,
components: 1,
animation: [
[ 0 , [
0,
]],
[ 26.42804465261863 , [
-0.00023114354615694221,
]],
[ 35.02876136374891 , [
0.9294680970982048,
]],
[ 41.22911171922535 , [
0.9351369456715175,
]],
[ 42.02105206328529 , [
0.0018195732368885414,
]],
[ 43.87549638051595 , [
-0.0058094668043194644,
]],
[ 44.12273989944436 , [
0.9719186220854608,
]],
[ 44.847435707518144 , [
0.9628951958285624,
]],
[ 44.993865123550414 , [
-0.008183462795106806,
]],
[ 46.99266404395375 , [
-0.04113509424668127,
]],
[ 47.102225671154635 , [
0.953031060141865,
]],
[ 47.88741733276103 , [
0.9543789204079054,
]],
[ 48.051759773562374 , [
-0.061852477272973175,
]],
[ 52.003800251195536 , [
0.005358437247212217,
]],
[ 52.113361878396425 , [
1.0442159480454056,
]],
[ 52.614649472000586 , [
0.9926898821174791,
]],
[ 53.00029326880267 , [
-0.069445545646775,
]],
[ 53.43810140480713 , [
0.9635391154403267,
]],
[ 54.191128727211144 , [
0.9252425302947553,
]],
[ 54.31547116801248 , [
0.00030490068638999723,
]],
[ 54.88415604961516 , [
-0.0013986646089968052,
]],
[ 55.02327930401695 , [
0.9942611291299581,
]],
[ 60.23016566893887 , [
1.001661279219025,
]],
[ 60.55986560564465 , [
-0.014682676946757872,
]],
[ 84.52412084366365 , [
-0.06972374525961059,
]],
[ 85.02412084366365 , [
0.8869080311957249,
]],
[ 86.09014776440299 , [
0.7702926284374868,
]],
[ 86.420147764403 , [
-0.08506619297594188,
]],
[ 86.72433601648586 , [
0.8105539120954673,
]],
[ 87.0351769952654 , [
0.7419264116402818,
]],
[ 91.78061001244811 , [
0.7446110348757087,
]],
[ 92.0206100124481 , [
-0.21318128244812673,
]],
[ 208 , [
1,
]],
],
},
],
'u_particles_distance': [
{
start:  23 ,
duration:  12 ,
components: 1,
animation: [
[ 0 , [
0.008342162850020096,
]],
],
},
{
start:  35 ,
duration:  25 ,
evaluate: function(t) { return [0.08*sin(8*t)*sin(2*t)]},
},
{
start:  96 ,
duration:  64 ,
evaluate: function(t) { return [t]},
},
{
start:  60 ,
duration:  36 ,
components: 1,
animation: [
[ 2.5147273984650433 , [
5.551115123125783e-17,
]],
[ 3.0049997251404417 , [
2.372007215124445,
]],
[ 3.9098195108563956 , [
2.427601134228924,
]],
[ 4.168926354325377 , [
0.9265653184079863,
]],
[ 7.466012164415294 , [
0.8895027056716668,
]],
[ 7.882703217608411 , [
2.3164132960199657,
]],
[ 9.830753090520133 , [
2.3164132960199657,
]],
[ 10.020753090520122 , [
0.6856583356219084,
]],
[ 11.175774865752757 , [
0.6671270292537487,
]],
[ 11.362030309560904 , [
2.446132440597084,
]],
[ 12.257523514909964 , [
2.4831950533334037,
]],
[ 12.434439891761459 , [
0.5744704974129495,
]],
[ 13.540167247083346 , [
0.5744704974129495,
]],
[ 13.871885453679905 , [
2.4831950533334037,
]],
[ 17.846259552002284 , [
2.496112211562458,
]],
[ 18.179158927194464 , [
1.4773756294885894,
]],
[ 20.072524123599916 , [
1.501473763561961,
]],
[ 20.21816760024648 , [
0.5756696606351098,
]],
[ 20.675904241135722 , [
0.6479640628552246,
]],
[ 21.981876508473825 , [
0.6361060475983957,
]],
[ 22.104311408536773 , [
0.013560246614884808,
]],
],
},
],
'u_particles_pos': [
{
start:  23 ,
duration:  137 ,
components: 2,
animation: [
[ 0 , [
0,
]],
[ 25.55520466679792 , [
-0.06911982683520712,
]],
[ 33.5758773617817 , [
0.9612418853555713,
]],
[ 42.63149832295514 , [
0.9739679112939233,
]],
[ 43.35132315891292 , [
-0.0036320058748416026,
]],
[ 45.702389832191216 , [
-0.0024338651590396785,
]],
[ 46.00854760829407 , [
0.9672989554061295,
]],
[ 47.516880239712464 , [
0.9695962134947526,
]],
[ 47.65688023971245 , [
0.04337571991564115,
]],
[ 56.37837511663932 , [
0.05059007624481949,
]],
[ 56.67108033801959 , [
0.9776345918380273,
]],
[ 208 , [
1,
]],
],
},
],
'u_particles_size': [
{
start:  23 ,
duration:  137 ,
components: 1,
animation: [
[ 24.253967106379307 , [
0.996086118416037,
]],
],
},
{
start:  -1 ,
duration:  24 ,
components: 1,
animation: [
[ 7.257005206444887 , [
0,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 1,
animation: [
[ 0 , [
0,
]],
],
},
],
'u_color': [
{
start:  0 ,
duration:  64 ,
components: 4,
animation: [
[ 0 , [
0,
0,
0,
1,
]],
[ 32 , [
0,
0,
0,
1,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 4,
animation: [
[ 0.03961123690055568 , [
-4.336808689942018e-19,
-4.336808689942018e-19,
-4.336808689942018e-19,
-4.336808689942018e-19,
]],
[ 23.24539437461227 , [
0.26840359744226905,
0.26840359744226905,
0.26840359744226905,
0.26840359744226905,
]],
[ 32.07335277244798 , [
0.5475932955487598,
0.6191179839574629,
0.7813063436218299,
0.26840359744226905,
]],
],
},
],
'u_cam_fov': [
{
start:  0 ,
duration:  160 ,
components: 1,
animation: [
[ 0 , [
0.5,
]],
[ 22 , [
0.5,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 1,
animation: [
[ 0.4852978786812278 , [
60,
]],
[ 64.07347319598674 , [
77.18924897011932,
]],
],
},
],
'u_cam_pos': [
{
start:  0 ,
duration:  160 ,
components: 3,
animation: [
[ -0.9271897373943297 , [
-100,
44.42896093357869,
100,
]],
[ 20 , [
200,
200,
200,
]],
[ 24.768202795404896 , [
200,
200,
200,
]],
[ 92.5784503093481 , [
200.03434237884466,
199.97709157016172,
200.09884047211068,
]],
[ 94.92408780196878 , [
200,
200,
200,
]],
[ 105.42245593766135 , [
195.60224394897926,
202.93356748512858,
187.34286036862014,
]],
[ 117.25912189823094 , [
224.03959919534856,
174.3087855408932,
215.34833614449548,
]],
[ 123.8710181464223 , [
232.0898355893198,
259.0392986611194,
174.6751082539671,
]],
[ 131.94283607835004 , [
273.95474265246304,
171.74249187422254,
203.83259521178792,
]],
[ 136.32723411594733 , [
197.0041818615682,
209.65064985357674,
202.05486661166097,
]],
[ 147.13702436464484 , [
200,
200,
200,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 3,
animation: [
[ 0.6162020416109001 , [
4.494065403763681,
3.1035739742958643,
14.698237438191786,
]],
[ 63.48705806863043 , [
27.514124568577337,
17.4806062492779,
28.317728072597653,
]],
],
},
],
'u_cam_target': [
{
start:  0 ,
duration:  160 ,
components: 3,
animation: [
[ 0 , [
0,
0,
0,
]],
[ 32 , [
0,
0,
0,
]],
[ 144.9019803427483 , [
0,
0,
0,
]],
[ 145.42738998762073 , [
0,
0,
0,
]],
[ 159.61226154665283 , [
4.934834103920054,
-0.06516589607994552,
-5.065165896079946,
]],
],
},
{
start:  160 ,
duration:  64 ,
components: 3,
animation: [
[ 1.2558137653600652 , [
4.726481869380512,
9.559596388858719,
-100,
]],
[ 62.97344712764955 , [
17.293471483107,
4.126621732511386,
-100,
]],
],
},
],
'fill_scale': [
{
start:  23 ,
duration:  137 ,
components: 3,
animation: [
[ 0.5846285394500418 , [
-0.0073245378109735755,
-0.007254458495596184,
-0.007254458495596184,
]],
[ 1.6898129809068614 , [
1.3692322719659593,
1.3693023512813376,
1.3693023512813376,
]],
[ 5.612721868417777 , [
1.330272971298284,
1.3303430506136622,
1.3303430506136622,
]],
[ 6.34804463751143 , [
0.320863996213479,
0.3209340755288573,
0.3209340755288573,
]],
[ 15.66388945579035 , [
0.3213670766626112,
0.3214371559779895,
0.3214371559779895,
]],
[ 18.820932593895208 , [
0.31983933691928657,
0.31990941623466485,
0.31990941623466485,
]],
[ 19.143175848597636 , [
0.0988639962134789,
0.09893407552885718,
0.09893407552885718,
]],
[ 21.660106430628446 , [
0.0988639962134789,
0.09893407552885718,
0.09893407552885718,
]],
[ 27.669203772704023 , [
0.0988639962134789,
0.09893407552885718,
0.09893407552885718,
]],
[ 27.973843155665868 , [
0.29486399621347903,
0.2949340755288573,
0.2949340755288573,
]],
],
},
],
'outline_scale1': [
{
start:  23 ,
duration:  137 ,
components: 3,
animation: [
[ 1.3537866178296223 , [
-0.004797146221899445,
-0.004797146221899445,
-0.004797146221899445,
]],
[ 1.4556911301932824 , [
-0.004797146221899445,
-0.004797146221899445,
-0.004797146221899445,
]],
[ 2.045963163230716 , [
2.307061094538929,
2.3070610945389274,
2.3070610945389283,
]],
[ 4.396418477379741 , [
2.5308267058086615,
2.5306912840777143,
2.530691284077715,
]],
[ 6.80458832411291 , [
2.3588635570276733,
2.349591169044519,
2.34959116904452,
]],
[ 7.700651522897339 , [
0.6145454946014556,
0.6111658887324724,
0.611165888732473,
]],
[ 9.852074800034895 , [
0.36533705208686873,
0.36533705208686784,
0.3653370520868685,
]],
[ 55.99452792641569 , [
0.4160199006471497,
0.4161767103019998,
0.41617671030200004,
]],
[ 87.11088918874552 , [
1.0698230752910889,
1.0699404160910486,
1.0699404160910486,
]],
[ 119.92850387647636 , [
1.0857586493606384,
1.0858483124471112,
1.085848312447112,
]],
[ 208 , [
1.05,
1.05,
1.05,
]],
],
},
],
'outline_scale2': [
{
start:  23 ,
duration:  137 ,
components: 3,
animation: [
[ 0.812246506728146 , [
-0.001014480609906109,
-0.001014480609906109,
-0.001014480609906109,
]],
[ 3.0523236792030914 , [
-0.0001335496699864832,
-0.0001335496699864832,
-0.0001335496699864832,
]],
[ 5.908525125328475 , [
2.425578290968105,
2.425578290968105,
2.425578290968105,
]],
[ 9.548781870390233 , [
2.433921977230089,
2.433921977230089,
2.433921977230089,
]],
[ 12.038049508285432 , [
0.4091281565800947,
0.4091281565800947,
0.4091281565800947,
]],
[ 21.4533425211921 , [
0.3745225866664125,
0.3745225866664125,
0.3745225866664125,
]],
[ 22.028848144077607 , [
0.8544265205751636,
0.8544265205751636,
0.8544265205751636,
]],
[ 22.96702558162056 , [
0.43945898561485724,
0.43945898561485724,
0.43945898561485724,
]],
[ 42.556526578161574 , [
0.43534676115482707,
0.4247884735245192,
0.4247884735245192,
]],
[ 42.743346771780146 , [
0.9632611426702221,
0.9632611426702221,
0.9632611426702221,
]],
[ 42.98084142828839 , [
0.4747548162555578,
0.4747548162555578,
0.4747548162555578,
]],
[ 44.674701813788495 , [
0.4742308522188111,
0.4742308522188111,
0.4742308522188111,
]],
[ 44.72084142828839 , [
1.0487497497927882,
1.0487497497927882,
1.0487497497927882,
]],
[ 45.064701813788496 , [
0.5230814848602771,
0.5230814848602771,
0.5230814848602771,
]],
[ 59.24848391483719 , [
0.5225694426442796,
0.5225694426442796,
0.5225694426442796,
]],
[ 59.849691476412836 , [
1.3709853823095455,
1.3709853823095455,
1.3709853823095455,
]],
[ 60.31576579021587 , [
0.5207153581044791,
0.5207153581044791,
0.5207153581044791,
]],
[ 72.05472226273724 , [
0.47825367332781277,
0.47825367332781277,
0.47825367332781277,
]],
[ 82.38681150801524 , [
1.1657251869862733,
1.1657251869862733,
1.1657251869862733,
]],
],
},
],
'u_logo_scales': [
{
start:  0 ,
duration:  60 ,
components: 3,
animation: [
[ 0 , [
1,
1,
1,
]],
[ 0 , [
1,
1,
1,
]],
],
},
{
start:  60 ,
duration:  4 ,
easing: ease_square ,
components: 3,
animation: [
[ 0 , [
1,
1,
1,
]],
[ 4 , [
0.01,
5,
5,
]],
],
},
],
'u_cookie_scale0': [
{
start:  0 ,
duration:  160 ,
components: 3,
animation: [
[ 0 , [
1,
1,
1,
]],
[ 208 , [
1,
1,
1,
]],
],
},
],
'u_cookie_translation0': [
{
start:  0 ,
duration:  160 ,
components: 3,
animation: [
[ 0 , [
0,
0,
0,
]],
[ 32 , [
0,
0,
0,
]],
[ 146.81809155992494 , [
0,
0,
0,
]],
],
},
],
'u_cookie_scale1': [
{
start:  0 ,
duration:  144 ,
easing: ease_inv_square ,
components: 3,
animation: [
[ 0 , [
10,
1,
1,
]],
[ 10 , [
1,
1,
1,
]],
],
},
{
start:  144 ,
duration:  16 ,
components: 3,
animation: [
[ 0 , [
1,
1,
1,
]],
[ 9.945077867674513 , [
1,
1,
1,
]],
],
},
],
'u_cookie_translation1': [
{
start:  0 ,
duration:  10 ,
components: 3,
animation: [
[ 0 , [
10,
0,
0,
]],
[ 10 , [
0,
0,
0,
]],
],
},
{
start:  10 ,
duration:  150 ,
components: 3,
animation: [
[ 0 , [
0,
0,
0,
]],
[ 54 , [
0,
0,
0,
]],
[ 135.1531666414771 , [
0,
0,
0,
]],
],
},
],
'u_line_threshold': [
{
start:  20 ,
duration:  10 ,
components: 1,
animation: [
[ 0 , [
0,
]],
[ 10 , [
1,
]],
],
},
{
start:  144 ,
duration:  16 ,
components: 1,
animation: [
[ 0.07152706566800138 , [
-3.0267052795722877,
]],
[ 8.230878886598946 , [
0.9496436729251934,
]],
],
},
],
'u_cam_tilt': [
{
start:  0 ,
duration:  160 ,
components: 1,
animation: [
[ 0 , [
0,
]],
[ 208 , [
0,
]],
],
},
],
'text_pos': [
{
start:  0 ,
duration:  160 ,
components: 2,
animation: [
[ 0 , [
100,
0,
]],
[ 65.83538934032387 , [
100,
243.31638317410125,
]],
],
},
],
'background_program': [
{
start:  0 ,
duration:  128 ,
evaluate: function(t) { return [1]},
},
{
start:  128 ,
duration:  16 ,
evaluate: function(t) { return [2]},
},
{
start:  144 ,
duration:  16 ,
evaluate: function(t) { return [1]},
},
{
start:  160 ,
duration:  64 ,
evaluate: function(t) { return [3]},
},
{
start:  224 ,
duration:  24 ,
evaluate: function(t) { return [0]},
},
],
'text_is': [
{
start:  0 ,
duration:  256 ,
components: 3,
animation: [
[ 6.40268937787987 , [
-1.0297628394341154,
-0.17896310043606534,
0.28012887393074953,
]],
[ 7.107192214239383 , [
-0.08045126394279317,
-0.18419216072113664,
0.2808979066802982,
]],
[ 15.077876969923565 , [
-0.020032022044794873,
-0.22671701065371858,
0.29043731178341653,
]],
[ 15.630762920287353 , [
-0.020032022044794873,
-1.6114048639042606,
0.29043731178341653,
]],
],
},
],
'text_dead': [
{
start:  0 ,
duration:  256 ,
components: 3,
animation: [
[ 7.99411084011846 , [
1.803257487860046,
-0.6108713225595717,
-0.030195512078138555,
]],
[ 9.239381500496908 , [
0.1884396468516313,
-0.6179527348825158,
-0.030195512078138555,
]],
[ 13.917857141398962 , [
0.06863735812497188,
-0.6181940746894897,
-0.030195512078138555,
]],
[ 14.232915539979231 , [
0.03925426277655508,
-0.6181899646849699,
-0.030195512078138555,
]],
[ 14.806779706997656 , [
-1.9292661822602568,
-0.6179527348825158,
-0.030195512078138555,
]],
],
},
],
'text_long': [
{
start:  0 ,
duration:  256 ,
components: 3,
animation: [
[ 11.587527046788257 , [
3.261115304438963,
3.928170687787715,
0,
]],
],
},
],
'text_live': [
{
start:  0 ,
duration:  256 ,
components: 3,
animation: [
[ 9.122143032120603 , [
4.033389545496315,
3.9281706877877136,
0,
]],
],
},
],
'u_twist': [
{
start:  160 ,
duration:  64 ,
components: 1,
animation: [
[ 0 , [
0,
]],
[ 16.099463765696484 , [
0,
]],
[ 20.227739696804598 , [
3.2048377151595213,
]],
[ 63.65552173499306 , [
-7.539815245971423,
]],
],
},
],
'u_flatness': [
{
start:  160 ,
duration:  64 ,
components: 1,
animation: [
[ 0.12072829761556747 , [
1.0029850746268656,
]],
[ 9.495926017573197 , [
1,
]],
[ 16.209219744401153 , [
0.99542311237933,
]],
[ 19.998222432707408 , [
0,
]],
],
},
],
'text_lnx': [
{
start:  160 ,
duration:  88 ,
components: 3,
animation: [
[ 0.36211124519545357 , [
1.3067558972518736,
0,
0,
]],
[ 1.4198115112170413 , [
0.5786133077383921,
-0.039007638723935534,
0,
]],
[ 3.539588192298578 , [
0.552226227274211,
0.021100199369307904,
0,
]],
[ 4.221441415091833 , [
0.5786133077383921,
1.4302800865443404,
0,
]],
],
},
],
'text_popsy': [
{
start:  160 ,
duration:  80 ,
components: 3,
animation: [
[ 2.062860763169044 , [
0.5625465757005053,
-1.5279876829675805,
0.059289733186804555,
]],
[ 2.8404503986130836 , [
0.574503458498292,
-1.1740865327829473,
0.059289733186804555,
]],
[ 3.652752505172166 , [
0.6047866889154311,
-0.47237376002269715,
0.059289733186804555,
]],
[ 5.906354997114717 , [
0.6266361522496171,
-0.4467768195304419,
0.059289733186804555,
]],
[ 6.47757507495031 , [
2.2765664588341084,
-0.47237376002269715,
0.059289733186804555,
]],
],
},
],
'text_xmen': [
{
start:  152 ,
duration:  88 ,
components: 3,
animation: [
[ 5.00188467694164 , [
0.5391808279854537,
-1.4827472769599974,
0,
]],
[ 6.143778002958587 , [
0.5391808279854537,
-0.7413736384799988,
0,
]],
[ 7.9670489072223285 , [
0.5391808279854537,
-0.7189077706472716,
0,
]],
[ 9.017588324468404 , [
0.5391808279854537,
1.347952069963634,
0,
]],
],
},
],
'text_cocoon': [
{
start:  160 ,
duration:  80 ,
components: 3,
animation: [
[ 8.09489707237147 , [
0.5391808279854533,
-2.2465867832727238,
0,
]],
[ 9.978050517591669 , [
0.5391808279854533,
-0.5616466958181809,
0,
]],
[ 10.285607500298202 , [
0.5376386041722093,
-0.6768770041153956,
-0.001542223813244044,
]],
[ 12.741999428887281 , [
0.5167149601527261,
-0.6964419028145444,
-0.022465867832727242,
]],
[ 13.029961934920625 , [
0.5161730403348168,
-0.8281347884814032,
-0.023007787650636543,
]],
[ 15.030772064596109 , [
0.5167149601527261,
3.0104262895854497,
-0.022465867832727242,
]],
],
},
],
'text_flush': [
{
start:  160 ,
duration:  80 ,
components: 3,
animation: [
[ 13.971123515986601 , [
1.5950766161236325,
-0.0224658678327272,
-0.0224658678327272,
]],
[ 14.830006846324858 , [
0.5616466958181797,
-0.0224658678327272,
-0.0224658678327272,
]],
[ 16.0772366123077 , [
0.5438801239201315,
-0.02827214348232692,
-0.0224658678327272,
]],
[ 16.65718515558177 , [
0.5616466958181797,
-0.0224658678327272,
-0.0224658678327272,
]],
[ 18.64861773314066 , [
0.5616466958181797,
-2.168676379253639,
-0.0224658678327272,
]],
],
},
],
'text_trbl': [
{
start:  160 ,
duration:  80 ,
components: 3,
animation: [
[ 16.130883405916553 , [
1.6497584773515472,
0,
0,
]],
[ 17.906178411098363 , [
0.546290325080167,
0,
0,
]],
[ 22.190652606405166 , [
0.6009960254489807,
0,
0,
]],
[ 24.579425194918244 , [
0.6009960254489807,
-1.3676425092203415,
0,
]],
],
},
],
'text_staytuned': [
{
start:  -96 ,
duration:  344 ,
components: 3,
animation: [
[ 97 , [
-0.004740528040651004,
-1.4865145967836713,
0,
]],
[ 308.85093718412895 , [
-1.8778780438247529,
-1.415407985126587,
0.12831883814618641,
]],
[ 317.50809394121967 , [
-2.436445791543722,
0.07030602731213931,
0.1660676765319174,
]],
[ 319.3256286850546 , [
-2.594355504052166,
-0.1321976539057403,
0.1660676765319174,
]],
[ 320.0751111735242 , [
-0.0006610771853103187,
0.09112833026954142,
0.1660676765319174,
]],
],
},
],
'text_url': [
{
start:  -96 ,
duration:  344 ,
components: 3,
animation: [
[ 23.765910459090964 , [
-32.35900530194623,
0,
0,
]],
[ 294.52440831229603 , [
-31.746639775342704,
0.23935600982437505,
-0.8800049298957626,
]],
[ 320.67527581049455 , [
-37.5233975046309,
-0.3645896481985678,
-0.024950228022276262,
]],
[ 320.71369125304284 , [
0.06233487763772085,
-0.3819981630777762,
0,
]],
],
},
],
'lalala': [
{
start:  -96 ,
duration:  24 ,
components: 3,
animation: [
],
},
],
}

var rg_targets = {}
function load_render_graph() {
textures.float_main = create_texture( 0 , 0 , 0 , 0,  0 , true , 0 , true , 0 );
textures.float_small1 = create_texture( 0 , 0 , 0 , 0,  0 , true , 0 , true , 1 );
textures.float_small2 = create_texture( 0 , 0 , 0 , 0,  0 , true , 0 , true , 1 );
textures.post1 = create_texture( 0 , 0 , 0 , 0,  0 , true , 0 , 0 , 0 );
textures.post2 = create_texture( 0 , 0 , 0 , 0,  0 , true , 0 , 0 , 0 );
textures.depth = create_texture( 0 , 0 , gl.DEPTH_COMPONENT , 0,  0 , 0 , 0 , 0 , 0 );
rg_targets['float_main'] = create_render_target({ color: textures.float_main, depth: textures.depth, });
rg_targets['float_small1'] = create_render_target({ color: textures.float_small1, /*no depth*/ });
rg_targets['float_small2'] = create_render_target({ color: textures.float_small2, /*no depth*/ });
rg_targets['post1'] = create_render_target({ color: textures.post1, /*no depth*/ });
rg_targets['post2'] = create_render_target({ color: textures.post2, /*no depth*/ });
render_passes = [
{
render_to: "float_main",
clear: [ 0.7,0.7,0.7,1 ],
},
{
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.quad  ],
],
programs: [
programs.background0,
programs.background1,
programs.background2,
programs.plop,
],
select_program: 'background_program',
},
{
enabled: 'show_demojs',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.demojs  ],
],
program: programs.demojs,
uniforms: [
{ name: 'u_scale', 
track: 'outline_scale2',
},
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
],
},
{
enabled: 'show_demojs',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.demojs  ],
],
program: programs.demojs,
uniforms: [
{ name: 'u_scale', 
track: 'outline_scale1',
},
{ name: 'u_color', 
value:  [ 1, 1, 1, 1 ] ,
},
],
},
{
enabled: 'show_demojs',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.demojs  ],
],
program: programs.demojs,
uniforms: [
{ name: 'u_scale', 
value:  [ 1.3, 1, 1 ] ,
},
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
],
},
{
enabled: 'show_particles',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.particles  ],
],
program: programs.particles,
uniforms: [
{ name: 'u_scale', 
track: 'outline_scale2',
},
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
],
},
{
enabled: 'show_particles',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.particles  ],
],
program: programs.particles,
uniforms: [
{ name: 'u_scale', 
track: 'outline_scale1',
},
{ name: 'u_color', 
value:  [ 1, 1, 1, 1 ] ,
},
],
},
{
enabled: 'show_particles',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.particles  ],
],
program: programs.particles,
uniforms: [
{ name: 'u_scale', 
track: 'fill_scale',
},
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
],
},
{
enabled: 'show_logo',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.cube  ],
],
program: programs.solid_color,
uniforms: [
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
{ name: 'u_scale', 
track: 'outline_scale2',
},
],
},
{
enabled: 'show_logo',
render_to: "float_main",
depth_test:  false ,
geometry: [
[geometries.cube  ],
],
program: programs.solid_color,
uniforms: [
{ name: 'u_color', 
value:  [ 0.7, 0.7, 0.7, 1 ] ,
},
{ name: 'u_scale', 
track: 'outline_scale1',
},
],
},
{
enabled: 'show_logo',
render_to: "float_main",
depth_test:  true ,
geometry: [
[geometries.cookie_logo  ],
],
program: programs.logo,
uniforms: [
{ name: 'u_color', 
value:  [ 0, 0, 0, 0 ] ,
},
{ name: 'u_scale', 
value:  [ 1, 1, 1 ] ,
},
],
},
{
enabled: 'show_logo',
render_to: "float_main",
depth_test:  true ,
geometry: [
[geometries.logo_lines  ],
],
program: programs.logo_lines,
},
{
enabled: 'show_cookie_title',
render_to: "float_main",
depth_test:  true ,
geometry: [
[geometries.cookie_title  ],
],
program: programs.logo_lines,
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.is,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.1, 0.1, 0.12, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.1, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_is',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.dead,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.1, 0.1, 0.12, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_dead',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.long,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 0 ] ,
},
{ name: 'u_scale', 
value:  [ 0.1, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_long',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.live,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_live',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.lnx,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_lnx',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.popsy,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_popsy',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.xmen,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_xmen',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.cocoon,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_cocoon',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.flush,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_flush',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.trbl,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0.4, 0.4, 0.45, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.3, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_trbl',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.staytuned,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.4, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_staytuned',
},
],
blend: 'alpha',
},
{
render_to: "float_main",
texture_inputs: [
textures.url,
],
geometry: [
[geometries.quad  ],
],
program: programs.text,
uniforms: [
{ name: 'u_color', 
value:  [ 0, 0, 0, 1 ] ,
},
{ name: 'u_scale', 
value:  [ 0.7, 0.3, 0 ] ,
},
{ name: 'u_position', 
track: 'text_url',
},
],
blend: 'alpha',
},
{
render_to: "float_small1",
texture_inputs: [
textures.float_main,
],
geometry: [
[geometries.quad  ],
],
program: programs.prepare_bloom,
},
{
render_to: "float_small2",
texture_inputs: [
textures.float_small1,
],
geometry: [
[geometries.quad  ],
],
program: programs.blur_h,
},
{
render_to: "float_small1",
texture_inputs: [
textures.float_small2,
],
geometry: [
[geometries.quad  ],
],
program: programs.blur_v,
},
{
render_to: "float_small2",
texture_inputs: [
textures.float_small1,
],
geometry: [
[geometries.quad  ],
],
program: programs.blur_h,
},
{
render_to: "float_small1",
texture_inputs: [
textures.float_small2,
],
geometry: [
[geometries.quad  ],
],
program: programs.blur_v,
},
{
render_to: "post1",
texture_inputs: [
textures.float_main,
textures.float_small1,
],
geometry: [
[geometries.quad  ],
],
program: programs.bloom,
},
{
render_to: "post2",
texture_inputs: [
textures.post1,
],
geometry: [
[geometries.quad  ],
],
program: programs.antialias,
},
{
texture_inputs: [
textures.post2,
],
geometry: [
[geometries.quad  ],
],
program: programs.posteffect,
},
]
engine.render = render_rg;
}
var  uniforms = {}
if (config.EDITOR) {

function refreshUniformsDump() {
    var top = document.querySelector("#uniforms-dump");
    if (!top) {
        top = document.createElement("div");
        top.style.fontSize = "1.5em";
        top.style.zIndex = "20000";
        top.style.border = "2px solid black";
        top.style.position = "absolute";
        top.style.left = "0px";
        top.style.bottom = "0px";
        top.style.background = "rgb(50,50,50)";
        top.style.color = "white";
        top.style.fontFamily = "courier";
        top.style.width = "50%";
        top.style.overflow = "hidden";
        top.id = "uniforms-dump";
        document.documentElement.appendChild(top);
    }
    var str = "<ul>";
    for (var i in uniforms) {
        str += "<li><b>" + i + "</b>: " + JSON.stringify(uniforms[i]) + "</li>";
    }
    str += "</ul>";
    //console.log(str);
    top.innerHTML = str;
}

window.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key == 'y') {
      var  i = window.renderHooks.indexOf(refreshUniformsDump);
      if (i == -1) {
          window.renderHooks.push(refreshUniformsDump);
          refreshUniformsDump();
      } else {
          window.renderHooks.splice(i, 1);
          var top = document.querySelector("#uniforms-dump");
          top.remove();
      }
    }
    return false;
});

}
  sends = [SND.DEL(),SND.REV(),SND.DIST()]
  instruments = [SND.Drum,SND.Synth,SND.Noise,SND.Reese,SND.Sub,SND.Snare,SND.Glitch]
  SONG = {playlist:[{3:0},{1:1,3:1},{3:0,1:1,0:6,4:2},{0:6,4:2, 1:3, 5:15,
  6:19},{6:12},{0:6,1:0,2:7,3:0,4:2,5:4},{0:6,1:0,2:7,3:0,4:2,5:4},{0:6,1:9,2:7,3:10,4:2,5:4},{0:6,1:11,2:7,3:10,4:8,5:4},{0:6,1:9,2:7,3:10,4:2,5:15},{0:16,1:11,2:17,3:10,4:8,5:18},{0:6,1:9,2:7,3:10,4:2},{0:6,1:11,2:7,3:10,4:2},{0:6,1:9,2:7,3:10,4:2},{6:12}],patterns:[[[72,{v:0.002,f:0.05,l:64}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[72,{l:32,f:0.01,v:0.01}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,[48,{l:32,f:0.01,v:0.01}],0,0,0,0,0,0,0,0,[36,{l:32,f:0.1,v:0.01}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{f:0.001,v:0.01,l:32}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[60,{f:0.001,v:0.01,l:32}],0,0,0,0,0,0,0,0,0,[60,{f:0.001,v:0.02,l:64}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[60,{f:0.01,v:0.02,l:32}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[36,{l:4}],0,0,0,0,[36,{l:4}],0,0,0,[36,{l:4}],0,0,0,0,0,0,[39,{l:4}],0,0,0,0,0,0,0,[41,{l:2}],0,[41,{l:4}],0,0,0,0,0,[36,{l:4}],0,0,0,0,[36,{l:2}],0,0,0,0,0,0,0,0,0,0,[41,{l:8}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,0,0],[0,0,[1,{v:0.01}],0,0,0,[1,{v:0.02}],0,0,0,[1,{v:0.03}],0,0,0,[1,{v:0.04}],0,0,0,[1,{v:0.05}],0,0,0,[1,{v:0.07}],0,0,0,[1,{v:0.09}],0,0,0,[1,{v:0.1}],0,0,0,[1,{v:0.11}],0,0,0,[1,{v:0.17}],0,0,0,[1,{v:0.2}],0,0,0,[1,{v:0.3}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],[[36,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[43,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[39,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[41,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:16}],0,0,0,0,0,65,65,0,0,0,0,[65,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[36,{l:32,f:0.005,v:0.05}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:8}],0,0,0,0,0,65,65,0,0,0,0,[62,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[1,{l:32}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:8}],0,0,0,0,0,65,65,0,0,0,0,[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[36,{l:32,f:0.1}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0], [0,0,0,1 ,0,0,0,0 ,0,0,0,1 ,0,0,0,0 ,0,0,1,0 ,0,1,1,1, ,0,0,0,1, ,0,0,0,0]]};
   function compressing() {
  return false;
}

function compress() {
  // partition before compressing
SONG2 = {cfg:{tempo:125},sends:[[SND.DEL],[SND.REV],[SND.DIST]],instruments:[[SND.Drum,{sw:0.04,d:0.2,k:0.03,st:90,en:50,v:1}],[SND.Synth,{q:2,d:0.5,fm:1800,f:200,s:[0.5,0.6],t:"square",v:0.1}],[SND.Noise,{q:8,d:0.06,ft:"highpass",f:8000,v:0.1,s:[0.3]}],[SND.Reese,{t:"square",lfo:1,co:8000,v:0.1,s:[0,0.4,1]}],[SND.Sub,{t:"sine",v:0.4,d:2}],[SND.Snare,{t:"triangle",sw:0,d:0.1,st:3000,f:3000,en:50,k:0.015,v:0.6,s:[0.03,0.2],ft:"bandpass"}],[SND.Glitch,{}]],playlist:[{"3":0},{"1":1,"3":1},{"6":12},{"3":0},{"1":1,"3":1},{"0":6,"1":0,"2":7,"3":0,"4":2,"5":4},{"0":6,"1":0,"2":7,"3":0,"4":2,"5":4},{"0":6,"1":9,"2":7,"3":10,"4":2,"5":4},{"0":6,"1":11,"2":7,"3":10,"4":8,"5":4},{"0":6,"1":9,"2":7,"3":10,"4":2,"5":15},{"0":16,"1":11,"2":17,"3":10,"4":8,"5":18},{"0":6,"1":9,"2":7,"3":10,"4":2},{"0":6,"1":11,"2":7,"3":10},{"1":0,"3":0}],patterns:[[[72,{v:0.002,lfo:0.05,l:64,co:4000}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[72,{l:32,lfo:0.01,v:0.01}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,[48,{l:32,lfo:0.01,v:0.01}],0,0,0,0,0,0,0,0,[36,{l:32,lfo:0.1,v:0.01}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{lfo:0.001,v:0.01,l:32}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[60,{lfo:0.001,v:0.01,l:32}],0,0,0,0,0,0,0,0,0,[60,{lfo:0.001,v:0.02,l:64}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[60,{lfo:0.01,v:0.02,l:32}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[36,{l:4}],0,0,0,0,[36,{l:4}],0,0,0,[36,{l:4}],0,0,0,0,0,0,[39,{l:4}],0,0,0,0,0,0,0,[41,{l:2}],0,[41,{l:4}],0,0,0,0,0,[36,{l:4}],0,0,0,0,[36,{l:2}],0,0,0,0,0,0,0,0,0,0,[41,{l:8}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[286331153,286331153],[0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,[1,{v:0.2}],0,0,0,0,0,0,0,0,0],[0,0,[1,{v:0.01}],0,0,0,[1,{v:0.02}],0,0,0,[1,{v:0.03}],0,0,0,[1,{v:0.04}],0,0,0,[1,{v:0.05}],0,0,0,[1,{v:0.07}],0,0,0,[1,{v:0.09}],0,0,0,[1,{v:0.1}],0,0,0,[1,{v:0.11}],0,0,0,[1,{v:0.17}],0,0,0,[1,{v:0.2}],0,0,0,[1,{v:0.3}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0,0,0,[1,{v:0.5}],0],[286331153,286331153],[1145324612,1145324612],[[36,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[43,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[39,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[41,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:16}],0,0,0,0,0,65,65,0,0,0,0,[65,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[36,{l:32,lfo:0.005,v:0.05}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:8}],0,0,0,0,0,65,65,0,0,0,0,[62,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0],[[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,[63,{l:2}],0,[48,{l:8}],0,0,0,0,0,65,65,0,0,0,0,[60,{l:16}],0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,[36,{l:32,lfo:0.1}]],[269488144,269488144],[286331153,17895697],[1145324612,4473924],[269488144,336597008]]};
  if (!compressing()) {
    return;
  }
  function is_perc(p) {
    for (var i = 0; i < 64; i++) {
      if (p[i] != 0 && p[i] != 1) {
        return false;
      }
    }
    return true;
  }

  var compressed = [];
  var patterns = SONG.patterns;
  for (var i = 0; i < patterns.length; i++) {
    if (is_perc(patterns[i])) {
      console.log("compressing " + i);
      compressed[i] = [];
      for(var j = 0; j < 64; j++) {
        compressed[i][j] = patterns[i][j];
      }
      patterns[i] = compress_perc_pattern(patterns[i]);
    }
  }
}


// var p = SONG.patterns;
// for (var i = 0; i < p.length; i++) {
//   // patterns.length == 2
//   if (p[i][2] == undefined) {
//     var c = [];
//     for (var j = 64; j;) {
//       c[--j] = (p[i][(j/32)|0] >> (j%32)) & 1;
//     }
//     p[i] = c;
//     if (compressing()) {
//       for (var j = 0 ; j < 64; j++) {
//         if (p[i][j] != compressed[i][j]) {
//           console.log("different at " + i + " " + j);
//           console.log(p[i][j], compressed[i][j]);
//         }
//       }
//     }
//   }
// }
function snd_init() {
snd = SNDStreaming('bbbb.ogg', 160);
}
onload=main;

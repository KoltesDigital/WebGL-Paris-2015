//==========================================================
//
//	シーン07
//
//==========================================================
var gScene07Primitive;
var gScene07RenderTarget;
var gScene07Composer;
var gScene07Object;



var gScene07RTTCamera;
var gScene07RTTScene;
var gScene07RTTObject;

//---- Rendererが必要な初期化 ----
function EnterScene07( renderer , scene , camera )
{
}

//---- 計算 ---
function CalcScene07( scene , camera , time )
{
	var rad = 2.5*time;

	for( var j=0 ; j < 10 ; j++ )
	{
		for( var i=0 ; i < 10 ; i++ )
		{
			gScene07Object[j][i].rotation.set( 0.2  , rad+0.5*i , 0 );
		}
	}
}

//---- レンダリング ----
function RenderScene07( renderer , scene , camera , time )
{
	// target
	renderer.clearTarget( gScene07RenderTarget, 0, 0, 0 );
	renderer.render( gScene07RTTScene, gScene07RTTCamera , gScene07RenderTarget );

	// main
    //renderer.setClearColor(0x000000);
	renderer.render( scene, camera );

	//renderer.render( gScene07RTTScene, gScene07RTTCamera );
}

//----- リサイズ ---
function OnResizeScene07()
{
}


function CreateScene07()
{
	// レンダリングターゲットの作成
	gScene07RenderTarget = new THREE.WebGLRenderTarget(  window.innerWidth,window.innerHeight , { format: THREE.RGBAFormat } );

	//========== メインシーン ==========
	var scene = new THREE.Scene();

	// カメラの作成
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,1,1000);
    camera.position.set( 0, 0, 10 );

	// 球
	var geometry = new THREE.SphereGeometry(0.5,64,32); 
	var material = new THREE.MeshBasicMaterial({ color: 0xffffff, map:gScene07RenderTarget }); // Skin the cube with 100% blue.
	gScene07Object = new Array();
	for( var j=0 ; j < 10 ; j++ )
	{
		gScene07Object[j] = new Array();
		for( var i=0 ; i < 10 ; i++ )
		{
			var cube = new THREE.Mesh(geometry, material); // Create a mesh based on the specified geometry (cube) and material (blue skin).
			
			cube.position.x = ( i - ( 10 - 1 ) / 2 )*2;
			cube.position.y = ( j - ( 10 - 1 ) / 2 )*1;
			cube.position.z = 0;
			cube.rotation.y = 3.1418 * -0.3;

			scene.add(cube); 
			gScene07Object[j][i] = cube;
		}
	}


	//========== RenderToTextureシーン =====
	gScene07RTTScene = new THREE.Scene();
	gScene07RTTCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight , 0 , 1000 );
	gScene07RTTCamera.position.set( 0, 0, 5 );

   
    // (2) マテリアルの作成
    var material = new THREE.ShaderMaterial({
    	vertexShader: document.getElementById('Scene07_VS').textContent,
        fragmentShader: document.getElementById('Scene07_FS').textContent,
		//uniform:シェーダーの全体の設定
        uniforms: {
          time: { type: 'f', value: 0 },
          resolution: { type: 'v2', value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
        },
 
        // 通常マテリアルのパラメータ
        blending: THREE.AdditiveBlending, transparent: false, depthTest: false
	});

	/*
	var geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0); // Create a 20 by 20 by 20 cube.
//	var material = new THREE.MeshBasicMaterial({ color: 0xFF00FF }); // Skin the cube with 100% blue.
	var cube = new THREE.Mesh(geometry, material); // Create a mesh based on the specified geometry (cube) and material (blue skin).
	cube.position.set(0.0, 0.0, 0.0); 
	gScene07RTTScene.add(cube); // Add the cube at (0, 0, 0).
	*/

	// 四角形   
	var geometry   = new THREE.Geometry();
    var attributes = material.attributes;
    geometry.vertices.push( new THREE.Vector3(  1 ,  1 , 0.5 ) );
    geometry.vertices.push( new THREE.Vector3(  1 , -1 , 0.5 ) );
    geometry.vertices.push( new THREE.Vector3( -1 ,  1 , 0.5 ) );
    geometry.vertices.push( new THREE.Vector3( -1 , -1 , 0.5 ) );

	geometry.faces.push( new THREE.Face3(0, 2, 1 ) );
	geometry.faces.push( new THREE.Face3(1, 2, 3 ) );
	var mesh = new THREE.Mesh( geometry, material );
	gScene07RTTScene.add(mesh);
	gScene07RTTObject = mesh;

	
	



    return { scene: scene , 
			 camera: camera , 
			 material: material , 
			 duration: 4 , 
			 enter:EnterScene07 ,
			 calc:CalcScene07 , 
			 render:RenderScene07 ,
			 resize:OnResizeScene07 };


}


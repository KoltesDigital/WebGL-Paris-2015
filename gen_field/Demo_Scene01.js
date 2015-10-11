//==========================================================
//
//	シーン01
//
//==========================================================
var gScene01Primitive;
var gScene01RenderTarget;
var gScene01Composer;

//---- Rendererが必要な初期化 ----
function EnterScene01( renderer , scene , camera )
{
	// ポストエフェクト
	// Composerを作ってパスを突っ込んでいく。
	gScene01Composer = new THREE.EffectComposer( renderer );

	// 【１段目】シーンのレンダリング
	var effect = new THREE.RenderPass( scene, camera );
	gScene01Composer.addPass( effect );

	// 【２段目】ドットシェーダー
	var effect = new THREE.ShaderPass( THREE.DotScreenShader );
	effect.uniforms[ 'scale' ].value = 4;
	gScene01Composer.addPass( effect );

	// 【３段目】RGBシフト
	var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
	effect.uniforms[ 'amount' ].value = 0.0055;
	effect.renderToScreen = true;		// ※最後のパスにつっこむEffectは必ずtrueに
	gScene01Composer.addPass( effect );

}

//---- 計算 ---
function CalcScene01( scene , camera , time )
{
	// この用にCreateで作ったジオメトリを動かすことが出来る
	//gScene01Primitive.geometry.verticesNeedUpdate = true;
//	gScene01Primitive.geometry.vertices[0].x = time;
}

//---- レンダリング ----
function RenderScene01( renderer , scene , camera , time )
{
	if(time>5.0 && time < 8.0 || time > 11.0 && time< 14.0 ||time > 17.0 && time< 19.0  ||time > 21.0 && time< 22.0)
	{
		// レンダリングはコンポーザーのレンダリングを呼び出すだけ
		gScene01Composer.render();
	}
	else
	{	
		// コンポーザーを使わないなら、直接レンダリング関数を呼び出す
		renderer.render( scene, camera);
	}
}


function CreateScene01()
{

	var scene = new THREE.Scene();
 
	// レンダリングターゲットの作成
	gScene01RenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , { format: THREE.RGBAFormat } );

    // カメラの作成
    var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    camera.position = new THREE.Vector3(0, 8, 12);
    camera.lookAt(new THREE.Vector3(-1, 0, 4));
    scene.add(camera);


    // (2) マテリアルの作成
    var material = new THREE.ShaderMaterial({
    	vertexShader: document.getElementById('Scene01_VS').textContent,
        fragmentShader: document.getElementById('Scene01_FS').textContent,
		//vertexShader: document.getElementById('SceneEnd_VS').textContent,
        //fragmentShader: document.getElementById('SceneEnd_FS').textContent,
		//uniform:シェーダーの全体の設定
        uniforms: {
          time: { type: 'f', value: 0 },
          resolution: { type: 'v2', value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
        },
 
        // 通常マテリアルのパラメータ
        blending: THREE.AdditiveBlending, transparent: false, depthTest: false
	});


	
	// (3) 形状データを作成（同時に追加の頂点情報を初期化）
 
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
	scene.add(mesh);


	//attribute:一頂点あたりの情報
 
      // 物体を作成
      

    return { scene: scene , 
			 camera: camera , 
			 material: material , 
			 duration: 26 , 
			 enter:EnterScene01 ,
			 calc:CalcScene01 , 
			 render:RenderScene01 };


}


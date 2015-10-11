//==========================================================
//
//	シーン04  tunnel
//
//==========================================================
var gScene04Primitive;
var gScene04RenderTarget;
var gScene04Composer;
var EffectDurationTime;
//---- Rendererが必要な初期化 ----
function EnterScene04( renderer , scene , camera )
{
	EffectDurationTime = 0;
	// ポストエフェクト
	// Composerを作ってパスを突っ込んでいく。
	gScene04Composer = new THREE.EffectComposer( renderer );

	// 【１段目】シーンのレンダリング
	var effect = new THREE.RenderPass( scene, camera );
	gScene04Composer.addPass( effect );

	//var effect = new THREE.BloomPass( 1.25);
	//gScene04Composer.addPass( effect );

	// 【２段目】ドットシェーダー
	var effect = new THREE.ShaderPass( THREE.DotScreenShader );
	effect.uniforms[ 'scale' ].value = 4;
	gScene04Composer.addPass( effect );

	// 【３段目】RGBシフト
	var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
	effect.uniforms[ 'amount' ].value = 0.0055;

	effect.renderToScreen = true;		// ※最後のパスにつっこむEffectは必ずtrueに

	gScene04Composer.addPass( effect );

}

//---- 計算 ---
function CalcScene04( scene , camera , time )
{
	// この用にCreateで作ったジオメトリを動かすことが出来る
	gScene04Primitive.geometry.verticesNeedUpdate = true;
	gScene04Primitive.geometry.vertices[0].x = time;
}

//---- レンダリング ----
function RenderScene04( renderer , scene , camera , time )
{
	if(time>5.0 && time < 8.0 || time > 11.0 && time< 14.0 ||time > 17.0 && time< 19.0  ||time > 21.0 && time< 22.0)
	{
		// レンダリングはコンポーザーのレンダリングを呼び出すだけ
		gScene04Composer.render();
	}
	else
	{	
		// コンポーザーを使わないなら、直接レンダリング関数を呼び出す
		renderer.render( scene, camera);
	}
}


function CreateScene04()
{

	var scene = new THREE.Scene();
 
	// レンダリングターゲットの作成
	gScene04RenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight , { format: THREE.RGBAFormat } );

    // カメラの作成
    var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);
    camera.position = new THREE.Vector3(0, 8, 12);
    camera.lookAt(new THREE.Vector3(-1, 0, 4));
    scene.add(camera);


    // (2) マテリアルの作成
    var material = new THREE.ShaderMaterial({
    	vertexShader: document.getElementById('Scene04_VS').textContent,
        fragmentShader: document.getElementById('Scene04_FS').textContent,
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


	// ライン
	var geometry = new THREE.Geometry();
	for( var i=0 ; i < 1000 ; i++ )
	{
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	}
	geometry.verticesNeedUpdate = true;
	geometry.dynamic = true;
	var line = new THREE.Line(geometry, material);
	scene.add(line);

	gScene04Primitive = line;

	//attribute:一頂点あたりの情報
 
      // 物体を作成
      

    return { scene: scene , 
			 camera: camera , 
			 material: material , 
			 duration: 30 , 
			 enter:EnterScene04 ,
			 calc:CalcScene04 , 
			 render:RenderScene04 };


}


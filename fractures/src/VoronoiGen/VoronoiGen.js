/**
 * ...
 * @author Henri Sarasvirta
 */

(function() {
	var VoronoiGen = function(main, scene){
		this.scene = scene;
		this.voronoi = new Voronoi();
		this.boundingBox = {xl:-main.width/2, yt:-main.height/2, xr:main.width/2, yb:main.height/2};
		//Gen sites
		this.sites = [];
		this.siteAmount = 50;
		
		var tempTex = new THREE.Texture();
		this.elapsedtime = 0;
		for(var i = 0; i < this.siteAmount; i++)
		{
			//TODD - simple texture to material, texture cannot be applied after first render.
			var mat = new THREE.MeshBasicMaterial({color: "white", transparent: true, side:THREE.DoubleSide, map:tempTex });
			var geom = new THREE.PlaneGeometry(70,70);// THREE.Geometry();
			
			//Sites for planes
			var site = {x: wideload.Random.next()%(main.width-10)-main.width/2+5, y: wideload.Random.next()%(main.height-10)-main.height/2+5};
			var plane = new THREE.Mesh(geom, mat);
			var pv = new THREE.Vector3(Math.random()*100,Math.random()*100,Math.random()*100);
			plane.scale.x =1.00;// 1+0.1*Math.random()-0.05;// Math.random()*0.3+0.7;
			plane.scale.y =1.00;// 1+0.1*Math.random()-0.05;//Math.random()*0.3+0.7;
			site.ox = site.x;
			site.oy = site.y;
			site.plane = plane;
			plane.rotation = new THREE.Vector3(Math.random(), Math.random(), Math.random());
			site.scale = 1.00;
			scene.add(plane);
			site.plane.material.color = new THREE.Color(Math.random()*0xFFFFFF);
			this.sites.push(site);
		//	break;
		}
		this.addspeed=0;
		this.diagram = this.voronoi.compute(this.sites, this.boundingBox);
		this.scale = 1;
		this.updateVertices();
	}
	
	var p = VoronoiGen.prototype;
	
	p.update = function(elapsedtime, partial, timesig)
	{
			this.elapsedtime = elapsedtime;
		var bar = timesig.bar;
		for(var i = 0; i < this.sites.length; i++)
		{
			var site = this.sites[i];
			if(bar > 1 && bar < 6)
			{
				var b = new wideload.TimeSig(2,0,0).toMilliseconds();
				var e = new wideload.TimeSig(6,0,0).toMilliseconds();
				var d = e-b;
				var o = timesig.toMilliseconds() - b;
				site.scale = 1-o/d*0.1;
			}
			else if(bar >= 6 && bar < 34)
			{
				this.scale = Math.sin(this.elapsedtime*0.001+i*0.5)*0.1+0.9;
			}
			else if(bar >= 34 && bar < 39)
			{
				var b = new wideload.TimeSig(34,0,0).toMilliseconds();
				var e = new wideload.TimeSig(35,i%8,0).toMilliseconds();
				var d = e-b;
				var o = timesig.toMilliseconds() - b;
				site.scale = Math.min(0.9,Math.abs(1-o/d*1));
			}
			else if(bar == 56)
			{
				site.os = site.scale;
			}
			else if(bar > 56)
			{
				var b = new wideload.TimeSig(56,0,0).toMilliseconds();
				var e = new wideload.TimeSig(58,0,0).toMilliseconds();
				var d = e-b;
				var o = timesig.toMilliseconds() - b;
				site.scale = Math.min(1.0,site.os+o/d*(1-site.os));
			}
		}
		
		this.timesig = timesig;
		this.elapsedtime = elapsedtime;
		//return;
		
		for(var i = 0; i < this.siteAmount; i++)
		{
			var site = this.sites[i];
			site.x = site.ox + Math.sin(elapsedtime/12000+i/5+Math.cos(elapsedtime/2750+i/15)*0.1)*40*i;
			site.y = site.oy + Math.cos(elapsedtime/18000+i/5+Math.cos(elapsedtime/2550+i/15)*0.3)*30*i;
			if(site.x > this.boundingBox.xr-10)
				site.x = this.boundingBox.xr-10;
			else if(site.x < this.boundingBox.xl + 10)
				site.x = this.boundingBox.xl + 10;
			
			if(site.y > this.boundingBox.yb-10)
				site.y = this.boundingBox.yb -10;
			else if(site.y < this.boundingBox.yt + 10)
				site.y = this.boundingBox.yt + 10;
			//console.log(site.x + " , " + site.y);
		}
		
		this.voronoi.recycle(this.diagram);
		this.diagram = this.voronoi.compute(this.sites, this.boundingBox);
		
		this.updateVertices();
	}
	
	p.updateVertices = function()
	{
	//	console.log(this.diagram.edges);
		//Update the vertices for each of the site
		for(var i = 0; i < this.siteAmount; i++)
		{
			this.sites[i].plane.visible = false;
		}
		for(var i = 0; i < this.siteAmount; i++)
		{
			if(this.diagram.cells[i] != undefined)
			{
				var cell = this.diagram.cells[i];
				var site = cell.site;
				if(cell.halfedges.length == 0)
				{
					//Skip
					continue;
				}
				var vertices = [];
				for(var j = cell.halfedges.length-1; j >= 0;j--)
				{
					var hedge = cell.halfedges[j];
					var start =  hedge.getStartpoint();
					var end =  hedge.getEndpoint();
					
					var duplicate = false;
					for(var k = 0; k < vertices.length; k++)
					{
						if(vertices[k].x == end.x && vertices[k].y == end.y)
						{
							duplicate = true;
							break;
						}
					}
					if(!duplicate)
						vertices.push( new THREE.Vector3(end.x, end.y, 0));
				}
				if(vertices.length > 2)
				{
					var triangles = THREE.Shape.Utils.triangulateShape(vertices, []);
					site.plane.geometry.vertices = vertices;
					
					site.plane.geometry.faces = [];
					for(var k = 0; k < triangles.length; k++)
					{
						var face = new THREE.Face3(triangles[k][0], triangles[k][1], triangles[k][2]);
						site.plane.geometry.faces.push(face);
					//	geometry.faces.push(face);
						if(triangles[k][0] >= vertices.length)
							debugger;
						if(triangles[k][1] >= vertices.length)
							debugger;
						if(triangles[k][2] >= vertices.length)
							debugger;
					}
					
					if(site.to != null)
						wideload.UVMapper.setUvMap(site.to.uv,site.plane);
					
					site.plane.geometry.groupsNeedUpdate = true;
					site.plane.geometry.elementsNeedUpdate = true;
					site.plane.geometry.needsUpdate = true;
					site.plane.geometry.verticesNeedUpdate = true;
					
					
					site.plane.scale.x = site.scale;
					site.plane.scale.y = site.scale;
					
					site.plane.position.x = (1-site.plane.scale.x) * site.x;// / (1280/100);
					site.plane.position.y = (1-site.plane.scale.y) * site.y;// / (720/100);
					site.plane.visible = true;
					
				}
			}
		}
	}
	wideload.VoronoiGen = VoronoiGen;
	
})();
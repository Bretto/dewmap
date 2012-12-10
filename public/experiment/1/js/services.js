'use strict';


var services = angular.module('GeoConnections.services', []);



services.factory('GeoConnectionsModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var GeoConnectionsModel = {

        geoPoints:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    };

    return GeoConnectionsModel;
});


services.factory('WorldModel', function ($http, $log, $rootScope, $routeParams, $timeout, GeoConnectionsModel) {

    var camera, scene, controls, renderer;
    var sphere, sphereMaterial, sphereGraphic, sphereGeometry;
    var particleSystem, particlesGeometry, particleGraphic, particleMaterial;
    var curves, curveGeometry, curveMaterial;
    var attributes, uniforms;

    var canvasWrap = $('#canvas-wrap')[0];
    var interfaceImg = $('#interface-img');

    var projector = new THREE.Projector();

    var geoPointsElem = [];

    var theta = 45;
    var worldRay = 450;


    function init(){

        console.log('init WORLD');

        scene = new THREE.Scene();
        camera = makeCamera();
        renderer = makeRenderer();
        controls = makeControls();

        particleMaterial = makeParticleMaterial();
        particlesGeometry = makeParticlesGeometry();
        particleSystem = makeParticleSystem();

        curves = [];
        var tempParticles = [];

        for (var i = 0; i < particleSystem.geometry.vertices.length; i++) {
            var p1 = particleSystem.geometry.vertices[i];
            var connections = findConnections(p1);
            var curveObj = makeCurve(connections.p1, connections.p2);


            var cnt = Math.floor(curveObj.spline.getLength()/100)*1.5;

            for (var j = 0; j < cnt; j++) {

                var particle = curveObj.spline.getPointAt((1/cnt)*j);
                particle.path = curveObj.spline.getPoints(curveObj.spline.getLength() /2);
                particle.index = Math.floor((particle.path.length/cnt)*j);
//                particlesGeometry.vertices.push(particle);
                tempParticles.push(particle);

            }


            curves.push(curveObj);
            scene.add(curveObj.curve);
        }

        for (var k = 0; k < tempParticles.length; k++) {
            var obj = tempParticles[k];
            particlesGeometry.vertices.push(obj);

        }




        particleSystem.update = function () {

            var idx = 1;
            for (var i in this.geometry.vertices) {
                var particle = this.geometry.vertices[i];

                if(particle.path){
                    var path = particle.path;

                    if (particle.index == particle.path.length) {
                        particle.index = 0;
                    }

                    particle.lerpSelf(path[particle.index++],1);
                }



                var pos = getObjectScreenPosition(particle);
                if(geoPointsElem && $(geoPointsElem[i]))
                {
                    var p = $(geoPointsElem[i]);
                    p.css('left',pos.x);
                    p.css('top',pos.y);
                    if(particle.distanceTo(camera.position) > 1650){
                        p.css('display', 'none');
                    }else{
                        p.css('display', 'block');
                    }
                }

                idx ++;
            }
        this.geometry.verticesNeedUpdate = true;
        }

        scene.add(particleSystem);

        sphereGraphic = THREE.ImageUtils.loadTexture("/experiment/1/assets/img/world2.png");
        sphereGraphic.offset.x = -.025;
        sphereMaterial = new THREE.MeshBasicMaterial({ map:sphereGraphic, side:THREE.DoubleSide, color:0xffffff, opacity:1, depthTest: true, wireframeLinewidth:2, transparent:false, wireframe:false, blending:THREE.NormalBlending});

        sphereGeometry = new THREE.SphereGeometry(worldRay, 50, 50);
        sphere = new THREE.Mesh(sphereGeometry, sphereMaterial );
        sphere.name = 'world';
        scene.add(sphere);


//        var geo = new THREE.SphereGeometry(5, 5, 5);
//        var mat = new THREE.MeshBasicMaterial({ side:THREE.DoubleSide, color:0x00ff00, opacity:1, depthTest: true, wireframeLinewidth:1, transparent:false, wireframe:false, blending:THREE.NormalBlending});
//        var me = new THREE.Mesh(geo, mat );
//        me.name = 'me';
//
//        var lat = 48.85;
//        var lon = 2.3;
//
//        var phi     = Math.PI / 2 - lat * Math.PI / 180;
//        var theta   = 2 * Math.PI - lon * Math.PI / 180;
//
//
//        me.position.x = Math.sin(phi) * Math.cos(theta) * 450;
//        me.position.y = Math.cos(phi) * 450;
//        me.position.z = Math.sin(phi) * Math.sin(theta) * 450;
//
//
//        scene.add(me);


//        var planeX = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 2, 2), new THREE.MeshBasicMaterial({ side:THREE.DoubleSide, color:0x154492, opacity:1, depthTest: true, linewidth:1, transparent:false, wireframe:true, blending:THREE.NormalBlending}));
//        planeX.rotation.x = -Math.PI / 2;
//        scene.add(planeX);

//        var planeY = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 2, 2), new THREE.MeshBasicMaterial({ side:THREE.DoubleSide, color:0x154492, opacity:1, depthTest: true, linewidth:1, transparent:false, wireframe:true, blending:THREE.NormalBlending}));
//        planeY.rotation.x = -Math.PI / 2;
//        planeY.rotation.y = -Math.PI / 2;
//        scene.add(planeY);

        canvasWrap.appendChild(renderer.domElement);

//        $log.info('animate')
        animate();





        onWindowResize();

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function destroy(){
        $log.info('destroy WORLD');


        if(sphere)
        {
            scene.remove( sphere );
            sphere.deallocate();
            sphere.geometry.deallocate();
            sphere.material.deallocate();
            renderer.deallocateObject( sphere );
            sphere = null;
        }

        if(sphereGraphic){
            sphereGraphic.deallocate();
            renderer.deallocateTexture(sphereGraphic);
            sphereGraphic = null;
        }

        if(sphereMaterial){
            sphereMaterial.deallocate();
            renderer.deallocateMaterial(sphereMaterial);
            sphereMaterial = null;
        }

        if(sphereGeometry){
            sphereGeometry.deallocate();
            renderer.deallocateObject(sphereGeometry);
            sphereGeometry = null;
        }

        //---------------------

        if(particleSystem)
        {
            scene.remove( particleSystem );
            particleSystem.deallocate();
            particleSystem.geometry.deallocate();
            particleSystem.material.deallocate();
            renderer.deallocateObject( particleSystem );
            particleSystem = null;
        }


        if(particleMaterial){
            particleMaterial.deallocate();
            renderer.deallocateMaterial(particleMaterial);
            particleMaterial = null;
        }

        if(particlesGeometry){
            particlesGeometry.deallocate();
            renderer.deallocateObject(particlesGeometry);
            particlesGeometry = null;
        }

        if(particleGraphic){
            particleGraphic.deallocate();
            renderer.deallocateTexture(particleGraphic);
            particleGraphic = null;
        }

        //---------------------

        if(curves)
        {
            for (var i = 0; i < curves.length; i++) {
                var curve = curves[i].curve;
                scene.remove( curve );
                curve.deallocate();
                curve.geometry.deallocate();
                curve.material.deallocate();
                renderer.deallocateObject( curve );
                curve = null;

                var curveMaterial = curves[i].curveMaterial;
                curveMaterial.deallocate();
                renderer.deallocateObject(curveMaterial);
                curveMaterial = null;

                var curveGeometry = curves[i].curveGeometry;
                curveGeometry.deallocate();
                renderer.deallocateObject(curveGeometry);
                curveGeometry = null;
            }

            curves = null;
        }



        $rootScope.$$childHead.$destroy();
        $rootScope.$$childHead = null;


        $timeout(function() {
            camera = null;
            scene = null;
            controls = null;
            renderer = null;
            projector = null;
            geoPointsElem = null;
        }, 0, false);


        window.removeEventListener( 'resize', onWindowResize);

    }


    $rootScope.$on(':destroy-experiment', function(){

       destroy();

    });




    function onWindowResize() {

        camera.aspect = interfaceImg.width() / interfaceImg.height();
        camera.updateProjectionMatrix();

        renderer.setSize( interfaceImg.width(), interfaceImg.height() );
    }

    function makeCamera(){
        var camera = new THREE.PerspectiveCamera(45, interfaceImg.width() / interfaceImg.height(), 1, 10000);
        camera.position.y = 800;
        camera.position.x = 1400 * Math.sin(theta * Math.PI / 360);
        camera.position.z = 1400 * Math.cos(theta * Math.PI / 360);
        camera.lookAt(scene.position);

        return camera;
    }

    function makeRenderer(){
        var renderer = new THREE.WebGLRenderer({    antialias:true,
            preserveDrawingBuffer:true,
            clearColor: 0x000000,
            clearAlpha: .1
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
//        renderer.autoClearColor = false;

        return renderer;
    }

    function makeControls(){

        var controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.5;
        controls.noZoom = true;
        controls.noPan = true;
        controls.addEventListener('change', render);

        return controls
    }

    function makeParticleSystem(){

        var pSystem = new THREE.ParticleSystem(
            particlesGeometry,
            particleMaterial);
//            shaderMaterial);
//        pSystem.dynamic = true;

        return pSystem;
    }

    function makeParticleMaterial(){

        var particleGraphic = THREE.ImageUtils.loadTexture("/experiment/1/assets/img/particleC.png");
        var particleMaterial = new THREE.ParticleBasicMaterial( { map: particleGraphic, color: 0x154492, size: 150,
            blending: THREE.AdditiveBlending, transparent:true,
            depthWrite: false, vertexColors: false,
            sizeAttenuation: false } );

        return particleMaterial;
    }


    function makeParticlesGeometry(){

        var particles = new THREE.Geometry();

        for (var i = 0, l = GeoConnectionsModel.geoPoints.length; i < l; i++) {

            var phi = Math.acos(-1 + ( 2 * i ) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            var offset = worldRay + 10;

            var pX = offset * Math.cos(theta) * Math.sin(phi);
            var pY = offset * Math.sin(theta) * Math.sin(phi);
            var pZ = offset * Math.cos(phi);

            var particle = new THREE.Vector3(pX, pY, pZ);

            particles.vertices.push(particle);
            // add it to the geometry
            //particles.vertices.push(particle);
        }

        return particles;
    }

    function findConnections(p1){
        for (var i = 0; i < particleSystem.geometry.vertices.length; i++) {
//            var p1 = particleSystem.geometry.vertices[i];
            var p2 = undefined;

            while (p2 === p1 || p2 === undefined) {
                var index = Math.floor(Math.random() * (particleSystem.geometry.vertices.length - 1));
                var p2 = particleSystem.geometry.vertices[index];
            }

            return {p1:p1, p2:p2};
        }
    }

    function makeCurve(p1, p2){

        curveGeometry = makeConnectionLineGeometry(p1, p2);
        curveMaterial = new THREE.LineBasicMaterial({ color:0xffffff, opacity:.8, depthTest: true, linewidth:1, transparent:true, blending:THREE.AdditiveBlending});
        var curve = new THREE.Line(curveGeometry, curveMaterial);

        var spline = new THREE.SplineCurve3(curveGeometry.vertices);


        return { curve:curve, curveGeometry:curveGeometry, curveMaterial:curveMaterial, spline:spline };
    }


    function animate() {

        requestAnimationFrame(animate);

        if(controls)
            controls.update();

        if(particleSystem)
            particleSystem.update();

        render();
    }

    function render() {

//        $log.info('World Render', camera);
        if(renderer && scene && camera)
            renderer.render(scene, camera);
    }

    function getObjectScreenPosition(object)
    {

        var pos = object;

        var projected = pos.clone();
        projector.projectVector(projected, camera);

        var eltx = (1 + projected.x) * canvasWrap.offsetWidth / 2 ;
        var elty = (1 - projected.y) * canvasWrap.offsetHeight / 2;

//        var offset = $(renderer.domElement).offset();
//        eltx += offset.left;
//        elty += offset.top;

        return { x : eltx, y : elty };
    }


    function createLineGeometry(points) {
        var geometry = new THREE.Geometry();
        for (var i = 0; i < points.length; i++) {
            geometry.vertices.push(points[i]);
        }
        return geometry;
    };

    function makeConnectionLineGeometry(exporter, importer) {

        var distanceBetweenCountryCenter = exporter.clone().subSelf(importer).length();
        var anchorHeight = 100 + distanceBetweenCountryCenter * 0.5;
        var start = exporter;
        var end = importer;
        var mid = start.clone().lerpSelf(end, 0.5);
        var midLength = mid.length()
        mid.normalize();
        mid.multiplyScalar(midLength + distanceBetweenCountryCenter * 0.5);
        var normal = (new THREE.Vector3()).sub(start, end);
        normal.normalize();
        var distanceHalf = distanceBetweenCountryCenter * 0.5;
        var startAnchor = start;
        var midStartAnchor = mid.clone().addSelf(normal.clone().multiplyScalar(distanceHalf));
        var midEndAnchor = mid.clone().addSelf(normal.clone().multiplyScalar(-distanceHalf));
        var endAnchor = end;
        var splineCurveA = new THREE.CubicBezierCurve3(start, startAnchor, midStartAnchor, mid);
        var splineCurveB = new THREE.CubicBezierCurve3(mid, midEndAnchor, endAnchor, end);
        var vertexCountDesired = Math.floor(distanceBetweenCountryCenter * 0.02 + 6) * 2;
        var points = splineCurveA.getPoints(vertexCountDesired);
        points = points.splice(0, points.length - 1);
        points = points.concat(splineCurveB.getPoints(vertexCountDesired));
        //points.push(vec3_origin);
//        var val = 1 * 0.0003;
//        var size = 10;//(10 + Math.sqrt(val));
//        size = constrain(size, 0.1, 1);
        var curveGeometry = createLineGeometry(points);
//        curveGeometry.size = .01;
        return curveGeometry;
    }


    function constrain(v, min, max) {
        if (v < min)
            v = min;
        else
        if (v > max)
            v = max;
        return v;
    }

    function setGeoPointsElem(value){
        geoPointsElem = value;
    }


    var worldModel = {
        setGeoPointsElem: setGeoPointsElem,
        init: init,
        destroy: destroy
    };


    return worldModel;
});


//----------------------------------

//
//
//
//
//    attributes = {
//        size: {	type: 'f', value: [] },
//        customColor: { type: 'c', value: [] }
//    };
//
//    uniforms = {
//        amplitude: { type: "f", value: 1.0 },
//        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
//        texture:   { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "images/particleA.png" ) },
//    };
//
//    var shaderMaterial = new THREE.ShaderMaterial( {
//
//        uniforms: 		uniforms,
//        attributes:     attributes,
//        vertexShader:   document.getElementById( 'vertexshader' ).textContent,
//        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
//
//        blending: 		THREE.AdditiveBlending,
//        depthTest: 		true,
//        depthWrite: 	false,
//        transparent:	true,
//        // sizeAttenuation: true,
//    });
//
//
//
//    var particleGraphic = THREE.ImageUtils.loadTexture("images/map_mask.png");
//    var particleMat = new THREE.ParticleBasicMaterial( { map: particleGraphic, color: 0xffffff, size: 60,
//        blending: THREE.NormalBlending, transparent:true,
//        depthWrite: false, vertexColors: true,
//        sizeAttenuation: true } );
//    particlesGeo.colors = particleColors;
//    var pSystem = new THREE.ParticleSystem( particlesGeo, shaderMaterial );
//    pSystem.dynamic = true;
//    splineOutline.add( pSystem );
//
//    var vertices = pSystem.geometry.vertices;
//    var values_size = attributes.size.value;
//    var values_color = attributes.customColor.value;
//
//    for( var v = 0; v < vertices.length; v++ ) {
//        values_size[ v ] = pSystem.geometry.vertices[v].size;
//        values_color[ v ] = particleColors[v];
//    }
//
//    pSystem.update = function(){
//        // var time = Date.now()
//        for( var i in this.geometry.vertices ){
//            var particle = this.geometry.vertices[i];
//            var path = particle.path;
//            var moveLength = path.length;
//
//            particle.lerpN += 0.05;
//            if(particle.lerpN > 1){
//                particle.lerpN = 0;
//                particle.moveIndex = particle.nextIndex;
//                particle.nextIndex++;
//                if( particle.nextIndex >= path.length ){
//                    particle.moveIndex = 0;
//                    particle.nextIndex = 1;
//                }
//            }
//
//            var currentPoint = path[particle.moveIndex];
//            var nextPoint = path[particle.nextIndex];
//
//
//            particle.copy( currentPoint );
//            particle.lerpSelf( nextPoint, particle.lerpN );
//        }
//        this.geometry.verticesNeedUpdate = true;
//    };
//
//    //	return this info as part of the mesh package, we'll use this in selectvisualization
//    splineOutline.affectedCountries = affectedCountries;
//
//
//    return splineOutline;
//}
//
//function selectVisualization( linearData, year, countries, exportCategories, importCategories ){
//    //	we're only doing one country for now so...
//    var cName = countries[0].toUpperCase();
//
//    $("#hudButtons .countryTextInput").val(cName);
//    previouslySelectedCountry = selectedCountry;
//    selectedCountry = countryData[countries[0].toUpperCase()];
//
//    selectedCountry.summary = {
//        imported: {
//            mil: 0,
//            civ: 0,
//            ammo: 0,
//            total: 0,
//        },
//        exported: {
//            mil: 0,
//            civ: 0,
//            ammo: 0,
//            total: 0,
//        },
//        total: 0,
//        historical: getHistoricalData(selectedCountry),
//    };
//
//    // console.log(selectedCountry);
//
//    //	clear off the country's internally held color data we used from last highlight
//    for( var i in countryData ){
//        var country = countryData[i];
//        country.exportedAmount = 0;
//        country.importedAmount = 0;
//        country.mapColor = 0;
//    }
//
//    //	clear markers
//    for( var i in selectableCountries ){
//        removeMarkerFromCountry( selectableCountries[i] );
//    }
//
//    //	clear children
//    while( visualizationMesh.children.length > 0 ){
//        var c = visualizationMesh.children[0];
//        visualizationMesh.remove(c);
//    }
//
//    //	build the mesh
//    console.time('getVisualizedMesh');
//    var mesh = getVisualizedMesh( timeBins, year, countries, exportCategories, importCategories );
//    console.timeEnd('getVisualizedMesh');
//
//    //	add it to scene graph
//    visualizationMesh.add( mesh );
//
//
//    //	alright we got no data but at least highlight the country we've selected
//    if( mesh.affectedCountries.length == 0 ){
//        mesh.affectedCountries.push( cName );
//    }
//
//    for( var i in mesh.affectedCountries ){
//        var countryName = mesh.affectedCountries[i];
//        var country = countryData[countryName];
//        attachMarkerToCountry( countryName, country.mapColor );
//    }
//
//    // console.log( mesh.affectedCountries );
//    highlightCountry( mesh.affectedCountries );
//
//
//
//    d3Graphs.initGraphs();
//}
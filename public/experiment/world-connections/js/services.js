'use strict';


var services = angular.module('GeoConnections.services', []);



services.factory('GeoConnectionsModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var GeoConnectionsModel = {

        geoPoints:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    };

    return GeoConnectionsModel;
});


services.factory('WorldModel', function ($http, $log, $rootScope, $routeParams, $timeout, GeoConnectionsModel) {

    var camera, scene, controls, renderer;
    var sphere, sphereMaterial, sphereGraphic, sphereGeometry;
    var particleSystem, particlesGeometry, particleGraphic, particleMaterial, particleColors, pColors;
    var curves, curveGeometry, curveMaterial;

    var canvasWrap = $('#canvas-wrap')[0];
    var interfaceImg = $('#interface-img');

    var projector = new THREE.Projector();

    var geoPointsElem = [];

    pColors = [0xdd380c,0x154492];

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
        curves = makeCurves(angular.copy(particlesGeometry.vertices));

        particlesGeometry.colors = particleColors;


        particleSystem = makeParticleSystem();

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
                if(geoPointsElem && geoPointsElem[i])
                {
                    var p = $(geoPointsElem[i]);

                    if($(p).scope()){
                        var s = $(p).scope();

//                        var lat = 48.85;
//                        var lon = 2.3;
//                        var phi     = Math.PI / 2 - lat * Math.PI / 180;
//                        var theta   = 2 * Math.PI - lon * Math.PI / 180;
//                        s.position.x = Math.sin(phi) * Math.cos(theta) * 450;
//                        s.position.y = Math.cos(phi) * 450;
//                        s.position.z = Math.sin(phi) * Math.sin(theta) * 450;

                        s.lat = Math.asin(particle.z / worldRay) * 180/Math.PI;
                        s.lon = Math.atan2(particle.y, particle.x) * 180/Math.PI;
                        s.x = particle.x;
                        s.y = particle.y;
                        s.z = particle.z;
                    }


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

        sphereGraphic = THREE.ImageUtils.loadTexture("/experiment/world-connections/assets/img/world_inv2.png");
        sphereGraphic.offset.x = -.025;
        sphereMaterial = new THREE.MeshBasicMaterial({ map:sphereGraphic, side:THREE.DoubleSide, color:0xffffff, opacity:1, depthTest: true, wireframeLinewidth:2, transparent:false, wireframe:false, blending:THREE.NormalBlending});

        sphereGeometry = new THREE.SphereGeometry(worldRay, 50, 50);
        sphere = new THREE.Mesh(sphereGeometry, sphereMaterial );
        sphere.name = 'world';
        scene.add(sphere);

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

    function makeCurves(points){

        curves = [];


        for (var i = 0; i < points.length; i++) {
            var p1 = points[i];
            var connections = findConnections(p1, points);
            var curveObj = makeCurve(connections.p1, connections.p2);
            makeMovingParticles(curveObj);

            curves.push(curveObj);
            scene.add(curveObj.curve);
        }

        return curves;
    }

    function makeMovingParticles(curveObj){

        var cnt = Math.floor(curveObj.spline.getLength()/100)*2.5;
        var rnd = (Math.random() >.5) ? 0:1 ;
        var pColor = new THREE.Color().setHex(pColors[rnd]);


        for (var j = 0; j < cnt; j++) {

            var particle = curveObj.spline.getPointAt((1/cnt)*j);
            particle.path = curveObj.spline.getPoints(curveObj.spline.getLength() /2);
            particle.index = Math.floor((particle.path.length/cnt)*j);


            particleColors.push(pColor);
            particlesGeometry.vertices.push(particle);
        }

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

        pSystem.dynamic = true;

        return pSystem;
    }

    function makeParticleMaterial(){

        var particleGraphic = THREE.ImageUtils.loadTexture("/experiment/world-connections/assets/img/particleC.png");
        var particleMaterial = new THREE.ParticleBasicMaterial( { map: particleGraphic, size: 80,
            blending: THREE.AdditiveBlending, transparent:true,
            depthWrite: false, vertexColors: true,
            sizeAttenuation: false } );

        return particleMaterial;
    }


    function makeParticlesGeometry(){

        var particles = new THREE.Geometry();
        particleColors = [];

        for (var i = 0, l = GeoConnectionsModel.geoPoints.length; i < l; i++) {

            var phi = Math.acos(-1 + ( 2 * i ) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            var offset = worldRay + 10;

            var pX = offset * Math.cos(theta) * Math.sin(phi);
            var pY = offset * Math.sin(theta) * Math.sin(phi);
            var pZ = offset * Math.cos(phi);

            var particle = new THREE.Vector3(pX, pY, pZ);
            particles.vertices.push(particle);
            particleColors.push(new THREE.Color().setHex(pColors[0]));
        }

        return particles;
    }

    function findConnections(p1, points){
        for (var i = 0; i < points.length; i++) {
//            var p1 = particleSystem.geometry.vertices[i];
            var p2 = undefined;

            while (p2 === p1 || p2 === undefined) {
                var index = Math.floor(Math.random() * (points.length - 1));
                var p2 = points[index];
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
        var curveGeometry = createLineGeometry(points);
        return curveGeometry;
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

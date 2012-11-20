'use strict';


var services = angular.module('GeoConnections.services', []);



services.factory('GeoConnectionsModel', function ($http, $log, $rootScope, $routeParams, $location) {

    var GeoConnectionsModel = {

        geoPoints:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    };

    return GeoConnectionsModel;
});


services.factory('WorldModel', function ($http, $log, $rootScope, $routeParams, $location, GeoConnectionsModel) {

    var camera, scene, controls, renderer;

    var canvasWrap = $('#canvas-wrap')[0];
    var interfaceImg = $('#interface-img');


    var projector = new THREE.Projector();

    var particleSystem;
    var particleMaterial;
    var particles = new THREE.Geometry();
    var particleColors = [];
    var geoPointsElem = [];

    var theta = 45;
    var worldRay = 450;


    function init(){

        scene = new THREE.Scene();
        camera = makeCamera();
        renderer = makeRenderer();
        controls = makeControls();


        particleMaterial = makeParticleMaterial();
        particles = makeParticles();
        particleSystem = makeParticleSystem();
        makeLineConnections();

        particleSystem.update = function () {

            var idx = 1;
            for (var i in this.geometry.vertices) {
                var particle = this.geometry.vertices[i];
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
//        this.geometry.verticesNeedUpdate = true;
        }

        scene.add(particleSystem);


        var sphereGraphic = THREE.ImageUtils.loadTexture("/experiment/1/assets/img/world.png");
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(worldRay, 15, 15), new THREE.MeshBasicMaterial({ map:sphereGraphic, side:THREE.DoubleSide, color:0xff0000, opacity:1, depthTest: true, wireframeLinewidth:2, transparent:false, wireframe:false, blending:THREE.NormalBlending}));
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
        //renderer.autoClearColor = false;

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
            particles,
            particleMaterial);

        return pSystem;
    }

    function makeParticleMaterial(){

        var particleGraphic = THREE.ImageUtils.loadTexture("/experiment/1/assets/img/particleB.png");
        particleMaterial = new THREE.ParticleBasicMaterial( { map: particleGraphic, color: 0xffffff, size: 100,
            blending: THREE.AdditiveBlending, transparent:true,
            depthWrite: true,
            sizeAttenuation: true } );

        return particleMaterial;
    }


    function makeParticles(){

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

    function makeLineConnections(){
        for (var i = 0; i < particleSystem.geometry.vertices.length; i++) {
            var p1 = particleSystem.geometry.vertices[i];
            var p2 = undefined;

            while (p2 === p1 || p2 === undefined) {
                var index = Math.floor(Math.random() * (particleSystem.geometry.vertices.length - 1));
                var p2 = particleSystem.geometry.vertices[index];
            }

            var curveGeometry = makeConnectionLineGeometry(p1, p2);
            var material = new THREE.LineBasicMaterial({ color:0xaa0000, opacity:.8, depthTest: true, linewidth:1, transparent:true, blending:THREE.AdditiveBlending});

            var line = new THREE.Line(curveGeometry, material);

            scene.add(line);
        }
    }


    function animate() {

        requestAnimationFrame(animate);
        controls.update();
        particleSystem.update();
        render();
    }

    function render() {

//        $log.info('World Render', camera);
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


    init();


    var worldModel = {
        setGeoPointsElem: setGeoPointsElem
    };

    return worldModel;
});

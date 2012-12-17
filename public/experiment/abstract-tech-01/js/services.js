'use strict';


var services = angular.module('AbstractTech.services', []);


var abstractTechModel = function ($http, $log, $rootScope, $routeParams, $location){

    var GeoConnectionsModel = {

        geoPoints:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    };

    return GeoConnectionsModel;
}


services.factory('AbstractTechModel', abstractTechModel);



services.factory('WorldModel', function ($http, $log, $rootScope, $routeParams, $timeout, AbstractTechModel) {

    var camera, scene, controls, renderer;
    var assetsPath = '/experiment/abstract-tech-01/assets/';
    var canvasWrap = $('#canvas-wrap')[0];
    var interfaceImg = $('#interface-img');
    var friction = .02;
    var theta = 45;
    var planes = [];
    var mouseX = 0, mouseY = 0;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var projector = new THREE.Projector();

    this.init = function(){


        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
        $('#preloader').css('display','none');
        console.log('init WORLD');

        scene = new THREE.Scene();
        camera = makeCamera();
        renderer = makeRenderer();

        makeGround();

        makeImgPlane('3d2.png', 508, 359, {x:0,y:-100,z:100} );

        makeImgPlane('red2.png', 642, 434, {x:0,y:50,z:-50},'add' );

        makeImgPlane('red1.png', 471, 252, {x:-100,y:0,z:0},'add' );

        makeImgPlane('screen2.png', 383, 206, {x:0,y:0,z:50},'add' );

        makeImgPlane('3d1.png', 351, 122, {x:-100,y:0,z:250} );

        makeImgPlane('screen1.png', 486, 311, {x:-100,y:50,z:350},'add' );

        makeImgPlane('white1.png', 859, 595, {x:-50,y:50,z:25},'add' );

        makeImgPlane('red_spectre1.png', 859, 595, {x:-150,y:100,z:300},'add' );

        makeImgPlane('red_spectre2.png', 859, 595, {x:150,y:-100,z:200},'add' );




        canvasWrap.appendChild(renderer.domElement);

        animate();
        onWindowResize();

        window.addEventListener( 'resize', onWindowResize, false );
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    }



    $rootScope.$on(':destroy-experiment', function(){

       destroy();

    });



    function onDocumentMouseMove(event) {

        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );

    }

    function onWindowResize() {

        camera.aspect = interfaceImg.width() / interfaceImg.height();
        camera.updateProjectionMatrix();

        renderer.setSize( interfaceImg.width(), interfaceImg.height() );
    }

    function makeImgPlane(url, w, h, pos, blend) {


        var geometry = new THREE.PlaneGeometry(w, h);

        var map = THREE.ImageUtils.loadTexture(assetsPath + url);
        map.minFilter = map.magFilter = THREE.LinearFilter;
        map.anisotropy = 4;



        var plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({opacity:1, depthTest: true, map: map, transparent: true, blending: (blend)? THREE.AdditiveBlending : THREE.NormalBlending}));

        plane.position.x = pos.x;
        plane.position.y = pos.y;
        plane.position.z = pos.z;


        plane.update = function () {
            // plane.rotation.y = -controls.camRadian + (90 * (Math.PI / 180));
            plane.lookAt(camera.position);
        }

        planes.push(plane);
        scene.add(plane);


    }

    function makeGround(){
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 20, 20), new THREE.MeshBasicMaterial({ color:0x154492, opacity:.2, depthTest: false, linewidth:1, transparent:true, wireframe:true, blending:THREE.AdditiveBlending}));
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -250;
        scene.add(plane);
    }



    function makeCamera(){
        camera = new THREE.PerspectiveCamera(35, interfaceImg.width() / interfaceImg.height(), 1, 10000);
        camera.position.x = 1400 * Math.sin(theta * Math.PI / 360);
        camera.position.y = 2000;
        camera.position.z = 1400 * Math.cos(theta * Math.PI / 360);
        camera.lookAt(scene.position);

        return camera;
    }

    function makeRenderer(){
        var renderer = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true});
        renderer.setSize(window.innerWidth, window.innerHeight);
//        renderer.autoClearColor = false;

        return renderer;
    }

    function transform(targets, duration) {

        TWEEN.removeAll();

        for (var obj in targets) {

            var object = targets[obj].obj;
            var target = targets[obj].objTarget;

            new TWEEN.Tween(object.position)
                .to({ x:target.position.x, y:target.position.y, z:target.position.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(object.rotation)
                .to({ x:target.rotation.x, y:target.rotation.y, z:target.rotation.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

        }

        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();


    }

   function animate() {

//       console.log('animate');

       requestAnimationFrame(animate);

       for (var i = 0; i < planes.length; i++) {
           var obj = planes[i];
       }

       TWEEN.update();

       render();
    }

    function render() {

        if(renderer && scene && camera)
        {

            if(camera.position.y < 200)friction = .2;

            camera.position.x -= ( mouseX/2 + camera.position.x ) * friction;
            camera.position.y -= ( - mouseY/2 + camera.position.y ) * friction;

            camera.lookAt( scene.position );
            renderer.render(scene, camera);
        }
    }

    function getRandomLayout(showObjects){

        var layout = [];

        for (var i = 0; i < showObjects.length; i++) {


            var object = showObjects[ i ];

            var objId = 'plane'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = Math.random() * 200 - 100;
            objTarget.position.y = Math.random() * 200 - 100;
            objTarget.position.z = object.position.z + Math.random() * 200 - 100;

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        return layout;
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



    function destroy(){
        $log.info('destroy WORLD');

        $rootScope.$$childHead.$destroy();
        $rootScope.$$childHead = null;

        $timeout(function() {
            camera = null;
            scene = null;
            controls = null;
            renderer = null;
            projector = null;
        }, 0, false);

        window.removeEventListener( 'resize', onWindowResize);
    }

    function doIt(){
        var targets = getRandomLayout(planes);
        transform(targets, 500);
    }

    var worldModel = {
        init: this.init,
        doIt: doIt,
        destroy: destroy
    };


    return worldModel;
});



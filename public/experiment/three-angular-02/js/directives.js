'use strict';

var directives = angular.module('App.directives', []);


directives.directive('render3dComplete', function ($log) {


    return {
        replace:false,
        restrict:'A',
        link:function (scope, elem, attr, ctrl) {

            //not in a ng-repeat context
            if(scope.$last === undefined){

                scope.$watch(function(){return scope.addObj3D},function(v){
                    if(typeof scope.addObj3D === 'function'){
                        scope.$emit('addObj3D', scope.addObj3D(elem[0]));
                        scope.$emit('render3dComplete');
                    }
                });
            }else{
                //in a ng-repeat context
                scope.$emit('addObj3D', scope.addObj3D(elem[0]));
                if (scope.$last === true) {
                    scope.$emit('render3dComplete');
                }
            }
        }
    }
});


directives.directive('scene3d', function ($log, $timeout, $rootScope) {

    var camera, scene, renderer, controls, projector;
    var cameraEle, rendererEle, viewerWrap;
    var mouseX = 0, mouseY = 0;
    var friction, windowHalfX, windowHalfY;
    var requestAnimationFrameId = null;

    function onWindowResize() {

        if(camera){
            //camera.aspect = 980 / 655;
            camera.aspect = viewerWrap.width() / viewerWrap.height();
            camera.updateProjectionMatrix();
        }

        if(renderer && scene && camera){
//            renderer.setSize( 980, 655 );
            renderer.setSize( viewerWrap.width(), viewerWrap.height() );
            renderer.render(scene,camera)
        }

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
    }

    function setInitPosition(targets) {

        //TWEEN.removeAll();

        for (var obj in targets) {

            var object = targets[obj].obj;
            var target = targets[obj].objTarget;

            object.position.x = target.position.x;
            object.position.y = target.position.y;
            object.position.z = target.position.z;
            object.rotation.x = target.rotation.x;
            object.rotation.y = target.rotation.y;
            object.rotation.z = target.rotation.z;
        }
    }

    function transform(targets, duration) {

        //TWEEN.removeAll();

        for (var obj in targets) {

            var object = targets[obj].obj;
            var target = targets[obj].objTarget;


            new TWEEN.Tween(object.position)
                .to({ x:target.position.x, y:target.position.y, z:target.position.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(object.rotation)
                .to({ x:target.rotation.x, y:target.rotation.y, z:target.rotation.z }, Math.random() * duration + duration)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();


        }

//        new TWEEN.Tween(this)
//            .to({}, duration * 2)
//            .onUpdate(render)
//            .start();
    }

    function animate() {

        requestAnimationFrameId = requestAnimationFrame(animate);

        TWEEN.update();

        if (controls)
            controls.update();

        render();
    }

    function stopAnimate() {
        window.cancelAnimationFrame(requestAnimationFrameId);
    }

    function render() {

        if(renderer && scene && camera)
        {
            friction = .2;

            camera.position.x -= ( mouseX/20 + camera.position.x ) * friction, 10;
            camera.position.y -= ( - mouseY/20 + camera.position.y ) * friction, 10;

            camera.lookAt( scene.position );

            renderer.render(scene, camera);
        }
    }

    function onDocumentMouseMove(event) {

        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );

    }

    function makeCamera(attr){
        var camera = new THREE.PerspectiveCamera(attr.fov, attr.width / attr.height, attr.near, attr.far);

        camera.position.x = +attr.posX;
        camera.position.y = +attr.posY;
        camera.position.z = +attr.posZ;

        camera.rotation.x = +attr.rotX;
        camera.rotation.y = +attr.rotY;
        camera.rotation.z = +attr.rotZ;

        return camera;
    }

    function makeRenderer(rendererEle, cameraEle, projector)
    {
        var renderer = new THREE.CSS3DRenderer(rendererEle, cameraEle, projector);

        return renderer;
    }

    function makeControls(camera, rendererElem)
    {
        var controls = new THREE.TrackballControls(camera, rendererElem);
        controls.rotateSpeed = 0.5;
        controls.noZoom = true;
        controls.noPan = true;

        return controls;
    }

    return {
        replace:false,
        restrict:'A',

        link:function (scope, elem, attr, ctrl) {

            scene = new THREE.Scene();
            camera = makeCamera(attr);

            viewerWrap = $('#viewer-wrap');
            window.addEventListener( 'resize', onWindowResize, false );
            document.addEventListener( 'mousemove', onDocumentMouseMove, false );

            rendererEle = elem[0];
            cameraEle = elem.find('[camera-3d]')[0];
            projector = new THREE.Projector();
            renderer = makeRenderer(rendererEle, cameraEle, projector);

//            controls = makeControls(camera, rendererEle);
//            controls.addEventListener('change', render);


            //API
            scope.setInitPosition = setInitPosition;
            scope.transform = transform;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;

            //scope.getObjects3D = function(){return objects3D};
            scope.getControls = function(){return controls};
            scope.getCamera = function(){return camera};



            scope.addObj3D = function(elem){

                var object = new THREE.Object3D();
                object.name = elem.name;
                object.element = elem;
                scene.add(object);
                return object;
            }

            animate();
            onWindowResize();
        }
    }
});

directives.directive('loader', function ($log, $rootScope) {


    return {
        replace:false,
        restrict:'A',
        link:function (scope, elem, attr, ctrl) {

            $rootScope.$on("$stateChangeSuccess",function(){
                scope.isVisible = false;
            })

            $rootScope.$on("$stateChangeStart",function(){
                scope.isVisible = true;
            })



        }
    }
});







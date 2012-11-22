'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('myApp.directives', []);


directives.directive('scene3d', function ($log, $timeout, $rootScope) {

    var camera, scene, renderer, objects3DWrap, controls, objects3D;
    var cameraEle, rendererEle, itemsEle;

    var theta = 0;
    var requestAnimationFrameId = null;

    var interfaceImg = $('#interface-img');
    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {

        camera.aspect = interfaceImg.width() / interfaceImg.height();
        camera.updateProjectionMatrix();

        renderer.setSize( interfaceImg.width(), interfaceImg.height() );
        renderer.render(scene,camera)

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

//            targets[obj].obj = null;
//            targets[obj].objTarget = null;

        }

//        new TWEEN.Tween(this)
//            .to({}, duration * 2)
//            .onUpdate(render)
//            .start();


    }




    function animate() {

//        $log.info('animate CSS 3');
        requestAnimationFrameId = requestAnimationFrame(animate);

        TWEEN.update();

        render();

        if (controls)
            controls.update();


    }

    function stopAnimate() {
        window.cancelAnimationFrame(requestAnimationFrameId);
    }

    function render() {

//        $log.info('render CSS 3');
        if(renderer && scene && camera)
            renderer.render(scene, camera);

    }


    function makeCamera(attr){
        var camera = new THREE.PerspectiveCamera(attr.fov, attr.width / attr.height, attr.near, attr.far);
        camera.position.z = attr.z;

        return camera;
    }

    function makeObjects3DWrap(itemsEle){
        var objects3DWrap = new THREE.Object3D();
        objects3DWrap.element = itemsEle;

        return objects3DWrap;
    }

    function makeRenderer(rendererEle, cameraEle, attr)
    {
        var renderer = new THREE.CSS3DRenderer(rendererEle, cameraEle);
        renderer.setSize(attr.width, attr.height);

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
            objects3D = [];

            itemsEle = elem.find('#item-wrap-3d')[0];
            objects3DWrap = makeObjects3DWrap(itemsEle);
            scene.add(objects3DWrap);

            rendererEle = elem[0];
            cameraEle = elem.find('[camera-3d]')[0];
            renderer = makeRenderer(rendererEle, cameraEle, attr)

            controls = makeControls(camera, renderer.domElement);
            controls.addEventListener('change', render);

            //API
            scope.transform = transform;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;

            scope.getObjects3D = function(){ return objects3D};
            scope.getObjects3DWrap = function(){ return objects3DWrap};
            scope.getControls = function(){ return controls};
            scope.getCamera = function(){ return camera};

            scope.addObj3D = function(elem){

                var object = new THREE.Object3D();
                object.element = elem;
                object.position.x = 0;
                object.position.y = 0;
                object.position.z = -5000;
                scene.add(object);
                objects3D.push(object);
            }



            $rootScope.$on(':destroy-nav', function(){

                destroy();

            });


            function destroy(){

                for (var i = 0; i < objects3D.length; i++) {
                    var obj = objects3D[i];
                    if(obj)
                    {
                        scene.remove( obj );
                        obj.deallocate();
                        obj = null;
                    }
                }


                $timeout(function() {
                    console.log('directive destroy');
                    scene = null;
                    camera = null;
                    objects3DWrap = null;
                    renderer = null;
                    controls = null;
                }, 0, false);

            }

            onWindowResize();
        }
    }

});

directives.directive('experimentTile', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'partial/experiment-tile',
        link:function (scope, elem, attr, ctrl) {

            scope.addObj3D(elem.parent()[0]);

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});


// based on the ngInclude, this directive includes the content but don' compile it
// perfect for including ng-app in ng-app
directives.directive('ngappInclude', function ($http, $templateCache, $compile) {
    return {
        restrict:'ECA',
        terminal:true,
        compile:function (element, attr) {
            var srcExp = attr.ngappInclude || attr.src,
                onloadExp = attr.onload || '',
                autoScrollExp = attr.autoscroll;

            return function (scope, element) {
                var changeCounter = 0,
                    childScope;

                var clearContent = function () {
                    if (childScope) {
                        childScope.$destroy();
                        childScope = null;
                    }

                    element.html('');
                };

                scope.$watch(srcExp, function ngIncludeWatchAction(src) {
                    var thisChangeId = ++changeCounter;

                    if (src) {
                        $http.get(src, {cache:$templateCache}).success(function (response) {
                            if (thisChangeId !== changeCounter) return;

                            if (childScope) childScope.$destroy();
                            childScope = scope.$new();

                            element.html(response);
//                            $compile(element.contents())(childScope);

                            childScope.$emit('$includeContentLoaded');
                            scope.$eval(onloadExp);
                        }).error(function () {
                                if (thisChangeId === changeCounter) clearContent();
                            });
                    } else clearContent();
                });
            };
        }
    };
});

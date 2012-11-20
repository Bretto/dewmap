'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('myApp.directives', []);


directives.directive('scene3d', function ($log, $timeout) {

    var camera, scene, renderer, itemsObj3D;
    var cameraEle, rendererEle, itemsEle;

    var controls;
    var theta = 0;
    var requestAnimationFrameId = null;


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

        $log.info('animate CSS 3');
        requestAnimationFrameId = requestAnimationFrame(animate);

        TWEEN.update();

//        render();

        if (controls)
            controls.update();


    }

    function stopAnimate() {
        window.cancelAnimationFrame(requestAnimationFrameId);
    }

    function render() {

        $log.info('render CSS 3');
        renderer.render(scene, camera);

    }


    return {
        replace:false,
        restrict:'A',

        link:function (scope, elem, attr, ctrl) {

            scope.scene = scene = new THREE.Scene();

            scope.camera = camera = new THREE.PerspectiveCamera(attr.fov, attr.width / attr.height, attr.near, attr.far);
            camera.position.z = attr.z;
//            camera.matrixAutoUpdate = false;


            rendererEle = elem[0];
            scope.cameraEle = cameraEle = elem.find('[camera-3d]')[0];
            scope.itemsEle = itemsEle = elem.find('#item-wrap-3d')[0];

            scope.itemsObj3D = itemsObj3D = new THREE.Object3D();
            itemsObj3D.element = itemsEle;
            scene.add(itemsObj3D);

            scope.renderer = renderer = new THREE.CSS3DRenderer(rendererEle, cameraEle);
            renderer.setSize(attr.width, attr.height);

//            var holder = elem.find('#holder');

            scope.controls = controls = new THREE.TrackballControls(scope.camera, renderer.domElement);
            controls.rotateSpeed = 0.5;
            controls.noZoom = true;
            controls.noPan = true;
            controls.addEventListener('change', render);

            scope.transform = transform;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;
        }
    }

});

directives.directive('experimentTile', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'partial/experiment-tile',
        link:function (scope, elem, attr, ctrl) {

            scope.addItem(elem.parent()[0]);

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

'use strict';

var directives = angular.module('GiltApp.directives', []);


directives.directive('render3dComplete', function ($log) {
    return {
        replace:false,
        restrict:'A',
        link:function (scope, elem, attr, ctrl) {

            //not in a ng-repeat context
            if(scope.$last === undefined){
                scope.$watch(function(){return scope.addObj3D},function(v){
                    if(typeof scope.addObj3D === 'function'){
                        scope.addObj3D(elem[0]);
                        scope.setInitPosition(scope.initPositionFn(scope.getObjects3D(),scope.getCamera()));
                        scope.$watch(function(){return scope.layoutFn},function(){
                            scope.transform(scope.layoutFn(scope.getObjects3D(),scope.getCamera()), 1500);
                        });
                    }
                });
            }else{
                //in a ng-repeat context
                scope.addObj3D(elem[0]);

                if (scope.$last === true) {
                    scope.setInitPosition(scope.initPositionFn(scope.getObjects3D(),scope.getCamera()));
                    scope.$watch(function(){return scope.layoutFn},function(){
                        scope.transform(scope.layoutFn(scope.getObjects3D(),scope.getCamera()), 1500);
                    });
                }
            }



        }
    }
});


directives.directive('scene3d', function ($log, $timeout, $rootScope) {

    var camera, scene, renderer, controls, objects3D, projector;
    var cameraEle, rendererEle, viewerWrap;
    var requestAnimationFrameId = null;

    function onWindowResize() {

        if(camera){
            camera.aspect = viewerWrap.width() / viewerWrap.height();
            camera.updateProjectionMatrix();
        }

        if(renderer && scene && camera){
            renderer.setSize( viewerWrap.width(), viewerWrap.height() );
            renderer.render(scene,camera)
        }
    }

    function setInitPosition(targets) {

        TWEEN.removeAll();

        for (var obj in targets) {

            var object = targets[obj].obj;
            var target = targets[obj].objTarget;

            object.position.x = target.position.x;
            object.position.y = target.position.y;
            object.position.z = target.position.z;
            object.rotation.x = target.rotation.x;
            object.rotation.y = target.rotation.x;
            object.rotation.z = target.rotation.x;
        }
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
            renderer.render(scene, camera);
        }
    }

    function makeCamera(attr){
        var camera = new THREE.PerspectiveCamera(attr.fov, attr.width / attr.height, attr.near, attr.far);
        camera.position.z = attr.z;

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
            objects3D = [];

            viewerWrap = $('#viewer-wrap');
            window.addEventListener( 'resize', onWindowResize, false );

            rendererEle = elem[0];
            cameraEle = elem.find('[camera-3d]')[0];
            projector = new THREE.Projector();
            renderer = makeRenderer(rendererEle, cameraEle, projector);

            controls = makeControls(camera, rendererEle);
            controls.addEventListener('change', render);


            //API
            scope.setInitPosition = setInitPosition;
            scope.transform = transform;
            scope.animate = animate;
            scope.stopAnimate = stopAnimate;

            scope.getObjects3D = function(){return objects3D};
            scope.getControls = function(){return controls};
            scope.getCamera = function(){return camera};



            scope.addObj3D = function(elem){

                var object = new THREE.Object3D();
                object.name = elem.name;
                object.element = elem;

                scene.add(object);
                objects3D.push(object);
            }

            scope.$on('$destroy', function(){
                destroy();
            });

            function destroy(){

                console.log('directive destroy');

                // remove the obj added to the scene
                if(projector && scene && camera){
                    var renderables = projector.projectScene( scene, camera, false ).objects;

                    for ( var i = 0, il = renderables.length; i < il; i ++ ) {
                        var renderable = renderables[ i ];
                        scene.remove( renderable.object );
                        renderable.object.deallocate();
                        renderable.object = null;
                        renderable = null;
                    }
                }

                // remove obj helpers
                while(THREE.Object3DLibrary.length){

                    var obj = THREE.Object3DLibrary[0];
                    obj.deallocate();
                    obj = null;
                }

                if(scene){
                    while ( scene.__objectsRemoved.length ) {
                        scene.__objectsRemoved.splice( 0, 1 );
                    }
                }

                renderables.length = 0;
                objects3D.length = 0;
                projector = null;
                scene = null;
                camera = null;
                renderer = null;
                controls.destroy();
                controls = null;

                window.removeEventListener( 'resize', onWindowResize );
            }

            animate();
            onWindowResize();
        }
    }
});




directives.directive('transView', function ($http, $templateCache, $route, $anchorScroll, $compile, $controller, $log, $timeout) {

    return {
        restrict:'ECA',
        terminal:true,
        link:function (scope, element, attr) {
            var lastScope, locals, template, state, templateLoaded,
                onloadExp = attr.onload || '';

            scope.$on('$routeChangeStart', getOut);

            scope.$on('$routeChangeSuccess', update);
            update();


            function destroyLastScope() {
                if (lastScope) {
                    lastScope.$destroy();
                    lastScope = null;
                }
            }

            function clearContent() {
                element.html('');
                destroyLastScope();
            }

            function compileTemplate() {
                element.html(template);
                destroyLastScope();

                var link = $compile(element.contents()),
                    current = $route.current,
                    controller;

                lastScope = current.scope = scope.$new();
                if (current.controller) {
                    locals.$scope = lastScope;
                    controller = $controller(current.controller, locals);
                    element.contents().data('$ngControllerController', controller);
                }

                link(lastScope);
                lastScope.$emit('$viewContentLoaded');
                lastScope.$eval(onloadExp);

                $timeout(function () {
                    lastScope.$digest();
                }, 0);

                // $anchorScroll might listen on event...
                $anchorScroll();
            }

            function getIn() {
                compileTemplate();
                templateLoaded = false;
                $timeout(function(){getInComplete()}, attr.time );
            }

            function getInComplete() {
                //$log.info('fade-in content complete');
            }

            function getOut() {

                if (element.html() !== '') {

                    state = 'fading-out-template';
                    $timeout(function(){getOutComplete()}, attr.time );

                } else {
                    state = 'waiting-for-template';
                }
            }

            function getOutComplete() {
                clearContent();
                state = 'waiting-for-template';
                if (templateLoaded) {
                    getIn();
                }
            }

            function update() {

                templateLoaded = true;
                locals = $route.current && $route.current.locals;
                template = locals && locals.$template;

                if (template && template !== '') {

                    //$log.info('Content Loaded');

                    if (state === 'fading-out-template') return;

                    getIn();
                }
            }
        }
    };
});





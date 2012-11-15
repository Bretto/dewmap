'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */

var directives = angular.module('myApp.directives', []);


directives.directive('scene3d', function ($log, $timeout) {

    var camera, scene, renderer, itemsObj3D;
    var cameraEle, rendererEle, itemsEle;

    var controls;
    var theta = 0;


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

//        new TWEEN.Tween(this)
//            .to({}, duration * 2)
//            .onUpdate(render)
//            .start();


    }


    function animate() {

        requestAnimationFrame(animate);

        TWEEN.update();

        render();

        if (controls)
            controls.update();


    }

    function render() {


        renderer.render(scene, camera);

//        theta += .01;

//        itemsObj3D.rotation.x = Math.PI/2;
//        itemsObj3D.rotation.z = theta;
//
//        itemsEle.style.WebkitTransform = renderer.getObjectCSSMatrix( itemsObj3D.matrixWorld );

//        itemsEle.style.WebkitTransform = "rotateZ("+ theta + "deg)";


//        if(camera){
//            theta += 1;
//            camera.position.x = 500 * Math.sin( theta * Math.PI / 360 );
//            camera.position.z = 500 * Math.cos( theta * Math.PI / 360 );
//        }

//        camera.lookAt(new THREE.Vector3());

        //console.log(camera.x, camera.z);
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

//            scope.controls = controls = new THREE.OrbitControls(scope.camera, renderer.domElement);
//            scope.controls = controls = new THREE.TrackYControls(scope.camera, renderer.domElement);
            scope.controls = controls = new THREE.TrackballControls(scope.camera, renderer.domElement);
            controls.rotateSpeed = 0.5;
            controls.addEventListener('change', render);

            scope.transform = transform;
            scope.animate = animate;

        }
    }

});

directives.directive('comp', function ($log) {
    return {
        replace:true,
        restrict:'E',
        templateUrl:'partials/comp',
        link:function (scope, elem, attr, ctrl) {

            scope.addItem(elem.parent()[0]);

            if (scope.$last === true) {
                scope.renderComplete();
            }
        }
    }
});


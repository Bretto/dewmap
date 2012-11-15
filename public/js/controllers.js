'use strict';
/* App Controllers */



function AppCtrl($scope, $rootScope, $log, AppModel, $location, $routeParams, LAYOUT){




    $scope.appModel = AppModel;

    $scope.onGrid = function(){
        AppModel.layout = LAYOUT.GRID;
        AppModel.controls.constraintToAxis = "none";
    }

    $scope.onSphere = function(){
        AppModel.layout = LAYOUT.SPHERE;
        AppModel.controls.constraintToAxis = "XY";
    }

    $scope.onDisk = function(){
        AppModel.layout = LAYOUT.DISK;
        AppModel.controls.constraintToAxis = "X";
    }

    $scope.onBack = function(){
        $location.path('nav');
        $scope.appModel.currentItem = null;
    }

    $scope.onNext = function(){
        $scope.appModel.currentItem = $scope.appModel.items[1];
        //$location.path('nav');
    }

}

// changes the url path and load the selected composition
function CompCtrl($scope, $rootScope, $log, AppModel, $routeParams, $location, LAYOUT){

    if(getItemById($routeParams.idx)){
        $scope.appModel.currentItem = getItemById($routeParams.idx);
    }else{
        $location.path('nav');
    }

    function getItemById(idx){
        var currentItem = null;
        angular.forEach(AppModel.items, function(obj,i){
            if(obj.idx === parseInt(idx)){
                currentItem = obj;
            }
        })

        return currentItem;
    }

}

function NavCtrl($scope, $timeout, AppModel, LAYOUT, $location, $log){

    var objects = [];
    var targets = {};

    function addObject3D(item){
        var object = new THREE.Object3D();
        object.element = item;
        object.position.x = 0;
        object.position.y = 0;
        object.position.z = -5000;
        $scope.scene.add(object);
        objects.push(object);
    }


    function getShowObjects(){
        var showObjects = [];

        for (var i = 0; i < objects.length; i++) {
            var object = objects[ i ];
            var objectScope = $(object.element).scope();
            if(objectScope.item['show'])
                showObjects.push(object);
        }

        return showObjects;
    }

    function getGridLayout(showObjects){

        var layout = [];
        var col = 0, row = 0;

        for (var i = 0; i < showObjects.length; i++) {


            var object = showObjects[ i ];

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = ( col * 220 ) - 330;
            objTarget.position.y = -( row * 200 ) + 300;

            row = col === 3 ? ++row : row;
            col = col === 3 ? 0 : ++col;
            //console.log(row);

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        var itemsTarget = new THREE.Object3D();
        layout['itemsObj3D'] = {obj:$scope.itemsObj3D, objTarget:itemsTarget};


        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;

        layout['camera'] = {obj:$scope.camera, objTarget:cameraTarget};

        return layout;
    }

    function getSphereLayout(showObjects){

        var layout = {};
        var vector = new THREE.Vector3();

        for (var i = 0, l = showObjects.length; i < l; i++) {

            var object = showObjects[ i ];

            var phi = Math.acos(-1 + ( 2 * i ) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            var ray = 350;

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();


            objTarget.position.x = ray * Math.cos(theta) * Math.sin(phi);
            objTarget.position.y = ray * Math.sin(theta) * Math.sin(phi);
            objTarget.position.z = ray * Math.cos(phi);

            vector.copy(objTarget.position).multiplyScalar(2);

            objTarget.lookAt(vector);

            layout[objId] = {obj:obj, objTarget:objTarget};

        }

        var itemsTarget = new THREE.Object3D();
        itemsTarget.rotation.y = Math.PI;
        layout['itemsObj3D'] = {obj:$scope.itemsObj3D, objTarget:itemsTarget};

        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 650;
        cameraTarget.rotation.z = 0;
        layout['camera'] = {obj:$scope.camera, objTarget:cameraTarget};

        return layout;
    }

    function getDiskLayout(showObjects){

        var layout = {};
        var vector = new THREE.Vector3();
        var angleIncrement = 360 / showObjects.length;
        var circleRadius = 650;
        for (var i = 0; i < showObjects.length; i++) {

            var objId = 'comp'+i;
            var obj = showObjects[i];
            var objTarget = new THREE.Object3D();

            objTarget.position.x = (circleRadius * Math.cos((angleIncrement * i) * (Math.PI / 180)));
            objTarget.position.y = (circleRadius * Math.sin((angleIncrement * i) * (Math.PI / 180)));
            objTarget.rotation.x = Math.PI/2;
            objTarget.rotation.y = Math.atan2(objTarget.position.y, objTarget.position.x) + Math.PI/2;


//            vector.copy(objTarget.position).multiplyScalar(2);
//            objTarget.up = new THREE.Vector3(1,0,0);
//            objTarget.lookAt(vector);


            layout[objId] = {obj:obj, objTarget:objTarget};
        }

        var itemsTarget = new THREE.Object3D();
        itemsTarget.rotation.x = Math.PI/2;
        layout['itemsObj3D'] = {obj:$scope.itemsObj3D, objTarget:itemsTarget};


        var cameraTarget = new THREE.Object3D();
        cameraTarget.position.z = 1100;
        cameraTarget.rotation.z = 0;
        layout['camera'] = {obj:$scope.camera, objTarget:cameraTarget};

        return layout;
    }


    function init(){

        if($scope.controls){

            AppModel.controls = $scope.controls;
            var constraintToAxis =      AppModel.layout === LAYOUT.GRID     ? 'none' :
                                        AppModel.layout === LAYOUT.SPHERE   ? 'XY' :
                                        AppModel.layout === LAYOUT.DISK     ? 'X' :
                                        'none';

            AppModel.controls.constraintToAxis = constraintToAxis;

        }

        onWindowResize();
        updateLayout();

        $scope.$watch(function() { return AppModel.layout }, function(newValue, oldValue){
            updateLayout();
        },true);

        $scope.animate();
    }


    function updateLayout(){
        var showObjects = getShowObjects();
        var layout =    AppModel.layout === LAYOUT.GRID     ? getGridLayout(showObjects) :
                        AppModel.layout === LAYOUT.SPHERE   ? getSphereLayout(showObjects) :
                        AppModel.layout === LAYOUT.DISK     ? getDiskLayout(showObjects) :
                        getGridLayout(showObjects);

        $scope.transform(layout, 500);
    }

    window.addEventListener( 'resize', onWindowResize, false );
    var interfaceImg = $('#interface-img');


    function onWindowResize() {

        $scope.camera.aspect = interfaceImg.width() / interfaceImg.height();
        $scope.camera.updateProjectionMatrix();

        $scope.renderer.setSize( interfaceImg.width(), interfaceImg.height() );
        $scope.renderer.render($scope.scene,$scope.camera)

    }

    $scope.onCompClick = function(item){
        $scope.appModel.currentItem = item;
        $location.path('comp/'+item.idx);
    }


    $scope.addItem = function(item) {
        addObject3D(item);
    }

    $scope.renderComplete = function() {

        $timeout(function(){
            init();
        },0);

    }

//    $scope.myFilter = function(){
//        updateLayout();
//    }
//
//    $scope.$watch(function() { return AppModel.items }, function(newValue, oldValue){
//        $scope.myFilter();
//    },true);



}






















